import { Grid } from '@mui/material'
import React, { useEffect, useRef,  } from 'react'
import { useInfiniteHits } from 'react-instantsearch-hooks-web'
import { useNavigate } from 'react-router-dom'
import ProfileBlock from './ProfileBlock'
import ProjectBlock from './ProjectBlock'

function SearchResultContainer({filter}) {

  const navigate = useNavigate()
  const {hits, isLastPage, showMore } = useInfiniteHits()
  console.log('hit numbers: ',hits.length)
  if(hits.length>0)
    console.log('hit : ', hits[0])
  const theRoot = useRef()
  const theSentinal = useRef()

  // using observer to watch the sentinal element and loading more search results
  useEffect(()=>{
    if(theSentinal.current){
      const observer = new IntersectionObserver((entries)=>{
        if(entries[0].isIntersecting && !isLastPage){
          showMore()
        }
      },{root: theRoot.current, rootMargin:'20px', threshold:0.7})
      observer.observe(theSentinal.current)

      return ()=>{
        observer.disconnect()
      }
    }
  },[isLastPage, showMore])

  const handleCheckProfile = (id)=>{
    navigate(`/profile/${id}`)
  }

  const handleCheckProject = (id)=>{
    navigate(`/projects/${id}`)
  }

  return (
    <Grid ref={theRoot} container sx={{width:{xs:'90%',sm:'80%',md:'75%'},alignSelf:'center'}}>
      {filter ==='projects' && hits.length >0 && hits.map((hit,index)=>{
        return <ProjectBlock key={index} hit={hit} handleCheckProject={handleCheckProject}/>
      })}
      {filter ==='people' && hits.length >0 && hits.map((hit,index)=>{
        return <ProfileBlock key={index} hit={hit} handleCheckProfile={handleCheckProfile}/>
      })}
      
      {/* the sentinal  */}
      <Grid ref={theSentinal} item xs={12} sm={6} md={4} lg={3} xl={2} sx={{px:1,py:1,border:'1px solid transparent'}}>
      </Grid>
    </Grid>
  )
}

export default React.memo(SearchResultContainer)