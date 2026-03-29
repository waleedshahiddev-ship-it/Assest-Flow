import { data } from "react-router-dom"
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
            throw new Error("Error while checking the company details based on the user id ", error.message)
        }

        const company_id = user.company_id

        // get the company details based on the company_id 

        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", company_id)
            .single()

        if (companyError) {
            throw new Error("Error while checking the company details based on the user id ", error.message)
        }

        return {
            companyId: company.id,
            companyName: company.name,
            companyLocation: company.location
        }

    } catch (error) {
        throw new Error("Falied to get the company details", error.message)
    }
}


// funcion for generating the invite token 

function generateToken(length = 10) {
    return Math.random().toString(36).slice(2).padEnd(length, "0").slice(0, length);
}


export async function sendAdminInvite(payload) {
    try {

        const { clerkId, receipientEmail, companyId } = payload
        // get the user id based on the clerk id 
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", clerkId)
            .single()

        if (userError) {
            console.log("User in checking user")
            // throw new Error("Error while sending the admin invitation")
        }

        const senderId = user.id
        const token = generateToken()
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)


        // validate the data before creating a record 

        if (!clerkId || !receipientEmail || !companyId) {

            console.log("Data from frontend not available")
            // throw new Error("Error while sending the admin invitation")
        }


        const { data: invitation, error: invitationError } = await supabase
            .from("invitations")
            .insert({
                email: receipientEmail,
                role: "admin",
                company_id: companyId,
                token,
                status: "pending",
                expire_at: expiresAt,
                sender_role: "employer",
                sender_id: senderId
            })
            .select()
            .single()

        if (invitationError) {
            console.log("Invitation not generated")
            throw new Error("Error while sending the admin invitation")
        }

        return { success: true, data: invitation }

    } catch (error) {
        console.log(error)
        throw new Error("Error while sending the admin invitation", error)

    }
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
            .single()


        if (tokenError) {
            throw new Error("Error ", tokenError)
        }

        if (!tokenData) {
            return { validate: false, message: "Invalid token" }
        }

        if (tokenData.status === "used") {
            return { validate: false, message: "Token is used already" }
        }

        return { validate: true, message: "Token is valid" }

    } catch (error) {
        throw new Error("Error while checking the token status", error)
    }
}