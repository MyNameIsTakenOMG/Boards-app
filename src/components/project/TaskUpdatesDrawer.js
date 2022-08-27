import React from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import { Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';

export default function TaskUpdatesDrawer({openUpdatesDrawer, handleCloseUpdatesDrawer, taskUpdates}) {

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    //  <div id='backdrop' onClick={handleCloseUpdatesDrawer} style={{zIndex:10000,position:'fixed',top:0,left:0,width:'100vw',height:'100vh',backgroundColor:'rgba(0,0,0,0.5)'}}>
    //    hello
    //  </div>
      <AnimatePresence>
        {openUpdatesDrawer &&
          <motion.div 
              id='backdrop'
              onClick={handleCloseUpdatesDrawer}
              style={{zIndex:1000,position:'fixed',width:'100vw',height:'100vh',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)'}}
              initial={{opacity:0}} 
              transition={{duration:0.5}} 
              animate={{opacity:1}} 
              exit={{opacity:0}}>
              <motion.div
                style={{width:isSmallScreen?'100%':'80%',maxWidth:'550px',padding:'1rem',paddingBottom:0,position:'absolute',display:'flex',flexFlow:'column nowrap',height:'100%',top:0,right:0,backgroundColor:'white'}}
                initial={{translateX:60}}
                transition={{duration:0.5}}
                animate={{translateX:0}}
                exit={{translateX:60}}
              >
                <Stack direction='column' spacing={1} mb={1}>
                  <Button sx={{alignSelf:'start'}} id='close_btn' color='error' onClick={handleCloseUpdatesDrawer}><CancelPresentationIcon id='cancel'/></Button>
                  <Typography variant='body1' textAlign={'left'}>Updates: </Typography>
                </Stack>
                {taskUpdates}
              </motion.div>
          </motion.div>
        }
      </AnimatePresence>
  )
}
