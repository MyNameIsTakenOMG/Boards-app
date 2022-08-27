import { Backdrop, CircularProgress, Paper, Typography } from '@mui/material'
import { purple } from '@mui/material/colors'
import React from 'react'

export default function Indicator({open}) {
  return (
    <Backdrop sx={{'&.MuiBackdrop-root':{backgroundColor:'transparent'},zIndex: (theme) => theme.zIndex.drawer + 1000}} open={open}>
        <Paper elevation={5} sx={{width:'240px',height:'200px',display:'flex',flexFlow:'column nowrap',justifyContent:'center'}}>
            <CircularProgress color='secondary' size={100} sx={{alignSelf:'center',width:100,height:100,mb:2}} />
            <Typography variant='body2' color={purple[400]} >Processing...</Typography>
        </Paper>
    </Backdrop>
  )
}
