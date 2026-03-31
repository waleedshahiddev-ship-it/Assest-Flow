import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { validateTokenStatus } from "../services/apiInvitations"
import { toast } from "sonner"
import { useClerk, useUser } from "@clerk/react"
import { useOnboarding } from "../context/OnboardingContext"

const AdminAcceptInvitation = () => {

    const params = useParams()

    const { role, token } = params
    const normalizedRole = (role || "").toLowerCase()

    const validRoles = ["admin", "manager", "employee"]

    const [currentRoleIsValid, setCurrentRoleIsValid] = useState(false)

    const { isLoaded, isSignedIn } = useUser()
    const { signOut } = useClerk()

    const { setOnboardingData } = useOnboarding()
    const navigate = useNavigate()




    useEffect(() => {
        if (validRoles.includes(normalizedRole)) {
            setCurrentRoleIsValid(true)
        } else {
            setCurrentRoleIsValid(false)
        }

    }, [normalizedRole])


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
        if (!isLoaded) return

        if (!tokenLoading && tokenStatus?.validate && !isSignedIn && normalizedRole && token) {
            setOnboardingData(normalizedRole, token)
            navigate('/register', { replace: true })
        }
    }, [isLoaded, tokenLoading, tokenStatus, isSignedIn, normalizedRole, token, setOnboardingData, navigate])


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
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-lg border bg-white p-6 shadow-sm text-center space-y-4">
                    <h2 className="text-xl font-semibold">Sign out required</h2>
                    <p className="text-sm text-slate-600">
                        You are already signed in. Please sign out to continue with this invitation.
                    </p>
                    <button
                        className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        onClick={async () => {
                            await signOut({ redirectUrl: `/${normalizedRole}/invite/${token}` })
                        }}
                    >
                        Sign out and continue
                    </button>
                </div>
            </div>
        )
    }

    if (tokenStatus.validate) {
        return <div>Redirecting to sign up…</div>
    }

    return <div>{tokenStatus.message}</div>
}


export default AdminAcceptInvitation