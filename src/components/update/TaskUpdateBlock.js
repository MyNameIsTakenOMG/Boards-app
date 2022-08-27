import React, { useEffect, useState, useRef } from 'react'
import { Stack, Typography,Button,Avatar, Divider, Pagination } from '@mui/material'
import { grey} from '@mui/material/colors';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { colorMap } from '../../utils/colorMap'
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../store/userSlice';
import {dayjs} from '../../utils/dayjs'
import MentionInput from '../mentionInput/MentionInput';
import { useDispatch } from 'react-redux';
import { addReply, selectUpdateStatus } from '../../store/updateSlice';
import useGetTaskMembers from '../../hooks/useGetTaskMembers';
import { selectTasks } from '../../store/projectSlice';
import parser from 'html-react-parser'
import useGetConvertedHtmlString from '../../hooks/useGetConvertedHtmlString';
import UpdateReplyBlock from './UpdateReplyBlock';
import { selectMyWorkEngagedTasks } from '../../store/myWorkSlice';
import { useLocation } from 'react-router-dom';

export default function TaskUpdateBlock({taskUpdate,handleOpenReplyDialog}) {
   
    // console.log('taskUpdate username: ',taskUpdate.username)
    const userInfo = useSelector(selectUserInfo)
    const captalized = taskUpdate.username.at(0).toUpperCase() + taskUpdate.username.slice(1)
    const status = useSelector(selectUpdateStatus)
    const dispatch = useDispatch()
    const allTasks = useSelector(selectTasks)
    const engagedTasks = useSelector(selectMyWorkEngagedTasks)
    const location = useLocation()
    let theTask = null
    console.log('update path: ',taskUpdate.path)

    if(location.pathname.match(/projects/)){
        console.log('update path: ',taskUpdate.path)
        console.log('all Tasks: ',allTasks)
        theTask = allTasks[taskUpdate.path.stage].find(task => task.id === taskUpdate.path.task)
    }
    if(location.pathname.match(/my_work/)){
        theTask = engagedTasks[taskUpdate.path.project].find(task=>task.id === taskUpdate.path.task)
    }
    const {convertedString} = useGetConvertedHtmlString(taskUpdate.contents,theTask)
    const {taskMembers} = useGetTaskMembers(theTask)

    // reply form
    const [replyFormInput, setReplyFormInput] = useState('')
    const handleReplyFormInputChange = (e)=>{
        setReplyFormInput(e.target.value)
    }
    const handleReplyFormSubmit = (e)=>{
        e.preventDefault()
        const path ={...taskUpdate.path,update:taskUpdate.id}
        dispatch(addReply({input:replyFormInput,path:path,replyToId:taskUpdate.userId}))
    }

    // listen to status
    useEffect(()=>{
        if(status.id){
            if(status.code ===200) setReplyFormInput('')
        }
    },[status.id])
    
    // toggle reply list
    const [toggleReplyList, setToggleReplyList] = useState(false)
    const handleToggleReplyList = () => {
        setToggleReplyList(pre=>!pre)
    }
    
    // replies pagination and display reply list
    const repliesPerPage = useRef(5)
    const totalPages = taskUpdate.replies.length>repliesPerPage.current ? Math.ceil(taskUpdate.replies.length/repliesPerPage.current) :0 
    const [page, setPage] = useState(1)
    const [displayReplies, setDisplayReplies] = useState([])
    const handleReplyPageChange = (e,value)=>{
        setPage(value)
    }

    // update the displaying replies and the page
    useEffect(()=>{
        if(toggleReplyList){
            if(totalPages === 0){
                setDisplayReplies([...taskUpdate.replies])
            }
            else{
                let firstElement = (page-1) * repliesPerPage.current
                let boundary = page * repliesPerPage.current
                // if not the last page
                if(boundary +1 <=taskUpdate.replies.length) setDisplayReplies(taskUpdate.replies.slice(firstElement, boundary))
                // if the last page
                else setDisplayReplies(taskUpdate.replies.slice(firstElement))
            }
        }
        else{
            setPage(1)
            setDisplayReplies([])
        }
    },[toggleReplyList,page,taskUpdate.replies])

    
  return (
        <Stack direction='column' spacing={1} sx={{overflow:'hidden',boxShadow:' inset 0px 0px 3px grey',borderRadius:'10px'}}>
            <Stack direction='row' justifyContent={'space-between'} sx={{p:2}}>
                <Stack direction={'row'} spacing={1}>
                    <Avatar src={taskUpdate.photoURL} alt={captalized} sx={{width:36,height:36, bgcolor: colorMap[taskUpdate.bgColor]}} >{taskUpdate.username.at(0).toUpperCase()}</Avatar>
                    <Typography sx={{flexGrow:1}} alignSelf={'center'} variant='body1' fontWeight={500}>
                        {captalized}
                    </Typography>
                </Stack>
                <Typography variant='body1' sx={{alignSelf: 'center'}}>{dayjs(taskUpdate.createdAt.toDate()).format('lll')}</Typography>
            </Stack>
            <Typography variant='body1' textAlign='left' sx={{p:2}}>{parser(convertedString)}</Typography>
            {/* reply form  */}
            <Stack direction='column' px={2} spacing={2}>
                <Divider />
                
                <form onSubmit={theTask.members[userInfo.id] ?handleReplyFormSubmit:null} style={{display: 'flex', flexFlow:'row nowrap', columnGap:'1rem'}} >
                    <Avatar src={userInfo.photoURL} sx={{alignSelf:'center',width:32,height:32,bgcolor:colorMap[userInfo.bgColor]}}>{userInfo.username.at(0).toUpperCase()}</Avatar>
                    <MentionInput disabled={!theTask.members[userInfo.id]?true:false} value={replyFormInput} onChange={handleReplyFormInputChange} placeholder={theTask.members[userInfo.id]?'Leave your reply, use @ to mention people':'not a task member, unable to write replies'} usersArr={taskMembers} small={true}/>
                    <Button disabled={!theTask.members[userInfo.id]?true:false} type='submit' variant='contained' color='primary' sx={{borderRadius:'40px',alignSelf:'center'}}>Reply</Button>
                </form>
            </Stack>
            {/* show replies list button*/}
            <Stack direction='column' px={2} pt={1} spacing={1}>
                <Stack direction='row' spacing={1} >
                    <Typography variant='body1' textAlign='left' fontWeight={500} sx={{py:1}}>
                        {taskUpdate.replies.length} Replies
                    </Typography>
                    <Button disabled={taskUpdate.replies.length>0?false:true} onClick={handleToggleReplyList} ><ArrowDropUpIcon sx={{transform:toggleReplyList?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease-in-out'}} /></Button>
                </Stack>
                <Divider />
            </Stack>
            {/* reply list section  */}
            { toggleReplyList && displayReplies.map((reply,index)=>{
                return (
                    <UpdateReplyBlock key={index} reply={reply}  handleOpenReplyDialog={handleOpenReplyDialog} />
                )
            })}
            {/* reply pagination  */}
            {(toggleReplyList && totalPages>0) && 
                <Stack direction='row' py={1} justifyContent='center' alignItems='center'>
                    <Pagination size='small' count={totalPages} page={page} onChange={handleReplyPageChange} />
                </Stack>
            }
        </Stack>
  )
}
