import { supabase } from "./supabase";

const PROJECT_DOCS_BUCKET = "project-docs";
const PROJECT_CARD_COLORS = [
  "bg-red-50 border-red-200",
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-orange-50 border-orange-200",
  "bg-amber-50 border-amber-200",
  "bg-cyan-50 border-cyan-200",
];

function normalizeEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function sanitizeFileName(fileName = "") {
  return String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildStoragePath(managerId, fileName) {
  const safeName = sanitizeFileName(fileName);
  return `projects/${managerId}/${Date.now()}-${safeName}`;
}

function formatStorageUploadError(uploadError) {
  const base = uploadError?.message || "Unknown storage upload error";
  const lower = String(base).toLowerCase();

  if (lower.includes("bucket") && lower.includes("not found")) {
    return `${base}. Ensure bucket \"${PROJECT_DOCS_BUCKET}\" exists.`;
  }

  if (lower.includes("mime") || lower.includes("type")) {
    return `${base}. Ensure bucket allowed MIME types include application/pdf.`;
  }

  if (lower.includes("policy") || lower.includes("permission") || lower.includes("unauthorized")) {
    return `${base}. Ensure storage insert permission exists for your auth role.`;
  }

  if (lower.includes("too large") || lower.includes("size")) {
    return `${base}. Check bucket max file size.`;
  }

  return `${base}. Verify bucket config, file size, MIME, and storage permissions.`;
}

function validateProjectInput(payload) {
  const required = [
    "project_name",
    "description",
    "tech_stack",
    "start_date",
    "expected_completion",
    "status",
  ];

  const missing = required.filter((key) => !payload?.[key]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  const startDate = new Date(payload.start_date);
  const expectedDate = new Date(payload.expected_completion);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(expectedDate.getTime())) {
    throw new Error("Start date and expected completion date must be valid dates");
  }

  if (startDate >= expectedDate) {
    throw new Error("Start date must be before expected completion date");
  }

  const validStatuses = ["planning", "active", "completed", "on_hold"];
  if (!validStatuses.includes(payload.status)) {
    throw new Error("Invalid project status");
  }
}

function validateAssigneeShape(assignees = []) {
  if (!Array.isArray(assignees)) {
    throw new Error("Assignees must be an array");
  }

  const emailSet = new Set();
  const invalidEntries = [];

  assignees.forEach((row, index) => {
    const normalized = normalizeEmail(row?.email);
    const roleInProject = String(row?.role_in_project || "").trim();

    if (!normalized || !roleInProject) {
      invalidEntries.push({
        index,
        email: row?.email || "",
        reason: "Email and role in project are required",
      });
      return;
    }

    if (emailSet.has(normalized)) {
      invalidEntries.push({
        index,
        email: row?.email,
        reason: "Duplicate assignee email",
      });
      return;
    }

    emailSet.add(normalized);
  });

  if (invalidEntries.length) {
    return { valid: false, invalidAssignees: invalidEntries };
  }

  return { valid: true, invalidAssignees: [] };
}

async function getDbUserByClerkId(clerkId, client = supabase) {
  const { data, error } = await client
    .from("users")
    .select("id, clerk_id, role, email")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) {
    throw new Error("Unable to find signed-in user in database");
  }

  return data;
}

async function uploadProjectDocument({ managerId, file, client = supabase }) {
  if (!file) {
    return { path: null, publicUrl: null };
  }

  if (file.type !== "application/pdf") {
    throw new Error("Project documentation must be a PDF file");
  }

  const storagePath = buildStoragePath(managerId, file.name);

  const { error: uploadError } = await client
    .storage
    .from(PROJECT_DOCS_BUCKET)
    .upload(storagePath, file, {
      upsert: false,
      contentType: "application/pdf",
    });

  if (uploadError) {
    throw new Error(`Project document upload failed: ${formatStorageUploadError(uploadError)}`);
  }

  const { data } = client.storage.from(PROJECT_DOCS_BUCKET).getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: data?.publicUrl || storagePath,
  };
}

