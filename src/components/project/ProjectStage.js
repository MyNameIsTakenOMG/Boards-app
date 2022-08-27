import React, { useEffect, useState } from 'react'
import { Box, IconButton, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, Stack, Dialog, DialogTitle, DialogContent, Button } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { grey, blue, red } from '@mui/material/colors'
import { useDispatch } from 'react-redux';
import { addNewTask, editStageName, removeStage, selectProjectDetails } from '../../store/projectSlice';
import ProjectTask from './ProjectTask';
import {colorMap} from '../../utils/colorMap'
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../store/userSlice';


export default function ProjectStage({stage,tasks, handleOpenUpdatesDrawer}) {

    const dispatch = useDispatch()
    const userInfo = useSelector(selectUserInfo)
    const projectDetails = useSelector(selectProjectDetails)
    // edit stage name
    const [editStage, setEditStage] = useState(false)
    const [editingStageName, setEditingStageName] = useState('')  
    const handleEditStage = ()=>{
        setEditStage(true)
        setEditingStageName(stage.stage_name)
    }
    const handleStageChange = (e)=>{
        setEditingStageName(e.target.value)
    }

    const handleStageConfirm = (e)=>{
        e.preventDefault()
        dispatch(editStageName({projectId: stage.path.project,stageId:stage.id,newStageName:editingStageName}))
    }

    // add new task 
    const handleAddNewTask = ()=>{
        dispatch(addNewTask({projectId: stage.path.project,stageId:stage.id}))
    }

    // delete the stage
    const [openDeleteStage, setOpenDeleteStage] = useState(false)
    const handleOpenDeleteStage = ()=>{
      setOpenDeleteStage(true)
    }
    const handleCloseDeleteStage = ()=>{
      setOpenDeleteStage(false)
    }
    const handleConfirmDeleteStage = ()=>{
      // dispatch an action to delete the stage
      dispatch(removeStage({projectId:stage.path.project,stageId:stage.id}))
    }

  return (
    <>
      {stage && tasks && 
      <>
        {userInfo.id === projectDetails.ownerId 
        ?<>
          {!editStage ?
            <Stack direction='row' spacing={0.5} pt={1.5} pb={0.5} sx={{'&:hover':{'& .MuiBox-root':{border:`1px solid ${blue[400]}`},'& .MuiSvgIcon-root':{opacity:1}}}}>
              <Tooltip title='Delete the stage'>
                <DeleteForeverIcon onClick={handleOpenDeleteStage} sx={{color:red[500], alignSelf:'center',opacity:0, cursor: 'pointer'}} />
              </Tooltip>
              <Box onClick={handleEditStage}  sx={{mt:2,mb:1,height:'38px',alignSelf:'start',display:'flex',flexFlow:'row nowrap',alignItems:'center',position:'relative',p:0.5,borderRadius:'5px',border:'1px solid transparent'}}>
                <Typography variant='h6' sx={{mr:1}} color={colorMap[stage.themeColor]}>{stage.stage_name.charAt(0).toUpperCase() + stage.stage_name.slice(1)}</Typography>
                <EditIcon sx={{color:blue[400],opacity:0}}/>
              </Box>
            </Stack>
            :
            <form style={{alignSelf:'start'}} onSubmit={handleStageConfirm}>
              <TextField inputProps={{maxLength:25}} sx={{alignSelf:'start',mt:2,mb:1,height:'38px',width:'120px', '& 	.MuiInputBase-input':{p:0.8}}}  autoFocus={editStage?true:false} value={editingStageName} onChange={handleStageChange} onBlur={handleStageConfirm} />
            </form>
          }
        </> 
        :<>
          <Stack direction='row' spacing={0.5} pt={1.5} pb={0.5} sx={{'&:hover':{'& .MuiBox-root':{border:`1px solid ${blue[400]}`},'& .MuiSvgIcon-root':{opacity:1}}}}>
            <Box sx={{mt:2,mb:1,height:'38px',alignSelf:'start',display:'flex',flexFlow:'row nowrap',alignItems:'center',position:'relative',p:0.5,borderRadius:'5px',border:'1px solid transparent'}}>
              <Typography variant='h6' sx={{mr:1}} color={colorMap[stage.themeColor]}>{stage.stage_name.charAt(0).toUpperCase() + stage.stage_name.slice(1)}</Typography>
            </Box>
          </Stack>
        </>}
        <TableContainer component={Paper}>
          <Table sx={{minWidth:'100%'}}>
            <TableHead>
              <TableRow sx={{borderLeft:`3px solid ${colorMap[stage.themeColor]}`,'& > .MuiTableCell-root':{p:1},'& > .MuiTableCell-root:not(:last-child)':{
                borderRight:`1px solid ${grey[300]}`,
              }}}>

                {/* add new task table cell  */}
                <TableCell>
                  {userInfo.id === projectDetails.ownerId 
                  ?<>
                    <Tooltip title='Add new task'>
                      <IconButton sx={{color:blue[400]}} onClick={handleAddNewTask}>
                          <AddCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                  :<>
                    <IconButton sx={{opacity:0}}>
                        <AddCircleOutlineIcon />
                    </IconButton>
                  </>}
                </TableCell>
                <TableCell>Tasks</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Cost</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* tasks list  */}
              {tasks.map((task,index)=>{
                return <ProjectTask handleOpenUpdatesDrawer={handleOpenUpdatesDrawer} key={index} task={task} themeColor={stage.themeColor} />
              })}
            </TableBody>

          </Table>
        </TableContainer>
        
        {/* delete stage dialog  */}
        <Dialog open={openDeleteStage} onClose={handleCloseDeleteStage}>
          <DialogTitle>Sure to delete the stage?</DialogTitle>
          <DialogContent>
              <Stack direction='row' justifyContent='space-between'>
                  <Button variant='contained' color='error' onClick={handleConfirmDeleteStage}>Confirm</Button>
                  <Button variant='contained' color='primary' onClick={handleCloseDeleteStage}>Cancel</Button>
              </Stack>
          </DialogContent>
        </Dialog>
      </>
      }
    </>
  )
}
