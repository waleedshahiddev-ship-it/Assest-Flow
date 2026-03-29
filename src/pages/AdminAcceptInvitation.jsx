import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { validateTokenStatus } from "../services/apiInvitations"
import { toast } from "sonner"
import { useUser } from "@clerk/react"
import { useOnboarding } from "../context/OnboardingContext"

const AdminAcceptInvitation = () => {

    const params = useParams()

    const { role, token } = params

    const validRoles = ["admin", "manager", "employee"]

    const [currentRoleIsValid, setCurrentRoleIsValid] = useState(false)

    const { isLoaded, isSignedIn } = useUser()

    const { setOnboardingData } = useOnboarding()
    const navigate = useNavigate()




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

    useEffect(() => {
        if (tokenStatusError) {
            toast.error("Error while checking the invitation")
        }
    }, [tokenStatusError])

    // Persist invite role/token in onboarding context only after validations pass.
    useEffect(() => {
        if (!tokenLoading && tokenStatus?.validate && !isSignedIn && role && token) {
            setOnboardingData(role, token)
            navigate('/register', { replace: true })
        }
    }, [tokenLoading, tokenStatus, isSignedIn, role, token, setOnboardingData, navigate])


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

    if (tokenStatus.validate) {
        return <div>Redirecting to sign up…</div>
    }

    return <div>{tokenStatus.message}</div>
}


export default AdminAcceptInvitation