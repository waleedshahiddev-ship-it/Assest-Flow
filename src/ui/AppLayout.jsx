import { Outlet } from 'react-router-dom'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import { useSideBar } from '../context/SidebarContext'
import Navbar from './Navbar'
import SideNav from './SideNav'

const drawerWidth = 260

export default function AppLayout() {
    const { open: mobileOpen, setOpen, toggle } = useSideBar()
    const desktopContentWidth = `calc(100% - ${drawerWidth}px)`

    const handleNavigate = () => setOpen(false)





    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar drawerWidth={drawerWidth} />

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
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRightColor: 'divider',
                    },
                }}
                open
            >
                <SideNav />
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: desktopContentWidth },
                    minWidth: 0,
                }}
                className="w-full"
            >
                <Toolbar />

                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="mx-auto w-full max-w-7xl text-gray-900">
                        <Outlet />
                    </div>
                </div>

            </Box>
        </Box>
    )
}