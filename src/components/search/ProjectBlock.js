import { Avatar, AvatarGroup, Chip, Divider, Grid, Paper, Stack, Tooltip, Typography } from '@mui/material'
import { green, orange, purple, red } from '@mui/material/colors'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import React from 'react'
import { colorMap } from '../../utils/colorMap'

const projectStatusColorMap = {
  'Stuck':red[500],
  'In progress':orange[500],
  'Done':green[500]
}

export default function ProjectBlock({hit, handleCheckProject}) {
  return (
    <Grid item  xs={12} sm={6} md={4} lg={3} xl={2} sx={{px:1,py:2,border:'1px solid black'}}>
      <Paper onClick={()=>{handleCheckProject(hit.objectID)}} sx={{'&:hover':{transform:'translateY(-5px) scale(1.05)'},transition:'transform 0.2s ease-in-out',position:'relative',cursor:'pointer',p:1,display:'flex',flexFlow:'column nowrap',border:`5px solid ${purple[400]}`}}>
        <Stack direction='column' alignItems={'start'} my={1} ml={1} spacing={1}>
          <Typography variant='h5'>{hit.project_name}</Typography>
          <Stack direction='row' spacing={1}>
            <Typography variant='body1' fontWeight={500} sx={{alignSelf:'center'}}>Owner:</Typography>
            <Tooltip title={hit.members[hit.ownerId].username}>
              <Chip sx={{'&.MuiChip-root':{height:34},'& .MuiChip-avatar':{width:28,height:28, bgcolor: colorMap[hit.members[hit.ownerId].bgColor]}}} avatar={<Avatar src={hit.members[hit.ownerId].photoURL} >{hit.members[hit.ownerId].username.at(0).toUpperCase()}</Avatar>}  label={hit.members[hit.ownerId].username.length >10 ? `${hit.members[hit.ownerId].username.slice(0,10)}...`:hit.members[hit.ownerId].username} variant='outlined'/>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider sx={{my:1}}/>
        <Stack direction='column' alignItems={'start'} my={1} ml={1} spacing={1}>
          <Stack direction='row' spacing={1}>
            <Typography variant='body1' sx={{alignSelf:'center'}}>Members:</Typography>
            <AvatarGroup sx={{'& .MuiAvatarGroup-avatar':{width:36,height:36}}} total={hit.members.membersArray.length}>
              {hit.members.membersArray.length >3 
              ? hit.members.membersArray.slice(0,3).map((memberId,index)=><Avatar src={hit.members[memberId].photoURL} key={index} sx={{bgcolor:colorMap[hit.members[memberId].bgColor]}}>{hit.members[memberId].username.at(0).toUpperCase()}</Avatar>) 
              :hit.members.membersArray.map((memberId,index)=><Avatar src={hit.members[memberId].photoURL} key={index} sx={{bgcolor:colorMap[hit.members[memberId].bgColor]}}>{hit.members[memberId].username.at(0).toUpperCase()}</Avatar>)}
            </AvatarGroup>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Typography variant='body1' sx={{alignSelf:'center'}}>Status:</Typography> 
            <Typography variant='body1' bgcolor={projectStatusColorMap[hit.status]} sx={{textAlign:'center',py:1,px:1, color:'white'}}>{hit.status}</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Grid>
  )
}
