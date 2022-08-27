import { Avatar, Box, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { grey } from '@mui/material/colors'; 
import React, { useEffect, useRef, useState } from 'react'
import {Highlight, useInfiniteHits} from 'react-instantsearch-hooks-web'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSelector } from 'react-redux';
import {useLocation} from 'react-router-dom'
import { colorMap } from '../../utils/colorMap';
import { selectProjectDetails, selectAllProjects } from '../../store/projectSlice';

export default function SearchResults({handleSelectUserChip}) {

    const { hits, isLastPage, showMore } = useInfiniteHits()
    console.log('hits length: ', hits.length)
    const sentinalRef = useRef()
    const theRoot = useRef()
    const projectDetails = useSelector(selectProjectDetails)
    const allProjects = useSelector(selectAllProjects)
    const location = useLocation()

    const theProject = location.pathname.match(/home/) ? allProjects[0] : projectDetails 

    // infinite scrolling 
    useEffect(()=>{
        if(sentinalRef.current){
            const observer = new IntersectionObserver((entries)=>{
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isLastPage) {
                      showMore();
                    }
                  });
            },{root:theRoot.current,rootMargin:'20px',threshold:0.7})
            observer.observe(sentinalRef.current)

            return ()=>{
                observer.disconnect()
            }
        }
    },[isLastPage, showMore])


  return (
        <Box ref={theRoot} sx={{mx:0.5,p:0.5,display: hits.length===0? 'none':'block' ,borderRadius:'3px',boxShadow:' inset 0px 0px 4px grey',width:'100%',maxHeight:'250px',overflowY:'auto'}}>
            <List sx={{p:0}}>
                {hits.map(hit=>{
                    let captalized = hit.username.charAt(0).toUpperCase() + hit.username.slice(1)
                    let isMember = false
                    if(theProject.members[hit.objectID]) isMember = true
                    return <ListItem onClick={!isMember?(e)=>{handleSelectUserChip(e, hits)}:null} id={hit.objectID} key={hit.objectID} sx={{py:0,cursor:'pointer','&:hover':{bgcolor:grey[100]}}}>
                        <ListItemAvatar>
                            <Avatar alt={captalized} src={hit.photoURL} sx={{bgcolor: colorMap[hit.bgColor],mx:'auto',width:36,height:36}}>{hit.username.charAt(0).toUpperCase()}</Avatar>
                        </ListItemAvatar>
                        <ListItemText sx={{textAlign:'center'}} primary={captalized} secondary={hit.email} />
                        <ListItemIcon>
                          {isMember &&
                          <Tooltip title='Project member'>
                              <CheckCircleOutlineIcon />
                          </Tooltip>}
                        </ListItemIcon>
                    </ListItem>
                })}
                <ListItem aria-hidden="true" ref={sentinalRef}></ListItem>
            </List>
        </Box>
  )
}
