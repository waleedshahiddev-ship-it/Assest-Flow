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
import LogoutButton from './LogoutButton'



const navItems = [
  { to: 'home', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: "invites", label: "Invites", icon: <EventNoteIcon /> },
]

export default function SideNav({ onNavigate }) {
  return (
    <Box className="flex h-full flex-col">
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: "#383838", fontStyle: { color: "white" , fontFamily:"-apple-system"} }}>
        <Box>
          <h1 className='text-[22px] font-bold'>Assest Flow</h1>
        </Box>
      </Toolbar>
      <Divider />
      <List className="flex-1 px-2 py-3">
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.to}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                '&.active': {
                  bgcolor: 'action.selected',
                  fontWeight: 600,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <List className="p-2">
        <ListItem disablePadding>
          <LogoutButton className="w-full" />
        </ListItem>
      </List>
    </Box>
  )
}
