import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import {createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref } from "firebase/storage";
import { projectAuth, projectFunctions, projectFirestore, projectStorage} from "../firebase/config";

const colors = ['grey', 'blue', 'red', 'green', 'orange', 'pink', 'purple', 'deepPurple', 'deepOrange', 'indigo', 'lightBlue', 'cyan', 'teal', 'lightGreen', 'lime', 'yellow', 'amber', 'brown', 'blueGrey']

export const sendResetEmail = createAsyncThunk(
    'user/sendResetEmail',
    async({email},{rejectWithValue})=>{
        try {
            await sendPasswordResetEmail(projectAuth,email)
            console.log('password reset email has been sent successfully')
            let id = new Date().getTime()
            return {code:200, message: 'password reset email has been sent successfully',id:id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:'failed to send password reset email', id:id})
        }
    }
)
export const signinWithGoogleOrGithub = createAsyncThunk(
    'user/signinWithGoogleOrGithub',
    async({providerType},{rejectWithValue})=>{
        try {
            let provider = null
            if (providerType === 'google') provider = new GoogleAuthProvider()
            if (providerType === 'github') provider = new GithubAuthProvider()
            const result = await signInWithPopup(projectAuth, provider)
            const {displayName,email,photoURL,uid } = result.user
            // check if this is an existing user
            const docSnap = await getDoc(doc(projectFirestore,`users/${uid}`))
            if(!docSnap.exists()){
                // create a new user record
                await setDoc(doc(projectFirestore,`users/${uid}`),{
                    username:displayName,
                    email:email,
                    photoURL:photoURL,
                    bgColor:colors[Math.floor(Math.random()*colors.length)],
                    createdAt:new Date(),
                    notifCursor:-1,
                    notifsArray:[], // received notif ids 
                    sentNotifsPaths:[], // sent notif path : {[receiverId]: [notifId] }
                    engaged_projects:{
                        // [projectId]:{
                        //     [taskId]:{
                        //         stageId:''
                        //     },
                        //     tasksArray:[], //tasks ids array
                        // }
                        projectsArray:[], //projects ids array
                        my_projects:[]
                    },
                    title:'',
                    phone:'',
                    location:'',
                    expertise:''
                })
            }
            console.log(`${providerType} user record is ready`)
            let id = new Date().getTime();
            return {code:200,message:`${providerType} user record is ready`,id:id}
        } catch (error) {
            console.log('error: ' + error)
            let id = new Date().getTime()
            return rejectWithValue({code:500, message:`failed to sign in with ${providerType}`,id:id})
        }
    }
)

export const logOut = createAsyncThunk(
    "user/signOut",
    async(_, {rejectWithValue})=>{
        try {
            await signOut(projectAuth)
            console.log('signed out successfully')
            let id = new Date().getTime();
            return {code:200,message:'signed out successfully',id:id}
        } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime();
            return rejectWithValue({code:500,message:'failed to sign out',id:id})    
        }
    }
)   
export const createNewUser = createAsyncThunk(
    "user/createNewUser",
    async({name,email,password},{rejectWithValue})=>{
        try {
            const validateName = httpsCallable(projectFunctions,'checkIsUsernameValid')
            const result = await validateName({username:name})
            console.log('result: ',result)
            if(result.data.code===500) throw new Error(result.data.message)
            // sign up user
            const userAuth = await createUserWithEmailAndPassword(projectAuth,email,password)
            console.log('user account created successfully');
            // update user name
            await updateProfile(projectAuth.currentUser,{displayName:name})
            console.log('user account updated successfully');
            //create new user record
            await setDoc(doc(projectFirestore,`users/${userAuth.user.uid}`),{
                username:userAuth.user.displayName,
                email:userAuth.user.email,
                photoURL:'',
                bgColor:colors[Math.floor(Math.random()*colors.length)],
                createdAt:new Date(),
                notifCursor:-1,
                notifsArray:[], // received notif ids 
                sentNotifsPaths:[], // sent notif path : {[receiverId]: [notifId] }
                engaged_projects:{
                    // [projectId]:{
                    //     [taskId]:{
                    //         stageId:''
                    //     },
                    //     tasksArray:[], //tasks ids array
                    // }
                    projectsArray:[], //projects ids array
                    my_projects:[]
                },
                title:'',
                phone:'',
                location:'',
                expertise:''
            })
            console.log('user record is ready')
            let id = new Date().getTime();
            return {code:200,message:'user record is ready',id:id}
        } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime();
            return rejectWithValue({code:500,message: error.message? error.message :'failed to create a new user',id:id})    
        }
    }
)
export const login = createAsyncThunk(
    "user/login",
    async({email,password},{rejectWithValue})=>{
        try {
            await signInWithEmailAndPassword(projectAuth,email,password)
            console.log('user logged in successfully');
            let id = new Date().getTime();
            return {code:200,message:'user logged in successfully',id:id}
        } catch (error) {
            console.log('error: ',error);
            let id = new Date().getTime();
            return rejectWithValue({code:500,message:'failed to login',id:id})        
        }
    }
)
export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async({userId,userProp, userPropValue},{rejectWithValue})=>{
        try {
            await updateDoc(doc(projectFirestore,`users/${userId}`),{
                [userProp]:userPropValue
            })
            console.log(`${userProp} updated successfully`)
            let id = new Date().getTime()
            return {code: 200, message:`${userProp} updated successfully`,id:id}
        } catch (error) {
            console.log('error: ',error)
            let id = new Date().getTime()
            return rejectWithValue({code:500,message:`failed to update ${userProp}`,id:id})
        }
    }
) 

