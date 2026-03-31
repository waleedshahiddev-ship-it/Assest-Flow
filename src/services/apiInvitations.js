import { supabase } from "./supabase"


// check the role of the user 

export async function getUserRole(userId) {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", userId)
            .single()

        if (error) throw new Error("Failed to check the user role: " + error.message)

        if (!data) {
            throw new Error("Invalid data while checking the user role")
        }

        return data.role

    } catch (error) {
        console.error("Error while checking the user role", error)
        throw error
    }
}


// get the company name and company location based on the user id


export async function getCompanyDetails(userId) {
    try {
        // get the user id based on the clerk id 
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", userId)
            .single()


        if (userError) {
            throw new Error("Error while checking the company details based on the user id: " + userError.message)
        }

        const company_id = user.company_id

        // get the company details based on the company_id 

        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", company_id)
            .single()

        if (companyError) {
            throw new Error("Error while checking the company details based on the user id: " + companyError.message)
        }

        return {
            companyId: company.id,
            companyName: company.name,
            companyLocation: company.location
        }

    } catch (error) {
        throw new Error("Failed to get the company details: " + error.message)
    }
}


// funcion for generating the invite token 

function generateToken(length = 10) {
    return Math.random().toString(36).slice(2).padEnd(length, "0").slice(0, length);
}


const INVITABLE_ROLES = ["admin", "manager", "employee"]

export async function sendRoleInvite(payload) {
    try {
        const { clerkId, receipientEmail, companyId, targetRole, senderRole } = payload

        if (!clerkId || !receipientEmail || !companyId || !targetRole || !senderRole) {
            throw new Error("Missing required invitation data")
        }

        const normalizedTargetRole = String(targetRole).toLowerCase()
        if (!INVITABLE_ROLES.includes(normalizedTargetRole)) {
            throw new Error("Invalid target role for invitation")
        }

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", clerkId)
            .single()

        if (userError || !user) {
            throw new Error("Error while finding sender user: " + (userError?.message || "unknown"))
        }

        const token = generateToken()
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

        const { data: invitation, error: invitationError } = await supabase
            .from("invitations")
            .insert({
                email: receipientEmail.trim().toLowerCase(),
                role: normalizedTargetRole,
                company_id: companyId,
                token,
                status: "pending",
                expire_at: expiresAt,
                sender_role: String(senderRole).toLowerCase(),
                sender_id: user.id
            })
            .select()
            .single()

        if (invitationError || !invitation) {
            throw new Error("Error while creating invitation: " + (invitationError?.message || "unknown"))
        }

        return { success: true, data: invitation }
    } catch (error) {
        console.log(error)
        throw new Error("Error while sending the invitation: " + error.message)
    }
}


export async function sendAdminInvite(payload) {
    return sendRoleInvite({
        ...payload,
        targetRole: "admin",
        senderRole: "employer",
    })
}

export async function sendManagerInvite(payload) {
    return sendRoleInvite({
        ...payload,
        targetRole: "manager",
        senderRole: "admin",
    })
}

export async function sendEmployeeInvite(payload) {
    return sendRoleInvite({
        ...payload,
        targetRole: "employee",
        senderRole: "manager",
    })
}


// get the user details 

export async function getUserDetails(clerkId) {
    try {
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", clerkId)
            .single()


        if (userError) {
            throw new Error("Error while checking the user details", userError.message)
        }

        return user
    } catch (error) {
        throw new Error("Error while checking the user details", error)
    }
}


// query the invitations table and validate the token status 

export async function validateTokenStatus(token) {
    try {

        // query the supabase to validate the token 

        const { data: tokenData, error: tokenError } = await supabase
            .from("invitations")
            .select("*")
            .eq("token", token)
            .maybeSingle()


        if (tokenError) {
            throw new Error("Error while validating token: " + tokenError.message)
        }

        if (!tokenData) {
            return { validate: false, message: "Invalid token" }
        }

        if (tokenData.status !== "pending") {
            return { validate: false, message: "Token is used already" }
        }

        if (!tokenData.expire_at || new Date(tokenData.expire_at) <= new Date()) {
            return { validate: false, message: "Token is expired" }
        }

        return { validate: true, message: "Token is valid" }

    } catch (error) {
        throw new Error("Error while checking the token status: " + error.message)
    }
}