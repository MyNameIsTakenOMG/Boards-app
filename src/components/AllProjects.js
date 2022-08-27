import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box,Grid, Paper , Typography, Divider, Stack, Avatar,AvatarGroup, Chip, Button, Menu, MenuItem, Tooltip, Dialog, DialogContent, DialogTitle} from '@mui/material';
import { green, grey, orange, purple, red} from '@mui/material/colors';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InviteMembers from './inviteMembers/InviteMembers';
import { useSelector, useDispatch } from 'react-redux'
import { selectUserInfo } from '../store/userSlice';
import { createNewProject, fetchAllProjects, removeProject, selectAllProjects, selectIsProcessing, selectStatus, updateProjectStatus, projectStatusCleared } from '../store/projectSlice';
import Indicator from './indicator/Indicator'
import { colorMap } from '../utils/colorMap';
import { Helmet } from 'react-helmet';

const options = [
  'All',
  'My',
  'Shared'
]

const projectStatusColorMap = {
  'Stuck':red[500],
  'In progress':orange[500],
  'Done':green[500]
}

export default function AllProjects() {

    // options menu
    const [optionsAnchorEl, setOptionsAnchorEl] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const optionOpen = Boolean(optionsAnchorEl)
    const handleOpenOptions = (e)=>{
      setOptionsAnchorEl(e.currentTarget)
    }
    const handleSelectOption = (e,index)=>{
      setSelectedIndex(index)
      setOptionsAnchorEl(null)
    }
    const handleCloseOptions = ()=>{
        setOptionsAnchorEl(null)
    }
    // const location = useLocation()
    // console.log('state: ', location.state);

    const navigate = useNavigate()
    const userInfo = useSelector(selectUserInfo)
    const dispatch = useDispatch()
    const projectStatus = useSelector(selectStatus)
    const projectProcessing = useSelector(selectIsProcessing)
    const allProjects = useSelector(selectAllProjects)
    // reversed version of all projects array
    const [reversed, setReversed] = useState([])
    // update reversed array
    useEffect(()=>{
      setReversed([...allProjects].reverse())
    },[allProjects])


    useEffect(()=>{
      // TODO: dispatch an action to re fetch all projects
      // wait until userInfo finish loading
      if(userInfo.id)
        dispatch(fetchAllProjects({selectedIndex,myProjects:userInfo.engaged_projects.my_projects,projectsArray:userInfo.engaged_projects.projectsArray}))
    },[userInfo.id,selectedIndex])

    // 2. re-fetch projects when a project is created or removed (projectStatus.updateProject.id && projectStatus.updateProject.code ===200 && projectStatus.updateProject.message.match(/created/))
    useEffect(()=>{
      if(projectStatus.id){
        console.log('project created or removed...')
        if(projectStatus.code === 200 && projectStatus.message.match(/created|removed/))
          dispatch(fetchAllProjects({selectedIndex,myProjects:userInfo.engaged_projects.my_projects,projectsArray:userInfo.engaged_projects.projectsArray}))
      }
    },[projectStatus.id,userInfo.engaged_projects.my_projects.length])  

    // 3. re-fetch projects when a project status is changed 
    useEffect(()=>{
      if(projectStatus.id){
        if(projectStatus.code === 200 && projectStatus.message.match(/updated/))
        dispatch(fetchAllProjects({selectedIndex,myProjects:userInfo.engaged_projects.my_projects,projectsArray:userInfo.engaged_projects.projectsArray}))
      }
    },[projectStatus.id])


    // invite members to the project
    const [openInviteMembers, setOpenInviteMembers] = useState(false)
    const [isCreated, setIsCreated] = useState(false)
    const [projectId, setProjectId] = useState('')

    const handleCloseInviteMembers = (e)=>{
      setOpenInviteMembers(false)
      setProjectId('')
      // dispatch an action to clear the updateProject status
      dispatch(projectStatusCleared())
    }

    const handleCreateNewProject = (e)=>{
        const {username,email,bgColor,photoURL} = userInfo
        dispatch(createNewProject({userId:userInfo.id,username,email,photoURL,bgColor}))
    }

    // listen to response and open invite members dialog
    useEffect(()=>{
        if(projectStatus.id){
          console.log('code: ',projectStatus.code)
            if(projectStatus.code ===200 &&projectStatus.message.match(/created/)){
              setIsCreated(true)
            }
            if(projectStatus.code === 200 && projectStatus.message.match(/fetched/) && isCreated === true){
              setIsCreated(false)
              setOpenInviteMembers(true)
              setProjectId(userInfo.engaged_projects.my_projects[userInfo.engaged_projects.my_projects.length-1])
            }
          }

        },[projectStatus.id])
        

    const handleClickProject = (projectId)=>{
      navigate(`/projects/${projectId}`)
    }

    // project status menu
    const [projectStatusAnchorEl, setProjectStatusAnchorEl] = useState(null)
    const [selectedProject, setSelectedProject] = useState('')
    const statusOpen = Boolean(projectStatusAnchorEl)
    const handleOpenStatusMenu = (e,projectId)=>{
      e.stopPropagation()
      setProjectStatusAnchorEl(e.currentTarget)
      setSelectedProject(projectId)
    }
    const handleCloseStatusMenu = ()=>{
      setProjectStatusAnchorEl(null)
      setSelectedProject('')
    }
    const handleChangeStatus = (e)=>{
      let status = e.currentTarget.id
      console.log('status: ',status)
      // dispatch an aciton to update the project status
      dispatch(updateProjectStatus({projectId:selectedProject,status:status}))
    }

    // reset projectstatus anchorEl and selectedProject after refetching projects
    useEffect(()=>{
      if(projectStatus.id){
        setProjectStatusAnchorEl(null)
        setSelectedProject('')
      }
    },[projectStatus.id])
        
    // delete project 
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [deletingProjectId, setDeletingProjectId] = useState('')
    const handleOpenDeleteDialog = (e,projectId)=>{
      e.stopPropagation()
      setOpenDeleteDialog(true)
      setDeletingProjectId(projectId)
    }
    const handleCloseDeleteDialog = ()=>{
      setOpenDeleteDialog(false)
      setDeletingProjectId('')
    }
    const handleConfirmDeleteProject = ()=>{
      // TODO: dispatch an action to delete the project
      dispatch(removeProject({projectId:deletingProjectId}))
    }
    useEffect(()=>{
      if(projectStatus.code === 200 && projectStatus.message.match(/removed/))
        setOpenDeleteDialog(false)
    },[projectStatus.id])

    return (
      <Box sx={{width:'100%',height:'100%',position:'relative',overflowY:'auto'}}>

        <Helmet>
          <title>Home / Boards</title>
          <meta name="description" content="Home page / Boards" />
        </Helmet>

        <Stack direction="row" p={2} spacing={1} sx={{boxShadow:'0px 1px 3px grey',position:'sticky',top:'0',left:'0',zIndex:'10',bgcolor:'#FFFFFF'}}>
          <Typography variant='h6' fontWeight={500}>Projects</Typography>
          <Button color='secondary' sx={{alignSelf: 'center'}} onClick={handleOpenOptions}><ArrowDropUpIcon sx={{transform:optionOpen?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s ease-in-out'}} />{options[selectedIndex]}</Button>
        </Stack>

        {/* allProjects */}
        <Grid container mt={2}>
          {/* the grid -- add new project */}
          <Grid item key={'add'} xs={12} sm={6} md={4} lg={3} xl={2} sx={{display:'flex'}}>
            <Paper elevation={2} onClick={handleCreateNewProject} sx={{'&:hover':{border:`5px solid ${orange[400]}`},'&:hover > *':{color:orange[400]},transition:'border 0.2s ease-in-out',cursor:'pointer',position:'relative',display:'flex',justifyContent:'center',alignItems:'center',flexGrow:1,height:'237px',my:1,mx:3,p:1,border:`5px solid transparent`}}>
              <AddIcon sx={{fontSize:48,color:grey[400],transition:'color 0.2s ease-in-out'}}/>
              <Typography variant='h5' sx={{position:'absolute',bottom:30,left:0,right:0,textAlign:'center',color:grey[400],transition:'color 0.2s ease-in-out'}}>Add new project</Typography>
            </Paper>
          </Grid>
          {
            reversed.length > 0 && reversed.map((project,index)=>{
              let ownerName = project.members[project.ownerId].username
              return (
                <Grid  key={index} item xs={12} sm={6} md={4} lg={3} xl={2}>
                  <Paper onClick={(e)=>{handleClickProject(project.id)}} sx={{'&:hover':{transform:'translateY(-5px) scale(1.05)'},'&:hover .MuiBox-root':{opacity:0.5},'&:hover .MuiBox-root:hover':{opacity:1},transition:'transform 0.2s ease-in-out',position:'relative',cursor:'pointer',my:1,mx:3,p:1,display:'flex',flexFlow:'column nowrap',border:`5px solid ${purple[400]}`}}>
                    {selectedIndex ===1 && 
                    <Box onClick={(e)=>{handleOpenDeleteDialog(e,project.id)}} sx={{opacity:0,position:'absolute',top:-1,right:-1,bgcolor:red[500],px:0.7,py:0.3,transition:'opacity 0.2s ease-in-out'}}>
                      <DeleteIcon sx={{color:'white'}}/>
                    </Box>}
                    <Stack direction='column' alignItems={'start'} my={1} ml={1} spacing={1}>
                      <Typography variant='h5'>{project.project_name}</Typography>
                      <Stack direction='row' spacing={1}>
                        <Typography variant='body1' fontWeight={500} sx={{alignSelf:'center'}}>Owner:</Typography>
                        <Tooltip title={ownerName}>
                          <Chip sx={{'&.MuiChip-root':{height:34},'& .MuiChip-avatar':{width:28,height:28, bgcolor: colorMap[project.members[project.ownerId].bgColor]}}} avatar={<Avatar src={project.members[project.ownerId].photoURL} >{ownerName.at(0).toUpperCase()}</Avatar>}  label={ownerName.length >10 ? `${ownerName.slice(0,10)}...`:ownerName} variant='outlined'/>
                        </Tooltip>
                      </Stack>
                    </Stack>
                    <Divider sx={{my:1}}/>
                    <Stack direction='column' alignItems={'start'} my={1} ml={1} spacing={1}>
                      <Stack direction='row' spacing={1}>
                        <Typography variant='body1' sx={{alignSelf:'center'}}>Members:</Typography>
                        <AvatarGroup sx={{'& .MuiAvatarGroup-avatar':{width:36,height:36}}} total={project.members.membersArray.length}>
                          {project.members.membersArray.length >3 
                          ? project.members.membersArray.slice(0,3).map((memberId,index)=><Avatar src={project.members[memberId].photoURL} key={index} sx={{bgcolor:colorMap[project.members[memberId].bgColor]}}>{project.members[memberId].username.at(0).toUpperCase()}</Avatar>) 
                          :project.members.membersArray.map((memberId,index)=><Avatar src={project.members[memberId].photoURL} key={index} sx={{bgcolor:colorMap[project.members[memberId].bgColor]}}>{project.members[memberId].username.at(0).toUpperCase()}</Avatar>)}
                        </AvatarGroup>
                      </Stack>
                      <Stack direction='row' spacing={1}>
                        <Typography variant='body1' sx={{alignSelf:'center'}}>Status:</Typography> 
                        <Stack onClick={selectedIndex===1 ? (e)=>{handleOpenStatusMenu(e,project.id)}:null} direction='row' spacing={1} width='130px' sx={{cursor:'pointer','&:hover':{'& .MuiSvgIcon-root':{color:red[500]}}}}>
                          {selectedIndex===1 &&<ArrowDropUpIcon sx={{alignSelf:'center',transform:projectStatusAnchorEl?'rotate(0)':'rotate(180deg)',transition:'transform 0.2s ease-in-out'}} />}
                          <Typography variant='body1' bgcolor={projectStatusColorMap[project.status]} sx={{textAlign:'center',py:1,px:1, color:'white'}}>{project.status}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              )
            })
          }

          {/* status menu  */}
          <Menu anchorEl={projectStatusAnchorEl} open={statusOpen} onClose={handleCloseStatusMenu}  anchorOrigin={{horizontal:'center',vertical:'bottom'}} transformOrigin={{horizontal:'center',vertical:'top'}}>
            <MenuItem onClick={handleChangeStatus} id='Stuck' sx={{m:1,bgcolor:red[500],'&:hover':{bgcolor:red[400]}}}>
              <Typography color='white'>Stuck</Typography>
            </MenuItem> 
            <MenuItem onClick={handleChangeStatus} id='In progress' sx={{m:1,bgcolor:orange[500],'&:hover':{bgcolor:orange[400]}}}>
              <Typography color='white'>In progress</Typography>
            </MenuItem>
            <MenuItem onClick={handleChangeStatus} id='Done' sx={{m:1,bgcolor:green[500],'&:hover':{bgcolor:green[400]}}}>
              <Typography color='white'>Done</Typography>
            </MenuItem>
          </Menu>

          {/* options menu  */}
          <Menu anchorEl={optionsAnchorEl} open={optionOpen} onClose={handleCloseOptions}>
            {options.map((option,index)=>(
              <MenuItem sx={{bgcolor:'white','&:hover':{bgcolor:purple[300],'&>*':{color:'white'}}}}  key={index} onClick={(e)=>{handleSelectOption(e,index)}}>
                <Typography >{option}</Typography>
              </MenuItem>
            ))}
          </Menu>

          {/* delete project dialog  */}
          <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Sure to delete the project?</DialogTitle>
              <DialogContent>
                <Stack direction='row' mt={1} p={0.5} justifyContent='space-between'>
                  <Button variant='contained' color='error' onClick={handleConfirmDeleteProject}>Confirm</Button>
                  <Button variant='contained' color='primary' onClick={handleCloseDeleteDialog}>Cancel</Button>
                </Stack>
              </DialogContent>
          </Dialog>

          {/* invite members dialog  */}
          {openInviteMembers===true 
          &&<InviteMembers projectId={projectId} openInviteMembers={openInviteMembers} handleCloseInviteMembers={handleCloseInviteMembers} helpInfo={true} />
          }
          {/* backdrop loading indicator -- creating project  */}
          <Indicator open={projectProcessing} />
        </Grid>
      </Box>
  )
}
