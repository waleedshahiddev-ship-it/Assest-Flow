import {supabase} from "./supabase";

export async function createUserAndCompany(payload) {
   try {
     const {
         clerkId,
         email,
         role,
         fullName,
         companyName,
         industry,
         companySize,
         website,
         token,
     } = payload;
 
     // ── Invited user (manager / employee) ────────────────────────
     if (token) {
         const { data: invite, error: inviteError } = await supabase
             .from("invitations")
             .select("*")
             .eq("token", token)
             .eq("status", "pending")
             .gt("expires_at", new Date().toISOString())
             .single();
 
         if (inviteError || !invite) {
             throw new Error("Invalid, expired, or already-used invite token");
         }
 
         const { data: user, error: userError } = await supabase
             .from("users")
             .insert({
                 clerk_id: clerkId,
                 email,
                 full_name: fullName,
                 role,
                 company_id: invite.company_id,
                 onboarding_completed: true,
             })
             .select()
             .single();
 
         if (userError) throw new Error("Failed to create user: " + userError.message);
 
         await supabase
             .from("invitations")
             .update({ status: "used"})
             .eq("id", invite.id);
 
         return { user, company_id: invite.company_id };
     }
 
     // ── Employer onboarding ───────────────────────────────────────
     if (role === "employer") {
         // Create company first so we can insert the user with a valid company_id
         const { data: company, error: companyError } = await supabase
             .from("companies")
             .insert({
                 name: companyName,
                 industry,
                 size: companySize,
                 website: website || null,
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
 
         return { user, company: { ...company, owner_id: user.id } };
     }
 
   } catch (error) {
     console.error("Onboarding error:", error);
     throw error;
   }
}