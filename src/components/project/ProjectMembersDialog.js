import React, { useState } from 'react'
import { Dialog, DialogActions , DialogTitle, DialogContent,Stack, Avatar,Typography,Button, Tooltip, useTheme, useMediaQuery } from '@mui/material'
import { grey } from '@mui/material/colors'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {useSelector, useDispatch} from 'react-redux'
import { removeMembers, selectProjectDetails } from '../../store/projectSlice'

export default function ProjectMembersDialog({openManageMembers, handleCloseManageMembers}) {

    const projectDetails = useSelector(selectProjectDetails)
    const [selectedMembers, setSelectedMembers] = useState({})
    const dispatch = useDispatch()
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const handleToggle = (id)=>()=>{
        setSelectedMembers(pre=>{
            let newState = {...pre}
            if(newState[id]) delete newState[id]
            else newState[id] = 'selected'
            return newState
        })
    }

    const handleRemoveMembers = ()=>{
        dispatch(removeMembers({projectId:projectDetails.id, selectedUsers: Object.keys(selectedMembers)}))
        // dispatch the action to remove the selected members from the project 
        // as well as the user info from corresponding tasks
        // pass 'Object.keys(selectedMembers)' and 'projectDetails.id' to the action 
    }

  return (
    <Dialog fullScreen={fullScreen} open={openManageMembers} onClose={handleCloseManageMembers} sx={{transition:'backdrop-filter 0.2s ease-in-out',backdropFilter:'blur(5px)','& .MuiDialog-paper':{overflowY:'unset',width:{sm:'500px'},height:{sm:'500px'}},'& .MuiDialog-container':{bgcolor:'rgba(255,255,255,0.6)'}}} >
        <DialogTitle sx={{borderBottom:`1px solid ${grey[400]}`}}>Manage members</DialogTitle>
        <DialogContent sx={{'&.MuiDialogContent-root':{pt:2.5,overflowY:'auto'}}}>
          <Stack direction='column' spacing={1}>
            {/* project members list goes here:  */}
            {projectDetails.members.membersArray.length > 0 && projectDetails.members.membersArray.map((m,index)=>(
                <Stack key={index} direction='row' onClick={projectDetails.ownerId===m ?null : handleToggle(m)} sx={{boxShadow:'1px 1px 3px grey',cursor:'pointer',outline: selectedMembers[m] ? '2px red solid': '2px solid transparent',transition:'outline 0.2s ease-in-out',overflowX:'auto', borderRadius:'5px',py:0.5,'&:hover':{backgroundColor:grey[100]}}}>
                    <Stack direction='row' spacing={1} mx={3} width='40%'>
                       <Avatar src={projectDetails.members[m].photoURL} sx={{width:32,height:32}}>{projectDetails.members[m].username.at(0).toUpperCase()}</Avatar>
                       <Typography variant='body1' sx={{alignSelf: 'center'}}>{projectDetails.members[m].username}</Typography>
                        {projectDetails.ownerId===m && 
                            <Tooltip title='Owner'>
                                <AccountCircleIcon sx={{alignSelf: 'center'}} />
                            </Tooltip>
                        }
                     </Stack>
                     <Typography variant='body1' sx={{alignSelf:'center'}}>{projectDetails.members[m].email}</Typography>
                   </Stack>
                )
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' color='error' disabled={Object.keys(selectedMembers).length === 0 ? true: false} onClick={handleRemoveMembers}>Remove</Button>
          <Button variant='outlined' color='primary' onClick={handleCloseManageMembers}>Cancel</Button>
        </DialogActions>
    </Dialog>
  )
}
