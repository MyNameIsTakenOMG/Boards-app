import React from 'react'
import {Box, Stack, Avatar, Typography, Tooltip, AvatarGroup} from '@mui/material'
import { grey, blue, orange, red, green} from '@mui/material/colors';
import { Helmet } from 'react-helmet';
import { colorMap } from '../../utils/colorMap';

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

export default function TaskDetails({task}) {
  return (
      <Box sx={{width:'100%',flexGrow:1,border:'1px solid black',overflowY:'auto'}}>
        <Helmet>
            <title>{`Task - ${task.task_name} / Boards`}</title>
            <meta name="description" content={`Task - ${task.task_name} / Boards`} />
        </Helmet>
        <Stack direction='column' px={2} py={1}>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Task Name:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Typography variant='body1' textAlign={'center'}>{task.task_name}</Typography>
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Manager:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    {task.managerId ?
                    <Stack direction='row' spacing={2} justifyContent={'center'} sx={{py:0.2,width:'100%',height:'100%'}}>
                        <Avatar src={task.members[task.managerId].photoURL} sx={{outline:'1px solid grey',width:28,height:28}}>{task.members[task.managerId].username.at(0).toUpperCase()}</Avatar>
                        <Typography variant='body1'>{task.members[task.managerId].username}</Typography>
                    </Stack>
                    : <Typography variant='body1' textAlign={'center'}>N/A</Typography>}
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Group:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Stack direction='row' justifyContent={'center'} sx={{py:0.2,width:'100%',height:'100%'}}>
                        <Tooltip title={task.members.membersArray.length}>
                            <AvatarGroup total={task.members.membersArray.length} spacing={5} sx={{flexGrow:1,justifyContent:'center','& .MuiAvatar-root':{width:28,height:28}}} >
                                {task.members.membersArray.length<4 
                                ? task.members.membersArray.map((member,index)=><Avatar src={task.members[member].photoURL} sx={{outline:'1px solid grey',bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)
                                : task.members.membersArray.slice(0,3).map((member,index)=><Avatar src={task.members[member].photoURL} sx={{outline:'1px solid grey',bgcolor:colorMap[task.members[member].bgColor]}} key={index}>{task.members[member].username.at(0).toUpperCase()}</Avatar>)}
                            </AvatarGroup>
                        </Tooltip>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Status:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Stack direction='row' justifyContent={'center'} sx={{py:0.5,width:'100%',height:'100%',bgcolor:statusColorMap[task.status].color,'&:hover':{bgcolor:statusColorMap[task.status].hoverColor},borderRadius:'10px'}}>
                        <Typography variant='body1' sx={{textAlign:'center',color:'white'}}>{task.status}</Typography>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Priority:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Stack direction='row' justifyContent={'center'} sx={{py:0.5,width:'100%',height:'100%',bgcolor:priorityColorMap[task.priority].color,'&:hover':{bgcolor:priorityColorMap[task.priority].hoverColor},borderRadius:'10px'}}>
                        <Typography variant='body1' sx={{textAlign:'center',color:'white'}}>{task.priority}</Typography>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Deadline:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Stack direction='row' justifyContent={'center'} sx={{py:0.5,width:'100%',height:'100%',bgcolor: task.deadline ?green[400]:grey[400],borderRadius:'10px'}}>
                        <Typography variant='body1' sx={{textAlign:'center',color:'white'}}>{task.deadline? task.deadline : 'N/A'}</Typography>
                    </Stack>
                </Box>
            </Stack>
            <Stack direction='row'>
                <Box sx={{width:'50%',p:2,display:'flex',flexFlow:'row nowrap',alignItems:'center'}}>
                    <Typography sx={{flexGrow:1}} variant='body1' textAlign={'right'} color={grey[600]}>Cost:</Typography>
                    <Box sx={{width:'20%'}}></Box>
                </Box>
                <Box sx={{width:'50%',p:2}}>
                    <Stack direction='row' justifyContent={'center'} sx={{py:0.2,width:'100%',height:'100%',}}>
                        <Typography variant='body1' sx={{textAlign:'center'}}>${task.cost}</Typography>
                    </Stack>
                </Box>
            </Stack>
        </Stack>
      </Box>
  )
}