export const  updateProfilePhoto = createAsyncThunk(
    'user/updateProfilePhoto',
    async({fileBase64},{getState,rejectWithValue})=>{
        try {
            const uploadUserProfilePhotoFunc = httpsCallable(projectFunctions,'uploadUserProfilePhoto')
            let result = await uploadUserProfilePhotoFunc({fileBase64})
            if(result.data.code ===500) throw new Error(result.data.message)
            console.log('successfully uploaded profile photo')
            let userPhotoURL = getState().entities.user.userInfo.photoURL
            let userId = getState().entities.user.userInfo.id
            // if user photoURL is '', then get the profile photo URL and then call the function to update the profile photo info
            // leave the rest for the trigger function...
            if(userPhotoURL===''){
                const updateUserProfilePhotoFunc =  httpsCallable(projectFunctions,'updateUserProfilePhoto')
                const photoURL = await getDownloadURL(ref(projectStorage,`images/${userId}/profile_photo.jpg`)) 
                let result = await updateUserProfilePhotoFunc({photoURL})
                if(result.data.code ===500) throw new Error(result.data.message)
                console.log('profile photo updated successfully')
                let id = new Date().getTime()
                return {code:200, message:'profile photo updated successfully',id:id}
            }
        } catch (error) {
            console.log('error: ' + error)
            let id = new Date().getTime()
            return rejectWithValue({code:500,message:`failed to update profile photo`,id:id})
        }
    }
)

// matchers
const isUserPendingAction = (action) =>{
    return action.type.startsWith('user') && action.type.endsWith('pending')
}

const isUserRejectedAction = (action)=>{
    return action.type.startsWith('user') && action.type.endsWith('rejected')
}


const userSlice = createSlice({
    name:'user',
    initialState:{
        auth:{
            displayName:'',
            email:'',
            uid:'',
            photoURL:''
        },
        userInfo:{},
        isProcessing:false,
        status:{
            code:null,
            message:null,
            id:null
        },
    },
    reducers:{
        userAuthLoaded:(state,action)=>{
            state.auth = action.payload
        },
        userStatusCleared:(state,action)=>{
            state.status = {
                code:null,
                message:null,
                id:null
            }
        },
        userInfoLoaded: (state, action) => {
            state.userInfo = action.payload;
            state.status ={
                code:200,
                message:'user info loaded successfully',
                id: new Date().getTime()    
            }
        },
    },
    extraReducers: (builder)=>{
        builder
            .addCase(logOut.fulfilled, (state, action)=>{
                state.isProcessing = false
                state.auth = {
                    displayName:'',
                    email:'',
                    uid:'',
                    photoURL:''
                }
                state.userInfo = {}
                state.status = {...action.payload}
            })
            .addCase(createNewUser.fulfilled, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addCase(login.fulfilled, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addCase(signinWithGoogleOrGithub.fulfilled, (state,action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addCase(sendResetEmail.fulfilled, (state,action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addCase(updateUserProfile.fulfilled, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addCase(updateProfilePhoto.fulfilled, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
            .addMatcher(isUserPendingAction, (state, action)=>{
                state.isProcessing = true
            })
            .addMatcher(isUserRejectedAction, (state, action)=>{
                state.isProcessing = false
                state.status = {...action.payload}
            })
    },
}) 

export default userSlice.reducer;
export const {userAuthLoaded,userInfoLoaded,userStatusCleared} = userSlice.actions;

// selectors
export const selectUserAuth = createSelector(
    state=>state.entities.user,
    user=>user.auth
)

export const selectUserInfo = createSelector(
    state=>state.entities.user,
    user=>user.userInfo
)

export const selectUserProcessing = createSelector(
    state=>state.entities.user,
    user=>user.isProcessing
)

export const selectUserStatus = createSelector(
    state=>state.entities.user,
    user=>user.status
)