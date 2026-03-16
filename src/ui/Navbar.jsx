import AppBar from '@mui/material/AppBar'
import { useSideBar } from '../context/SidebarContext'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import {UserButton} from '@clerk/react'

const Navbar = () => {
  const { toggle } = useSideBar()

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
          Asset Flow
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Profile">
            <UserButton />
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar