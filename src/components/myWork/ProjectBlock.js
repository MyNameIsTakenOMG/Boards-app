import { Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material'
import { blue, green, grey, orange, red } from '@mui/material/colors'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import React, { useState } from 'react'

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

export default function ProjectBlock({project, tasksData, handleOpenTaskBoard}) {

    const [isExpanding, setIsExpanding] = useState(false)
    const handleToggleExpand = ()=>{
        setIsExpanding(pre=>!pre)
    }

  return (
    <Stack key={project.id} direction='column' spacing={1} sx={{width:'100%',mb:1}}>
        <Stack direction='row' spacing={0.5} >
            <Typography sx={{alignSelf:'center'}} >{project.name.toUpperCase()} / ({tasksData[project.id].length}) tasks</Typography>
            <IconButton sx={{alignSelf:'center'}} onClick={handleToggleExpand}><ArrowDropUpIcon sx={{transform:!isExpanding ? 'rotate(0deg)':'rotate(180deg)',transition:'transform 0.2s ease-in-out'}}/></IconButton>
        </Stack>
        {/* task block  list --- grid style */}
        <Grid container sx={{overflow:'hidden',height: !isExpanding?0:'auto'}}>
            {tasksData[project.id].map(task =>(
                <Grid key={task.id} item xs={12} sm={6} md={4} lg={3} xl={2} sx={{px:1,py:2}}>
                    <Paper onClick={()=>{handleOpenTaskBoard(project.id, task.id)}} elevation={2} sx={{'&:hover':{transform:'scale(1.03)','& .MuiSvgIcon-root':{opacity:1}},transition:'transform 0.2s ease-in-out',position:'relative',overflow:'hidden',width:'100%',pb:0.5,cursor:'pointer',fontSize:{xs:'160%',md:'180%',lg:'200%'}}}>
                        <Stack direction='column' p={2} spacing={1}>
                            <Typography variant='body1' textAlign={'left'} color={grey[600]} fontWeight={500}>{task.task_name}</Typography>
                            <Typography variant='body2' textAlign={'left'} color={grey[600]}>Manager: {task.managerId? task.members[task.managerId].username: 'N/A'}</Typography>
                            <Stack direction={'row'}>
                                <Typography variant='body1' textAlign={'left'} sx={{width:'50%'}} color={grey[600]}>{'Status'}</Typography>
                                <Typography variant='body1' sx={{width:'50%',borderRadius:'10px',bgcolor:statusColorMap[task.status].color,'&:hover':{bgcolor:statusColorMap[task.status].hoverColor}}} color='white'>{task.status}</Typography>
                            </Stack>
                            <Stack direction={'row'}>
                                <Typography variant='body1' textAlign={'left'} sx={{width:'50%'}} color={grey[600]}>{'Deadline'}</Typography>
                                <Typography variant='body1' sx={{width:'50%',borderRadius:'10px',bgcolor:green[400]}} color='white'>{task.deadline? task.deadline:'N/A'}</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>    
        <Divider />
    </Stack>
  )
}