async function removeProjectDocument(storagePath, client = supabase) {
  if (!storagePath) return;

  await client.storage.from(PROJECT_DOCS_BUCKET).remove([storagePath]);
}

function extractStoragePathFromProjectReport(projectReport) {
  if (!projectReport) return null;

  if (!String(projectReport).startsWith("http")) {
    return projectReport;
  }

  const marker = `/object/public/${PROJECT_DOCS_BUCKET}/`;
  const idx = projectReport.indexOf(marker);
  if (idx === -1) return null;

  return projectReport.slice(idx + marker.length);
}

async function validateAssigneesForManager({ assignees, managerId, client = supabase }) {
  if (!assignees?.length) {
    return { valid: true, invalidAssignees: [], rows: [] };
  }

  const emails = assignees.map((row) => normalizeEmail(row.email));

  const { data: users, error: usersError } = await client
    .from("users")
    .select("id, email, role")
    .in("email", emails);

  if (usersError) {
    throw new Error("Failed to validate assignees from users table");
  }

  const byEmail = new Map((users || []).map((u) => [normalizeEmail(u.email), u]));

  const matchedUsers = (users || []).map((u) => u.id);
  const { data: employeeProfiles, error: profilesError } = await client
    .from("employee_profiles")
    .select("user_id, manager_id")
    .in("user_id", matchedUsers.length ? matchedUsers : ["00000000-0000-0000-0000-000000000000"]);

  if (profilesError) {
    throw new Error("Failed to validate assignees from employee_profiles table");
  }

  const profileByUserId = new Map((employeeProfiles || []).map((p) => [p.user_id, p]));
  const invalidAssignees = [];
  const rows = [];

  assignees.forEach((assignee, index) => {
    const normalizedEmail = normalizeEmail(assignee.email);
    const user = byEmail.get(normalizedEmail);

    if (!user) {
      invalidAssignees.push({
        index,
        email: assignee.email,
        reason: "No user found for this email",
      });
      return;
    }

    if (user.role !== "employee") {
      invalidAssignees.push({
        index,
        email: assignee.email,
        reason: "Only users with role employee can be assigned",
      });
      return;
    }

    if (user.id === managerId) {
      invalidAssignees.push({
        index,
        email: assignee.email,
        reason: "Manager cannot assign themselves as project member",
      });
      return;
    }

    const employeeProfile = profileByUserId.get(user.id);
    if (!employeeProfile) {
      invalidAssignees.push({
        index,
        email: assignee.email,
        reason: "Employee profile not found",
      });
      return;
    }

    if (employeeProfile.manager_id !== managerId) {
      invalidAssignees.push({
        index,
        email: assignee.email,
        reason: "This employee is not managed by the current manager",
      });
      return;
    }

    rows.push({
      user_id: user.id,
      role_in_project: assignee.role_in_project,
      assigned_date: new Date().toISOString(),
    });
  });

  return {
    valid: invalidAssignees.length === 0,
    invalidAssignees,
    rows,
  };
}

export async function getCurrentUserRoleByClerkId(clerkId, client = supabase) {
  const user = await getDbUserByClerkId(clerkId, client);
  return user.role;
}

export async function getCurrentDbUser(clerkId, client = supabase) {
  return await getDbUserByClerkId(clerkId, client);
}

export async function getProjectsForManagerByClerkId(clerkId, client = supabase) {
  const manager = await getDbUserByClerkId(clerkId, client);

  if (manager.role !== "manager") {
    throw new Error("Only managers can access manager projects");
  }

  const { data, error } = await client
    .from("projects")
    .select("id, project_name, created_at")
    .eq("project_manager_id", manager.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch projects for manager");
  }

  return data || [];
}

