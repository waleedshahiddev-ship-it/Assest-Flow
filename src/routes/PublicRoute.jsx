import { useAuth } from "@clerk/react"
import { Navigate } from "react-router-dom"
import Loader from '../ui/Loader'

const PublicRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <Loader title="Loading account…" subtitle="Checking your session and preferences" />
    }

    if (isSignedIn) {
        // Let onboarding check decide final destination based on onboarding status.
        return <Navigate to="/onboarding/check" replace />
    }

    return children
}

export default PublicRoute



