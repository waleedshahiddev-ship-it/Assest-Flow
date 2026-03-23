/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useState, useCallback} from "react"

const OnboardingContext = createContext(null)


export function OnboardingProvider({ children }) {
    const [role, setRole]   = useState("")
    const [token , setToken] = useState("")

    const setOnboardingData = useCallback((role, token) => {
        setRole(role)
        setToken(token)
    }, [])

    const clearOnboardingData = useCallback(() => {
        setRole("")
        setToken("")
    }, [])

    return (
        <OnboardingContext.Provider value={{ role, token, setOnboardingData, clearOnboardingData }}>
            {children}
        </OnboardingContext.Provider>
    )
}


export function useOnboarding(){
    const ctx = useContext(OnboardingContext)
    if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider")
    return ctx
}