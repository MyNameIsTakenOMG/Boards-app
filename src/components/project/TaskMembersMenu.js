import React, {  useEffect, useState } from 'react'
import { Box, Button, TextField, Stack, Typography, Tooltip, Avatar, Menu,  Chip, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { grey, red } from '@mui/material/colors'
import { useSelector, useDispatch } from 'react-redux';
import { addTaskMember, deleteTaskMember, selectProjectDetails } from '../../store/projectSlice';
import { colorMap } from '../../utils/colorMap';

export default function TaskMembersMenu({anchorEl,handleCloseGroupMenu,task}) {

    const projectDetails = useSelector(selectProjectDetails)
    const dispatch = useDispatch()
    const [addOrRemove, setAddOrRemove] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchInput, setSearchInput] = useState('')
    const [usersToAdd, setUsersToAdd] = useState([])
    const [usersToRemove, setUsersToRemove] = useState({})

    const handleClickAdd = ()=>{
        setAddOrRemove('add')
        setSearchInput('')
        setUsersToAdd([])
    }
    const handleClickRemove = ()=>{
        setAddOrRemove('remove')
        setUsersToRemove([])
    }
    const handleClickCancel = ()=>{
        setAddOrRemove('')
    }
    const handleSearchInputChange =(e)=>{
        setSearchInput(e.target.value)
    }
    const handleSelectUserToAdd = (e)=>{
        let id = e.currentTarget.id
        // check if the selected user is already in the list
        if (usersToAdd.find(user=>user.id === id)) return
        let theUser = searchResults.find(res=>res.id === id)
        setUsersToAdd(pre=>{
            let newArr = [...pre,theUser]
            return newArr
        })
    }
    const handleUnselectUserToAdd = (userId)=>(e)=>{
        console.log('id to remove: ',userId)
        setUsersToAdd(pre=>{
            let newArr = [...pre]
            newArr = newArr.filter(user=>user.id !==userId)
            return newArr
        })
    }
    const handleAddTaskMembers =()=>{
        dispatch(addTaskMember({projectId:task.path.project,stageId:task.path.stage,taskId:task.id,theUsers:[...usersToAdd]}))
    }
    const handleToggleUserToRemove = (e)=>{
        let id = e.currentTarget.id
        if(usersToRemove[id])
            setUsersToRemove(pre=>{
                let newState = {...pre}
                delete newState[id]
                return newState
            })
        else setUsersToRemove(pre=>{
            let newState = {...pre}
            newState[id] = 'selected'
            return newState
        })
    }
    const handleDeleteTaskMembers =()=>{
        dispatch(deleteTaskMember({projectId:task.path.project,stageId:task.path.stage,taskId:task.id,userIds:Object.keys(usersToRemove)}))
    }

    //update search results
    useEffect(()=>{
        if(searchInput===''){
            let ids = [...projectDetails.members.membersArray]
            let res = ids.map(id=>{
                return {...projectDetails.members[id],id:id}
            })
            setSearchResults(res)
        }
        else{
            // create a new search regex 
            let nameRegex = new RegExp(`^${searchInput}`, 'i')
            //fetch ids of all matched members names
            let ids = projectDetails.members.membersArray.filter(id=>{
                return nameRegex.test(projectDetails.members[id].username)
            })
            let res = ids.map(id=>{
                return {...projectDetails.members[id],id:id}
            })
            setSearchResults(res)
        }
    },[searchInput,projectDetails.members])

  return (
    <Menu sx={{'& .MuiMenu-list':{py:0.5,px:1}}} autoFocus={false} anchorOrigin={{horizontal:'center',vertical:'bottom'}} transformOrigin={{horizontal:'center',vertical:'top'}} anchorEl={anchorEl} open={anchorEl?true:false} onClose={handleCloseGroupMenu}>
        {addOrRemove ==='' && 
            <Stack direction='column' spacing={1} my={1}>
                <Button size='small' variant='contained' color='primary' onClick={handleClickAdd}>add members</Button>
                <Button size='small' variant='contained' color='warning' onClick={handleClickRemove}>remove members</Button>
            </Stack>
        }

        {/* remove members dialog  */}
        {addOrRemove === 'remove' && 
            <Stack direction='column' spacing={1} sx={{m:0.5,maxHeight:'180px',overflowY:'auto'}}>
                {/* task members list  */}
                <Stack direction='column' spacing={0.5} sx={{p:0.5}}>
                    {task.members.membersArray.length >0 
                    ?<>
                        {task.members.membersArray.map((memberId,index)=>(
                            <Box onClick={handleToggleUserToRemove} id={memberId} key={index} sx={{outline: usersToRemove[memberId] ? '2px solid red':'2px solid transparent',transition:'outline 0.2s ease-in-out' ,p:0.5, display:'flex',borderRadius:'5px',cursor:'pointer','&:hover':{bgcolor:grey[100]},flexFlow:'row nowrap',justifyContent:'start',alignItems:'center'}}>
                                <Avatar src={task.members[memberId].photoURL} sx={{width:24,height:24,mr:0.5,bgcolor:colorMap[task.members[memberId].bgColor]}}>{task.members[memberId].username.at(0).toUpperCase()}</Avatar>
                                <Typography variant='body2' sx={{color:grey[800],width:100,whiteSpace:'nowrap',overflow:'hidden', textoverflow:'ellipsis'}}>{task.members[memberId].username.at(0).toUpperCase()+task.members[memberId].username.slice(1)}</Typography>
                                <HighlightOffIcon sx={{ml:0.5,color: red[400], opacity: usersToRemove[memberId] ? 1:0, transition:'opacity 0.2s ease-in-out'}} />
                            </Box>  
                        ))}
                    </>
                    :<>
                        <Typography sx={{p:0.5,borderRadius:'5px',width:156,color: grey[500]}} variant='body2'>No task members...</Typography>
                    </>}
                </Stack>
                <Stack direction='row' justifyContent='space-between'>
                    <Button size='small' variant='contained' color='error' disabled={Object.keys(usersToRemove).length === 0? true:false} onClick={handleDeleteTaskMembers}>remove</Button>
                    <Button size='small' variant='contained' color='primary' onClick={handleClickCancel}>cancel</Button>
                </Stack>
            </Stack>
        }

        {/* add members dialog  */}
        {addOrRemove ==='add' && 
        <Stack direction='column' spacing={0.5} pb={0.5}>
            { usersToAdd.length>0 && 
                <Box sx={{width:'205px',maxHeight:'75px',overflowY:'auto',p:0.5,textAlign:'left',border:'1px solid black'}}>
                    {usersToAdd.map((user,index)=>{
                        let initial = user.username.at(0).toUpperCase()
                        let captalized = initial + user.username.slice(1)
                        return <Chip sx={{mr:0.5,'& .MuiChip-avatar':{color:'white'}}} onDelete={handleUnselectUserToAdd(user.id)} key={index} size='small'  label={captalized} variant='outlined' avatar={<Avatar src={user.photoURL} sx={{bgcolor: colorMap[user.bgColor]}}>{initial}</Avatar>}/>  
                    })}
                </Box>
            }
            <TextField sx={{width:'100%','& .MuiInputBase-input':{py:0.5,px:1}}} value={searchInput} onChange={handleSearchInputChange} placeholder='Choose task members'/>

            {/* search results  */}
            {searchResults.length > 0 &&
                <Box sx={{mt:0.5,width:'100%',maxHeight:'100px',overflowY:'auto'}}>
                    {searchResults.map((res,index)=>{
                        let isMember = task.members[res.id]!==undefined ? true : false
                        let initial = res.username.at(0).toUpperCase()
                        let captalized = initial + res.username.slice(1)
                        return (
                            <ListItem onClick={isMember?null: handleSelectUserToAdd} sx={{borderRadius:'5px',cursor:'pointer','&:hover':{bgcolor:grey[200]}}} key={index} id={res.id} >
                                {/* <ListItemAvatar sx={{mr:'unset'}}> */}
                                    <Avatar src={res.photoURL} sx={{width:28,height:28,mr:1,bgcolor: colorMap[res.bgColor]}}>{initial}</Avatar>
                                {/* </ListItemAvatar> */}
                                <ListItemText sx={{width:82,whiteSpace:'nowrap',overflow:'hidden', textoverflow:'ellipsis'}} secondary={captalized} />
                                <ListItemIcon sx={{minWidth:'unset',ml:1}}>
                                    {isMember &&
                                        <Tooltip title="Member">
                                            <CheckCircleOutlineIcon />
                                        </Tooltip>
                                    }
                                </ListItemIcon>
                            </ListItem>
                        )
                    })}
                </Box>
            }
            <Stack direction='row' justifyContent='space-between'>
                <Button size='small' variant='contained' color='primary' disabled={usersToAdd.length===0 ? true:false} onClick={handleAddTaskMembers}>confirm</Button>
                <Button size='small' variant='contained' color='warning' onClick={handleClickCancel}>cancel</Button>
            </Stack>
        </Stack>
        }
    </Menu>
  )
}
