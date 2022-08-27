import React, {  useEffect, useState } from 'react'
import { Box, Button, IconButton, TextField, Stack, TableCell, TableRow, Typography, Tooltip, Avatar, AvatarGroup, Menu, MenuItem, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { grey, blue, red, green, orange } from '@mui/material/colors'
import {colorMap} from '../../utils/colorMap'
import {dayjs} from '../../utils/dayjs'
import { useDispatch, useSelector} from 'react-redux';
import { changeTaskPriority, changeTaskStatus, deleteTask, deleteTaskManager, editTaskName, selectProjectDetails, selectStatus, updateTaskCost, updateTaskDeadline, updateTaskManager } from '../../store/projectSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import TaskMembersMenu from './TaskMembersMenu';
import { selectUserInfo } from '../../store/userSlice';


const statusColorMap = {
    'Stuck':{
        color:red[500],
        hoverColor:red[400]
    },
    'In progress':{
        color:orange[500],
        hoverColor:orange[400]
    },
    'Done':{
        color:green[500],
        hoverColor:green[400]
    }
}

const priorityColorMap = {
    'High':{
        color:blue[800],
        hoverColor:blue[700]
    },
    'Medium':{
        color:blue[600],
        hoverColor:blue[500]
    },
    'Low':{
        color:blue[400],
        hoverColor:blue[300]
    }
}


export default function ProjectTask({themeColor,task,handleOpenUpdatesDrawer}) {

    const dispatch = useDispatch()
    const userInfo = useSelector(selectUserInfo)
    const projectDetails = useSelector(selectProjectDetails)
    const status = useSelector(selectStatus)
    const location = useLocation()
    const navigate = useNavigate()

    // task name table cell
    const [editTask, setEditTask] = useState(false)
    const [editingTaskName, setEditingTaskName] = useState('') 
    const handleEditTask = ()=>{
        setEditTask(true)
        setEditingTaskName(task.task_name)
    }
    const handleEditChange = (e)=>{
        setEditingTaskName(e.target.value)
    }
    const handleEditConfirm = (e)=>{
        e.preventDefault()
        dispatch(editTaskName({projectId: task.path.project,stageId: task.path.stage,taskId:task.id,newTaskName: editingTaskName}))   
    }

    // manager table cell
    const [managerAnchorEl, setManagerAnchorEl] = useState(null)
    const [managerSearchResults, setManagerSearchResults] = useState([])
    const [managerSearchInput, setManagerSearchInput] = useState('')

    useEffect(()=>{
        if(managerSearchInput===''){
            let ids = [...task.members.membersArray]
            let res = ids.map(id=>{
                return {...task.members[id],id:id}
            })
            setManagerSearchResults(res)
        }
        else {
            // create a new search regex 
            let nameRegex = new RegExp(`^${managerSearchInput}`, 'i')
            //fetch ids of all matched members names
            let ids = task.members.membersArray.filter(id=>{
                return nameRegex.test(task.members[id].name)
            })
            let res = ids.map(id=>{
                return {...task.members[id],id:id}
            })
            setManagerSearchResults(res)
        }
    },[managerSearchInput,task.members])

    const handleOpenManagerMenu = (e)=>{
        setManagerAnchorEl(e.currentTarget)
    }
    const handleCloseManagerMenu = ()=>{
        setManagerAnchorEl(null)
    }
    const handleManagerSearchInputChange = (e)=>{
        setManagerSearchInput(e.target.value)
    }
    const handleSelectManager = (e)=>{
        let id = e.currentTarget.id
        dispatch(updateTaskManager({projectId:task.path.project, stageId: task.path.stage, taskId:task.id, userId:id}))
    }

    const handleDeleteManager = ()=>{
        console.log('delete manager')
        dispatch(deleteTaskManager({projectId: task.path.project,stageId: task.path.stage,taskId:task.id}))
    }

    // group table cell
    const [groupAnchorEl, setGroupAnchorEl] = useState(null)

    const handleOpenGroupMenu = (e)=>{
        setGroupAnchorEl(e.currentTarget)
    }
    const handleCloseGroupMenu = ()=>{
        setGroupAnchorEl(null)
    }

    // status table cell
    const [statusAnchorEl, setStatusAnchorEl] = useState(null)
    const handleOpenStatusMenu = (e)=>{
        setStatusAnchorEl(e.currentTarget)
    }
    const handleCloseStatusMenu = ()=>{
        setStatusAnchorEl(null)
    }
    const handleStatusChange = (e)=>{
        let status = e.currentTarget.id
        dispatch(changeTaskStatus({projectId: task.path.project,stageId: task.path.stage,taskId: task.id,status:status}))
    }

    // priority table cell
    const [priorityAnchorEl, setPriorityAnchorEl] = useState(null)
    const handleOpenPriorityMenu = (e)=>{
        setPriorityAnchorEl(e.currentTarget)
    }
    const handleClosePriorityMenu = ()=>{
        setPriorityAnchorEl(null)
    }
    const handlePriorityChange = async(e)=>{
        let priority = e.currentTarget.id
        dispatch(changeTaskPriority({projectId:task.path.project,stageId:task.path.stage,taskId:task.id,priority:priority}))
    }
    
    // deadline table cell
    const [editDeadline, setEditDeadline] = useState(false)
    const [deadline, setDeadline] = useState('')
    const handleEditDeadline = ()=>{
        setEditDeadline(true)
        if(task.deadline===''){
            let today = dayjs().format('YYYY-MM-DD')
            setDeadline(today)
        }else{
            setDeadline(task.deadline)
        }
    }
    const handleDeadlineChange = (e)=>{
        setDeadline(e.target.value)
    }
    const handleDeadlineConfirm = (e)=>{
        e.preventDefault() 
        dispatch(updateTaskDeadline({projectId:task.path.project,stageId:task.path.stage,taskId:task.id,deadline:deadline})) 
    }

    // cost table cell
    const [editCost, setEditCost] = useState(false)
    const [cost, setCost] = useState(null)
    const handleEditCost = ()=>{
        setEditCost(true)
        setCost(task.cost)
    }
    const handleCostChange = (e)=>{
        setCost(e.target.value)
    }
    const handleCostConfirm = (e)=>{
        e.preventDefault()
        let sanitizedCost = parseInt(cost)
        dispatch(updateTaskCost({projectId:task.path.project,stageId:task.path.stage,taskId:task.id,sanitizedCost:sanitizedCost}))
    }

    // delete task
    const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false)
    const handleOpenDeleteTaskDialog = ()=>{
        setOpenDeleteTaskDialog(true)
    }
    const handleCloseDeleteTaskDialog = ()=>{
        setOpenDeleteTaskDialog(false)
    }

    const handleDeleteTask = ()=>{
        console.log('delete task');
        dispatch(deleteTask({projectId:task.path.project,stageId:task.path.stage,taskId:task.id}))
    }

    useEffect(()=>{
        if(managerAnchorEl) {
            setManagerAnchorEl(null)
            setManagerSearchResults([])
            setManagerSearchInput('')
        }
        if(groupAnchorEl) return setGroupAnchorEl(null)
        if(editTask===true) return setEditTask(false)
        if(statusAnchorEl) return setStatusAnchorEl(null)
        if(priorityAnchorEl) return setPriorityAnchorEl(null)
        if(editCost===true) return setEditCost(false)
        if(editDeadline===true) return setEditDeadline(false)
    },[status.id])


  return (
    <>
        {/* delete task dialog  */}
        <Dialog open={openDeleteTaskDialog} onClose={handleCloseDeleteTaskDialog}>
            <DialogTitle>Sure to delete the task?</DialogTitle>
            <DialogContent>
                <Stack direction='row' justifyContent='space-between'>
                    <Button variant='contained' color='error' onClick={handleDeleteTask}>Confirm</Button>
                    <Button variant='contained' color='primary' onClick={handleCloseDeleteTaskDialog}>Cancel</Button>
                </Stack>
            </DialogContent>
        </Dialog>


        <TableRow sx={{borderLeft:`3px solid ${colorMap[themeColor]}`,'& > .MuiTableCell-root':{p:1},'& > .MuiTableCell-root:not(:last-child)':{
            borderRight:`1px solid ${grey[300]}`,
            }}}>

            {/* delete table cell  */}
            <TableCell >
                {userInfo.id === projectDetails.ownerId
                ?<>
                    <Tooltip title='Delete the task'>
                        <IconButton sx={{color:red[500]}} onClick={handleOpenDeleteTaskDialog}>
                            <DeleteForeverIcon />
                        </IconButton>    
                    </Tooltip>
                </>
                :<>
                    <IconButton sx={{opacity:0}} >
                        <DeleteForeverIcon />
                    </IconButton> 
                </>}
            </TableCell>

            {/* task name table cell */}
            <TableCell>
                <Stack direction='row' sx={{minwidth:'170px',width:'100%',height:'100%'}}>
                    {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId) 
                    ?<>
                        {!editTask?
                            <Tooltip title={editingTaskName}>
                            <Box onClick={handleEditTask} sx={{cursor:'pointer',flexGrow:1,height:'38px',display:'flex',position:'relative',p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Typography  variant='body1' sx={{width:'110px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{task.task_name}</Typography>
                                <EditIcon sx={{position:'absolute',top:'7px',right:'2px',color:blue[400],opacity:0}}/>
                            </Box>
                            </Tooltip>
                        :
                            <form style={{flexGrow:1}} onSubmit={handleEditConfirm}>
                                <TextField inputProps={{maxLength:25}} sx={{width:'110px',height:'100%', '& .MuiInputBase-input':{p:0.5}}}  autoFocus={editTask?true:false} value={editingTaskName} onChange={handleEditChange} onBlur={handleEditConfirm} />
                            </form>
                        }
                        <Box sx={{cursor:'pointer',display:'flex',alignItems: 'center',justifyContent: 'center',px:1,ml:1, borderLeft:`1px solid ${grey[300]}`}}>
                            <Tooltip title='Updates'>
                                <ChatBubbleOutlineIcon onClick={handleOpenUpdatesDrawer({...task.path,task:task.id})} sx={{color:grey[400],'&:hover':{color:blue[400]},transition:'color 0.2s ease-in-out'}} />
                            </Tooltip>
                        </Box>
                    </>
                    :<>
                        <Tooltip title={editingTaskName}>
                            <Box sx={{cursor:'pointer',flexGrow:1,height:'38px',display:'flex',position:'relative',p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Typography  variant='body1' sx={{width:'110px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{task.task_name}</Typography>
                            </Box>
                        </Tooltip>
                        <Box sx={{cursor:'pointer',display:'flex',alignItems: 'center',justifyContent: 'center',px:1,ml:1, borderLeft:`1px solid ${grey[300]}`}}>
                            <Tooltip title='Updates'>
                                <ChatBubbleOutlineIcon onClick={handleOpenUpdatesDrawer({...task.path,task:task.id})} sx={{color:grey[400],'&:hover':{color:blue[400]},transition:'color 0.2s ease-in-out'}} />
                            </Tooltip>
                        </Box>
                    </>}
                </Stack>  
            </TableCell>


            {/* manager table cell */}
            <TableCell>
                {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)
                ?<>
                    <Stack onClick={handleOpenManagerMenu} sx={{cursor:'pointer',minWidth:'130px',width:'100%',height:'100%',p:'2px', position:'relative'}}>
                        {task.managerId!==''?
                        <Tooltip title={task.members[task.managerId].username}>
                            <Box sx={{position:'relative',display:'flex',justifyContent:'center',height:'100%',flexGrow:1,border:'1px solid transparent', borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Avatar src={task.members[task.managerId].photoURL} sx={{width:28,height:28,my:'2px',bgcolor:colorMap[task.members[task.managerId].bgColor]}}>{task.members[task.managerId].username.at(0).toUpperCase()}</Avatar>
                                <HighlightOffIcon onClick={handleDeleteManager} sx={{position:'absolute',top:'4px',right:'2px',color:red[400],opacity:0}}/>
                            </Box>
                        </Tooltip>
                        :<Box sx={{width:'100%',height:'100%',display:'flex',justifyContent: 'center',alignItems:'center',border:'1px solid transparent',borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`}}}>
                            <AddIcon sx={{width:'30px',height:'30px'}}/>
                        </Box>
                        }
                    </Stack>
                </>
                :<>
                    <Stack sx={{cursor:'pointer',minWidth:'130px',width:'100%',height:'100%',p:'2px', position:'relative'}}>
                        {task.managerId!==''?
                        <Tooltip title={task.members[task.managerId].username}>
                            <Box sx={{position:'relative',display:'flex',justifyContent:'center',height:'100%',flexGrow:1,border:'1px solid transparent', borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Avatar src={task.members[task.managerId].photoURL} sx={{width:28,height:28,my:'2px',bgcolor:colorMap[task.members[task.managerId].bgColor]}}>{task.members[task.managerId].username.at(0).toUpperCase()}</Avatar>
                            </Box>
                        </Tooltip>
                        :<Box sx={{width:'100%',height:'100%',display:'flex',justifyContent: 'center',alignItems:'center',border:'1px solid transparent',borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`}}}>
                            <AddIcon sx={{width:'30px',height:'30px'}}/>
                        </Box>
                        }
                    </Stack>
                </>} 
            </TableCell>

            {/* group table cell */}
            <TableCell>
                {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)
                ?<>
                    <Stack onClick={handleOpenGroupMenu} sx={{cursor:'pointer',minWidth:'180px',width:'100%',p:'2px', position:'relative',border:'1px solid transparent',borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                        {task.members.membersArray.length>0 ?
                        <>
                            <Tooltip title={task.members.membersArray.length}>
                                <AvatarGroup total={task.members.membersArray.length} spacing={5} sx={{flexGrow:1,justifyContent:'center','& .MuiAvatar-root':{width:28,height:28}}} >
                                    {/* <TaskMembers members={task.members} /> */}
                                    {task.members.membersArray.length<4 
                                    ? task.members.membersArray.map((member,index)=><Avatar src={task.members[member].photoURL} sx={{bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)
                                    : task.members.membersArray.slice(0,3).map((member,index)=><Avatar src={task.members[member].photoURL} sx={{bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)}
                                </AvatarGroup>
                            </Tooltip>
                            <EditIcon sx={{position:'absolute',top:'7px',right:'2px',color:blue[400],opacity:0}}/>
                        </>
                        :<Box sx={{width:'100%',height:'100%',display:'flex',justifyContent: 'center',alignItems:'center'}}>
                            <AddIcon sx={{width:'30px',height:'30px'}}/>
                        </Box>
                        }
                    </Stack>
                </>
                :<>
                    <Stack sx={{cursor:'pointer',minWidth:'180px',width:'100%',p:'2px', position:'relative',border:'1px solid transparent',borderRadius:'5px','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                        {task.members.membersArray.length>0 ?
                        <>
                            <Tooltip title={task.members.membersArray.length}>
                                <AvatarGroup total={task.members.membersArray.length} spacing={5} sx={{flexGrow:1,justifyContent:'center','& .MuiAvatar-root':{width:28,height:28}}} >
                                    {/* <TaskMembers members={task.members} /> */}
                                    {task.members.membersArray.length<4 
                                    ? task.members.membersArray.map((member,index)=><Avatar src={task.members[member].photoURL} sx={{bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)
                                    : task.members.membersArray.slice(0,3).map((member,index)=><Avatar src={task.members[member].photoURL} sx={{bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)}
                                </AvatarGroup>
                            </Tooltip>
                        </>
                        :<Box sx={{width:'100%',height:'100%',display:'flex',justifyContent: 'center',alignItems:'center'}}>
                            <AddIcon sx={{width:'30px',height:'30px'}}/>
                        </Box>
                        }
                    </Stack>
                </>}
            </TableCell>

            {/* status table cell */}
            <TableCell sx={{cursor:'pointer',bgcolor:statusColorMap[task.status].color,'&:hover':{bgcolor:statusColorMap[task.status].hoverColor},'&:hover .MuiSvgIcon-root':{opacity:1}}} onClick={(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)?handleOpenStatusMenu:null}>
                <Stack direction='row' sx={{position:'relative'}}>
                <Typography variant='body2' textAlign={'center'} sx={{color:'white',minWidth:'130px',width:'100%'}}>
                    {task.status}
                </Typography>
                {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId) &&
                <EditIcon sx={{position:'absolute',top:'0px',right:'2px',color:'white',opacity:0}} />}
                </Stack>
            </TableCell>

            {/* priority table cell */}
            <TableCell sx={{cursor:'pointer',bgcolor:priorityColorMap[task.priority].color,'&:hover':{bgcolor:priorityColorMap[task.priority].hoverColor},'&:hover .MuiSvgIcon-root':{opacity:1}}} onClick={(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)?handleOpenPriorityMenu:null}>
                <Stack direction='row' sx={{position:'relative'}}>
                <Typography variant='body2' textAlign={'center'} sx={{color:'white',minWidth:'120px',width:'100%'}}>
                    {task.priority}
                </Typography>
                {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId) &&
                <EditIcon sx={{position:'absolute',top:'0px',right:'2px',color:'white',opacity:0}} />}
                </Stack>
            </TableCell>

            {/* deadline table cell , may switch to using menu + react-calendar later */}
            <TableCell >
                <Stack sx={{minWidth:'165px',width:'100%',position:'relative','&:hover .MuiSvgIcon-root':{opacity:1}}}>
                    {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)
                    ?<>
                        {!editDeadline?
                            <>
                            {task.deadline===''
                            ?<Box onClick={handleEditDeadline} sx={{cursor:'pointer',flexGrow:1,height:30,borderRadius:'50px',bgcolor:grey[500],'&:hover':{bgcolor:grey[400]}}}></Box>
                            :<Typography onClick={handleEditDeadline} textAlign={'center'} variant='body2' sx={{cursor:'pointer',flexGrow:1,p:0.5,borderRadius:'50px',color:'white',backgroundColor:green[500],'&:hover':{backgroundColor:green[400]}}}>{task.deadline}</Typography>
                            }
                            <EditIcon fontSize='small' sx={{position:'absolute',top:'5px',right:'2px',color:'white',opacity:0}}/>
                            </>
                            :  
                            <form style={{flexGrow:1}} onSubmit={handleDeadlineConfirm}>
                                <TextField type='date' inputProps={{min:task.deadline===''?deadline:dayjs().format('YYYY-MM-DD')}} sx={{width:'100%',height:'100%','& .MuiInputBase-input':{p:0.5}}} value={deadline} autoFocus={editDeadline?true:false} onChange={handleDeadlineChange} onBlur={handleDeadlineConfirm}/>
                            </form>
                        }
                    </>
                    :<>
                        {task.deadline===''
                        ?<Box sx={{cursor:'pointer',flexGrow:1,height:30,borderRadius:'50px',bgcolor:grey[500],'&:hover':{bgcolor:grey[400]}}}></Box>
                        :<Typography textAlign={'center'} variant='body2' sx={{cursor:'pointer',flexGrow:1,p:0.5,borderRadius:'50px',color:'white',backgroundColor:green[500],'&:hover':{backgroundColor:green[400]}}}>{task.deadline}</Typography>
                        }
                    </>}
                </Stack>
            </TableCell>

            {/* cost table cell */}
            <TableCell>
                <Stack sx={{minWidth:'120px',width:'100%',height:'100%',cursor:'pointer',position:'relative'}}>
                    {(userInfo.id === projectDetails.ownerId || userInfo.id === task.managerId)
                    ?<>
                        {!editCost?
                            <Tooltip title={task.cost}>
                            <Box sx={{position:'relative',flexGrow:1,display:'flex',height:'38px',p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Typography onClick={handleEditCost} variant='body2' sx={{width:'120px', whiteSpace:'nowrap',alignSelf:'center',overflow:'hidden',textOverflow:'ellipsis'}}>${task.cost}</Typography>
                                <EditIcon sx={{position:'absolute',top:'7px',right:'2px',color:blue[400],opacity:0}} />
                            </Box>
                            </Tooltip>
                            :
                            // fix negative and NaN issue ---------------> UGENT!!!!!!!
                            <form style={{flexGrow:1}} onSubmit={handleCostConfirm}>
                                <TextField inputMode='numeric' type={'number'} inputProps={{min:0}} sx={{width:'100%',height:'100%', '& .MuiInputBase-input':{p:0.5}}} autoFocus={editCost?true:false} onBlur={handleCostConfirm} value={cost} onChange={handleCostChange}/>
                            </form>
                        }
                    </>
                    :<>
                        <Tooltip title={task.cost}>
                            <Box sx={{position:'relative',flexGrow:1,display:'flex',height:'38px',p:0.5,borderRadius:'5px',border:'1px solid transparent','&:hover':{border:`1px solid ${blue[400]}`},'&:hover .MuiSvgIcon-root':{opacity:1}}}>
                                <Typography variant='body2' sx={{width:'120px', whiteSpace:'nowrap',alignSelf:'center',overflow:'hidden',textOverflow:'ellipsis'}}>${task.cost}</Typography>
                            </Box>
                        </Tooltip>
                    </>}
                </Stack>
            </TableCell>
        </TableRow>

        {/* status menu */}
        <Menu autoFocus={false} anchorOrigin={{horizontal:'center',vertical:'bottom'}} transformOrigin={{horizontal:'center',vertical:'top'}} anchorEl={statusAnchorEl} open={statusAnchorEl?true:false} onClose={handleCloseStatusMenu}>
          <MenuItem onClick={handleStatusChange} id='Stuck' sx={{m:1,bgcolor:red[500],'&:hover':{bgcolor:red[400]}}}>
            <Typography color='white'>Stuck</Typography>
          </MenuItem> 
          <MenuItem onClick={handleStatusChange} id='In progress' sx={{m:1,bgcolor:orange[500],'&:hover':{bgcolor:orange[400]}}}>
            <Typography color='white'>In progress</Typography>
          </MenuItem>
          <MenuItem onClick={handleStatusChange} id='Done' sx={{m:1,bgcolor:green[500],'&:hover':{bgcolor:green[400]}}}>
            <Typography color='white'>Done</Typography>
          </MenuItem>
        </Menu>

        {/* priority menu */}
        <Menu autoFocus={false} anchorOrigin={{horizontal:'center',vertical:'bottom'}} transformOrigin={{horizontal:'center',vertical:'top'}} anchorEl={priorityAnchorEl} open={priorityAnchorEl?true:false} onClose={handleClosePriorityMenu}>
          <MenuItem onClick={handlePriorityChange} id='High' sx={{m:1,bgcolor:blue[800],'&:hover':{bgcolor:blue[700]}}}>
            <Typography color='white'>High</Typography>
          </MenuItem>
          <MenuItem onClick={handlePriorityChange} id='Medium' sx={{m:1,bgcolor:blue[600],'&:hover':{bgcolor:blue[500]}}}>
            <Typography color='white'>Medium</Typography>
          </MenuItem>
          <MenuItem onClick={handlePriorityChange} id='Low' sx={{m:1,bgcolor:blue[400],'&:hover':{bgcolor:blue[300]}}}>
            <Typography color='white'>Low</Typography>
          </MenuItem>
        </Menu>

        {/* manager menu  */}
        <Menu sx={{'& .MuiMenu-list':{py:0.5,px:1}}} autoFocus={false} anchorOrigin={{horizontal:'center',vertical:'bottom'}} transformOrigin={{horizontal:'center',vertical:'top'}} anchorEl={managerAnchorEl} open={managerAnchorEl?true:false} onClose={handleCloseManagerMenu}>
            <TextField sx={{'& .MuiInputBase-input':{py:0.5,px:1}}} value={managerSearchInput} onChange={handleManagerSearchInputChange} disabled={task.members.membersArray.length>0?false:true} placeholder={task.members.membersArray.length>0 ? 'Choose task manager':'no members'}/>
            {/* search results  */}
            {managerSearchResults.length > 0 &&
                <Box sx={{mt:0.5,width:'100%',maxHeight:'100px',overflowY:'auto'}}>
                    {managerSearchResults.map((res,index)=>{
                        let isManager = res.id === task.managerId ? true : false
                        let initial = res.username.at(0).toUpperCase()
                        let captalized = initial + res.username.slice(1)
                        return (
                            <ListItem onClick={task.managerId===res.id ?null : handleSelectManager} key={index} id={res.id} sx={{borderRadius:'5px',cursor:'pointer','&:hover':{bgcolor:grey[200]}}} >
                                {/* <ListItemAvatar> */}
                                    <Avatar src={res.photoURL} sx={{width:28,height:28,mr:1,bgcolor:colorMap[res.bgColor]}}>{initial}</Avatar>
                                {/* </ListItemAvatar> */}
                                <ListItemText sx={{width:82,whiteSpace:'nowrap',overflow:'hidden', textoverflow:'ellipsis'}} secondary={captalized} />
                                <ListItemIcon sx={{minWidth:'unset',ml:1}}>
                                    {isManager &&
                                        <Tooltip title="Manager">
                                            <CheckCircleOutlineIcon />
                                        </Tooltip>
                                    }
                                </ListItemIcon>
                            </ListItem>
                        )
                    })}
                </Box>
            }
        </Menu>

        {/* group menu */}
        {groupAnchorEl &&
        <TaskMembersMenu task={task} anchorEl={groupAnchorEl} handleCloseGroupMenu={handleCloseGroupMenu} />}
    
        {/* indicator  */}
        
    </>
  )
}

