import { SignOutButton } from '@clerk/react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LogoutIcon from '@mui/icons-material/Logout'

const LogoutButton = ({ className }) => {
  return (
    <SignOutButton>
      <ListItemButton className={className} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
        <ListItemIcon>
          <LogoutIcon color="action" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </SignOutButton>
  )
}

export default LogoutButton