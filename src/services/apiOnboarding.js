import { supabase } from "./supabase";

const INVITED_ROLES = ["admin", "manager", "employee"]

async function setOnboardingCompleted(userId, completed = true) {
    const { error } = await supabase
        .from("users")
        .update({ onboarding_completed: completed })
        .eq("id", userId)

    if (error) {
        throw new Error("Failed to update onboarding status: " + error.message)
    }
}

async function validateInvitationForOnboarding({ token, role, email }) {
    if (!token || !role || !email) {
        throw new Error("Missing invite token, role, or email")
    }

    const { data: invite, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle()

    if (error) throw new Error("Failed to validate invitation: " + error.message)
    if (!invite) throw new Error("Invalid invite token")

    if ((invite.email || "").trim().toLowerCase() !== (email || "").trim().toLowerCase()) {
        throw new Error("Invitation email does not match current account email")
    }

    if ((invite.role || "").toLowerCase() !== (role || "").toLowerCase()) {
        throw new Error("Invitation role does not match onboarding role")
    }

    if (invite.status !== "pending") {
        throw new Error("Invitation is no longer pending")
    }

    if (!invite.expire_at || new Date(invite.expire_at) <= new Date()) {
        throw new Error("Invitation has expired")
    }

    return invite
}

export async function createUserAndCompany(payload) {
    try {

        // check the role 
        const { role } = payload;
        const normalizedRole = String(role || "").toLowerCase();

        // based on the role extract the corresponding data from the payload

        if (normalizedRole === "employer") {
            const { clerkId, email, fullName, companyName, industry, companySize, website, location, phone } = payload;

            if (!clerkId || !email || !fullName || !companyName || !industry || !location) {
                throw new Error("Missing required fields for employer onboarding");
            }

            let company = null
            let user = null

            // Create company first so we can insert the user with a valid company_id
            const { data: createdCompany, error: companyError } = await supabase
                .from("companies")
                .insert({
                    name: companyName,
                    industry,
                    size: companySize || "",
                    website: website || "",
                    location,
                    owner_id: null,
                })
                .select()
                .single();

            if (companyError || !createdCompany) throw new Error("Failed to create company: " + (companyError?.message || "unknown"));

            company = createdCompany


            // Now create the user with the company_id set
            const { data: createdUser, error: userError } = await supabase
                .from("users")
                .insert({
                    clerk_id: clerkId,
                    email,
                    full_name: fullName,
                    role: "employer",
                    company_id: company.id,
                    onboarding_completed: false,
                })
                .select()
                .single();

            if (userError || !createdUser) {
                // delete the company if user creation fails, to avoid orphaned records
                await supabase.from("companies").delete().eq("id", company.id);
                throw new Error("Failed to create user: " + (userError?.message || "unknown"));
            };

            user = createdUser

            // Finally, set the company owner_id to the new user (if not already set)
            if (company.owner_id !== user.id) {
                const { error: ownerError } = await supabase
                    .from("companies")
                    .update({ owner_id: user.id })
                    .eq("id", company.id);

                if (ownerError) throw new Error("Failed to set company owner: " + ownerError.message);
            }


            // insert the data into the employer table for the employer specific data
            const { error: employerError } = await supabase.from("employer_profiles")
                .insert({
                    user_id: user.id,
                    company_id: company.id,
                    phone: phone || "",
                });

            if (employerError) {
                await supabase.from("users").delete().eq("id", user.id)
                await supabase.from("companies").delete().eq("id", company.id)
                throw new Error("Failed to create employer record: " + employerError.message);
            }

            await setOnboardingCompleted(user.id, true)

            return { user, company: { ...company, owner_id: user.id } };
        }

        if (INVITED_ROLES.includes(normalizedRole)) {
            const { clerkId, companyId, email, fullName, phone, title, token, department, managerLevel, jobTitle, location } = payload

            if (!clerkId || !email || !fullName) {
                throw new Error("Missing required fields for invited role onboarding");
            }

            const invite = await validateInvitationForOnboarding({ token, role: normalizedRole, email })

            const resolvedCompanyId = companyId || invite.company_id
            let createdUser = null


            // create the user record 
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({
                    clerk_id: clerkId,
                    email,
                    full_name: fullName,
                    role: normalizedRole,
                    company_id: resolvedCompanyId,
                    onboarding_completed: false,
                })
                .select()
                .single();

            if (userError || !user) {
                throw new Error("Failed to create user: " + (userError?.message || "unknown"));
            };

            createdUser = user

            if (normalizedRole === "admin") {
                const { error: adminError } = await supabase.from("admin_profiles")
                    .insert({
                        user_id: user.id,
                        company_id: resolvedCompanyId,
                        phone: phone || "",
                        title: title || "",
                    });

                if (adminError) {
                    await supabase.from("users").delete().eq("id", user.id)
                    throw new Error("Failed to create admin record: " + adminError.message);
                }
            }

            if (normalizedRole === "manager") {
                const { error: managerError } = await supabase.from("manager_profiles")
                    .insert({
                        user_id: user.id,
                        company_id: resolvedCompanyId,
                        phone: phone || "",
                        department: department || "",
                        manager_level: managerLevel || "",
                    });

                if (managerError) {
                    await supabase.from("users").delete().eq("id", user.id)
                    throw new Error("Failed to create manager record: " + managerError.message);
                }
            }

            if (normalizedRole === "employee") {
                const { error: employeeError } = await supabase.from("employee_profiles")
                    .insert({
                        user_id: user.id,
                        company_id: resolvedCompanyId,
                        manager_id: invite.sender_id,
                        department: department || "",
                        job_title: jobTitle || "",
                        location: location || "",
                    });

                if (employeeError) {
                    await supabase.from("users").delete().eq("id", user.id)
                    throw new Error("Failed to create employee record: " + employeeError.message);
                }
            }

            const { error: inviteUpdateError } = await supabase
                .from("invitations")
                .update({ status: "used" })
                .eq("id", invite.id)

            if (inviteUpdateError) {
                await supabase.from("users").delete().eq("id", createdUser.id)
                throw new Error("Failed to mark invitation as used: " + inviteUpdateError.message)
            }

            await setOnboardingCompleted(createdUser.id, true)

            return { success: true, user: createdUser }

        }

        throw new Error("Unsupported onboarding role")

    } catch (error) {
        console.error("Onboarding error:", error);
        throw error;
    }
}



// Check the onBoaring status of the user 

export async function checkOnboardingStatus(clerkId) {
    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("onboarding_completed, role")
            .eq("clerk_id", clerkId)
            .order("created_at", { ascending: false })
            .limit(1);


        if (error) throw new Error("Failed to check onboarding status: " + error.message);

        const user = users?.[0];

        if (!user) {
            return { onboarding: false, role: null };
        }


        return user.onboarding_completed
            ? { onboarding: true, role: user.role }
            : { onboarding: false, role: user.role };
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        throw error;
    }
}

