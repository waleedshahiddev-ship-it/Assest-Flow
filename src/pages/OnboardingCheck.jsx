import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"
import { useOnboarding } from "../context/OnboardingContext"
import { checkOnboardingStatus } from "../services/apiOnboarding"
import { useQuery } from "@tanstack/react-query"
import { checkInviteTokenEmail } from "../services/apiOnboarding"

const OnboardingCheck = () => {
    const navigate = useNavigate()
    const { isSignedIn, isLoaded, user } = useUser()
    const { role, token } = useOnboarding()

    useEffect(() => {
        if (!isLoaded) return

        // if there is no signed in user, redirect to login

        if (!isSignedIn) {
            navigate("/login")
            return
        }


        // check if the current user has already done the onboarding 

        const { data: onboarding, isLoading: onboardingLoading } = useQuery({
            queryKey: ['onboardingStatus', user?.id],
            queryFn: () => checkOnboardingStatus(user.id),
            enabled: !!user?.id
        })

        if (!onboardingLoading && onboarding.onboarding) {
            // if the user has already completed onboarding, redirect to home
            navigate("/")
            return
        }

        // check any onbaording data exits in the onboarding react context or not 

        if (role && token) {
            // find thge email address of the logged in user and compare with the email address in the onboarding context

            const userEmail = user.emailAddresses?.[0]?.emailAddress

            // query the supabase database to check the current user email address based on the token 

            const { data: tokenCheck, isLoading: tokenCheckLoading } = useQuery({
                queryKey: ['checkInviteToken', userEmail, token],
                queryFn: () => checkInviteTokenEmail(userEmail, token),
                enabled: !!userEmail && !!token
            })

            if (!tokenCheckLoading) {
                if (tokenCheck.valid) {
                    // if the token is valid, redirect to the onboarding page based on the role in the onboarding context
                    navigate(`/onboarding/${role}`)
                    return
                } else {
                    // if the token is not valid, redirect to home page with an error message
                    console.error(tokenCheck.message)
                    // TODO: Redirect to the /need/logout route with the error message 
                    return
                }

            }
        } else {

            // if there is no onboarding data in the context, 
            // redirect to the employer onbaording page 

            navigate("/onboarding/employer")
        }
    }, [isLoaded, isSignedIn, navigate])

    return (
        <div className="flex items-center justify-center h-screen">
            <div>Verifying your account...</div>
            <div>Redirecting to the onboarding page...</div>
        </div>
    )
}

export default OnboardingCheck