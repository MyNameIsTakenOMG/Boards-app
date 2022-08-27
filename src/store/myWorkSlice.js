import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { doc, getDoc } from "firebase/firestore";
import { projectFirestore } from "../firebase/config";

export const fetchMyWork = createAsyncThunk(
    'myWork/fetchMyWork',
    async({currentProjectsArrayLength,cursor, limit},{getState,rejectWithValue})=>{
        try {
            // fetch engaged tasks in a specific project
            const fetchTasks = (projectId,totalTasksPromises)=>{
                // for projects that have no tasks assigned, it's undefined, cound not find the property name [projectId] in engaged_projects
                // need to deal with it manually, set tasksArray to [] 
                if(getState().entities.user.userInfo.engaged_projects[projectId]){
                    let tasksArray = [...getState().entities.user.userInfo.engaged_projects[projectId].tasksArray]
                    let stagesArray = tasksArray.map(task=>getState().entities.user.userInfo.engaged_projects[projectId][task].stageId)
                    let tasksPromises = tasksArray.map((task,index)=> getDoc(doc(projectFirestore,`projects/${projectId}/stages/${stagesArray[index]}/tasks/${task}`)))
                    totalTasksPromises.push(Promise.all(tasksPromises))
                }
                else totalTasksPromises.push(Promise.resolve([]))
            }
            let newCursor = -1
            let projectsArray = [...getState().entities.user.userInfo.engaged_projects.projectsArray]
            let projectsPromises = []
            let totalTasksPromises = []
            let fetchedMyWork
            // first fetch
            if(cursor === -1){
                console.log('cursor: ',cursor)
                console.log('currentProjectsArrayLength: ',currentProjectsArrayLength)
                // if there is more
                if(currentProjectsArrayLength >=limit+1){
                    newCursor = currentProjectsArrayLength - (limit+1)
                    // fetch all the projects  
                    for(let i = 0; i <limit; i++){
                        let projectId = projectsArray[(currentProjectsArrayLength-1)-i]
                        console.log('projectId: ',projectId)
                        projectsPromises.push(getDoc(doc(projectFirestore,`projects/${projectId}`)))
                        // fetch all relavant tasks
                        fetchTasks(projectId,totalTasksPromises)
                    }
                }
                // if there is no more
                else{
                    // fetch all the projects 
                    for(let i = currentProjectsArrayLength; i >0; i--){
                        let projectId = projectsArray[i-1]
                        projectsPromises.push(getDoc(doc(projectFirestore,`projects/${projectId}`)))
                        // fetch all relavant tasks
                        fetchTasks(projectId,totalTasksPromises)
                    }
                }
            }
            //subsequent fetches
            else{
                // if there is more
                if(cursor>=limit){
                    newCursor = cursor - limit
                    // fetch all the projects 
                    for(let i = 0; i <limit; i++){
                        let projectId = projectsArray[cursor-i]
                        projectsPromises.push(getDoc(doc(projectFirestore,`projects/${projectId}`)))
                        // fetch all relavant tasks
                        fetchTasks(projectId,totalTasksPromises)
                    }
                }
                // if there is no more
                else{
                    // fetch all the projects 
                    for(let i = cursor; i > 0 ; i--){
                        let projectId = projectsArray[i]
                        projectsPromises.push(getDoc(doc(projectFirestore,`projects/${projectId}`)))
                        // fetch all relavant tasks
                        fetchTasks(projectId,totalTasksPromises)
                    }
                }
            }
            fetchedMyWork = await Promise.all([Promise.all(projectsPromises), Promise.all(totalTasksPromises)])
            let projectsData = fetchedMyWork[0].map(docSnap=>{
                return { id: docSnap.id, name: docSnap.data().project_name}
            })
            console.log('projectsData: ', projectsData)
            let tasksData = fetchedMyWork[1].map(tasksArray=>{
                if(tasksArray.length >0){
                    let arr = tasksArray.map(taskSnap=>({ id:taskSnap.id, ...taskSnap.data()}))
                    return arr
                }
                else return []
            })
            console.log('tasks data :', tasksData)
            let id = new Date().getTime()
            return {projectsData, tasksData, newCursor,id:id,message:'my work fetched successfully',code:200}
        } catch (error) {
            console.log('error: ', error)
            let id = new Date().getTime()
            rejectWithValue({code:500, message:'failed to fetch my work', id:id})
        }
    }
)


const myWorkSlice = createSlice({
    name: 'myWork',
    initialState: {
        engagedProjects:[],
        engagedTasks:{
            // [projectId]:[...tasks] 
        },
        cursor:-1,
        isProcessing:false,
        status:{
            code:null,
            message:null,
            id:null,
        }
    },
    reducers:{
        myWorkSliceCleared: (state,action)=>{
            state.engagedProjects = []
            state.engagedTasks = {}
            state.cursor = -1
            state.isProcessing = false
            state.status = {
                code:null,
                message:null,
                id:null,
            }
        },
        myWorkStatusCleared: (state,action)=>{
            state.status = {
                code:null,
                message:null,
                id:null,
            }
        }
    },
    extraReducers: (builder)=>{
        builder
            .addCase(fetchMyWork.pending, (state,action)=>{
                state.isProcessing =true
            })
            .addCase(fetchMyWork.fulfilled, (state,action)=>{
                state.isProcessing = false
                const {projectsData, tasksData,newCursor, ...others} = action.payload
                state.cursor = newCursor
                state.status = {...others}
                state.engagedProjects = [...state.engagedProjects, ...projectsData]
                projectsData.forEach((project, index)=>{
                    state.engagedTasks[project.id] = tasksData[index]
                })
            })
            .addCase(fetchMyWork.rejected, (state,action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
    }
})

export default myWorkSlice.reducer
export const {myWorkStatusCleared,myWorkSliceCleared} = myWorkSlice.actions

// selectors
export const selectMyWorkEngagedProjects = createSelector(
    state=>state.entities.myWork,
    myWork=>myWork.engagedProjects
)
export const selectMyWorkEngagedTasks = createSelector(
    state=>state.entities.myWork,
    myWork=>myWork.engagedTasks
)
export const selectMyWorkCursor = createSelector(
    state=>state.entities.myWork,
    myWork=>myWork.cursor
)
export const selectMyWorkProcessing = createSelector(
    state=>state.entities.myWork,
    myWork=>myWork.isProcessing
)
export const selectMyWorkStatus = createSelector(
    state=>state.entities.myWork,
    myWork=>myWork.status
)