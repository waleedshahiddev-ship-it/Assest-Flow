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
    const { isSignedIn, isLoaded, user } = useUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress

    const { role, token } = useOnboarding()

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
        if (!isLoaded) return

        // if there is no signed in user, redirect to login

        if (!isSignedIn) {
            navigate("/login")
            return
        }

        if (onboardingQuery.isLoading) return

        if (onboardingQuery.isError) {
            console.error("Failed to check onboarding status")
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
                console.error("Invalid role in onboarding context:", role)
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
                console.error("Invalid role in onboarding context:", role)
                return
            }

            if (inviteQuery.isError) {
                console.error("Error occurred while checking invite token:", inviteQuery.error)
                return
            }
        } else {

            // if there is no onboarding data in the context, 
            // redirect to the employer onbaording page 
            // as the employer needs no invite token to onboard and can start the 
            // onboarding process by creating a company and then inviting other users to join the company

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