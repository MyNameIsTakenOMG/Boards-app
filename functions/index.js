const functions = require("firebase-functions");
const admin = require("firebase-admin");
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
// const {v4} = require('uuid');
// import {arrayUnion} from 'firebase/firestore'
// cannot import anything else other than 'funcitons' and 'admin', or it will cause issue
admin.initializeApp();


// reduce the quality of user profile photos 
// Note: Setting 'firebaseStorageDownloadTokens' is not official google storage feature, undocumented, no promise in the future, not 100% safe.
// If possible, using 'getsignedurl' method or get download link at front end using 'getDownloadURL' method
// exports.sanitizeUserProfilePhotos = functions.storage.object().onFinalize(async(object)=>{
//     const fileBucket = object.bucket; // The Storage bucket that contains the file.
//     const filePath = object.name; // File path in the bucket.
//     const contentType = object.contentType; // File content type.
//     const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
//     console.log('media link: ',object.mediaLink)
//     console.log('fileBucket: ' + fileBucket)
//     console.log('filePath: ' + filePath)
//     console.log('contentType: ' + contentType)
//     console.log('metageneration: ' + metageneration)
//     console.log('meta data: ', object.metadata)
//     // Exit if this is triggered on a file that is not an image.
//     if (!contentType.startsWith('image/')) {
//         return functions.logger.log('This is not an image.');
//     }
//     // Exit if the image is already sanitized
//     if(!object.metadata.sanitized || object.metadata.sanitized !== 'yes'){
//         return functions.logger.log('Image has not been sanitized')
//     }
    
//     // using uuid v4 to regenerate a new download token(access token for the file), and combine it with the media link
//     let uuid = v4()
//     let bucket = admin.storage().bucket()
//     let file = bucket.file(filePath)
//     await file.setMetadata({
//         metadata:{
//             //update the download token(access token)
//             firebaseStorageDownloadTokens:uuid
//         }
//     })
// })


//there is a trigger to update user profile photoURL in relavant documents of other collections, eg. projects. tasks, updates, and notifs
exports.updateUserProfilePhotoTrigger = functions.runWith({memory:'4GB',timeoutSeconds:300}).firestore.document('users/{userId}').onUpdate(async(change,context)=>{
    const after = change.after.data()
    const before = change.before.data()
    // We'll only update if the photoURL has changed.
    // This is crucial to prevent infinite loops.
    if (after.photoURL == before.photoURL) {
        return null;
    }
    // create a new bulkWriter instance
    const MAX_RETRY = 5
    let bulkWriter = admin.firestore().bulkWriter()
    bulkWriter.onWriteError((error)=>{
        if(error.failedAttempts<MAX_RETRY) return true
        else{
            console.log('Failed write at document: ', error.documentRef.path);
            return false;
        }
    })
    // retrieve the new photoURL from the after
    const photoURL = after.photoURL
    // retrieve all the notifications sent out by the user and update the photoURL field
    after.sentNotifsPaths.forEach(path=>{
        bulkWriter.update(admin.firestore().doc(`users/${path.receiverId}/notifs/${path.notifId}`),{
            'sender.photoURL':photoURL
        })
    })
    // retrieve all projects the user has engaged and update the photoURL field
    const projects = [...after.engaged_projects.projectsArray]
    projects.forEach((project)=>{
        bulkWriter.update(admin.firestore().doc(`projects/${project}`),{
            [`members.${context.params.userId}.photoURL`]:photoURL
        })
    })

    // retrieve all the tasks paths the user has engaged and update the photoURL field
    let allUpdatesPromises = []
    projects.forEach((project)=>{
        const tasks = [...after.engaged_projects[project].tasksArray]
        const stages = tasks.map((task)=>after.engaged_projects[project][task].stageId)
        tasks.forEach((task,index)=>{
            // update the photoURL field for each task
            bulkWriter.update(admin.firestore().doc(`projects/${project}/stages/${stages[index]}/tasks/${task}`),{
                [`members.${context.params.userId}.photoURL`]:photoURL
            })
            // fetch all updates from the updates subcollection under the task
            allUpdatesPromises.push(admin.firestore().collection(`projects/${project}/stages/${stages[index]}/tasks/${task}/updates`).get())
        })
    })
    // retrieve all updates( including the replies arrays) of all the tasks, and update the photoURL field
    let updatesSnapshotsArray = await Promise.all(allUpdatesPromises)
    updatesSnapshotsArray.forEach(updatesSnapshot=>{
        updatesSnapshot.forEach(docSnap=>{
            let doc = docSnap.data()
            let replies = [...doc.replies]
            // update the replies array
            replies = replies.map(reply=>{
                if(reply.userId === context.params.userId){
                    reply.photoURL = photoURL
                }
                return reply
            })
            const {project, stage, task} = doc.path
            // if the update is made by the user 
            if(doc.userId === context.params.userId){
                bulkWriter.update(admin.firestore().doc(`projects/${project}/stages/${stage}/tasks/${task}/updates/${docSnap.id}`),{
                    photoURL:photoURL,
                    replies:replies
                })
            }
            else{
                bulkWriter.update(admin.firestore().doc(`projects/${project}/stages/${stage}/tasks/${task}/updates/${docSnap.id}`),{
                    replies:replies
                })
            }
        })
    })
    return bulkWriter.flush()
})


exports.updateUserProfilePhoto = functions.https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated');
        const {photoURL} = data
        let userId = photoURL.split('%2F')[1]
        if(context.auth.uid !== userId) throw new functions.https.HttpsError('failed-precondition','unauthorized');
        // TODO: update user.photoURL 
        const theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        // when user has not setup profile photo
        if(theUser.data().photoURL===''){
            await admin.firestore().doc(`users/${context.auth.uid}`).update({
                photoURL:photoURL
            })
            console.log('photo updated successfully')
            return {code:200, message:'photo updated successfully'}
        }
        // when user has setup profile photo, and photo URL is not tampered
        else if(theUser.data().photoURL === photoURL){
            console.log('the photo URL is identical to the one recorded')
            return {code:200, message:'photo updated successfully'}
        }
        // when user has setup profile photo, but the photo URL is tampered
        else{
            console.log('the photo URL is not identical to the one recorded')
            throw new functions.https.HttpsError('invalid-argument','failed to update photo')
        }
    } catch (error) {
        console.log('error: ' + error)
        return {code:500,message:error.message? error.message:'failed to update profile photo info'}
    }
})


// upload profile photo and transform it and re-upload it 
exports.uploadUserProfilePhoto = functions.runWith({memory:'2GB',timeoutSeconds:300}).https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated');
        const {fileBase64} = data
        const bucket = admin.storage().bucket()
        const destFile = bucket.file(`images/${context.auth.uid}/profile_photo.jpg`)
        let theBuffer = new Buffer.from(fileBase64.split(';base64,')[1],'base64') // data URL doesn't support
        const tempFilePath = path.join(os.tmpdir(),'/temp.jpg')

        // fs.writeFile(tempFilePath, theBuffer,async(err)=>{
        //     if(err) console.log(err)
        //     else {
        //         console.log('file written successfully')
        //         await spawn('convert',[tempFilePath, '-quality','40',tempFilePath])
        //         console.log('converted successfully')
        //         await bucket.upload(tempFilePath,{destination:`images/${context.auth.uid}/profile_photo.jpg`})
        //         return fs.unlinkSync(tempFilePath)
        //     }
        // })

        await destFile.save(theBuffer)
        // download the file just uploaded
        await bucket.file(`images/${context.auth.uid}/profile_photo.jpg`).download({destination: tempFilePath})
        
        // doing transformation and then upload the new photo, then clean up and return...
        await spawn('convert',[tempFilePath, '-quality','40',tempFilePath])
        await bucket.upload(tempFilePath,{destination:`images/${context.auth.uid}/profile_photo.jpg`,metadata:{contentType:'image/jpeg',metadata:{'sanitized':'yes'}}})
        fs.unlinkSync(tempFilePath) 
        return {code:200, message:'photo uploaded successfully'}
    } catch (error) {
        console.log(error)
        return {code:500,message:error.message? error.message:'failed to upload user profile photo'}
    }
})

exports.createNewProject = functions.runWith({memory:'1GB',timeoutSeconds:30}).https.onCall(async(data, context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('unauthenticated','unauthenticated')
        const theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        const {username, email, photoURL, bgColor} = theUser.data()
        const {themeColors} = data
        let batch = admin.firestore().batch()
        let projectRef = admin.firestore().collection('projects').doc()
        // create a new project
        batch.create(projectRef,{
            project_name:'New Project',
            ownerId:context.auth.uid,
            createdAt:new Date(),
            stageIdArray:[],  // used for listing stages in a certain order
            status:'In progress',
            members :{
              [context.auth.uid]:{
                username,
                email,
                photoURL,
                bgColor,
                work:{
                    // [taskId]:{
                    //     stageId: stageID
                    // },
                    // ...
                }
              },
              membersArray:admin.firestore.FieldValue.arrayUnion(context.auth.uid)
            }
        })
        // update the user info
        batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
            'engaged_projects.projectsArray': admin.firestore.FieldValue.arrayUnion(projectRef.id),
            'engaged_projects.my_projects':admin.firestore.FieldValue.arrayUnion(projectRef.id)
        })
        // then create four default stages and tasks for the new project
        let defaultStages = ['planing','execution','launch','closure']
        defaultStages.forEach((stage,index) => {
            let stageRef = admin.firestore().collection(`projects/${projectRef.id}/stages`).doc()
            let taskRef = admin.firestore().collection(`projects/${projectRef.id}/stages/${stageRef.id}/tasks`).doc()
            batch.create(stageRef,{
                stage_name:stage,
                tasksArray:[], 
                path:{
                  project:projectRef.id
                },
                themeColor:themeColors[index],
                createdAt:new Date()
            })
            batch.create(taskRef,{
                task_name:'New Task',
                managerId:'',
                members:{
                  // id:{
                  //   username:'',
                  //   email:'',
                  //   photoURL:'',
                  //   bgColor:'',
                  // },
                  membersArray:[]
                },
                status:'In progress',
                priority:'Medium',
                deadline:'',
                cost:0,
                path:{
                  project:projectRef.id,
                  stage:stageRef.id
                },
                createdAt:new Date(),
            })
            batch.update(stageRef,{
                tasksArray: admin.firestore.FieldValue.arrayUnion(taskRef.id)
            })
            batch.update(projectRef,{
                stageIdArray: admin.firestore.FieldValue.arrayUnion(stageRef.id)
            })
        })
        await batch.commit()
        console.log('project created successfully');
        return {code:200, message: 'project created successfully'};
    } catch (error) {
        console.log('error: ' + error)
        return {code:500,message:'internal error'}
    }
})

// admin.firestore ---> namespace
// admin.firestore() ---> instance of firestore database

exports.checkIsUsernameValid = functions.https.onCall(async(data,context)=>{
    try {
        let query = admin.firestore().collection('users').where('username','==',data.username)
        let snapshot = await query.get()
        if(snapshot.empty) return {code:200, message:'name is available'}
        else throw new functions.https.HttpsError('already-exists','name has already been taken')
    } catch (error) {
        console.log(error)
        return {code:500, message:error.message ? error.message : 'internal error'}
    }
})

exports.inviteProjectMembers = functions.https.onCall(async(data,context)=>{
    try {
        const {projectId, selectedUsers} = data
        let theProject = await admin.firestore().doc(`projects/${projectId}`).get()
        let ownerId = theProject.data().ownerId
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        if(context.auth && context.auth.uid !== ownerId) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        let theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        const {username,email,bgColor,photoURL} = theUser.data()
        // instead of using transaction, using batch for this situation
        let batch = admin.firestore().batch()
        let projectRef = admin.firestore().doc(`projects/${projectId}`)
        selectedUsers.forEach(user =>{
            // update the project info
            batch.update(projectRef, {
                [`members.${user.objectID}`]:{
                    username: user.username,
                    email:user.email,
                    bgColor:user.bgColor,
                    photoURL:user.photoURL,
                    work:{}
                },
                'members.membersArray': admin.firestore.FieldValue.arrayUnion(user.objectID)
            })
            // update the user info
            let userRef = admin.firestore().doc(`users/${user.objectID}`)
            batch.update(userRef, {
                'engaged_projects.projectsArray': admin.firestore.FieldValue.arrayUnion(projectId)
            })
            // create and send notif to the user and update the user notifs array
            let notifRef = admin.firestore().collection(`users/${user.objectID}/notifs`).doc()
            batch.create(notifRef, {
                type:'project_invite', 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:`@[${username}](${context.auth.uid}) invited you to join the team of the project <strong>${theProject.data().project_name}</strong>`, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project:projectId,
                }
            })
            batch.update(userRef,{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            // update the sender notifsPaths array
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths: admin.firestore.FieldValue.arrayUnion({receiverId:user.objectID, notifId:notifRef.id})
            })
        })
        await batch.commit()
        
        console.log('members invited successfully')
        return {code:200,message: 'members invited successfully'}
    } catch (error) {
        console.log(error)
        return {code:500, message:error.message? error.message: 'internal error'}
    }
})

// TODO: Remove project member callable function   (users -- projects)
exports.removeProjectMembers = functions.https.onCall(async(data,context)=>{
    try {
        let batch = admin.firestore().batch()
        const {projectId, selectedUsers} = data
        let theProject = await admin.firestore().doc(`projects/${projectId}`).get()
        let ownerId = theProject.data().ownerId
        if(!context.auth || (context.auth && context.auth.uid !== ownerId)) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        
        const theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        const {username, bgColor, email, photoURL} = theUser.data()
        selectedUsers.forEach(user =>{
            let allTaskIds = Object.keys(theProject.data().members[user].work)
            let allStageIds = Object.values(theProject.data().members[user].work).map(item=>item.stageId)
            // remove user info from all tasks they participated in
            allTaskIds.forEach(async(taskId,index) =>{
                let theTaskRef = admin.firestore().doc(`projects/${projectId}/stages/${allStageIds[index]}/tasks/${taskId}`)
                let theTask = await theTaskRef.get()
                if(theTask.data().managerId === user) {
                    batch.update(theTaskRef,{
                        'managerId':'',
                        [`members.${user}`]: admin.firestore.FieldValue.delete(),
                        'members.membersArray': admin.firestore.FieldValue.arrayRemove(user)
                    })
                }else {
                    batch.update(theTaskRef,{
                        [`members.${user}`]: admin.firestore.FieldValue.delete(),
                        'members.membersArray': admin.firestore.FieldValue.arrayRemove(user)
                    })
                }
            })
            // remove members from the project
            batch.update(admin.firestore().doc(`projects/${projectId}`),{
                [`members.${user}`]: admin.firestore.FieldValue.delete(),
                'members.membersArray': admin.firestore.FieldValue.arrayRemove(user)
            })
            // remove the project and the tasks info from the user
            batch.update(admin.firestore().doc(`users/${user}`),{
                'engaged_projects.projectsArray': admin.firestore.FieldValue.arrayRemove(projectId),
                [`engaged_projects.${projectId}`]: admin.firestore.FieldValue.delete()
            })
            // create and send a notification to the user and update the user botifs array
            let notifRef = admin.firestore().collection(`users/${user}/notifs`).doc()
            batch.create(notifRef,{
                type:'project_remove', 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:`@[${username}](${context.auth.uid}) removed you from the team of the project <strong>${theProject.data().project_name}</strong>`, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project:projectId,
                }
            })
            batch.update(admin.firestore().doc(`users/${user}`),{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            // udpate the send notifsPaths array
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths: admin.firestore.FieldValue.arrayUnion({receiverId:user,notifId:notifRef.id})
            })
        })

        await batch.commit()

        console.log('members of the project have been removed successfully')
        return {code:200, message:'members of the project have been removed successfully'}
    } catch (error) {
        console.log(error)
        return {code:500, message:'internal error'}
    }
})


// TODO: choose task members callable function      (users -- projects)
exports.addTaskMember = functions.https.onCall(async(data,context)=>{
    try {
        // if the caller is not logged in
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        const {projectId,stageId,taskId,theUsers} = data
        let [theProject, theTask] = await Promise.all([admin.firestore().doc(`projects/${projectId}`).get(),admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`).get()])
        let ownerId = theProject.data().ownerId
        let managerId = theTask.data().managerId
        // if the caller is not the project owner or the task manager 
        if(ownerId !== context.auth.uid && managerId !== context.auth.uid) throw new functions.https.HttpsError('failed-precondition', 'unauthorized')
        
        const theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        const {username,email,bgColor,photoURL} = theUser.data()
        let batch = admin.firestore().batch()
        theUsers.forEach(theUser =>{
            // update task members info
            batch.update(admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                [`members.${theUser.id}`]:{
                    username:theUser.username,
                    email:theUser.email,
                    photoURL:theUser.photoURL,
                    bgColor:theUser.bgColor
                },
                'members.membersArray': admin.firestore.FieldValue.arrayUnion(theUser.id)
            })
            // update project members info
            batch.update(admin.firestore().doc(`projects/${projectId}`),{
                [`members.${theUser.id}.work.${taskId}.stageId`]:stageId
            })
            // update the user info
            batch.update(admin.firestore().doc(`users/${theUser.id}`),{
                [`engaged_projects.${projectId}.${taskId}.stageId`]:stageId,
                [`engaged_projects.${projectId}.tasksArray`]: admin.firestore.FieldValue.arrayUnion(taskId)
            })
            // create and send a notification to the user and update the user notifs array
            let notifRef = admin.firestore().collection(`users/${theUser.id}/notifs`).doc()
            batch.create(notifRef,{
                type:'task_invite', 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:`@[${username}](${context.auth.uid}) invited you to the team of the task <strong>${theTask.data().task_name}</strong>`, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project:projectId,
                    stage:stageId,
                    task:taskId
                }
            })
            batch.update(admin.firestore().doc(`users/${theUser.id}`),{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            // udpate the sender notifsPaths array
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths:admin.firestore.FieldValue.arrayUnion({receiverId:theUser.id, notifId:notifRef.id})
            })
        })

        await batch.commit()
        console.log('task has been linked to the user')
        return {code:200, message: 'Task has been linked to the user'}
    } catch (error) {
        console.log(error)
        return {code:500, message:'internal error'}
    }

})

// TODO: remove task member    
exports.removeTaskMember = functions.https.onCall(async(data,context)=>{
    try {
        // if the caller is not logged in
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        const {projectId,stageId ,taskId, userIds} = data

        let [theProject, theTask] = await Promise.all([admin.firestore().doc(`projects/${projectId}`).get(),admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`).get()])
        let ownerId = theProject.data().ownerId
        let managerId = theTask.data().managerId
        // if the caller is not the project owner or the task manager 
        if(ownerId !== context.auth.uid && managerId !== context.auth.uid) throw new functions.https.HttpsError('failed-precondition', 'unauthorized')
        
        const theUser = await admin.firestore().doc(`users/${context.auth.uid}`).get()
        const {username,email,photoURL,bgColor} = theUser.data()

        let batch = admin.firestore().batch()
        
        userIds.forEach(userId =>{
            // update task members info
            if(managerId === userId) {
                batch.update(admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                    "managerId":'',
                    [`members.${userId}`]: admin.firestore.FieldValue.delete(),
                    'members.membersArray': admin.firestore.FieldValue.arrayRemove(userId)
                })
            }else{
                batch.update(admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                    [`members.${userId}`]: admin.firestore.FieldValue.delete(), 
                    'members.membersArray': admin.firestore.FieldValue.arrayRemove(userId) 
                });
            }
            // update project members info 
            batch.update(admin.firestore().doc(`projects/${projectId}`),{
                [`members.${userId}.work.${taskId}`]: admin.firestore.FieldValue.delete() 
            })
            //update the user info of whom were removed from the task
            batch.update(admin.firestore().doc(`users/${userId}`),{
                [`engaged_projects.${projectId}.${taskId}`] : admin.firestore.FieldValue.delete(),
                [`engaged_projects.${projectId}.tasksArray`]: admin.firestore.FieldValue.arrayRemove(taskId)
            })
            // create and send a notification to the user and update the user notifs array
            let notifRef = admin.firestore().collection(`users/${userId}/notifs`).doc()
            batch.create(notifRef,{
                type:'task_remove', 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:`@[${username}](${context.auth.uid}) removed you from the team of the task <strong>${theTask.data().task_name}</strong>`, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project:projectId,
                    stage:stageId,
                    task:taskId
                }
            })
            batch.update(admin.firestore().doc(`users/${userId}`),{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            // update the sender notifsPaths array
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths:admin.firestore.FieldValue.arrayUnion({receiverId:userId, notifId:notifRef.id})
            })
        })

        await batch.commit()

        console.log('the task has been detached from the user')
        return {code:200, message: 'Task has been detached from the user'}
    } catch (error) {
        console.log(error)
        return {code:500, message:'internal error'}
    }
})

