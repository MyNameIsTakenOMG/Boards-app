import React from 'react'

export default function useGetTaskMembers(theTask) {

    let taskMembers =[]
    if(theTask.members.membersArray.length>0){
        let keys = [...theTask.members.membersArray]
        for(let i=0; i<keys.length; i++) {
            let captalized = theTask.members[keys[i]].username.at(0).toUpperCase() + theTask.members[keys[i]].username.slice(1)
            taskMembers.push({id: keys[i], display:captalized})
        }
    }
    return {taskMembers}
}
