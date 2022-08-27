import React, { useEffect, useState } from 'react'

export default function useObserverTrigger(cursor,root,sentinal) {
    const [trigger, setTrigger] = useState(null)
    useEffect(()=>{
        // if there is no more 
        if(cursor===0) return
        if(sentinal){
            // if there is more, then update the trigger
            const observer = new IntersectionObserver((entries)=>{
                if(entries[0].isIntersecting){
                    setTrigger(new Date().getTime())
                    console.log('triggered')
                }
            },{root:root,rootMargin:'20px',threshold:0.5})
            observer.observe(sentinal)
            // clear the observer
            return ()=>{
                observer.disconnect()
            }
        }
    },[cursor, sentinal,root])
  return {trigger}
}
