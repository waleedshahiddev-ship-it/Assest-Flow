import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import Loader from "../ui/Loader";
import { useSupabase } from "../hooks/useSupabase";
import { createProjectWithMembers, getCurrentDbUser } from "../services/apiProjects";

const statusOptions = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

const AddProject = () => {
  const { user, isLoaded } = useUser();
  const { client } = useSupabase();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showAssigneeDialog, setShowAssigneeDialog] = useState(false);
  const [assigneeForm, setAssigneeForm] = useState({ email: "", role_in_project: "" });
  const [projectFile, setProjectFile] = useState(null);
  const [invalidAssignees, setInvalidAssignees] = useState([]);

  const roleQuery = useQuery({
    queryKey: ["projects-add-role", user?.id],
    queryFn: () => getCurrentDbUser(user.id, client),
    enabled: isLoaded && !!user?.id,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      project_name: "",
      description: "",
      tech_stack: "",
      start_date: "",
      expected_completion: "",
      status: "planning",
      assignees: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assignees",
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      return await createProjectWithMembers({
        clerkId: user.id,
        project: {
          project_name: values.project_name,
          description: values.description,
          tech_stack: values.tech_stack,
          start_date: values.start_date,
          expected_completion: values.expected_completion,
          status: values.status,
        },
        assignees: values.assignees,
        file: projectFile,
        client,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        setInvalidAssignees(result.invalidAssignees || []);
        toast.error(result.message || "Project creation failed");
        return;
      }

      toast.success("Project created successfully");
      setInvalidAssignees([]);
      setProjectFile(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["projects-manager-list", user?.id] });
      navigate("/projects/manager");
    },
    onError: (error) => {
      toast.error(error.message || "Project creation failed");
    },
  });

  const invalidMap = useMemo(() => {
    const map = new Map();
    invalidAssignees.forEach((row) => {
      map.set(row.index, row.reason);
    });
    return map;
  }, [invalidAssignees]);

  const addAssigneeRow = () => {
    const email = String(assigneeForm.email || "").trim();
    const roleInProject = String(assigneeForm.role_in_project || "").trim();

    if (!email || !roleInProject) {
      toast.error("Assignee email and role in project are required");
      return;
    }

    append({ email, role_in_project: roleInProject });
    setAssigneeForm({ email: "", role_in_project: "" });
    setShowAssigneeDialog(false);
  };

  const onSubmit = (values) => {
    setInvalidAssignees([]);
    mutation.mutate(values);
  };

  useEffect(() => {
    if (!roleQuery.isLoading && roleQuery.data && roleQuery.data.role !== "manager") {
      navigate("/unauthorized", { replace: true });
    }
  }, [roleQuery.isLoading, roleQuery.data, navigate]);

  if (roleQuery.isLoading) {
    return <Loader title="Loading form" subtitle="Checking project creation access" />;
  }

  if (!roleQuery.data || roleQuery.data.role !== "manager") {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add Project</h1>
          <p className="text-sm text-slate-500 mt-1">Create a project and assign employees managed by you.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/projects/manager")}>Back</Button>
      </div>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  {...register("project_name", { required: "Project name is required" })}
                />
                {errors.project_name ? <p className="text-xs text-rose-600">{errors.project_name.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech_stack">Tech Stack</Label>
                <Input
                  id="tech_stack"
                  {...register("tech_stack", { required: "Tech stack is required" })}
                  placeholder="React, Node.js, Supabase"
                />
                {errors.tech_stack ? <p className="text-xs text-rose-600">{errors.tech_stack.message}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                {...register("description", { required: "Description is required" })}
                rows={4}
              />
              {errors.description ? <p className="text-xs text-rose-600">{errors.description.message}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date", { required: "Start date is required" })}
                />
                {errors.start_date ? <p className="text-xs text-rose-600">{errors.start_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_completion">Expected End Date</Label>
                <Input
                  id="expected_completion"
                  type="date"
                  {...register("expected_completion", { required: "Expected end date is required" })}
                />
                {errors.expected_completion ? <p className="text-xs text-rose-600">{errors.expected_completion.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Project Status</Label>
                <select
                  id="status"
                  {...register("status", { required: true })}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Project Assignees</h3>
                <Button type="button" size="sm" onClick={() => setShowAssigneeDialog(true)}>+</Button>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">Email</th>
                      <th className="text-left px-3 py-2">Role In Project</th>
                      <th className="text-left px-3 py-2 w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-slate-500">No assignees added yet.</td>
                      </tr>
                    ) : (
                      fields.map((field, index) => (
                        <tr key={field.id} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            <Input
                              {...register(`assignees.${index}.email`)}
                              className="h-7"
                            />
                            {invalidMap.get(index) ? (
                              <p className="text-[11px] text-rose-600 mt-1">{invalidMap.get(index)}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              {...register(`assignees.${index}.role_in_project`)}
                              className="h-7"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Button type="button" size="sm" variant="destructive" onClick={() => remove(index)}>
                              x
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_document">Project Documentation (PDF)</Label>
              <Input
                id="project_document"
                type="file"
                accept="application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setProjectFile(file);
                }}
              />
              {projectFile ? <p className="text-xs text-slate-500">Selected: {projectFile.name}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {mutation.isPending ? "Adding..." : "Add Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showAssigneeDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Add Assignee</h3>
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={assigneeForm.email}
                  onChange={(event) => setAssigneeForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Role In Project</Label>
                <Input
                  value={assigneeForm.role_in_project}
                  onChange={(event) => setAssigneeForm((prev) => ({ ...prev, role_in_project: event.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAssigneeDialog(false)}>Cancel</Button>
              <Button type="button" onClick={addAssigneeRow}>Add</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddProject;
