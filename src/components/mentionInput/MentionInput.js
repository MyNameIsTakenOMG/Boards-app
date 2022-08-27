import { Box } from '@mui/material'
import React from 'react'
import {Mention, MentionsInput} from 'react-mentions'
import styles from './mentionInput.module.css'
import styles2 from './mentionInput-small.module.css'

export default function MentionInput({disabled,usersArr,placeholder,value,onChange,small=false}) {

  return (
    <Box sx={{width:'100%',position:'relative',py:'0.5rem',px:'0.5rem',border:'1px solid silver',borderRadius:'4px','&:hover':{border:'1px solid black'},'&:focus-within':{border:'1px solid transparent',outline:'2px solid #1976d2'}}}>
        <MentionsInput disabled={disabled} required aria-required placeholder={placeholder} value={value} onChange={onChange} className="mentions"  classNames={small ?styles2 : styles} >
            <Mention trigger='@' data={usersArr} className={small ? styles2.mentions__mention : styles.mentions__mention} appendSpaceOnAdd/>
        </MentionsInput>
    </Box>
  )
}