export async function getProjectDetailsForManager({ clerkId, projectId, client = supabase }) {
  const manager = await getDbUserByClerkId(clerkId, client);

  if (manager.role !== "manager") {
    throw new Error("Only managers can access project details");
  }

  const { data: project, error: projectError } = await client
    .from("projects")
    .select("id, project_name, description, tech_stack, start_date, expected_completion, status, project_report, project_manager_id")
    .eq("id", projectId)
    .eq("project_manager_id", manager.id)
    .single();

  if (projectError || !project) {
    throw new Error("Project not found or unauthorized access");
  }

  const { data: members, error: membersError } = await client
    .from("project_members")
    .select("id, user_id, role_in_project")
    .eq("project_id", project.id);

  if (membersError) {
    throw new Error("Failed to fetch project members");
  }

  const memberUserIds = (members || []).map((member) => member.user_id);
  let users = [];

  if (memberUserIds.length) {
    const { data: userRows, error: usersError } = await client
      .from("users")
      .select("id, email")
      .in("id", memberUserIds);

    if (usersError) {
      throw new Error("Failed to fetch assignee user details");
    }

    users = userRows || [];
  }

  const userById = new Map(users.map((row) => [row.id, row]));
  const assignees = (members || []).map((member) => ({
    email: userById.get(member.user_id)?.email || "",
    role_in_project: member.role_in_project,
  }));

  return {
    project,
    assignees,
  };
}

export function getCardColorByIndex(index = 0) {
  return PROJECT_CARD_COLORS[index % PROJECT_CARD_COLORS.length];
}

export async function createProjectWithMembers({ clerkId, project, assignees, file, client = supabase }) {
  const manager = await getDbUserByClerkId(clerkId, client);

  if (manager.role !== "manager") {
    return {
      success: false,
      message: "Unauthorized. Only manager can add a project.",
      invalidAssignees: [],
    };
  }

  validateProjectInput(project);

  const assigneeShape = validateAssigneeShape(assignees);
  if (!assigneeShape.valid) {
    return {
      success: false,
      message: "Please fix assignee details before submitting",
      invalidAssignees: assigneeShape.invalidAssignees,
    };
  }

  const assigneeValidation = await validateAssigneesForManager({
    assignees,
    managerId: manager.id,
    client,
  });

  if (!assigneeValidation.valid) {
    return {
      success: false,
      message: "One or more assignees are invalid",
      invalidAssignees: assigneeValidation.invalidAssignees,
    };
  }

  let uploadedDocPath = null;
  let createdProjectId = null;

  try {
    const uploadResult = await uploadProjectDocument({ managerId: manager.id, file, client });
    uploadedDocPath = uploadResult.path;

    const projectPayload = {
      project_name: project.project_name,
      description: project.description,
      project_manager_id: manager.id,
      tech_stack: project.tech_stack,
      start_date: project.start_date,
      expected_completion: project.expected_completion,
      status: project.status,
      project_report: uploadResult.publicUrl,
    };

    const { data: createdProject, error: projectError } = await client
      .from("projects")
      .insert(projectPayload)
      .select("id")
      .single();

    if (projectError || !createdProject) {
      throw new Error(projectError?.message || "Failed to create project");
    }

    createdProjectId = createdProject.id;

    if (assigneeValidation.rows.length) {
      const memberRows = assigneeValidation.rows.map((row) => ({
        project_id: createdProjectId,
        user_id: row.user_id,
        role_in_project: row.role_in_project,
        assigned_date: row.assigned_date,
      }));

      const { error: memberError } = await client
        .from("project_members")
        .insert(memberRows);

      if (memberError) {
        throw new Error(`Failed to insert project members: ${memberError.message}`);
      }
    }

    return {
      success: true,
      message: "Project created successfully",
      invalidAssignees: [],
    };
  } catch (error) {
    if (createdProjectId) {
      await client.from("projects").delete().eq("id", createdProjectId);
    }

    if (uploadedDocPath) {
      await removeProjectDocument(uploadedDocPath, client);
    }

    return {
      success: false,
      message: error.message || "Project creation failed",
      invalidAssignees: [],
    };
  }
}

