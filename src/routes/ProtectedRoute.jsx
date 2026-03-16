import { useAuth } from "@clerk/react"
import { Navigate } from "react-router-dom"
const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <div>Loading...</div>
    }

    if (!isSignedIn) {
        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute