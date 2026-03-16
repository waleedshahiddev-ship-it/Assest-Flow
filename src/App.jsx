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

const theme = createTheme()

const App = () => {

  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
  }
  return (

    <SidebarProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>

          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate replace to="home" />} />
              <Route path="home" element={<Home />} />
            </Route>

            <Route
              path="login/*"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="register/*"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          </Routes>

        </BrowserRouter>
        </ThemeProvider>
      </ClerkProvider>
    </SidebarProvider>
  )
}

export default App