export async function updateProjectWithMembers({ clerkId, projectId, project, assignees, file, client = supabase }) {
  const manager = await getDbUserByClerkId(clerkId, client);

  if (manager.role !== "manager") {
    return {
      success: false,
      message: "Unauthorized. Only manager can update a project.",
      invalidAssignees: [],
    };
  }

  validateProjectInput(project);

  const assigneeShape = validateAssigneeShape(assignees);
  if (!assigneeShape.valid) {
    return {
      success: false,
      message: "Please fix assignee details before updating",
      invalidAssignees: assigneeShape.invalidAssignees,
    };
  }

  const assigneeValidation = await validateAssigneesForManager({
    assignees,
    managerId: manager.id,
    client,
  });

  if (!assigneeValidation.valid) {
    return {
      success: false,
      message: "One or more assignees are invalid",
      invalidAssignees: assigneeValidation.invalidAssignees,
    };
  }

  const { data: existingProject, error: existingProjectError } = await client
    .from("projects")
    .select("id, project_name, description, tech_stack, start_date, expected_completion, status, project_report, project_manager_id")
    .eq("id", projectId)
    .eq("project_manager_id", manager.id)
    .single();

  if (existingProjectError || !existingProject) {
    return {
      success: false,
      message: "Project not found or unauthorized",
      invalidAssignees: [],
    };
  }

  const { data: existingMembers, error: existingMembersError } = await client
    .from("project_members")
    .select("project_id, user_id, role_in_project, assigned_date")
    .eq("project_id", projectId);

  if (existingMembersError) {
    return {
      success: false,
      message: "Failed to load existing project members",
      invalidAssignees: [],
    };
  }

  let newUploadedDocPath = null;
  let newProjectReport = existingProject.project_report;
  let projectUpdated = false;
  let membersReplaced = false;

  try {
    if (file) {
      const uploadResult = await uploadProjectDocument({ managerId: manager.id, file, client });
      newUploadedDocPath = uploadResult.path;
      newProjectReport = uploadResult.publicUrl;
    }

    const projectPayload = {
      project_name: project.project_name,
      description: project.description,
      tech_stack: project.tech_stack,
      start_date: project.start_date,
      expected_completion: project.expected_completion,
      status: project.status,
      project_report: newProjectReport,
    };

    const { error: updateProjectError } = await client
      .from("projects")
      .update(projectPayload)
      .eq("id", projectId)
      .eq("project_manager_id", manager.id);

    if (updateProjectError) {
      throw new Error(`Failed to update project: ${updateProjectError.message}`);
    }

    projectUpdated = true;

    const { error: deleteMembersError } = await client
      .from("project_members")
      .delete()
      .eq("project_id", projectId);

    if (deleteMembersError) {
      throw new Error(`Failed to replace project members: ${deleteMembersError.message}`);
    }

    const newMemberRows = assigneeValidation.rows.map((row) => ({
      project_id: projectId,
      user_id: row.user_id,
      role_in_project: row.role_in_project,
      assigned_date: row.assigned_date,
    }));

    if (newMemberRows.length) {
      const { error: insertMembersError } = await client
        .from("project_members")
        .insert(newMemberRows);

      if (insertMembersError) {
        throw new Error(`Failed to update project members: ${insertMembersError.message}`);
      }
    }

    membersReplaced = true;

    if (file && existingProject.project_report) {
      const oldStoragePath = extractStoragePathFromProjectReport(existingProject.project_report);
      if (oldStoragePath) {
        await removeProjectDocument(oldStoragePath, client);
      }
    }

    return {
      success: true,
      message: "Project updated successfully",
      invalidAssignees: [],
    };
  } catch (error) {
    if (membersReplaced === false) {
      await client
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (existingMembers?.length) {
        await client
          .from("project_members")
          .insert(existingMembers);
      }
    }

    if (projectUpdated) {
      await client
        .from("projects")
        .update({
          project_name: existingProject.project_name,
          description: existingProject.description,
          tech_stack: existingProject.tech_stack,
          start_date: existingProject.start_date,
          expected_completion: existingProject.expected_completion,
          status: existingProject.status,
          project_report: existingProject.project_report,
        })
        .eq("id", projectId)
        .eq("project_manager_id", manager.id);
    }

    if (newUploadedDocPath) {
      await removeProjectDocument(newUploadedDocPath, client);
    }

    return {
      success: false,
      message: error.message || "Project update failed",
      invalidAssignees: [],
    };
  }
}
