import { useAuth } from "@clerk/react"
import { Navigate } from "react-router-dom"
import Loader from '../ui/Loader'

const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <Loader title="Securing your session…" subtitle="Verifying access and loading your workspace" />
    }

    if (!isSignedIn) {
        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute