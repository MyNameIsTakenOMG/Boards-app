import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { httpsCallable } from "firebase/functions";
import { projectFunctions } from "../firebase/config";


export const addReply = createAsyncThunk(
    'update/addReply',
    // TODO: need to seperate mentioned names from input string later
    // TODO: need to add 'reply to' field later
    // ...
    async({path, replyToId, input},{rejectWithValue})=>{
        try {
            let matched = [...input.matchAll(/@\[[\w\s]*\]\([\w]*\)/g)]
            let mentionedUsers = matched.map(m=>{
                let theString = m[0]
                let name = theString.match(/@\[[\w\s]*\]/)[0].slice(2,-1)
                let id = theString.match(/\([\w]*\)/)[0].slice(1,-1)
                return {id,name}
            })
            const addReplyFunc = httpsCallable(projectFunctions,'makeReply')
            const result = await addReplyFunc({path,input,replyToId,mentionedUsers})
            if(result.data.code===500) throw new Error(result.data.message)
            console.log('reply created successfully');
            let id = new Date().getTime()
            return {code:200, message:'reply created successfully', id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            rejectWithValue({code:500, message:'Failed to add update', id:id})
        }
    }
)

export const addUpdate = createAsyncThunk(
    'update/addUpdate',
    async({path, input},{rejectWithValue})=>{
        try {
            // TODO: handle input, seperate mentioned names from the input string
            // ...
            let matched = [...input.matchAll(/@\[[\w\s]*\]\([\w]*\)/g)]
            let mentionedUsers = matched.map(m=>{
                let theString = m[0]
                let name = theString.match(/@\[[\w\s]*\]/)[0].slice(2,-1)
                let id = theString.match(/\([\w]*\)/)[0].slice(1,-1)
                return {id,name}
            })
            const makeUpdateFunc = httpsCallable(projectFunctions,'makeUpdate')
            const result = await makeUpdateFunc({path,input,mentionedUsers})
            if(result.data.code===500) throw new Error(result.data.message)

            // let newDocRef = doc(projectFirestore,coll)

            console.log('new update created successfully')
            let id = new Date().getTime()
            return  {code:200,message:'new update created successfully',id:id}
        } catch (error) {
            console.log(error)
            let id = new Date().getTime()
            rejectWithValue({code:500, message:'Failed to add update', id:id})
        }
    }
)

// matcher
const isUpdatePendingAction = (action)=>{
    return action.type.startsWith('update') && action.type.endsWith('pending')
} 

const updateSlice = createSlice({
    name: 'update',
    initialState:{
        newUpdates:[],
        oldUpdates:[],
        cursor:0,
        isProcessing:false,
        status:{
            code:null,
            message:null,
            id:null
        }
    },
    reducers:{
        updateStatusCleared:(state,action)=>{
            state.status={
                code:null,
                message:null,
                id:null
            }
        },
        updateSliceCleared:(state,action)=>{
            state.newUpdates = []
            state.oldUpdates = []
            state.cursor =0
            state.isProcessing = false
            state.status = {
                code:null,
                message:null,
                id:null
            }
        },
        newUpdatesLoaded: (state,action)=>{
            state.newUpdates = action.payload
        },
        oldUpdatesAndCursorLoaded: (state,action)=>{
            state.oldUpdates = action.payload.updates
            state.cursor = action.payload.cursor
        },
    },
    extraReducers: (builder)=>{
        builder
        // add update
        .addCase(addUpdate.fulfilled, (state, action)=>{
            state.isProcessing = false
            state.status = {...action.payload}
        })
        .addCase(addUpdate.rejected, (state, action)=>{
            state.isProcessing = false
            state.status = {...action.payload}
        })
        // add reply
        .addCase(addReply.fulfilled, (state, action)=>{
            state.isProcessing = false
            state.status = {...action.payload}
        })
        .addCase(addReply.rejected, (state, action)=>{
            state.isProcessing = false
            state.status = {...action.payload}
        })
        .addMatcher(isUpdatePendingAction, (state,action)=>{
            state.isProcessing = true
        })
        
    }
})

export default updateSlice.reducer
export const { updateStatusCleared,updateSliceCleared, newUpdatesLoaded, oldUpdatesAndCursorLoaded } = updateSlice.actions 


export const selectUpdateStatus = createSelector(
    state=>state.entities.update,
    update=>update.status
)
export const selectNewUpdates = createSelector(
    state=>state.entities.update,
    update=>update.newUpdates
)
export const selectOldUpdates = createSelector(
    state=>state.entities.update,
    update=>update.oldUpdates
)
export const selectUpdateCursor = createSelector(
    state=>state.entities.update,
    update=>update.cursor
)
export const selectUpdateProcessing = createSelector(
    state=>state.entities.update,
    update=>update.isProcessing
)