// TODO: delete a project
exports.deleteProject = functions.runWith({memory:'4GB',timeoutSeconds:200}).https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('unauthenticated','unauthenticated')
        const {projectId} = data
        const theProject = await admin.firestore().doc(`projects/${projectId}`).get()
        if(theProject.data().ownerId!==context.auth.uid) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        const projectMembers = [...theProject.data().members.membersArray]
        const MAX_RETRY = 5
        let bulkWriter1 = admin.firestore().bulkWriter()
        let bulkWriter2 = admin.firestore().bulkWriter()
        bulkWriter1.onWriteError((error)=>{
            if(error.failedAttempts < MAX_RETRY) return true
            else {
                console.log('failed to delete project(from "Users") at: ', error.documentRef.path)
                return false
            }
        })
        bulkWriter2.onWriteError((error)=>{
            if(error.failedAttempts < MAX_RETRY) return true
            else {
                console.log('failed to recursively delete docs at: ', error.documentRef.path)
                return false
            }
        })
        projectMembers.forEach(memberId=>{
            bulkWriter1.update(admin.firestore().doc(`users/${memberId}`),{
                [`engaged_projects.${projectId}`]: admin.firestore.FieldValue.delete(),
                'engaged_projects.my_projects':admin.firestore.FieldValue.arrayRemove(projectId),
                'engaged_projects.projectsArray': admin.firestore.FieldValue.arrayRemove(projectId),
            })
        })
        await bulkWriter1.flush()
        console.log('users data has been updated successfully')
        await admin.firestore().recursiveDelete(admin.firestore().doc(`projects/${projectId}`),bulkWriter2)
        console.log('the project and all related data has been deleted successfully')
        return {code:200, message:'project deleted successfully'}
    } catch (error) {
        console.log(error)
        return {code:500, message:'internal error'}
    }
})


// TODO: remove a stage
exports.deleteStage = functions.runWith({memory:'2GB',timeoutSeconds:100}).https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('unauthenticated','unauthenticated')
        const {projectId, stageId} = data
        const theProject = await admin.firestore().doc(`projects/${projectId}`).get()
        if(theProject.data().ownerId !== context.auth.uid) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        const theStage = await admin.firestore().doc(`projects/${projectId}/stages/${stageId}`).get()
        const taskIdsArr = [...theStage.data().tasksArray]
        let batch = admin.firestore().batch()
        let MAX_RETRY = 5
        let bulkWriter = admin.firestore().bulkWriter()
        bulkWriter.onWriteError((error)=>{
            if(error.failedAttempts < MAX_RETRY) return true
            else {
                console.log('failed to delete docs at: ',error.documentRef.path)
                return false
            }
        })
        // remove all tasks info under the stage from the project[members] and user[engaged_projects]
        theProject.data().members.membersArray.forEach(memberId=>{
            taskIdsArr.forEach(taskId=>{
                // if the user engaged with the task
                if(theProject.data().members[memberId].work[taskId]){
                    // update user info in the project 
                    batch.update(admin.firestore().doc(`projects/${projectId}`),{
                        [`members.${memberId}.work[taskId]`]:admin.firestore.FieldValue.delete()
                    })
                    // update user info in the user record
                    batch.update(admin.firestore().doc(`users/${memberId}`),{
                        [`engaged_projects.${projectId}.${taskId}`]:admin.firestore.FieldValue.delete(),
                        [`engaged_projects.${projectId}.tasksArray`]:admin.firestore.FieldValue.arrayRemove(taskId)
                    })
                }
            })
        })
        // remove the stage from the list of stages in the project
        batch.update(admin.firestore().doc(`projects/${projectId}`),{
            stageIdArray: admin.firestore.FieldValue.arrayRemove(stageId)
        })
        // commit the batch
        await batch.commit()
        // recursively delete all the related data under the stage 
        await admin.firestore().recursiveDelete(admin.firestore().doc(`projects/${projectId}/stages/${stageId}`),bulkWriter)
        console.log('stage deleted successfully')
        return {code:200, message:'stage deleted successfully'}

    } catch (error) {
        console.log('error: ',error)
        return {code:500, message:'internal error'}
    }
})


// TODO: remove a task 
exports.deleteTask = functions.runWith({memory:'2GB',timeoutSeconds:100}).https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        const {projectId,stageId,taskId} = data
        let [theProject, theTask] = await Promise.all([admin.firestore().doc(`projects/${projectId}`).get(),admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`).get()]) 
        let ownerId = theProject.data().ownerId
        if(ownerId !== context.auth.uid) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        // bulkWriter instance
        let bulkWriter = admin.firestore().bulkWriter()
        bulkWriter.onWriteError((error)=>{
            if(error.failedAttempts < 3 ) return true
            else {
                console.log('failed to delete document at: ',error.documentRef.path)
                return false
            }
        })
        let batch = admin.firestore().batch()
        let taskMembers = theTask.data().members.membersArray
        if(taskMembers.length ===0) {
            // update the related stage info
            await admin.firestore().doc(`projects/${projectId}/stages/${stageId}`).update({
                tasksArray: admin.firestore.FieldValue.arrayRemove(taskId)
            })
            // recursive deleting
            await admin.firestore().recursiveDelete(admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),bulkWriter)
        }
        else {
            // update members info in the project
            taskMembers.forEach(memberId=>{
                batch.update(admin.firestore().doc(`projects/${projectId}`),{
                    [`members.${memberId}.work.${taskId}`]:admin.firestore.FieldValue.delete()
                })
            })
            // update related stage  info
            batch.update(admin.firestore().doc(`projects/${projectId}/stages/${stageId}`,{
                tasksArray: admin.firestore.FieldValue.arrayRemove(taskId)
            }))
            // update each user info
            taskMembers.forEach(memberId=>{
                batch.update(admin.firestore().doc(`users/${memberId}`),{
                    [`engaged_projects.${projectId}.${taskId}`]: admin.firestore.FieldValue.delete(),
                    [`engaged_projects.${projectId}.tasksArray`]: admin.firestore.FieldValue.arrayRemove(taskId)
                })
            })
            await batch.commit()
            await admin.firestore().recursiveDelete(admin.firestore().doc(`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),bulkWriter)
        }
        console.log('task deleted successfully')
        return {code:200, message: 'Task deleted successfully'}
    } catch (error) {
        console.log(error)
        return {code:500, message:'internal error'}
    }
})


// TODO: make a task update callable function       (project(task),users.sub(notifications) -- updates)
// send notifs to the task members mentioned...

exports.makeUpdate = functions.https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        const {input,mentionedUsers, path} = data
        console.log('input: ',input)
        console.log('mentionedUsers: ',mentionedUsers)
        console.log('path: ',path)
        const {project, stage, task} = path
        let [theAuthor, theTask] = await Promise.all([admin.firestore().doc(`users/${context.auth.uid}`).get(),admin.firestore().doc(`projects/${project}/stages/${stage}/tasks/${task}`).get()]) 
        if(!theTask.data().members[context.auth.uid]) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        const {username, bgColor, email, photoURL} = theAuthor.data()
        
        // remove the author id from the task members array
        let sanitizedTaskMembers = theTask.data().members.membersArray.filter(member=>member!== context.auth.uid)
        console.log('sanitizedTaskMembers: ',sanitizedTaskMembers)
        let sanitizedMentions = mentionedUsers.filter(user=>{
            let regex = new RegExp(`${user.name}`,'i')
            // remove the author id 
            if(user.id === context.auth.uid) return false
            // make sure user id and username are both matched 
            else if(regex.test(theTask.data().members[user.id].username)) return true
            else return false
        })
        // remove the duplicates from the sanitizedMentions
        let theSetIds = new Set(sanitizedMentions.map(m=>m.id))
        
        let batch = admin.firestore().batch()
        // this new doc ref doesn't need to be removed manually cuz it would not be showing in the database if there is no data written to it
        let newUpdateRef = admin.firestore().collection(`projects/${project}/stages/${stage}/tasks/${task}/updates`).doc()
        batch.create(newUpdateRef,{
            userId:context.auth.uid,
            username,
            bgColor,
            email,
            photoURL,
            createdAt:new Date(),
            contents:input,
            // mentioned:[...theSetIds],
            replies:[],
            path:{
                project,
                stage,
                task,
            }
        })
        // creating notifications for each task members
        sanitizedTaskMembers.forEach(memberId=>{
            let notifRef = admin.firestore().collection(`users/${memberId}/notifs`).doc()
            let notifType = theSetIds.has(memberId) ? 'mentioned' : 'general' 
            batch.create(notifRef,{
                type:notifType, 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:input, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project,
                    stage,
                    task,
                    update:newUpdateRef.id
                }
            })
            batch.update(admin.firestore().doc(`users/${memberId}`),{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            // update the sender notifsPaths array
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths: admin.firestore.FieldValue.arrayUnion({receiverId:memberId, notifId:notifRef.id})
            })
        })
        await batch.commit()
        console.log('update created successfully')
        return {code:200, message: 'update created successfully'}
    } catch (error) {
        console.log(error)
        return {code:500,message:'internal error'}
    }
})

