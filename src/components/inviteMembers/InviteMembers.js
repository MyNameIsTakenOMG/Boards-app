import { Button, Box, Avatar,  Typography, Chip, Stack, Backdrop, Paper, Divider, Dialog, DialogTitle, DialogContent, useTheme, useMediaQuery } from '@mui/material'
import { grey } from '@mui/material/colors'
import React, {  useEffect, useState } from 'react'
import { InstantSearch } from 'react-instantsearch-hooks-web'
import {searchClient} from '../../algolia/config'
import SearchResults from './SearchResults'
import './InviteMembers.css'
import {useDispatch, useSelector} from 'react-redux'
import { inviteMembers, selectIsProcessing, selectProjectDetails, selectStatus } from '../../store/projectSlice'
import { colorMap } from '../../utils/colorMap'
import AlgoliaSearchBox from '../algoliaSearch/AlgoliaSearchBox'

export default function InviteMembers({projectId,openInviteMembers,handleCloseInviteMembers,helpInfo=false}) {

    const [selectedUsers, setSelectedUsers] = useState([])
    const projectDetails = useSelector(selectProjectDetails)
    const isProcessing = useSelector(selectIsProcessing)
    const projectStatus = useSelector(selectStatus)
    const dispatch = useDispatch()
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const handleDeleteUserChip = (id)=>(e)=>{
        console.log('e: ',e)
        console.log('id: ', id )
        setSelectedUsers(pre=>{
            return pre.filter(user=>user.objectID !== id)
        })
    }

    const handleSelectUserChip = (e,hits)=>{
        console.log(e.currentTarget.id);
        // add the user if it doesn't exist in the selectedUsers array 
        let isExisting = false;
        selectedUsers.forEach(user=>{
            if(user.objectID === e.currentTarget.id) {
                isExisting = true;
            }
        })
        console.log('isExisting: ', isExisting);
        if(!isExisting) {
            let theUser = hits.find(hit=>hit.objectID === e.currentTarget.id)
            console.log('the user: ',theUser);
            setSelectedUsers(pre=>(
                [...pre, theUser]
            ))
        }
    }

    const handleConfirmInviteMembers = ()=>{
        if(selectedUsers.length!==0)
            dispatch(inviteMembers({projectId: projectId,selectedUsers:selectedUsers}))
    }
    
    useEffect(()=>{
        if(projectStatus.id){
            if(projectStatus.code ===200 && projectStatus.message.match(/invited/)){
                setSelectedUsers([])
            }
        }
    },[projectStatus.id])

  return (
    <Dialog fullScreen={fullScreen} open={openInviteMembers} onClose={handleCloseInviteMembers} sx={{transition:'backdrop-filter 0.2s ease-in-out',backdropFilter:'blur(5px)','& .MuiDialog-paper':{overflowY:'unset',width:{xs:'100%',sm:'500px'},height:{sm:'auto'}},'& .MuiDialog-container':{bgcolor:'rgba(255,255,255,0.6)'}}} >
        <DialogTitle sx={{textAlign:'center'}}>Invite new members</DialogTitle>
        <DialogContent>
            <Stack className='inviteMembersDialog' mx={1} direction={'column'} spacing={2}>
                {selectedUsers.length!==0 &&
                <Box sx={{border:'1px solid red',width:'100%',maxHeight:'120px',overflowY:'auto',p:0.5,textAlign:'left'}}>
                    {/* chip list  */}
                    {selectedUsers.map((user)=>{
                        return(
                            <Chip onDelete={handleDeleteUserChip(user.objectID)} sx={{mr:0.5,'& .MuiChip-avatar':{color:'white'}}} key={user.objectID} size='small' label={user.username.length>10?`${user.username.slice(0,8)}...`:user.username} variant='outlined' avatar={<Avatar sx={{bgcolor: colorMap[user.bgColor]}}>{user.username.at(0).toUpperCase()}</Avatar>}/>
                        )
                    })}
                </Box>
                }   

                <InstantSearch searchClient={searchClient} indexName='boardsapp_username'>
                
                    <AlgoliaSearchBox />
                    {/* search results component goes here  */}
                    <SearchResults handleSelectUserChip={handleSelectUserChip} />

                </InstantSearch>

                <Divider />
                { helpInfo && <Typography variant='body2' color={grey[500]} sx={{mx:2}}>**Click 'Skip' if you wanna invite members later</Typography>}
                <Stack direction={'row'} justifyContent={'end'} spacing={1}>
                    <Button variant='contained' onClick={handleConfirmInviteMembers} >Confirm</Button>
                    <Button variant='contained' color='warning' onClick={handleCloseInviteMembers}>{helpInfo ? 'Skip': 'Cancel'}</Button>
                </Stack>
            </Stack>
        </DialogContent>
    </Dialog>

  )
}
