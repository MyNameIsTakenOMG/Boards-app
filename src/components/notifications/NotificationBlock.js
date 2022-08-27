import { Avatar, Stack, Tooltip, Typography } from '@mui/material'
import { blue, grey, red } from '@mui/material/colors'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShortcutIcon from '@mui/icons-material/Shortcut';
import React from 'react'
import { colorMap } from '../../utils/colorMap'
import {dayjs} from '../../utils/dayjs'
import parser from 'html-react-parser'
import { useNavigate } from 'react-router-dom';

export default function NotificationBlock({notif,handleOpenReplyDialog}) {

  const navigate = useNavigate()

  const captalized = notif.sender.username.at(0).toUpperCase() + notif.sender.username.slice(1)
  let convertedString = notif.contents
  let matchedArr =[...convertedString.matchAll(/@\[[\w\s]*\]\([\w]*\)/g)]
  if (matchedArr.length > 0) {
      matchedArr.forEach(matched=>{
          let theString = matched[0]
          let name = theString.match(/@\[[\w\s]*\]/)[0].slice(2,-1)
          convertedString = convertedString.replace(theString, `<span style="background-color:rgb(227, 229, 232);border-radius:5px;color:rgb(35, 128, 234); font-weight:500">@${name}</span>`)
      })
  }
  let hint =''
  if(notif.type==='mentioned' || notif.type==='replied') {
    let theType = notif.type === 'mentioned' ? 'mentioned' : 'replied to'
    hint = `<span style="background-color:rgb(227, 229, 232);border-radius:5px;color:rgb(35, 128, 234); font-weight:500">@${notif.sender.username}</span> ${theType} you:`
  }
  return (
    <Stack direction={'row'} spacing={2} mx={1} p={2}  sx={{borderRadius:'10px',cursor:'pointer','&:hover':{backgroundColor:blue[50],'& .MuiSvgIcon-root':{opacity:1}}}}>
      <Avatar src={notif.sender.photoURL} sx={{width:48,height:48, bgcolor:colorMap[notif.sender.bgColor]}}>{notif.sender.username.at(0).toUpperCase()}</Avatar>
      <Stack direction='column' spacing={1}  sx={{flexGrow:1}}>
        <Stack direction='row' justifyContent='space-between' sx={{width: '100%'}} >
          <Typography variant='body1' fontWeight={500}>{captalized}</Typography>
          <Typography variant='body2' fontWeight={300} sx={{alignSelf: 'center'}}>{dayjs(notif.createdAt.toDate()).format('lll')}</Typography>
        </Stack>
        {hint !=='' 
        && <Typography variant='body1' fontWeight={500} sx={{textAlign:'left'}}>{parser(hint)}</Typography>}
        <Typography textAlign={'left'} variant='body2' color={grey[600]}>{parser(convertedString)}</Typography>
        <Stack direction='row' justifyContent='end' pt={2} pr={1} sx={{width:'100%'}}>
          <Tooltip title='Check the project'>
            <ShortcutIcon onClick={()=>{navigate(`/projects/${notif.path.project}`)}} sx={{mx:2,opacity:0,color:grey[400],'&:hover':{color:blue[600]},transition:'all 0.2s ease-in-out'}}/>
          </Tooltip>
          {(notif.type==='mentioned' || notif.type==='replied')
          && <Tooltip title='make a reply'>
            <ChatBubbleOutlineIcon onClick={handleOpenReplyDialog(notif.path,{id:notif.sender.userId,name:notif.sender.username})} sx={{mx:2,mr:3,opacity:0,color:grey[400],'&:hover':{color:blue[600]},transition:'all 0.2s ease-in-out'}}/>
          </Tooltip>}
        </Stack>
      </Stack>
    </Stack>
  )
}
