import { Outlet } from 'react-router-dom'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import { useSideBar } from '../context/SidebarContext'
import Navbar from './Navbar'
import SideNav from './SideNav'
import { useUser } from '@clerk/react'
import { Navigate } from "react-router-dom";
import {checkOnboardingStatus} from "../services/apiOnboarding";
import {useQuery} from "@tanstack/react-query"
import Loader from './Loader'
const drawerWidth = 240

export default function AppLayout() {
    const { open: mobileOpen, setOpen, toggle } = useSideBar()

    const handleNavigate = () => setOpen(false)

    const { user, isLoading } = useUser()

    const { data: onboarding, isLoading: onboardingLoading, isError: onboardingError } = useQuery({
        queryKey: ['onboardingStatus', user?.id],
        queryFn: () => checkOnboardingStatus(user.id),
        enabled: !!user?.id,
    })

    if (isLoading || onboardingLoading) {
        return <Loader title="Checking onboarding…" subtitle="Validating your onboarding status before opening the app" />
    }

    if (onboardingError) {
        return <Navigate to="/onboarding/employer" replace />
    }

    if (onboarding && !onboarding.onboarding) {
        const nextRole = onboarding.role || 'employer'
        return (
            <Navigate to={`/onboarding/${nextRole}`} replace />
        )
    }

    if (!onboarding) {
        return <Navigate to="/onboarding/employer" replace />
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Navbar />

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
            >
                <SideNav onNavigate={handleNavigate} />
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
                open
            >
                <SideNav />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h5">Dashboard</Typography>
                        <Typography variant="body2" color="text.secondary">Overview and quick actions</Typography>
                    </Box>
                </Box>

                <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}