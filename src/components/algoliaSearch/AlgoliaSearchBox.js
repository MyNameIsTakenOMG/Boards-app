import React, { useRef } from 'react'
import {SearchBox} from 'react-instantsearch-hooks-web'

// enhanced search box, by applying debouncing to avoid being triggered too many times in short intervals

function AlgoliaSearchBox() {
    
    const timerId = useRef()
    console.log('search box rendered')

  return (
    <SearchBox 
     queryHook={(query, search)=>{
        if(timerId.current){
            clearTimeout(timerId.current)
        }
        timerId.current = setTimeout(()=>{
            search(query)
        },1000)
     }}
     placeholder='Search here...' />
  )
}

//  stop querying data between re-renders by memoizing the searchbox component 
export default React.memo(AlgoliaSearchBox)