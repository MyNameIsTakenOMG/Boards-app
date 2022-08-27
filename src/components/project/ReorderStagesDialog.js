import { LoadingButton } from '@mui/lab'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

export default function ReorderStagesDialog({onDragEnd,openReorder,handleCloseReorder,projectId,duplicateStageIdArray,handleConfirmReorder}) {

    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
          <Dialog fullScreen={fullScreen} open={openReorder} onClose={handleCloseReorder} sx={{transition:'backdrop-filter 0.2s ease-in-out',backdropFilter:'blur(5px)','& .MuiDialog-paper':{overflowY:'unset',width:{sm:'600px'},height:{sm:'600px'}},'& .MuiDialog-container':{bgcolor:'rgba(255,255,255,0.6)'}}} >
            <DialogTitle sx={{borderBottom:`1px solid ${grey[400]}`}}>Reorder your stages</DialogTitle>
            <DialogContent sx={{'&.MuiDialogContent-root':{pt:2.5,overflowY:'auto'}}}>
                {/* drag and drop area  */}
                <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={projectId}>
                    {(provided,snapshot)=>(
                    <Stack ref={provided.innerRef} {...provided.droppableProps} direction='column' spacing={1}>
                        {duplicateStageIdArray.ids.map((stageId,index)=>(
                        // dont use index as key for draggable component, instead use stage or something else
                        <Draggable draggableId={stageId} index={index} key={stageId}>
                            {(provided,snapshot)=>(
                            <Typography key={stageId} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}  variant='body1' sx={{py:1,px:2,borderRadius:'5px',boxShadow:'1px 1px 3px grey'}}>
                                {duplicateStageIdArray.names[index]}
                            </Typography>
                            )}
                        </Draggable>
                        ))}
                        {provided.placeholder}
                    </Stack>
                    )}
                </Droppable> 
                </DragDropContext>
            </DialogContent>
            <DialogActions>
                <Button  variant='outlined' color='primary' onClick={handleConfirmReorder}>Confirm</Button>
                <Button variant='outlined' color='error' onClick={handleCloseReorder}>Close</Button>
            </DialogActions>
        </Dialog>
  )
}
