import { createAsyncThunk, createSlice, createSelector, isFulfilled } from "@reduxjs/toolkit";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { projectFirestore, projectFunctions } from "../firebase/config";


const colors = ['grey', 'blue', 'red', 'green', 'orange', 'pink', 'purple', 'deepPurple', 'deepOrange', 'indigo', 'lightBlue', 'cyan', 'teal', 'lightGreen', 'lime', 'yellow', 'amber', 'brown', 'blueGrey']

export const fetchAllProjects = createAsyncThunk(
    'allProjects/fetchAllProjects',
    async({selectedIndex, myProjects, projectsArray},{rejectWithValue})=>{
        try {
            let fetchedProjects = []
            let promisesArr = []
            // fetch all projects( user's projects and shared projects)
            if(selectedIndex === 0 && projectsArray.length >0){
                promisesArr =  projectsArray.map(project=> getDoc(doc(projectFirestore,`projects/${project}`)))
            }
            // fetch my projects
            if(selectedIndex === 1 && myProjects.length > 0){
                console.log('should go here...')
                promisesArr = myProjects.map(project=> getDoc(doc(projectFirestore,`projects/${project}`)))
            }
            // fetch all shared projects
            if(selectedIndex === 2){
                let myProjectsString = myProjects.toString()
                let sharedProjects = projectsArray.filter(p=>!myProjectsString.match(p))
                if(sharedProjects.length > 0)
                    promisesArr = sharedProjects.map(project=> getDoc(doc(projectFirestore,`projects/${project}`)))
            }
            // check promisesArr length
            if(promisesArr.length > 0){
                const result = await Promise.all(promisesArr)
                console.log('result length: ',result)
                fetchedProjects = result.map(r=>({...r.data(),id:r.id}))
            }
            console.log('projects fetched successfully')
            let id = new Date().getTime()
            return {code:200, message:'projects fetched successfully',id:id,fetchedProjects}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'failed to fetch projects',id:id})
        }
    }
)

export const updateProjectStatus = createAsyncThunk(
    'project/updateProjectStatus',
    async({projectId,status},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}`),{
                status:status
            })
            console.log('project status updated successfully')
            let id = new Date().getTime()
            return {code:200, message:'project status updated successfully', id:id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'failed to update project status',id:id})
        }
    }
)

export const reorderStageList = createAsyncThunk(
    'project/reorderStageList',
    async({stageIdArray,projectId},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}`),{
                stageIdArray:[...stageIdArray]
            })
            console.log('stages reordered successfully');
            let id = new Date().getTime();
            return {code:200,message:'reordered successfully',id:id}
        } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime();
            return rejectWithValue({code:500,message:'Failed to re-order the stages',id:id})
        }
    }
)

export const editProjectName = createAsyncThunk(
    'project/editProjectName',
    async({projectId,newName},{rejectWithValue})=>{
        try {
            // edit project name
            await updateDoc(doc(projectFirestore,`projects/${projectId}`),{
                project_name:newName
            })
          console.log('updated project name successfully');
          let id = new Date().getTime();
            return {code:200,message:'Updated successfully',id:id}
        } catch (error) {
            console.log('error: ',error);
          let id = new Date().getTime();
            // return rejectWithValue(error.response.data)
            return rejectWithValue({code:500,message:'Failed to update project',id:id})
        }
    }
)

export const inviteMembers = createAsyncThunk(
    'project/inviteMembers',
    async({projectId,selectedUsers},{rejectWithValue})=>{
        try {
            const inviteMembersFunc = httpsCallable(projectFunctions,'inviteProjectMembers')
            const result = await inviteMembersFunc({projectId:projectId, selectedUsers:selectedUsers})
            // check the response code, and if it is 500, then throw an error
            if(result.data.code === 500) throw new Error(result.data.message)
            console.log('project members invited successfully');
            let id = new Date().getTime()
            return {code:200, message: 'invited members successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to invite members',id:id})
        }
    }
)

export const removeMembers = createAsyncThunk(
    'project/removeMembers',
    async({projectId, selectedUsers},{rejectWithValue})=>{
        try {
            console.log('projectId: ' + projectId)
            console.log('selectedUsers: ' + selectedUsers)
            
            const removeMembersFunc = httpsCallable(projectFunctions,'removeProjectMembers')
            const result = await removeMembersFunc({projectId:projectId,selectedUsers:selectedUsers})
            // check the response code, if it is 500, then throw an error
            if(result.data.code ===500) throw new Error(result.data.message)
            console.log('project members removed successfully');
            console.log(result.data.message)
            let id = new Date().getTime()
            return {code:200, message:'removed members successfully', id:id}
        } catch (error) {
            console.log('error: ', error);
            let id = new Date().getTime();
            return rejectWithValue({code:500, message:'Failed to remove members', id:id})
        }
    }
)

