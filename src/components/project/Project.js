import { Box,Divider, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, IconButton, useTheme, useMediaQuery, Tooltip } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {  blue, grey } from '@mui/material/colors'
import { collection, doc ,onSnapshot, query, orderBy } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {Navigate, useLocation, useNavigate, useParams} from 'react-router-dom'
import ProjectStage from './ProjectStage'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {useDispatch, useSelector} from 'react-redux'
import { Routes, Route} from 'react-router-dom';
import InviteMembers from '../inviteMembers/InviteMembers';
import { addNewStage, editProjectName, projectDataCleared, projectDetailsUpdated, reorderStageList, selectIsProcessing, selectProjectDetails, selectStages, selectStatus, selectTasks, stageDeleted, stageUpdated, tasksDeleted, tasksUpdated } from '../../store/projectSlice';
import TaskUpdatesDrawer from './TaskUpdatesDrawer';
import TaskUpdates from '../update/TaskUpdates';
import { updateSliceCleared } from '../../store/updateSlice';
import ProjectMembersDialog from './ProjectMembersDialog';
import { projectFirestore } from '../../firebase/config';
import { Helmet } from 'react-helmet';
import ReorderStagesDialog from './ReorderStagesDialog';
import Indicator from '../indicator/Indicator';
import { selectUserInfo } from '../../store/userSlice';

