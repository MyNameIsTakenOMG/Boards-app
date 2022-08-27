import React,{useEffect, useRef, useState} from 'react'
import { Box, Stack, Typography, IconButton, Divider, Grid, Paper} from '@mui/material'
import { green, grey, orange } from '@mui/material/colors'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import TaskBoard from './TaskBoard';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserInfo } from '../../store/userSlice';
import { fetchMyWork, myWorkSliceCleared, selectMyWorkCursor, selectMyWorkEngagedProjects, selectMyWorkEngagedTasks, selectMyWorkProcessing, selectMyWorkStatus } from '../../store/myWorkSlice';
import ProjectBlock from './ProjectBlock';
import TaskDetails from './TaskDetails';
import TaskUpdates from '../update/TaskUpdates';
import { Helmet } from 'react-helmet';
import { updateSliceCleared } from '../../store/updateSlice';
import Indicator from '../indicator/Indicator';

export default function MyWork() {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const projectsData = useSelector(selectMyWorkEngagedProjects)
    const tasksData = useSelector(selectMyWorkEngagedTasks)
    const myWorkProcessing = useSelector(selectMyWorkProcessing)
    const myWorkStatus = useSelector(selectMyWorkStatus)
    const cursor = useSelector(selectMyWorkCursor)
    const userInfo = useSelector(selectUserInfo)

    const theLimit = useRef(5)
    const theRoot = useRef()
    const theSentinal = useRef()
    const currentProjectsArrayLength = useRef(userInfo.engaged_projects.projectsArray.length)
    // const {trigger} = useObserverTrigger(cursor, theRoot.current, theSentinal.current)

    // clear data before the component is unmounted
    useEffect(()=>{
        return ()=>{
            dispatch(myWorkSliceCleared())
            dispatch(updateSliceCleared())
        }
    },[])

    // the trigger
    const [trigger, setTrigger] = useState('')
    useEffect(()=>{
        // if there is no more 
        if(cursor===-1) return
        if(theSentinal.current){
            // if there is more, then update the trigger
            const observer = new IntersectionObserver((entries)=>{
                if(entries[0].isIntersecting){
                    setTrigger(new Date().getTime())
                    console.log('triggered')
                }
            },{root:theRoot.current,rootMargin:'20px',threshold:0.5})
            observer.observe(theSentinal.current)
            // clear the observer
            return ()=>{
                observer.disconnect()
            }
        }
    },[cursor])

    // fetch users work data
    useEffect(()=>{
        dispatch(fetchMyWork({currentProjectsArrayLength:currentProjectsArrayLength.current,cursor,limit:theLimit.current}))
    },[trigger])


    // task boards
    const [openTaskBoard, setOpenTaskBoard] = useState(false)
    const [taskPath, setTaskPath] = useState({project:'',stage:'',task:''})
    const [projectName, setProjectName] = useState('')
    const [task, setTask] = useState(null)

    const handleOpenTaskBoard = (projectId,taskId)=>{
        setOpenTaskBoard(true)
        setTaskPath({
            project:projectId,
            task:taskId,
            stage:userInfo.engaged_projects[projectId][taskId].stageId
        })
    }
    useEffect(()=>{
        if(taskPath.task){
            let theProject = projectsData.find(p => p.id === taskPath.project)
            setProjectName(theProject.name)
            let theTask = tasksData[taskPath.project].find(task=>task.id === taskPath.task)
            setTask(theTask)
        }
    },[taskPath.task])
    const handleCloseTaskBoard = ()=>{
        setOpenTaskBoard(false)
    }

  return (
    <Box ref={theRoot} sx={{width:'100%',height:'100%',position:'relative',overflowY:'auto'}}>
        <Helmet>
            <title>My Work / Boards</title>
            <meta name="description" content='my work / Boards' />
        </Helmet>
        <Stack  direction='column' sx={{width:'100%',position:'relative'}}>
            <Stack zIndex={10} direction='row' spacing={0.5} sx={{bgcolor:'white',boxShadow:'0px 1px 1px grey',position:'sticky',top:0,left:0}}>
                <IconButton sx={{alignSelf:'center',ml:1}} aria-label="go back" onClick={()=>{navigate(-1)}}><ArrowLeftIcon /></IconButton>
                <Typography variant='h6' alignSelf={'start'} color={grey[800]} sx={{p:2}}>My work</Typography>
            </Stack>

            {/* projects list */}
            <Stack direction='column' sx={{width:'100%',flexGrow:1,position:'relative',py:2.5,px:3}}>
                {projectsData.map(project=>{
                    {/* project block  */}
                    return <ProjectBlock key={project.id} project={project} tasksData={tasksData} handleOpenTaskBoard={handleOpenTaskBoard} />
                })}
            </Stack>
            <Box ref={theSentinal} sx={{width:'100%',py:0.5,border:'1px solid black'}}></Box>
        </Stack>
        {/* task detail page  */}
        {task && 
        <TaskBoard projectName={projectName} taskName={task.task_name} taskDetails={<TaskDetails task={task} />} taskUpdates={<TaskUpdates taskPath={taskPath}/>} handleCloseTaskBoard={handleCloseTaskBoard} openTaskBoard={openTaskBoard} />}

        {/* loading indicator  */}
        <Indicator open={myWorkProcessing} />
    </Box>
  )
}