export const removeProject = createAsyncThunk(
    'project/removeProject',
    async({projectId},{rejectWithValue})=>{
        try {
            console.log('projectId: ', projectId)
            const deleteProjectFunc = httpsCallable(projectFunctions,'deleteProject')
            const result = await deleteProjectFunc({projectId})
            // check the response code, if it is 500, then throw an error
            if(result.data.code ===500) throw new Error(result.data.message)
            console.log('project removed successfully');
            let id = new Date().getTime()
            return {code:200, message:'removed project successfully', id:id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to remove project', id:id})
        }
    }
)

export const createNewProject = createAsyncThunk(
    "project/createNewProject",
    async (_, { rejectWithValue }) => {
        try {
            let themeColors = []
            for(let i = 0; i < 4 ; i++) {
                themeColors.push(colors[Math.floor(Math.random()*colors.length)])
            }
            const createNewProjectFunc = httpsCallable(projectFunctions, 'createNewProject')
            const result = await createNewProjectFunc({themeColors: [...themeColors]})
            // check the response code, if it is 500, then throw an error
            if(result.data.code ===500) throw new Error(result.data.message)
            console.log('project created successfully');
            let id = new Date().getTime()
            return {code:200, message:'project created successfully', id:id}
        } catch (error) {
            console.log('error: ', error);
            // return rejectWithValue(error.response.data);
            let id = new Date().getTime();
            return rejectWithValue({code:500,message:'Failed to create project',id:id});
        }
    }
)

export const removeStage = createAsyncThunk(
    'stage/removeStage',
    async({projectId,stageId},{rejectWithValue})=>{
        try {
            console.log('projectId: ', projectId)
            console.log('stageId: ', stageId)
            const deleteStageFunc = httpsCallable(projectFunctions, 'deleteStage')
            const res = await deleteStageFunc({projectId,stageId})
            if(res.data.code === 500) throw new Error(res.data.message)
            console.log('stage removed successfully')
            let id = new Date().getTime()
            return {code:200,message:'stage removed successfully',id:id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500,message:'Failed to remove stage',id:id});
        }
    }
)

