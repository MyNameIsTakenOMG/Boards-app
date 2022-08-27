import React, { useState } from 'react'
import { Box, Stack, Typography,Button,Tabs,Tab, useTheme, useMediaQuery, Dialog } from '@mui/material'
import { grey, blue} from '@mui/material/colors';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';


export default function TaskBoard({projectName,taskName,handleCloseTaskBoard, openTaskBoard, taskDetails, taskUpdates}) {

    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))

    const [tabValue, setTabValue] = useState('details')
    const handleChange = (event, newValue) => {
        setTabValue(newValue)
    }

  return (
    <Dialog maxWidth={false} fullScreen={fullScreen} open={openTaskBoard} onClose={handleCloseTaskBoard} sx={{transition:'backdrop-filter 0.2s ease-in-out',backdropFilter:'blur(5px)','& .MuiDialog-paper':{overflowY:'unset',width:{xs:'100%',sm:'90%',md:'600px',lg:'1000px'},height:{xs:'100%',sm:'90%'}},'& .MuiDialog-container':{bgcolor:'rgba(255,255,255,0.6)'}}} >
        <Stack direction='column' sx={{backgroundColor:'white',width:'100%',height:'100%',position:'relative',px:4,py:3}}>
            <Stack direction='column' spacing={1} >
                <Stack direction='row' justifyContent={'space-between'}>
                    <Typography variant='h6' fontWeight={500} textAlign='left'>{`Task: ${taskName}`}</Typography>
                    <Button color='error' onClick={handleCloseTaskBoard}><CancelPresentationIcon /></Button>
                </Stack>    
                <Typography variant='body1' color={grey[500]} textAlign='left'>{`Project: ${projectName}`}</Typography>
            </Stack>
            <Stack direction='column' mt={1} spacing={1} sx={{height:'calc(100% - 72px)'}}>
                {!isLargeScreen 
                ?<>
                    <Stack direction='row' justifyContent={'center'}>
                        <Tabs value={tabValue} onChange={handleChange} sx={{justifyContent:'center'}}>
                            <Tab value='details' label='Details' />
                            <Tab value='updates' label='Updates' />
                        </Tabs>
                    </Stack>
                    {/* task details section  */}
                    {tabValue ==='details' && taskDetails}
                    {/* task updates section  */}
                    {tabValue === 'updates' && taskUpdates }
                </>
                :<>
                    <Stack direction='row' sx={{width:'100%',height:'100%',position:'relative'}} spacing={2}>
                        <Stack direction='column' sx={{width:'50%',height:'100%'}}>{taskDetails}</Stack>
                        <Stack direction='column' sx={{width:'50%',height:'100%'}}>{taskUpdates}</Stack>
                    </Stack>
                </>}
            </Stack>
        </Stack>  
    </Dialog>
            
  )
}
