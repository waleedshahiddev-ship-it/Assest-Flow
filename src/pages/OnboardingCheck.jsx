import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useUser } from "@clerk/react"
import { useOnboarding } from "../context/OnboardingContext"
import { checkOnboardingStatus } from "../services/apiOnboarding"
import { useQuery } from "@tanstack/react-query"
import { checkInviteTokenEmail } from "../services/apiOnboarding"

const ALLOWED_ROLES = ["employer", "admin", "manager", "employee"]

const OnboardingCheck = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { isSignedIn, isLoaded, user } = useUser()
    const { role, token, setOnboardingData } = useOnboarding()
    const inviteRole = searchParams.get("role")
    const inviteToken = searchParams.get("token")
    const userEmail = user?.emailAddresses?.[0]?.emailAddress

    const onboardingQuery = useQuery({
        queryKey: ["onboardingStatus", user?.id],
        queryFn: () => checkOnboardingStatus(user.id),
        enabled: !!isLoaded && !!isSignedIn && !!user?.id,
    })

    const inviteQuery = useQuery({
        queryKey: ["checkInviteToken", userEmail, token],
        queryFn: () => checkInviteTokenEmail(userEmail, token),
        enabled:
            !!isLoaded &&
            !!isSignedIn &&
            !!userEmail &&
            !!role &&
            !!token &&
            onboardingQuery.isSuccess &&
            !onboardingQuery.data?.onboarding,
    })

    useEffect(() => {
        if (inviteRole && inviteToken && ALLOWED_ROLES.includes(inviteRole)) {
            setOnboardingData(inviteRole, inviteToken)
        }
    }, [inviteRole, inviteToken, setOnboardingData])

    useEffect(() => {
        if (!isLoaded) return

        // if there is no signed in user, redirect to login

        if (!isSignedIn) {
            navigate("/login")
            return
        }

        if (onboardingQuery.isLoading) return

        if (onboardingQuery.isError) {
            navigate("/onboarding/employer")
            return
        }

        if (onboardingQuery.data?.onboarding) {
            // if the user has already completed onboarding, redirect to home
            navigate("/")
            return
        }

        // check any onbaording data exits in the onboarding react context or not 

        if (role && token) {
            if (!ALLOWED_ROLES.includes(role)) {
                navigate("/onboarding/employer")
                return
            }

            if (inviteQuery.isLoading) return

            if (inviteQuery.isSuccess) {
                if (inviteQuery.data?.valid) {
                    // if the token is valid, redirect to the onboarding page based on the role in the onboarding context
                    navigate(`/onboarding/${role}`)
                    return
                }

                console.error(inviteQuery.data?.message || "Invalid invite token")
                navigate("/onboarding/employer")
                return
            }

            if (inviteQuery.isError) {
                navigate("/onboarding/employer")
                return
            }
        } else {

            // if there is no onboarding data in the context, 
            // redirect to the employer onbaording page 

            navigate("/onboarding/employer")
        }
    }, [
        isLoaded,
        isSignedIn,
        navigate,
        role,
        token,
        onboardingQuery.isLoading,
        onboardingQuery.isError,
        onboardingQuery.data,
        inviteQuery.isLoading,
        inviteQuery.isSuccess,
        inviteQuery.isError,
        inviteQuery.data,
    ])

    return (
        <div className="flex items-center justify-center h-screen">
            <div>Verifying your account...</div>
            <div>Redirecting to the onboarding page...</div>
        </div>
    )
}

export default OnboardingCheck