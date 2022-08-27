import { Avatar, Stack, Box, IconButton, Tooltip, Typography, Badge } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import React from 'react'
import { grey, purple } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import { colorMap } from '../utils/colorMap';


const customFont = createTheme({
    typography: {
        fontFamily:['"Dancing Script"', 'cursive'].join(','),
    }
})


export default function Banner({toggleDrawer}) {

    const userInfo = useSelector(selectUserInfo)
    const navigate = useNavigate()

  return (
    <Stack sx={{bgcolor:'white'}} zIndex={20} direction='row' p={1} justifyContent={'space-between'} alignItems='center' boxShadow={`0px 1px 3px ${grey[400]}`}>
        <Stack direction='row' columnGap={1}>
            <IconButton onClick={toggleDrawer(true)}>
                <MenuIcon />
            </IconButton>
            <Stack direction='row' spacing={1}>
                <ThemeProvider theme={customFont} >
                    <Avatar onClick={()=>{navigate('/home')}} sx={{cursor:'pointer',bgcolor:purple[400],fontSize:'200%'}} variant='rounded'>B</Avatar>
                    <Typography variant='body1' fontSize={'165%'} alignSelf={'center'} color={purple[400]}>Boards</Typography>
                </ThemeProvider>
            </Stack>
        </Stack>
        <Stack direction='row' columnGap={1}>
            {userInfo.notifsArray &&
            <Tooltip title='Notifications'>
                <IconButton sx={{alignSelf:'center'}} onClick={()=>{navigate('/notifications')}}>
                    <Badge color='secondary' max={99} badgeContent={(userInfo.notifsArray.length-1)-userInfo.notifCursor}>
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            }
            {userInfo.username &&
                <Tooltip title={userInfo.username} arrow>
                    <Avatar onClick={()=>{navigate(`/profile/${userInfo.id}`)}} src={userInfo.photoURL} sx={{cursor:'pointer',bgcolor: colorMap[userInfo.bgColor]}}>{userInfo.username.at(0).toUpperCase()}</Avatar>
                </Tooltip>
            }
        </Stack>
    </Stack>
  )
}
