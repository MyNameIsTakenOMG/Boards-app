import React, { useEffect, useRef, useState } from 'react'
import {  Stack, Button,Avatar, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import  useMediaQuery  from '@mui/material/useMediaQuery';
import MentionInput from '../mentionInput/MentionInput';


export default function ReplyDialog({username,photoURL,handleReplyInputChange,replyInput,openReplyDialog,handleCloseReplyDialog, replyName,handleSubmitReply,usersArr }) {

    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog fullScreen={fullScreen} sx={{'& .MuiPaper-root':{width:{xs:'100%',sm:'480px'}}}} open={openReplyDialog} onClose={handleCloseReplyDialog}>
        <DialogTitle >
            Reply to: {replyName}
        </DialogTitle>
        <DialogContent>
            <form onSubmit={handleSubmitReply} style={{marginTop:'0.5rem',display:'flex',flexFlow:'column nowrap',rowGap:'0.5rem',marginBottom:'0.5rem'}}>
                <Stack direction='row' spacing={2}>
                    <Avatar src={photoURL} sx={{width:32,height:32}}>{username.at(0).toUpperCase()}</Avatar>
                    <MentionInput usersArr={usersArr} value={replyInput} onChange={handleReplyInputChange} placeholder='Leave your reply, use @ to mention people'/>
                </Stack>
                <Button type='submit' variant='contained' color='primary' sx={{borderRadius:'40px',alignSelf:'end'}} >Reply</Button>
            </form>
        </DialogContent>
        <DialogActions>
        </DialogActions>
    </Dialog>
  )
}