export const addNewStage = createAsyncThunk(
    'stage/addNewStage',
    async({projectId},{rejectWithValue})=>{
        try {
            // create theme color for the new stage
            let color = colors[Math.floor(Math.random()*colors.length)]
            // create the new stage
            let newStageRes = await addDoc(collection(projectFirestore,`projects/${projectId}/stages`),{
              stage_name: 'New Stage',
              createdAt: new Date(),
              tasksArray:[],
              themeColor: color,
              path:{
                project:projectId,
              }
            })
            let promiseArray = []
            // create a default task for the new stage
            let newTaskRes = await addDoc(collection(projectFirestore,`projects/${projectId}/stages/${newStageRes.id}/tasks`),{
                task_name:'New Task',
                managerId:'',
                members:{
                    membersArray:[]
                },
                status:'In progress',
                priority:'Medium',
                deadline:'',
                cost:0,
                path:{
                  project:projectId,
                  stage:newStageRes.id,
                },
                createdAt:new Date(),
            })
            // update the project stage array
            promiseArray.push(updateDoc(doc(projectFirestore,`projects/${projectId}`),{
              stageIdArray: arrayUnion(newStageRes.id)
            })) 
            // update the new stage tasksArray
            promiseArray.push(updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${newStageRes.id}`),{
                tasksArray: arrayUnion(newTaskRes.id)
            }))
      
            await Promise.all(promiseArray)
            console.log('new stage created successfully');
            let id = new Date().getTime()
            return {code: 200, message:'stage created successfully',id: id}
          } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to create stage',id: id})
          }
    }
)
export const editStageName = createAsyncThunk(
    'stage/editStageName',
    async({projectId,stageId,newStageName},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}`),{
                stage_name:newStageName
            })
            console.log('Updated stage name successfully');
            let id = new Date().getTime();
            return {code: 200, message:'updated stage name successfully',id: id}
        } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to create stage',id: id})
        }
    }
)
export const addNewTask = createAsyncThunk(
    'task/addNewTask',
    async({projectId,stageId},{rejectWithValue})=>{
        try {
            let newTaskRes = await addDoc(collection(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks`),{
                task_name:'New Task',
                managerId:'',
                members:{
                    membersArray:[]
                },
                status:'In progress',
                priority:'Medium',
                deadline:'',
                cost:0,
                path:{
                  project:projectId,
                  stage:stageId,
                },
                createdAt:new Date(),
            })
            // update the stage tasksArray
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}`),{
                tasksArray:arrayUnion(newTaskRes.id)
            })
            console.log('Task created successfully')
            let id = new Date().getTime()
            return {code:200, message:'Task created successfully',id: id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to add new task',id: id})
        }
    }
)
export const deleteTask = createAsyncThunk(
    'task/deleteTask',
    async({projectId,stageId,taskId},{rejectWithValue})=>{
        try {
            const deleteTaskFunc = httpsCallable(projectFunctions,'deleteTask')
            const result = await deleteTaskFunc({projectId,stageId,taskId})
            if(result.data.code===500) throw new Error(result.data.message)
            console.log('Task deleted successfully')
            let id = new Date().getTime()
            return {code:200, message: 'Task deleted successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'failed to delete the task',id:id})
        }
    }
)

export const editTaskName = createAsyncThunk(
    'task/editTaskName',
    async({projectId, stageId, taskId, newTaskName},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                task_name: newTaskName
            })            
            console.log('updated task name successfully')
            let id = new Date().getTime()
            return {code: 200, message:'updated task name successfully',id: id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to edit task name', id:id})
        }
    }
)
export const changeTaskStatus = createAsyncThunk(
    'task/changeTaskStatus',
    async({projectId,stageId,taskId,status},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                status:status
            })
            console.log('changed status successfully')
            let id = new Date().getTime()
            return {code:200, message:'changed status successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to change task status', id:id})
        }
    }
)
export const changeTaskPriority = createAsyncThunk(
    'task/changeTaskPriority',
    async({projectId,stageId,taskId,priority},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                priority:priority
            })
            console.log('changed priority successfully')
            let id = new Date().getTime()
            return {code:200, message:'changed priority successfully', id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to change task priority', id:id})
        }
    }
)
export const updateTaskCost = createAsyncThunk(
    'task/updateTaskCost',
    async({projectId,stageId,taskId,sanitizedCost},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                cost: sanitizedCost
            })
            console.log('updated cost successfully')
            let id = new Date().getTime()
            return {code:200, message:'updated cost successfully', id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to update task cost', id:id})
        }
    }
)
export const updateTaskDeadline = createAsyncThunk(
    'task/updateTaskDeadline',
    async({projectId,stageId,taskId,deadline},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                deadline:deadline
            })
            console.log('updated deadline successfully')
            let id = new Date().getTime()
            return {code:200, message:'updated deadline successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to update task deadline', id:id})
        }
    }
)
export const updateTaskManager = createAsyncThunk(
    'task/updateTaskManager',
    async({projectId,stageId,taskId,userId},{rejectWithValue})=>{
        try {
            let docRef = doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`)
            await updateDoc(docRef,{
                managerId: userId
            })
            console.log('Updated task manager successfully')
            let id = new Date().getTime()
            return {code:200,message:'update task manager successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to select task manager', id:id})
        }
    }
)
export const deleteTaskManager = createAsyncThunk(
    'task/deleteTaskManager',
    async({projectId,stageId,taskId},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`projects/${projectId}/stages/${stageId}/tasks/${taskId}`),{
                managerId:''
            })
            console.log('deleted task manager successfully')
            let id = new Date().getTime()
            return {code:200,message:'deleted task manager successfully',id:id}
        } catch (error) {
            console.log(error);
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to delete task manager', id:id})
        }
    }
)
export const addTaskMember = createAsyncThunk(
    'task/addTaskMember',
    async({projectId,stageId,taskId,theUsers},{rejectWithValue})=>{
        try {
            const addTaskMemberFunc = httpsCallable(projectFunctions,'addTaskMember') 
            const result = await addTaskMemberFunc({projectId:projectId,stageId:stageId,taskId:taskId,theUsers:theUsers})
            // check the response code , and if it is 500, then throw an error'
            if(result.data.code === 500) throw new Error(result.data.message)
            console.log('added task member successfully')
            let id = new Date().getTime();
            return {code:200,message:'added task member successfully',id:id}
        } catch (error) {
            console.log(error);
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to add task member', id:id})
        }
    }
)
export const deleteTaskMember = createAsyncThunk(
    'task/deleteTaskMember',
    async({projectId,stageId,taskId,userIds},{rejectWithValue})=>{
        try {
            const removeTaskMemberFunc = httpsCallable(projectFunctions,'removeTaskMember') 
            const result = await removeTaskMemberFunc({projectId,stageId ,taskId, userIds})
            // check the response code , and if it is 500, then throw an error
            if(result.data.code === 500) throw new Error(result.data.message)
            console.log('deleted task member successfully')
            let id = new Date().getTime()
            return {code: 200, message:'deleted task member successfully',id: id}
        } catch (error) {
            console.log(error);
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'Failed to delete task member', id:id})
        }
    }
)


// matchers
const isProjectSlicePendingAction = (action)=>{
    return (action.type.startsWith('allProjects') || action.type.startsWith('project') || action.type.startsWith('stage') || action.type.startsWith('task')) && action.type.endsWith('pending')
}
const isRejectedAction = (action)=>{
    return (action.type.startsWith('allProjects') || action.type.startsWith('project') || action.type.startsWith('stage') || action.type.startsWith('task')) && action.type.endsWith('rejected')
}
const isProjectFulfilledAction = (action)=>{
    return !action.type.startsWith('allProject') && !action.type.match(/createNewProject|updateProjectStatus|removeProject/) && action.type.endsWith('fulfilled')
}

const projectSlice = createSlice({
    name:'project',
    initialState:{
        allProjects:[],
        projectDetails:{},
        stages:{},
        tasks:{},
        isProcessing:false,
        status:{
            code:null,
            message:null,
            id:null, // new date()
        }
    },
    reducers:{
        projectSliceCleared:(state,action)=>{
            state.allProjects = []
            state.projectDetails = {}
            state.stages={}
            state.tasks={}
            state.isProcessing = false
            state.status = {
                code:null,
                message:null,
                id:null
            }
        },
        projectDataCleared:(state,action)=>{
            state.projectDetails={}
            state.stages={}
            state.tasks={}
        },
        projectStatusCleared: (state,action)=>{
            state.status={
                code:null,
                message:null,
                id:null,
            }
        },
        allProjectsLoaded:(state,action)=>{
            const {id,project} = action.payload
            state.allProjects[id] = project
        },
        allProjectsCleared:(state,action)=>{
            state.allProjects = {}
        },
        projectDetailsUpdated: (state, action) => {
            state.projectDetails = action.payload;
        },
        stageUpdated: (state, action) => {
            state.stages[action.payload.id] = {...action.payload.data, id:action.payload.id};
        },
        stageDeleted: (state, action) => {
            delete state.stages[action.payload.id];
        },
        tasksUpdated: (state, action) => {
            let {stageId, tasksArray} = action.payload;
            state.tasks[stageId] = [...tasksArray];
        },
        tasksDeleted: (state, action) => {
            delete state.tasks[action.payload.id]
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchAllProjects.fulfilled, (state, action) => {
                state.isProcessing = false
                const {fetchedProjects,...others} = action.payload
                state.status = {...others}
                state.allProjects = [...fetchedProjects]
            })
            .addMatcher(isProjectSlicePendingAction, (state, action)=>{
                state.isProcessing = true
            })
            .addMatcher(isProjectFulfilledAction, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addMatcher(isFulfilled(createNewProject,updateProjectStatus,removeProject),(state,action)=>{
                state.status = {...action.payload}
            })
            .addMatcher(isRejectedAction, (state, action)=>{
                state.isProcessing = false
                state.status= {...action.payload}
            })
    },
})

export default projectSlice.reducer;
export const {allProjectsCleared,allProjectsLoaded,projectSliceCleared,projectDataCleared,projectStatusCleared, projectDetailsUpdated,stageUpdated,stageDeleted,tasksUpdated,tasksDeleted} = projectSlice.actions;


// selectors
export const selectAllProjects = createSelector(
    state=>state.entities.project,
    project=>project.allProjects
)
export const selectProjectDetails = createSelector(
    state=>state.entities.project,
    project=>project.projectDetails
)
export const selectIsProcessing = createSelector(
    state=>state.entities.project,
    project=>project.isProcessing
)
export const selectStages = createSelector(
    state=>state.entities.project,
    project=>project.stages
)
export const selectTasks = createSelector(
    state=>state.entities.project,
    project=>project.tasks
)
export const selectStatus = createSelector(
    state=>state.entities.project,
    project=>project.status
)
