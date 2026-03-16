import { useAuth } from "@clerk/react"
import { Navigate } from "react-router-dom"
import Loader from '../ui/Loader'

const PublicRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <Loader title="Loading account…" subtitle="Checking your session and preferences" />
    }

    if (isSignedIn) {
        return <Navigate to="/" />
    }

    return children
}

export default PublicRoute



