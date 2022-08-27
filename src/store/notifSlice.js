import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { projectFirestore } from "../firebase/config";

const { createSlice, createSelector, createAsyncThunk } = require("@reduxjs/toolkit");

export const fetchNotifs = createAsyncThunk(
    'notif/fetchNotifs',
    async({selectedIndex, userId, lastCheck,notifLimit},{rejectWithValue})=>{

        try {
            let q 
            let fetchedNotifs = []
            let newLastCheck = 0
            // initial fetch
            if(lastCheck===0){
                if(selectedIndex ===0) // all notifications
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),orderBy('createdAt', 'desc'),limit(notifLimit+1))
                if(selectedIndex ===1) // @me notifications
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),where('type','==','mentioned'),orderBy('createdAt', 'desc'),limit(notifLimit+1))
                if(selectedIndex ===2) // replied notifications
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),where('type','==','replied'),orderBy('createdAt', 'desc'),limit(notifLimit+1))
            }
            //subsequent fetch
            else {
                if(selectedIndex ===0)
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),where('createdAt','<=',lastCheck),orderBy('createdAt','desc'),limit(notifLimit+1))
                if(selectedIndex ===1)
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),where('type','==','mentioned'),where('createdAt','<=',lastCheck),orderBy('createdAt','desc'),limit(notifLimit+1))
                if(selectedIndex ===2)
                    q = query(collection(projectFirestore,`users/${userId}/notifs`),where('type','==','replied'),where('createdAt','<=',lastCheck),orderBy('createdAt','desc'),limit(notifLimit+1))
            }

            const querySnapshot= await getDocs(q)
            console.log('size: ',querySnapshot.size)
            // if there is more 
            if(querySnapshot.size === notifLimit+1) 
            querySnapshot.docs.forEach((docSnap,index)=>{
                if(index<=notifLimit-1)
                    fetchedNotifs.push({...docSnap.data(),id:docSnap.id})
                if(index === notifLimit) newLastCheck = docSnap.data().createdAt
            })
            // if there is no more
            else querySnapshot.docs.forEach(docSnap=>{
                fetchedNotifs.push({...docSnap.data(),id:docSnap.id})
            })
            console.log('notifications fetched successfully')
            let id = new Date().getTime()
            return {code:200, message:'notifications fetched successfully', id:id, fetchedNotifs,newLastCheck}

        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'failed to fetch notifications',id:id})
        }
    }
)


export const updateCursor = createAsyncThunk(
    'notif/updateCursor',
    async({newCursor,userId},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`users/${userId}`),{
                notifCursor: newCursor
            })
            console.log('cursor updated successfully');
            let id = new Date().getTime();
            return {code:200, message:'cursor updated successfully',id:id}
        } catch (error) {
            console.log('error ', error);
            let id = new Date().getTime();
            return rejectWithValue({code:500, message:'failed to update cursor',id:id});
        }
    }
)

// matchers 
const isNotifPendingAction = (action)=>{
    return action.type.startsWith('notif') && action.type.endsWith('pending')
}
const isRejectedAction = (action)=>{
    return action.type.endsWith('rejected')
}

const notifSlice = createSlice({
    name: "notif",
    initialState:{
        notifs:[],
        isProcessing:false,
        lastCheck:0,
        status:{
            code:null,
            message:null,
            id:null
        },
    },
    reducers:{
        notifSliceCleared: (state,action)=>{
            state.notifs = []
            state.isProcessing = false
            state.lastCheck = 0
            state.status = {
                code:null,
                message:null,
                id:null
            }
        },
        notifStatusCleared: (state,action)=>{
            state.status = {
                code:null,
                message:null,
                id:null
            }
        }
    },
    extraReducers: (builder)=>{
        builder
            .addCase(updateCursor.fulfilled, (state,action)=>{
                state.isProcessing = false
                state.notifs = []
                state.lastCheck = 0
                state.status = action.payload
            })
            .addCase(fetchNotifs.fulfilled, (state,action)=>{
                state.isProcessing = false
                const {fetchedNotifs, newLastCheck, ...others} = action.payload
                state.lastCheck = newLastCheck
                state.status = {...others}
                state.notifs = [...state.notifs, ...fetchedNotifs]
            })
            .addMatcher(isNotifPendingAction, (state,action)=>{
                state.isProcessing = true
            })
            .addMatcher(isRejectedAction, (state,action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })

    }
})

export default notifSlice.reducer
export const {notifStatusCleared,notifSliceCleared} =  notifSlice.actions

//selectors

export const selectNotifs = createSelector(
    state=>state.entities.notif,
    notif=>notif.notifs
)
export const selectNotifProcessing = createSelector(
    state=>state.entities.notif,
    notif=>notif.isProcessing
)
export const selectNotifStatus = createSelector(
    state=>state.entities.notif,
    notif=>notif.status
)
export const selectNotifLastCheck = createSelector(
    state=>state.entities.notif,
    notif=>notif.lastCheck
)
export const selectNotifFiltered = createSelector(
    state=>state.entities.notif,
    notif=>notif.filtered
)