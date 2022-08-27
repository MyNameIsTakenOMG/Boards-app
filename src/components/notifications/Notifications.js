import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { grey, purple } from '@mui/material/colors'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { fetchNotifs, notifSliceCleared , selectNotifLastCheck, selectNotifProcessing, selectNotifs, selectNotifStatus, updateCursor } from '../../store/notifSlice';
import { selectUserInfo } from '../../store/userSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useObserverTrigger from '../../hooks/useObserverTrigger';
import ReplyDialog from '../replyDialog/ReplyDialog';
import NotificationBlock from './NotificationBlock';
import { addReply } from '../../store/updateSlice';
import { doc, getDoc } from 'firebase/firestore';
import { projectFirestore } from '../../firebase/config';
import {debounce} from 'lodash'
import { Helmet } from 'react-helmet';
import Indicator from '../indicator/Indicator';

const options = [
    'All',
    '@Me',
    'Replies'
]

export default function Notifications() {

    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const userInfo = useSelector(selectUserInfo)
    const theRoot = useRef()
    const theSentinal = useRef()
    const notifLimit = useRef(5)
    const notifs = useSelector(selectNotifs)
    const isProcessing = useSelector(selectNotifProcessing)
    const status = useSelector(selectNotifStatus)
    const lastCheck = useSelector(selectNotifLastCheck)

    // options menu
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const open = Boolean(anchorEl)
    const handleOpenOptions = (e)=>{
        setAnchorEl(e.currentTarget)
    }
    const handleSelectOption = (e,index)=>{
        setSelectedIndex(index)
        setAnchorEl(null)
    }
    const handleCloseOptions = ()=>{
        setAnchorEl(null)
    }

    // update the notifCursor when first visit the page
    // using debouncing to limit the frequency of refreshing the page
    const refresh = useCallback(debounce(()=>{
        let newCursor = userInfo.notifsArray.length-1
        dispatch(updateCursor({newCursor, userId:userInfo.id}))
    },1000),[userInfo.notifsArray.length])
    
    useEffect(() => {
        if(userInfo.id){
            refresh()
        }
        return ()=>{
            // before unmount the component, throw any remaining pending invocations
            refresh.cancel()
        }
    }, [selectedIndex,location.key])
    
    const {trigger} = useObserverTrigger(lastCheck,theRoot.current,theSentinal.current)

    // loading notifications after the cursor is updated
    useEffect(()=>{ 
        if(status.code ===200 && status.message.match(/updated/)){
            console.log('triggered by the trigger')
            dispatch(fetchNotifs({selectedIndex,userId:userInfo.id,lastCheck,notifLimit:notifLimit.current}))
        }
        else return
    },[trigger,status.id])

    // clean up the notif slice data
    useEffect(()=>{
        return ()=>{
            dispatch(notifSliceCleared())
        }
    },[])


    // reply dialog
    const [openReplyDialog, setOpenReplyDialog] = useState(false)
    const [replyToInfo, setReplyToInfo] = useState({id:'',name:''})
    const [path, setPath] = useState({})
    const [replyInput, setReplyInput] = useState('')
    const [usersArr, setUsersArr] = useState([])
    const handleReplyInputChange = (e)=>{
        setReplyInput(e.target.value)
    }
    const handleOpenReplyDialog = (updatePath, replyToInfo)=>()=>{
        setOpenReplyDialog(true)
        setReplyToInfo(replyToInfo)
        setPath(updatePath)
    }
    // update usersArr
    useEffect(()=>{
        if(openReplyDialog && Object.keys(path).length>0){
            const {project,stage,task} = path
            getDoc(doc(projectFirestore,`projects/${project}/stages/${stage}/tasks/${task}`))
            .then(docSnap=>{
                let taskMembers =[]
                if(docSnap.data().members.membersArray.length>0){
                    let keys = [...docSnap.data().members.membersArray]
                    for(let i=0; i<keys.length; i++) {
                        let captalized = docSnap.data().members[keys[i]].username.at(0).toUpperCase() + docSnap.data().members[keys[i]].username.slice(1)
                        taskMembers.push({id: keys[i], display:captalized})
                    }
                }
                setUsersArr([...taskMembers])
            })
            .catch(err=>{console.log(err)})
        }
    },[openReplyDialog])

    const handleCloseReplyDialog = ()=>{
        setOpenReplyDialog(false)
        setReplyToInfo({id:'',name:''})
        setPath({})
        setReplyInput('')
    }
    const handleSubmitReply = ()=>{
        dispatch(addReply({input:replyInput, path:path, replyToId:replyToInfo.id}))
    }

  return (
      <Box ref={theRoot} sx={{width:'100%',height:'100%',position:'relative',overflowY:'auto'}}>
        <Helmet>
            <title>Notifications / Boards</title>
            <meta name="description" content='notifications / Boards' />
        </Helmet>
          <Stack direction={'column'} sx={{width:'100%',position:'relative'}}>
            <Stack direction='row' spacing={1} sx={{zIndex:10,mb:0.5,position:'sticky',top:0,left:0,bgcolor:'white',boxShadow:'0px 1px 3px grey'}}>
                <IconButton sx={{alignSelf:'center',ml:1}} aria-label="go back" onClick={()=>{navigate(-1)}}><ArrowLeftIcon /></IconButton>
                <Typography variant='h6' textAlign={'left'} sx={{p:2,position:'sticky',top:0,backgroundColor:'white',zIndex:10}} color={grey[800]}>Notifications</Typography>
                <Button color='secondary' sx={{alignSelf: 'center'}} onClick={handleOpenOptions}><ArrowDropUpIcon sx={{transform:open?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease-in-out'}} />{options[selectedIndex]}</Button>
            </Stack>
            {/* notification blocks  list */}
            <Stack direction='column' sx={{width:'100%',maxWidth:'800px',alignSelf:'center'}}>
                {notifs.length > 0 
                ?<>
                    {notifs.map((notif,index)=>{
                        return <NotificationBlock key={index} notif={notif} handleOpenReplyDialog={handleOpenReplyDialog} />
                    })}
                </> 
                : <Box sx={{width: '100%'}}>
                    <Typography variant='h4' sx={{color:grey[300],pt:3}}>No notifications</Typography>
                </Box>
                }
            </Stack>
            <Box ref={theSentinal} sx={{p:0.5, border:'1px solid transparent'}}></Box>
        </Stack>

        {/* options menu  */}
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseOptions}>
            {options.map((option,index)=>(
                <MenuItem sx={{bgcolor:'white','&:hover':{bgcolor:purple[300],'&>*':{color:'white'}}}} key={index} onClick={(e)=>handleSelectOption(e,index)}>
                    <Typography >{option}</Typography>
                </MenuItem>
            ))}
        </Menu>

        {/* reply dialog  */}
        <ReplyDialog username={userInfo.username} photoURL={userInfo.photoURL} handleSubmitReply={handleSubmitReply} usersArr={usersArr} openReplyDialog={openReplyDialog} replyName={replyToInfo.name} replyInput={replyInput} handleReplyInputChange={handleReplyInputChange} handleCloseReplyDialog={handleCloseReplyDialog} />
        
        {/* loading indicator  */}
        <Indicator open={isProcessing} />
      </Box>
  )
}
