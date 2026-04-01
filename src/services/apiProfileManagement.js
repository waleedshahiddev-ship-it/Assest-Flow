import { supabase } from "./supabase";

/**
 * Fetches the base user details and their role-specific profile
 * @param {string} clerkId - The Clerk ID of the user
 */
export async function getFullUserProfile(clerkId) {
  try {
    // 1. Get base user record with explicit company relationship
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*, companies!company_id(*)")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    let profileData = null;
    const role = user.role;

    // 2. Fetch role-specific profile based on role
    if (role === "employer") {
      const { data, error } = await supabase
        .from("employer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      profileData = data;
    } else if (role === "admin") {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      profileData = data;
    } else if (role === "manager") {
      const { data, error } = await supabase
        .from("manager_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      profileData = data;
    } else if (role === "employee") {
      const { data, error } = await supabase
        .from("employee_profiles")
        .select("*, users!manager_id(full_name)")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      profileData = data;
    }

    return {
      user,
      profile: profileData,
      role
    };
  } catch (error) {
    console.error("Error in getFullUserProfile:", error.message);
    throw error;
  }
}

/**
 * Updates the user's base info, role-specific profile, and company details (for employer)
 */
export async function updateProfile(clerkId, role, updates) {
  try {
    // 1. Get user UUID first
    const { data: user, error: userFetchError } = await supabase
      .from("users")
      .select("id, company_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userFetchError) throw userFetchError;

    // 2. Update base user table (full_name)
    if (updates.full_name) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ full_name: updates.full_name })
        .eq("id", user.id);
      if (userUpdateError) throw userUpdateError;
    }

    // 3. Update company table (for employer only)
    if (role === "employer" && (updates.company_name || updates.industry || updates.size || updates.website || updates.company_location)) {
      const companyUpdates = {};
      if (updates.company_name) companyUpdates.name = updates.company_name;
      if (updates.industry) companyUpdates.industry = updates.industry;
      if (updates.size) companyUpdates.size = updates.size;
      if (updates.website) companyUpdates.website = updates.website;
      if (updates.company_location) companyUpdates.location = updates.company_location;

      let companyId = user.company_id;

      if (!companyId) {
        // Create new company if employer doesn't have one
        const { data: newCompany, error: createError } = await supabase
          .from("companies")
          .insert(companyUpdates)
          .select("id")
          .single();
        if (createError) throw createError;
        companyId = newCompany.id;

        // Update user with new company_id
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ company_id: companyId })
          .eq("id", user.id);
        if (userUpdateError) throw userUpdateError;
      } else {
        // Update existing company
        const { error: companyError } = await supabase
          .from("companies")
          .update(companyUpdates)
          .eq("id", companyId);
        if (companyError) throw companyError;
      }
    }

    // 4. Update role-specific table
    let tableName = "";
    const profileUpdates = { ...updates };
    delete profileUpdates.full_name; // Already handled
    // Remove company fields from profile updates
    delete profileUpdates.company_name;
    delete profileUpdates.industry;
    delete profileUpdates.size;
    delete profileUpdates.website;
    delete profileUpdates.company_location;

    if (role === "employer") tableName = "employer_profiles";
    else if (role === "admin") tableName = "admin_profiles";
    else if (role === "manager") tableName = "manager_profiles";
    else if (role === "employee") tableName = "employee_profiles";

    if (tableName && Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from(tableName)
        .update(profileUpdates)
        .eq("user_id", user.id);
      if (profileError) throw profileError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error.message);
    throw error;
  }
}
