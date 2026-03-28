import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import { useSideBar } from '../context/SidebarContext'
import Navbar from './Navbar'
import SideNav from './SideNav'

const drawerWidth = 260

export default function AppLayout() {
    const { open: mobileOpen, setOpen, toggle } = useSideBar()

    const handleNavigate = () => setOpen(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Navbar - Pass drawerWidth if it needs to shift its content */}
            <Navbar drawerWidth={drawerWidth} />

            {/* Mobile Drawer (Overlay) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggle}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        width: drawerWidth,
                        boxSizing: 'border-box' 
                    },
                }}
            >
                <SideNav onNavigate={handleNavigate} />
            </Drawer>

            {/* Desktop Drawer (Persistent Space) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth, // This "reserves" the space so content doesn't hide behind it
                    flexShrink: 0,      // Prevents the drawer from squishing
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
                open
            >
                <SideNav />
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0, // Prevents flex children from overflowing
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default'
                }}
            >
                {/* This Toolbar acts as a spacer so content doesn't go under the fixed Navbar */}
                <Toolbar />

                <div className="flex-1 overflow-auto">
                    {/* Using max-w-7xl and mx-auto is the professional way to center content. 
                        It stays readable on huge monitors and adapts to small ones.
                    */}
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Outlet />
                        <Toaster richColors position="top-right" />
                    </div>
                </div>
            </Box>
        </Box>
    )
}