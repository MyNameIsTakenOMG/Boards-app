import React from 'react'

export default function useGetConvertedHtmlString(HtmlString,theTask) {
    let convertedString = HtmlString
    let matchedArr =[...HtmlString.matchAll(/@\[[\w\s]*\]\([\w]*\)/g)]

    if (matchedArr.length > 0) {
        // TODO: replace all matched strings with '<span style="color:rgb(35, 128, 234)">{username}</span>'
        // only if they can be found in taskMembers
        matchedArr.forEach(matched=>{
            let theString = matched[0]
            let name = theString.match(/@\[[\w\s]*\]/)[0].slice(2,-1)
            let id = theString.match(/\([\w]*\)/)[0].slice(1,-1)
            let nameRegex = new RegExp(`${name}`,'i')
            // if the user is still the member of the task
            if(theTask.members[id].username.match(nameRegex)) convertedString = convertedString.replace(theString, `<span style="background-color:rgb(227, 229, 232);border-radius:5px;color:rgb(35, 128, 234); font-weight:500">@${name}</span>`)
            // if the user is no longer the member of the task
            else convertedString = convertedString.replace(theString, `<span>@${name}</span>`)
        })
    }

  return {convertedString}
}
