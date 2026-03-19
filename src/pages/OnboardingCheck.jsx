import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/react"

const OnboardingCheck = () => {
    const navigate = useNavigate()
    const { isSignedIn, isLoaded } = useAuth()

    useEffect(() => {
        if (!isLoaded) return

        if (!isSignedIn) {
            navigate("/login")
            return
        }

        

        // Fresh signup - route to employer onboarding by default
        // (invite tokens will be handled separately)
        navigate("/onboarding/employer")
    }, [isLoaded, isSignedIn, navigate])

    return (
        <div className="flex items-center justify-center h-screen">
            <div>Verifying your account...</div>
        </div>
    )
}

export default OnboardingCheck