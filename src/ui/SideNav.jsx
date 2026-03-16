import * as React from 'react'
import { NavLink } from 'react-router-dom'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EventNoteIcon from '@mui/icons-material/EventNote'
import WeekendIcon from '@mui/icons-material/Weekend'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { SignOutButton } from '@clerk/react'

const navItems = [
  { to: 'home', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: 'bookings', label: 'Bookings', icon: <EventNoteIcon /> },
  { to: 'cabins', label: 'Cabins', icon: <WeekendIcon /> },
  { to: 'users', label: 'Users', icon: <PeopleIcon /> },
  { to: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  { to: 'account', label: 'Account', icon: <AccountCircleIcon /> },
]

export default function SideNav({ onNavigate }) {
  return (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>AF</Box>
        <Box>
          <Typography variant="subtitle1">Asset Flow</Typography>
          <Typography variant="caption" color="text.secondary">Asset management</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton component={NavLink} to={item.to} onClick={onNavigate} sx={{ '&.active': { bgcolor: 'action.selected' } }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <List>
        <ListItem disablePadding>
          <SignOutButton >
            <ListItemButton>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </SignOutButton>
        </ListItem>
      </List>
    </div>
  )
}
