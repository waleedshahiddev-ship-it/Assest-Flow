import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './ui/AppLayout'
import Home from './pages/Home'
import PublicRoute from './routes/PublicRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import { SidebarProvider } from './context/SidebarContext'
import OnboardingCheck from "./pages/OnboardingCheck"
import Onboarding from "./pages/Onboarding"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { OnboardingProvider } from './context/OnboardingContext'
import Invites from './pages/Invites'
import InviteEmployer from './pages/InviteEmployer'
import AdminAcceptInvitation from './pages/AdminAcceptInvitation'

const theme = createTheme()
const queryClient = new QueryClient()



const App = () => {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
  }
  return (

    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <OnboardingProvider>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}
            afterSignUpUrl="/onboarding/check"
            signInUrl="/login"
            signUpUrl="/register"
            fallbackRedirectUrl="/"

          >
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>

                <Routes>
                  {/* Onboarding routes - PUBLIC, not inside AppLayout */}
                  <Route path="/onboarding/check" element={<OnboardingCheck />} />
                  <Route
                    path="/onboarding/:role"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />


                  {/* Accept Inviations Routes - PUBLIC , not inside AppLayout} */}

                  < Route path='/:role/invite/:token' element={<AdminAcceptInvitation />} />

                  {/* Public auth routes */}
                  <Route
                    path="/login/*"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/*"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* Protected app routes - inside AppLayout - must be last */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate replace to="/home" />} />
                    <Route path="home" element={<Home />} />
                    <Route path="invites" element={<Invites />} />
                    <Route path="invites/employer" element={<InviteEmployer />} />

                  </Route>
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </ClerkProvider>
        </OnboardingProvider>
      </SidebarProvider>

      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  )
}

export default App