export default function Project() {

  const dispatch = useDispatch()
  const userInfo = useSelector(selectUserInfo)
  const projectDetails = useSelector(selectProjectDetails)
  const projectStages = useSelector(selectStages)
  const projectTasks = useSelector(selectTasks)
  const isProcessing = useSelector(selectIsProcessing)
  const status = useSelector(selectStatus)
  const {projectId} = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

  // first fetch
  const [firstFetch, setFirstFetch] = useState(true) // used for displaying skeleton during the initial fetch 

  // initialize listeners for the project and its stages and tasks
  useEffect(() => {
    // tasks listeners mapping
    let taskUnsubMap = new Map()
    // project listener
    let project_unsub = onSnapshot(doc(projectFirestore,`projects/${projectId}`),snapshot=>{
      console.log('project listener, changes...')
      console.log('snapshot.data: ',snapshot.data());
      // console.log('project stages array: ',snapshot.data().stageIdArray);
      dispatch(projectDetailsUpdated({...snapshot.data(),id:snapshot.id}))
    })
    // stages listener
    let stages_unsub = onSnapshot(collection(projectFirestore,`projects/${projectId}/stages`),stageSnapshot=>{
      console.log('stages listener, changes...')

      // setStages based on change type, eg: added, removed, modified
      stageSnapshot.docChanges().forEach(stageChange=>{
        console.log('stage change id : ',stageChange.doc.id);
        console.log('stage change type : ',stageChange.type);
        let stageId = stageChange.doc.id

        if(stageChange.type==='modified'){
          dispatch(stageUpdated({id:stageChange.doc.id,data:stageChange.doc.data()}))
        }
        if(stageChange.type==='added'){
          dispatch(stageUpdated({id:stageChange.doc.id,data:stageChange.doc.data()}))
          // using query instead of collection to get the tasks for the stage in chronological order
          let q = query(collection(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks`),orderBy('createdAt','asc'))
          // add tasks listener for the new stage
          let unsub = onSnapshot(q,taskSnapshot=>{
            console.log('task listener under the stage: ',stageId);

            let newTasks = taskSnapshot.docs.map(task=>({...task.data(),id:task.id}))

            dispatch(tasksUpdated({stageId: stageId,tasksArray: [...newTasks]}))

          })
          taskUnsubMap.set(stageId,unsub)
        }
        // remove tasks listener for the removed stage
        // need extra actions for removing all the tasks associated with the removed stage
        if(stageChange.type==='removed'){

          // remove tasks listener under the stage and update the tasks state
          let unsub = taskUnsubMap.get(stageId)
          unsub()
          taskUnsubMap.delete(stageId)
          dispatch(tasksDeleted({id:stageId}))
          // remove the stage from the stages state and update the stages state
          dispatch(stageDeleted({id:stageId}))
        }
      })
    })

    if(firstFetch === true) setFirstFetch(false)

    return ()=>{
      project_unsub()
      stages_unsub()
      taskUnsubMap.forEach(unsub=>{unsub()})
    }
  }, [projectId])
  
  
  // reorder the stages & drag and drop
  const [openReorder, setOpenReorder] = useState(false)
  const [duplicateStageIdArray,setDuplicateStageIdArray] = useState({})
  const handleOpenReorder = (e)=>{
    console.log('project stages: ',projectStages)
    
    setDuplicateStageIdArray(pre=>{
      let idArray = [...projectDetails.stageIdArray]
      let nameArray = idArray.map(id=>projectStages[id].stage_name)
      return {ids:idArray,names:nameArray}
    })
    setOpenReorder(true)
  }
  const handleCloseReorder = (e)=>{
    if(isProcessing===false) setOpenReorder(false)
  }

  const onDragEnd =(result)=>{
      // try {
        const {destination, source, draggableId} = result
        // if destination is outside of droppable area or the location of the item isn't changed after drag & drop
        if(!destination) return
        if(destination.droppableId===source.droppableId && destination.index===source.index) return
        // if the stage is moved
        let newIdArray = {ids:[...duplicateStageIdArray.ids],names:[...duplicateStageIdArray.names]}
        let stageName = newIdArray.names[source.index]
        newIdArray.ids.splice(source.index,1)
        newIdArray.ids.splice(destination.index,0,draggableId)
        newIdArray.names.splice(source.index,1)
        newIdArray.names.splice(destination.index,0,stageName)
        setDuplicateStageIdArray(pre=>({ids:[...newIdArray.ids],names:[...newIdArray.names]}))
  }
  const handleConfirmReorder = ()=>{
      dispatch(reorderStageList({stageIdArray: [...duplicateStageIdArray.ids],projectId:projectDetails.id}))
  }

  // add new stage
  const handleNewStage = ()=>{
      dispatch(addNewStage({projectId:projectDetails.id}))
  }

  // edit project name
  const [editProject, setEditProject] = useState(false)
  const [editingProjectName, setEditingProjectName] = useState('')
  const handleEditProject = (e)=>{
    setEditProject(true)
    setEditingProjectName(projectDetails.project_name)
  }
  const handleEditProjectChange = (e)=>{
    setEditingProjectName(e.target.value)
  }
  const handleConfirmEditProjectName = (e)=>{
    e.preventDefault()
    dispatch(editProjectName({projectId:projectDetails.id,newName:editingProjectName}))
  }


  useEffect(()=>{
      if(status.code===200) setEditProject(false)
  },[status.id])

  // open/close invite members dialog
  const [openInviteMembers, setOpenInviteMembers] = useState(false)
  const handleOpenInviteMembers = (e)=>{
    setOpenInviteMembers(true)
  }
  const handleCloseInviteMembers = (e)=>{
    setOpenInviteMembers(false)
  }

  // update drawer
  const [taskPath, setTaskPath] = useState({})
  const [openUpdatesDrawer, setOpenUpdatesDrawer] = useState(false)
  const handleOpenUpdatesDrawer = (taskPath)=>()=>{
    setTaskPath(taskPath)
    setOpenUpdatesDrawer(true)
  }
  const handleCloseUpdatesDrawer = (e)=>{
    e.stopPropagation();
    if(e.currentTarget.id ==='close_btn') {
      setOpenUpdatesDrawer(false)
      // dispatch(updateSliceCleared())
    }
    if(e.currentTarget.id ==='backdrop' && e.currentTarget.id === e.target.id) {
      setOpenUpdatesDrawer(false)
      // dispatch(updateSliceCleared())
    }
  }

  // manage project members
  const [openManageMembers, setOpenManageMembers] = useState(false)
  const handleOpenManageMembers = ()=>{
    setOpenManageMembers(true)
  }
  const handleCloseManageMembers = ()=>{
    setOpenManageMembers(false)
  }

  // clear data before leaving the page
  useEffect(()=>{
    return ()=>{
      dispatch(projectDataCleared())
      dispatch(updateSliceCleared())
    }
  },[])
  

  return (
    <Box sx={{width:'100%',display:'flex',flexFlow:'column nowrap'}}>

      <Helmet>
        <title>{`Project (${projectDetails.project_name}) / Boards`}</title>
        <meta name='description' content={`Project (${projectDetails.project_name}) / Boards`} />
      </Helmet>

      <Stack direction='row' p={2} sx={{boxShadow:'0px 1px 3px grey',position:'sticky',top:'0',left:'0',zIndex:'10',bgcolor:'#FFFFFF'}} justifyContent={'space-between'}>
        <Stack direction='row' spacing={1}>
          <IconButton sx={{alignSelf:'center'}} aria-label="go back" onClick={()=>{navigate(-1)}}><ArrowLeftIcon /></IconButton>
          {userInfo.id === projectDetails.ownerId
          ?<>
            {!editProject ?
              <Stack onClick={handleEditProject} direction='row' spacing={1} alignItems={'center'} sx={{my:2,p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover	.MuiSvgIcon-root':{opacity:1}}}>
                <Typography variant='h6' fontWeight={500}>{projectDetails.project_name}</Typography>
                <EditIcon sx={{color:blue[400],opacity:0}}/>
              </Stack>
            :
            <form onSubmit={handleConfirmEditProjectName}>
              <TextField inputProps={{maxLength:100}} sx={{alignSelf:'start',mt:2,mb:2,height:'42px',width:'170px', '& .MuiInputBase-input':{p:0.8,fontSize:'130%'}}}  autoFocus={editProject?true:false} value={editingProjectName} onChange={handleEditProjectChange} onBlur={handleConfirmEditProjectName} />
            </form>
            }
          </>
          :<>
            <Stack direction='row' spacing={1} alignItems={'center'} sx={{my:2,p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover	.MuiSvgIcon-root':{opacity:1}}}>
              <Typography variant='h5' fontWeight={500}>{projectDetails.project_name}</Typography>
            </Stack>
          </>}
        </Stack>
        {userInfo.id === projectDetails.ownerId &&
        <Stack direction='row' spacing={1} alignItems={'center'}>
          {isSmall 
          ?<>
            <Tooltip title='invite people'>
              <PersonAddIcon sx={{color:blue[400]}} onClick={handleOpenInviteMembers} />
            </Tooltip>
            <Tooltip title='manage people'>
              <ManageAccountsIcon sx={{color:blue[400]}} onClick={handleOpenManageMembers}/>
            </Tooltip>
            <Tooltip title='re-order stages'>
              <ListAltIcon sx={{color:blue[400]}} onClick={handleOpenReorder}/>
            </Tooltip>
          </>
          :<>
            <Button onClick={handleOpenInviteMembers} variant='outlined' color='primary' startIcon={<PersonAddIcon />} >Invite</Button>
            <Button variant='outlined' color='primary' onClick={handleOpenManageMembers} startIcon={<ManageAccountsIcon />} >Manage</Button>
            <Button onClick={handleOpenReorder} variant='outlined' sx={{alignSelf:'center'}} startIcon={<ListAltIcon />}>Reorder</Button>
          </>}
        </Stack>}
      </Stack>
      {/* <Divider /> */}
      
      {/* project stages go here... */}
      <Stack direction='column' sx={{px:2,py:1}}>
        {projectDetails.stageIdArray && projectDetails.stageIdArray.map(stageId=>{
          return <ProjectStage handleOpenUpdatesDrawer={handleOpenUpdatesDrawer}  key={stageId} stage={projectStages[stageId]} tasks={projectTasks[stageId]} />
        })}
      </Stack>
      {userInfo.id === projectDetails.ownerId &&
      <Stack sx={{px:2,py:1}}>
        <Button onClick={handleNewStage} startIcon={<AddCircleOutlineIcon />} variant='outlined' color='primary' sx={{my:3,alignSelf:'start'}}>
          Add new stage
        </Button>
      </Stack>}

      {/* reorder dialog (drag&drop component goes here) */}
      <ReorderStagesDialog onDragEnd={onDragEnd} openReorder={openReorder} projectId={projectDetails.id} handleCloseReorder={handleCloseReorder} duplicateStageIdArray={duplicateStageIdArray} handleConfirmReorder={handleConfirmReorder}/>

      {/* invite members dialog */}
      {openInviteMembers===true 
      && <InviteMembers projectId={projectId} openInviteMembers={openInviteMembers} handleCloseInviteMembers={handleCloseInviteMembers} />
      }

      {/* manage members dialog  */}
      {openManageMembers===true
      && <ProjectMembersDialog openManageMembers={openManageMembers} handleCloseManageMembers={handleCloseManageMembers} /> 
      }

      {/* updates drawer  */}
      <TaskUpdatesDrawer taskUpdates={<TaskUpdates taskPath={taskPath} />} openUpdatesDrawer={openUpdatesDrawer} handleCloseUpdatesDrawer={handleCloseUpdatesDrawer}/>

      {/* indicator  */}
      <Indicator open={isProcessing} />

      {/* task updates route  */}
      {/* <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={location.key} >
          <Route path='/' element={null} />
          <Route path='updates/id' element={<TaskUpdatesDrawer />} />
          <Route path='*' element={<Navigate replace to='../../404' />} />
        </Routes>
      </AnimatePresence> */}

    </Box>
  )
}
