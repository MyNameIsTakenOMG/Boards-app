import React,{ useState} from 'react'
import {Routes,Route, Navigate,  useLocation, useNavigate} from 'react-router-dom'
import AllProjects from '../components/AllProjects'
import NotFound from '../components/NotFound'
import Banner from '../components/Banner'
import {Stack , SwipeableDrawer,  Avatar, Typography, Box, Divider, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import LogoutIcon from '@mui/icons-material/Logout';
import Notifications from '../components/notifications/Notifications'

import Profile from '../components/Profile'
import Search from '../components/search/Search'
import { useDispatch } from 'react-redux'
import { logOut, selectUserInfo, selectUserStatus } from '../store/userSlice'
import { projectSliceCleared } from '../store/projectSlice'
import Project from '../components/project/Project'
import MyWork from '../components/myWork/MyWork'
import { useSelector } from 'react-redux'
import { purple } from '@mui/material/colors'
import { colorMap } from '../utils/colorMap'

export default function Main() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const userInfo = useSelector(selectUserInfo)
  const userStatus = useSelector(selectUserStatus)
  // drawer
  const [open, setOpen] = useState(false)
  const toggleDrawer = (open) => event => { 
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {  
      return;
    }
    setOpen(open)
  }

  //sign out
  const handleSignout = ()=>{
    dispatch(projectSliceCleared())
    dispatch(logOut())
  }



  return (
    <>
      {userInfo.username && 
      <Stack direction='column' sx={{height:'100%'}}>
       <Banner toggleDrawer={toggleDrawer} />
      
        <SwipeableDrawer  open={open} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
          <Stack direction='column' rowGap={2} sx={{width:{xs:'250px',md:'300px'},height:'100%',}}>
            <Box sx={{display:'flex',bgcolor:purple[400],py:4,px:3}}>
              <Avatar src={userInfo.photoURL} sx={{width:48,height:48,mr:2, outline:'3px solid white',bgcolor:colorMap[userInfo.bgColor]}}>{userInfo.username.at(0).toUpperCase()}</Avatar>
              <Stack direction='column' alignItems='center' sx={{flexGrow:1, overflowX:'hidden', whiteSpace:'nowrap', textOverflow: 'ellipsis'}}>
                <Tooltip title={userInfo.username}>
                  <Typography variant='body1' fontWeight={500} sx={{ color:'white'}}>{userInfo.username.length>15?`${userInfo.username.slice(0,12)}...`:userInfo.username}</Typography> 
                </Tooltip>
                <Tooltip title={userInfo.email}>
                  <Typography variant='body2' sx={{color:'white'}}>{userInfo.email.length >20 ?`${userInfo.email.slice(0,15)}...`:userInfo.email}</Typography>
                </Tooltip>
              </Stack>
            </Box>
            <Divider />
            <Stack direction='column' sx={{py:3,px:2}}>
              <MenuList>
                <MenuItem onClick={()=>{navigate('/home');setOpen(false)}}>
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText>Home</ListItemText>
                </MenuItem>
                <MenuItem onClick={()=>{navigate('/my_work');setOpen(false)}}>
                  <ListItemIcon>
                    <FormatListBulletedIcon />
                  </ListItemIcon>
                  <ListItemText>My work</ListItemText>
                </MenuItem>
                <MenuItem onClick={()=>{navigate('/notifications');setOpen(false)}}>
                  <ListItemIcon>
                    <NotificationsNoneIcon />
                  </ListItemIcon>
                  <ListItemText>Notifications</ListItemText>
                </MenuItem>
                <MenuItem onClick={()=>{navigate(`/profile/${userInfo.id}`);setOpen(false)}}>
                  <ListItemIcon>
                    <AccountBoxIcon />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={()=>{navigate('/search');setOpen(false)}}>
                  <ListItemIcon>
                    <ManageSearchIcon />
                  </ListItemIcon>
                  <ListItemText>Search</ListItemText>
                </MenuItem>
              </MenuList>
              <Divider sx={{my:2}} />
              <MenuList>
                <MenuItem onClick={handleSignout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Sign out</ListItemText>
                </MenuItem>
              </MenuList>
            </Stack>
          </Stack>
        </SwipeableDrawer>

       <Box sx={{flexGrow:1, overflow:'auto'}}>
          <Routes>
              <Route path="/" element={<Navigate replace to="home" />} />
              <Route path='home' element={<AllProjects/>}/> 
              <Route path='projects/:projectId' element={<Project />}/>
              <Route path='my_work' element={<MyWork />}/>
              <Route path='notifications' key={location.key} element={<Notifications />}/>
              <Route path='profile/:profileId' element={<Profile />}/>
              <Route path='search' element={<Search />}/>
              <Route path='404' element={<NotFound />} />
              <Route path='*' element={<Navigate replace to='404' />} />  
          </Routes> 
        </Box>
      </Stack>}
    </>
  )
}
