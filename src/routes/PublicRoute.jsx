import { useAuth } from "@clerk/react"
import { Navigate } from "react-router-dom"
import { ClerkLoaded, ClerkLoading, ClerkDegraded, ClerkFailed } from '@clerk/react'

const PublicRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return <div>Loading...</div>
    }

    if (isSignedIn) {
        return <Navigate to="/" />
    }

    return children
}

export default PublicRoute