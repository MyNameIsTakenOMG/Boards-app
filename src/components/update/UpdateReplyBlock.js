import React from 'react'
import {Stack, Avatar,Typography,} from '@mui/material'
import { grey, blue } from '@mui/material/colors';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useSelector } from 'react-redux';
import { selectTasks } from '../../store/projectSlice';
import parser from 'html-react-parser'
import useGetConvertedHtmlString from '../../hooks/useGetConvertedHtmlString';
import {dayjs} from '../../utils/dayjs'
import { colorMap } from '../../utils/colorMap';
import { useLocation } from 'react-router-dom';
import { selectMyWorkEngagedTasks } from '../../store/myWorkSlice';
import { selectUserInfo } from '../../store/userSlice';

export default function UpdateReplyBlock({reply, handleOpenReplyDialog}) {

    const captalized = reply.username.at(0).toUpperCase() + reply.username.slice(1)
    const allTasks = useSelector(selectTasks)
    const userInfo = useSelector(selectUserInfo)
    const engagedTasks = useSelector(selectMyWorkEngagedTasks)
    const location = useLocation()
    let theTask = null
    if(location.pathname.match(/projects/)){
        theTask = allTasks[reply.path.stage].find(task => task.id === reply.path.task)
    }
    if(location.pathname.match(/my_work/)){
        theTask = engagedTasks[reply.path.project].find(task=>task.id === reply.path.task)
    }
    const {convertedString} = useGetConvertedHtmlString(reply.contents,theTask)

    return (
        <Stack direction='row' mb={2} spacing={1} sx={{p:2}}>
            <Avatar src={reply.photoURL} sx={{width:32,height:32,bgcolor:colorMap[reply.bgColor]}}>{reply.username.at(0).toUpperCase()}</Avatar>
            <Stack direction='column' spacing={0.5} sx={{'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                <Typography variant='body2' textAlign='left' sx={{py:0.5,px:2,backgroundColor:grey[100],borderRadius:'20px'}}><span style={{fontWeight:500,color:blue[500]}}>{captalized}:</span> {parser(convertedString)}</Typography>
                <Stack direction='row' spacing={2}>
                    <Typography variant='body2' textAlign='left' color={grey[400]} sx={{px:2}}>{dayjs(reply.createdAt.toDate()).format('lll')}</Typography>
                    <ChatBubbleOutlineIcon onClick={theTask.members[userInfo.id]?handleOpenReplyDialog(reply.path, {id:reply.userId,name:reply.username}):null} sx={{cursor:'pointer',color:grey[400],opacity:0,transition:'all 0.2s ease-in-out','&:hover':{color:blue[400]}}}/>
                </Stack>
            </Stack>
        </Stack>
    )
}
