import React, { useEffect, useRef, useState } from 'react'
import { Box, Stack, Button, Typography } from '@mui/material'
import { collection, limit, onSnapshot, orderBy, query,  where } from 'firebase/firestore';
import { projectFirestore } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../store/userSlice';
import TaskUpdateBlock from './TaskUpdateBlock';
import MentionInput from '../mentionInput/MentionInput';
import Indicator from '../indicator/Indicator'
import useObserverTrigger from '../../hooks/useObserverTrigger';
import { addReply, addUpdate, newUpdatesLoaded, oldUpdatesAndCursorLoaded, selectNewUpdates, selectOldUpdates, selectUpdateCursor, selectUpdateProcessing, selectUpdateStatus, updateSliceCleared } from '../../store/updateSlice';
import { useDispatch } from 'react-redux';
import { selectTasks } from '../../store/projectSlice';
import useGetTaskMembers from '../../hooks/useGetTaskMembers';
import ReplyDialog from '../replyDialog/ReplyDialog';
import { useLocation } from 'react-router-dom';
import { selectMyWorkEngagedTasks } from '../../store/myWorkSlice';
import { Helmet } from 'react-helmet';
import { grey } from '@mui/material/colors';

export default function TaskUpdates({taskPath}) {

    const dispatch = useDispatch()
    const {project,stage,task} = taskPath
    const userInfo = useSelector(selectUserInfo)
    const newUpdates = useSelector(selectNewUpdates)
    const oldUpdates = useSelector(selectOldUpdates)
    const cursor = useSelector(selectUpdateCursor)
    const isProcessing = useSelector(selectUpdateProcessing)
    const status = useSelector(selectUpdateStatus)

    const allTasks = useSelector(selectTasks)
    const engagedTasks = useSelector(selectMyWorkEngagedTasks)
    const location = useLocation()
    let taskMembersArray = []
    let theTask = null
    if(location.pathname.match(/projects/)){
        theTask = allTasks[stage].find(t => t.id === task)
    }
    if(location.pathname.match(/my_work/)){
        theTask = engagedTasks[taskPath.project].find(t=>t.id === taskPath.task)
    }
    const {taskMembers} = useGetTaskMembers(theTask)
    taskMembersArray = taskMembers

    const updateLimit = useRef(5)
    const theRoot = useRef()
    const theSentinal = useRef()
    const startTime = useRef(new Date())

    const {trigger} = useObserverTrigger(cursor, theRoot.current,theSentinal.current)

    // clear the update slice data for each time the component mounted
    useEffect(()=>{
        dispatch(updateSliceCleared())
    },[])

    // new task updates listener
    useEffect(()=>{
        let q = query(collection(projectFirestore, `projects/${project}/stages/${stage}/tasks/${task}/updates`),where('createdAt','>',startTime.current),orderBy('createdAt','desc'));
        let unsub = onSnapshot(q,(snapshot)=>{
            if(snapshot.size >0){
                let arr = []
                snapshot.forEach(doc=>{
                    arr.push({...doc.data(),id:doc.id})
                })
                dispatch(newUpdatesLoaded(arr))
            }
        })
        return ()=>{
            unsub()
        }
    },[])

    // old task updates listener
    useEffect(()=>{
        console.log('triggered by trigger')
        let theLimit
        if(cursor===0) theLimit = updateLimit.current +1
        else theLimit = cursor + updateLimit.current
        let q = query(collection(projectFirestore,`projects/${project}/stages/${stage}/tasks/${task}/updates`),where('createdAt','<=',startTime.current),limit(theLimit),orderBy('createdAt','desc'))
        let unsub = onSnapshot(q,(snapshot)=>{
            // if there is more
            if(snapshot.size===theLimit){
                let arr = snapshot.docs.slice(0,-1).map(doc=>({...doc.data(),id:doc.id}))
                dispatch(oldUpdatesAndCursorLoaded({updates:arr,cursor:snapshot.size}))
            }
            // if there is no more
            else {
                let arr = snapshot.docs.map(doc=>({...doc.data(),id:doc.id}))
                dispatch(oldUpdatesAndCursorLoaded({updates:arr,cursor:0}))
            }
        })
        return ()=>{
            unsub()
        }
            
    },[trigger])

    // create new update
    const [updateInput, setUpdateInput] = useState('')
    const handleUpdateInputChange = (e)=>{
        setUpdateInput(e.target.value)
    }
    const handleSubmitUpdate = (e)=>{
        e.preventDefault()
        dispatch(addUpdate({path:{...taskPath},input:updateInput}))
    }
    
    // reply form dialog 
    const [openReplyDialog, setOpenReplyDialog] = useState(false)
    const [replyInput, setReplyInput] = useState('')
    const [path, setPath] = useState({})
    const [replyToInfo, setReplyToInfo] = useState({id:'',name:''})
    const handleOpenReplyDialog = (updatePath,replyToInfo)=>(e) => {
        e.stopPropagation()
        setOpenReplyDialog(true)
        setPath(updatePath)
        setReplyToInfo(replyToInfo)
    }
    const handleCloseReplyDialog = (e) => {
        e.stopPropagation()
        setOpenReplyDialog(false)
        setPath({})
        setReplyToInfo({id:'',name:''})
        setReplyInput('')
    }
    const handleReplyInputChange = (e)=>{
        setReplyInput(e.target.value)
    }
    const handleSubmitReply = (e)=>{
        e.preventDefault()
        dispatch(addReply({input:replyInput,path:path,replyToId:replyToInfo.id}))
    }

    //listen to status
    useEffect(()=>{
        if(status.id){
            if(status.code===200){
                if(updateInput!=='') setUpdateInput('')
                if(openReplyDialog) {
                    setOpenReplyDialog(false)
                    setReplyInput('')
                }
            }
            else{
                return
            }
        }
    },[status.id])


  return (

    <Box ref={theRoot}  sx={{width:'100%',flexGrow:1,borderRadius:'5px',boxShadow:' inset 0px 0px 4px grey',overflowY:'auto',p:0.5}}>
        <Helmet>
            <title>{`Task(${theTask.task_name}) updates / Boards`}</title>
            <meta name="description" content={`Task(${theTask.task_name}) updates / Boards`} />
        </Helmet>

        <Stack direction='column' spacing={3}>
            {/* update form  */}
            
            <form onSubmit={theTask.members[userInfo.id] ? handleSubmitUpdate: null} style={{display: 'flex', flexFlow:'column nowrap', rowGap:'0.5rem'}} >
                <MentionInput disabled={!theTask.members[userInfo.id]?true:false} usersArr={taskMembersArray} value={updateInput} onChange={handleUpdateInputChange} placeholder={theTask.members[userInfo.id]?'Write your update, use @ to mention people...':'not a task member, unable to write updates'}/>
                <Stack direction='row' justifyContent={'end'} alignItems={'center'}>
                    <Button disabled={!theTask.members[userInfo.id]?true:false} type='submit' sx={{borderRadius:'10px'}} variant='contained' color='primary'>
                        Update
                    </Button>
                </Stack>
            </form>
            {/* new update blocks  */}
            {newUpdates.length>0 && newUpdates.map((update,index)=>(
                <TaskUpdateBlock key={`newUpdates-${index}`} taskUpdate={update} handleOpenReplyDialog={handleOpenReplyDialog} />
            ))
            }
            {/* older updates blocks  */}
            {oldUpdates.length>0 && oldUpdates.map((oldUpdate,index)=>(
                <TaskUpdateBlock key={`oldUpdates-${index}`} taskUpdate={oldUpdate} handleOpenReplyDialog={handleOpenReplyDialog} />
            ))}
            {/* if there is no update here  */}
            {(newUpdates.length ===0 && oldUpdates.length ===0)&&
            <Stack direction='column' p={2} mt={1}>
                <Typography variant='h6' sx={{color:grey[400],textAlign: 'center'}}>No updates...</Typography>
            </Stack>}
            {/* the sentinal  */}
            <Box ref={theSentinal} sx={{p:0.5,border:'1px solid transparent'}}></Box>
            {/* reply dialog  */}
            <ReplyDialog username={userInfo.username} photoURL={userInfo.photoURL} replyInput={replyInput} handleReplyInputChange={handleReplyInputChange}  openReplyDialog={openReplyDialog} replyName={replyToInfo.name} usersArr={taskMembersArray} handleCloseReplyDialog={handleCloseReplyDialog} handleSubmitReply={handleSubmitReply} />
        </Stack>
        {/* indicator  */}
        <Indicator open={isProcessing} />
    </Box>
  )
}