// Comapre the email address of the logged in user with the email address in the invitations table based on the token

export async function checkInviteTokenEmail(email, token) {
    try {
        if (!email || !token) {
            return { valid: false, message: "Missing email or invite token" };
        }

        const { data: invite, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error("Failed to check invite token: " + error.message);

        if (!invite) {
            return { valid: false, message: "Invalid invite token" };
        }

        if ((invite.email || "").trim().toLowerCase() !== (email || "").trim().toLowerCase()) {
            return { valid: false, message: "Invite token does not match the logged in user's email" };
        }

        if (invite.status !== "pending") {
            return { valid: false, message: "Invite token is already used or no longer pending" };
        }

        const expiresAt = invite.expire_at ? new Date(invite.expire_at) : null;
        if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
            return { valid: false, message: "Invite token has expired" };
        }

        return { valid: true, message: "Valid invite token" };
    } catch (error) {
        console.error("Error checking invite token:", error);
        throw error;
    }
}


// get compnay details from the token 

export async function getCompanyDetailsBasedOnToken(token) {
    try {
        // get the sender id based on token from the invitations 

        const { data: sender, error: senderError } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .maybeSingle()

        if (senderError || !sender) {
            throw new Error("Error while getting the company details based on the token")
        }

        const senderId = sender.sender_id

        // get the company id based on the sender id 

        const { data: companyIdData, error: companyIdDataError } = await supabase
            .from("users")
            .select("*")
            .eq("id", senderId)
            .single()

        if (companyIdDataError) {
            throw new Error("Error while getting the company details based on the token")
        }

        const companyId = companyIdData.company_id

        // get the company details based on the compnay id 

        const { data: companyData, error: companyDataError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .single()

        if (companyDataError) {
            throw new Error("Error while getting the company details based on the token")
        }

        let inviterDepartment = ""
        const { data: managerProfile } = await supabase
            .from("manager_profiles")
            .select("department")
            .eq("user_id", senderId)
            .maybeSingle()

        if (managerProfile?.department) {
            inviterDepartment = managerProfile.department
        }

        return {
            ...companyData,
            inviterDepartment,
        }

    } catch (error) {
        throw new Error("Error while getting the company details based on the token")
    }
}

