import AppBar from '@mui/material/AppBar'
import { useSideBar } from '../context/SidebarContext'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { UserButton } from '@clerk/react'

const Navbar = ({ drawerWidth = 260 }) => {
  const { toggle } = useSideBar()

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#383838',
        color: '#ffffff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },

      }}
    >
      <Toolbar className="px-3 sm:px-5 lg:px-8">
        <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block', md: "none" } }}>
          Asset Flow
        </Typography>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <UserButton />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar