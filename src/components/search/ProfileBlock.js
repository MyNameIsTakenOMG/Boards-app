import { Avatar, Box, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch';
import React from 'react'
import { grey, purple } from '@mui/material/colors';
import { colorMap } from '../../utils/colorMap';

export default function ProfileBlock({hit, handleCheckProfile}) {
  console.log('hit: ',hit)
  return (
    <Grid item  xs={12} sm={6} md={4} lg={3} xl={2} sx={{px:1,py:2,border:'1px solid transparent'}}>
        <Paper onClick={()=>{handleCheckProfile(hit.objectID)}} elevation={2} sx={{'&:hover':{transform:'scale(1.05)','& .MuiSvgIcon-root':{opacity:1}},transition:'transform 0.2s ease-in-out',position:'relative',overflow:'hidden',width:'100%',pb:0.5,cursor:'pointer',fontSize:{xs:'160%',md:'180%',lg:'200%'}}}>
            <Stack sx={{bgcolor:purple[400]}} direction='row' justifyContent='center' py={2} mb={1.5}>
                <Box sx={{width:{xs:40,md:60,lg:80},aspectRatio:(1/1).toString()}}>
                    <Avatar sx={{outline:'3px solid white',width:'100%',height:'100%',bgcolor:colorMap[hit.bgColor],fontSize:'inherit'}} src={hit.photoURL} alt={hit.username}>{hit.username.at(0).toUpperCase()}</Avatar>
                </Box>
            </Stack>
            <Stack sx={{width:'100%',overflow:'hidden'}} spacing={1} direction='column' alignItems='start' px={2}>
                  <Typography variant='body1'>Name: {hit.username.length>15?`${hit.username.slice(0,12)}...`:hit.username}</Typography>
                  <Typography variant='body1'>Email: {hit.email.length>15?`${hit.email.slice(0,12)}...`:hit.email}</Typography>
                  <Typography variant='body1'>Title: {hit.title.length>15?`${hit.title.slice(0,12)}...`:hit.title}</Typography>
                <Tooltip title='Check profile'>
                    <LaunchIcon  sx={{alignSelf:'end',color:grey[500] ,opacity:0, transition:'opacity 0.2s ease-in-out'}}/>
                </Tooltip>
            </Stack>
        </Paper>
    </Grid>
  )
}
