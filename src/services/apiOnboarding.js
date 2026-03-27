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
        const { data: invite, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .eq("email", email)
            .eq("status", "pending")
            .gt("expires_at", new Date().toISOString())
            .single();

        if (error) throw new Error("Failed to check invite token: " + error.message);

        if (!invite) {
            return { valid: false, message: "Invalid, expired, or already-used invite token" };
        }

        if (invite.email !== email) {
            return { valid: false, message: "Invite token does not match the logged in user's email" };
        }

        return { valid: true, message: "Valid invite token" };
    } catch (error) {
        console.error("Error checking invite token:", error);
        throw error;
    }
}


// check the role of the user 

export async function getUserRole(userId){
    try {
        const {data, error} = await supabase
            .from("users")
            .select("*")
            .eq("id",userId)
            .single()
        
        if(error) throw new Error("Failed to check the user role: " + error.message)

        if(!data){
            throw new Error("Invalid data while checking the user role")
        }

        return data.role

    } catch (error) {
        console.error("Error while checking the user role", error)
        throw error
    }
}