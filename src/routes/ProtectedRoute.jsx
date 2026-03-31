import { useAuth, useUser } from "@clerk/react"
import { Navigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { checkOnboardingStatus } from "../services/apiOnboarding"
import Loader from '../ui/Loader'

const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth()
    const { user } = useUser()
    const location = useLocation()

    const onboardingQuery = useQuery({
        queryKey: ["onboardingStatus", user?.id],
        queryFn: () => checkOnboardingStatus(user.id),
        enabled: isLoaded && isSignedIn && !!user?.id,
    })

    if (!isLoaded) {
        return <Loader title="Securing your session…" subtitle="Verifying access and loading your workspace" />
    }

    if (!isSignedIn) {
        return <Navigate to="/login" />
    }

    if (onboardingQuery.isLoading) {
        return <Loader title="Loading account…" subtitle="Checking onboarding status" />
    }

    const isOnboardingPath = location.pathname.startsWith("/onboarding")
    if (!isOnboardingPath && onboardingQuery.data && !onboardingQuery.data.onboarding) {
        return <Navigate to="/onboarding/check" replace />
    }

    return children
}

export default ProtectedRoute