// notif type :  'general','mentioned', 'replied', 'project_invite','project_remove','task_invite','task_remove'

// TODO: reply to a task update(or a reply) callable function  (project(task),users.sub(notifications) -- updates)
// send notif to the receiver and others if they are mentioned ...
exports.makeReply = functions.https.onCall(async(data,context)=>{
    try {
        if(!context.auth) throw new functions.https.HttpsError('failed-precondition','unauthenticated')
        const {path, mentionedUsers,input, replyToId} = data
        const {project,stage,task,update} = path
        let [theAuthor, theTask] = await Promise.all([admin.firestore().doc(`users/${context.auth.uid}`).get(),admin.firestore().doc(`projects/${project}/stages/${stage}/tasks/${task}`).get()]) 
        if(!theTask.data().members[context.auth.uid]) throw new functions.https.HttpsError('failed-precondition','unauthorized')
        const {username, bgColor, email, photoURL} = theAuthor.data()

        let batch = admin.firestore().batch()
        // create the reply , and add it to the replies array of the update doc
        let theUpdateRef = admin.firestore().doc(`projects/${project}/stages/${stage}/tasks/${task}/updates/${update}`)
        batch.update(theUpdateRef,{
            replies: admin.firestore.FieldValue.arrayUnion({
                path:{
                    project,
                    stage,
                    task,
                    update
                },
                userId:context.auth.uid,
                username, 
                bgColor, 
                email, 
                photoURL,
                createdAt:new Date(),
                contents:input,
                replyTo:replyToId, // replyTo: the user id that is replied to 
            })
        })
        // create notifications for the user that is replied to and mentioned people
        // first, sanitize the mentioned
        let sanitizedMentions = mentionedUsers.filter(user=>{
            let regex = new RegExp(`${user.name}`,'i')
            // remove the user who made this reply as well as the one he/she replied to 
            if(user.id === context.auth.uid || username.id === replyToId) return false
            // make sure user id and username are both matched 
            else if(regex.test(theTask.data().members[user.id].username)) return true
            else return false
        })
        // remove the duplicates from the sanitizedMentions
        let theSetIds = new Set(sanitizedMentions.map(m=>m.id))
        let sanitizedIds = [...theSetIds]
        
        // second, send  a 'replied' type notif to the 'replyTo' user and update the user notifs array,
        // and then update the sender notifsPaths array
        let theReplyToRef = admin.firestore().collection(`users/${replyToId}/notifs`).doc()
        batch.create(theReplyToRef,{
            type:'replied', 
            sender:{
                userId:context.auth.uid,
                username, 
                bgColor, 
                email, 
                photoURL
            },
            contents:input, // update inputs or reply inputs
            createdAt:new Date(),
            path:{
                project,
                stage,
                task,
                update
            }
        })
        batch.update(admin.firestore().doc(`users/${replyToId}`),{
            notifsArray: admin.firestore.FieldValue.arrayUnion(theReplyToRef.id)
        })
        batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
            sentNotifsPaths: admin.firestore.FieldValue.arrayUnion({receiverId:replyToId, notifId:theReplyToRef.id})
        })
        // last, send 'mentioned' type notifs to all mentioned users and update their notifs array
        // and update the sender notifsPaths array
        sanitizedIds.forEach(id=>{
            let notifRef = admin.firestore().collection(`users/${id}/notifs`).doc()
            batch.create(notifRef,{
                type:'mentioned', 
                sender:{
                    userId:context.auth.uid,
                    username, 
                    bgColor, 
                    email, 
                    photoURL
                },
                contents:input, // update inputs or reply inputs
                createdAt:new Date(),
                path:{
                    project,
                    stage,
                    task,
                    update
                }
            })
            batch.update(admin.firestore().doc(`users/${id}`),{
                notifsArray: admin.firestore.FieldValue.arrayUnion(notifRef.id)
            })
            batch.update(admin.firestore().doc(`users/${context.auth.uid}`),{
                sentNotifsPaths: admin.firestore.FieldValue.arrayUnion({receiverId:id, notifId:notifRef.id})
            })
        })
        await batch.commit()
        console.log('reply made successfully')
        return {code:200, message:'reply sent successfully'}
    } catch (error) {
        console.log(error)
        return {code:500,message:'internal error'}
    }
})
            