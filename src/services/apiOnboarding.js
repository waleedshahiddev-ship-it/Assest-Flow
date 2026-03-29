import { supabase } from "./supabase";

export async function createUserAndCompany(payload) {
    try {

        // check the role 
        const { role } = payload;

        // based on the role extract the corresponding data from the payload

        if (role === "employer") {
            const { clerkId, email, fullName, companyName, industry, companySize, website, location, phone } = payload;

            if (!clerkId || !email || !fullName || !companyName || !industry || !location) {
                throw new Error("Missing required fields for employer onboarding");
            }

            // Create company first so we can insert the user with a valid company_id
            const { data: company, error: companyError } = await supabase
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

            if (companyError || !company) throw new Error("Failed to create company: " + (companyError?.message || "unknown"));


            // Now create the user with the company_id set
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({
                    clerk_id: clerkId,
                    email,
                    full_name: fullName,
                    role: "employer",
                    company_id: company.id,
                    onboarding_completed: true,
                })
                .select()
                .single();

            if (userError || !user) {
                // delete the company if user creation fails, to avoid orphaned records
                await supabase.from("companies").delete().eq("id", company.id);
                throw new Error("Failed to create user: " + (userError?.message || "unknown"));
            };

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

            if (employerError) throw new Error("Failed to create employer record: " + employerError.message);

            return { user, company: { ...company, owner_id: user.id } };
        }

        if (role == "admin") {
            const { clerkId, companyId, email, fullName, phone, role, title } = payload

            if (!clerkId || !email || !fullName) {
                throw new Error("Missing required fields for admin onboarding");
            }


            // create the user record 
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({
                    clerk_id: clerkId,
                    email,
                    full_name: fullName,
                    role: role,
                    company_id: companyId,
                    onboarding_completed: true,
                })
                .select()
                .single();

            if (userError || !user) {
                throw new Error("Failed to create user: " + (userError?.message || "unknown"));
            };

            // create the admin record and link it with the user account created 
            const { data: admin, error: adminError } = await supabase.from("admin_profiles")
                .insert({
                    user_id: user.id,
                    company_id: companyId,
                    phone: phone || "",
                    title: title || "",
                });

            if (adminError) throw new Error("Failed to create admin record: " + employerError.message);

            return { ...user, ...admin }

        }

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

        const { data: sender, isError: senderError } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .single()

        if (senderError) {
            throw new Error("Error while getting the company details based on the token")
        }

        const senderId = sender.sender_id

        // get the company id based on the sender id 

        const { data: companyIdData, isError: companyIdDataError } = await supabase
            .from("users")
            .select("*")
            .eq("id", senderId)
            .single()

        if (companyIdDataError) {
            throw new Error("Error while getting the company details based on the token")
        }

        const companyId = companyIdData.company_id

        // get the company details based on the compnay id 

        const { data: companyData, isError: companyDataError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .single()

        if (companyDataError) {
            throw new Error("Error while getting the company details based on the token")
        }

        return companyData

    } catch (error) {
        throw new Error("Error while getting the company details based on the token")
    }
}

