import { Navigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { validateTokenStatus } from "../services/apiInvitations"
import { toast } from "sonner"
import { useUser } from "@clerk/react"
import { useOnboarding } from "../context/OnboardingContext"
import { useNavigate } from "react-router-dom"
const AdminAcceptInvitation = () => {

    const params = useParams()

    const { role, token } = params

    const validRoles = ["admin", "manager", "employee"]

    const [currentRoleIsValid, setCurrentRoleIsValid] = useState(false)

    const { isLoaded, isSignedIn } = useUser()
    
    const {setOnboardingData, clearOnboardingData} = useOnboarding()

    


    useEffect(() => {
        if (validRoles.includes(role)) {
            setCurrentRoleIsValid(true)
        } else {
            setCurrentRoleIsValid(false)
        }

    }, [role])


    // check the token status 
    const { data: tokenStatus, isLoading: tokenLoading, isError: tokenStatusError } = useQuery({
        queryKey: ["Checking the token status", token],
        queryFn: () => validateTokenStatus(token),
        enabled: !!token
    })

    if (tokenStatusError) {
        toast.error("Error while checking the invitation")
    }


    if (!tokenLoading && tokenStatus) {
        console.log(tokenStatus)
        console.log(tokenStatus.validate)
    }

    if (!currentRoleIsValid) {
        return <div>Not a valid role</div>
    }

    if (tokenLoading) {
        return <div>Checking invitation token…</div>
    }

    // tokenStatus may be undefined if query returned nothing or errored
    if (!tokenStatus) {
        return <div>Invalid or expired token</div>
    }


    // Wait until Clerk has loaded user state
    if (!isLoaded) {
        return <div>Checking authentication…</div>
    }


    if (isSignedIn) {
        return <div>Need to sign out first </div>
    }


    // add the role and the token in the react context 

    setOnboardingData(role, token)


    return tokenStatus.validate ? (
        <Navigate to={`/register`} replace/>
    ) : (
        <div>{tokenStatus.message}</div>
    )
}


export default AdminAcceptInvitation