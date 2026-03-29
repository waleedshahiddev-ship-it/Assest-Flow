/* eslint-disable react-refresh/only-export-components */
import {createContext, useContext, useState, useCallback} from "react"

const OnboardingContext = createContext(null)

const STORAGE_KEY = "asset-flow-onboarding"

function readStoredOnboarding() {
    if (typeof window === "undefined") return { role: "", token: "" }
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY)
        if (!raw) return { role: "", token: "" }
        const parsed = JSON.parse(raw)
        return {
            role: parsed?.role || "",
            token: parsed?.token || "",
        }
    } catch {
        return { role: "", token: "" }
    }
}


export function OnboardingProvider({ children }) {
    const initial = readStoredOnboarding()
    const [role, setRole]   = useState(initial.role)
    const [token , setToken] = useState(initial.token)

    const setOnboardingData = useCallback((role, token) => {
        setRole(role)
        setToken(token)
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ role, token }))
        }
    }, [])

    const clearOnboardingData = useCallback(() => {
        setRole("")
        setToken("")
        if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(STORAGE_KEY)
        }
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