import './App.css';
import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom'
import Login from './pages/Login';
import Main from './pages/Main';
import { useEffect, useState } from 'react';
import {useSelector, useDispatch} from 'react-redux'
import { selectUserAuth, selectUserStatus, userAuthLoaded, userInfoLoaded, userStatusCleared } from './store/userSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { projectAuth, projectFirestore } from './firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Alert, Snackbar } from '@mui/material';
import { selectUpdateStatus, updateStatusCleared } from './store/updateSlice';
import { projectStatusCleared, selectStatus } from './store/projectSlice';
import { myWorkStatusCleared, selectMyWorkStatus } from './store/myWorkSlice';
import { notifStatusCleared, selectNotifStatus } from './store/notifSlice';

function App() {

  const dispatch = useDispatch()
  const userAuth = useSelector(selectUserAuth)
  const [isAuthFirstLoaded, setIsAuthFirstLoaded] = useState(false)
  const userStatus = useSelector(selectUserStatus)
  const updateStatus = useSelector(selectUpdateStatus)
  const projectStatus = useSelector(selectStatus)
  const myWorkStatus = useSelector(selectMyWorkStatus)
  const notifStatus = useSelector(selectNotifStatus)

  // listen to auth state changes
  useEffect(() => {
    let unsubUserAuthListener = onAuthStateChanged(projectAuth,(user)=>{
      if(user){
        console.log('user auth info: ',user);
        // check if first loading is completed
        if(!isAuthFirstLoaded){
          setIsAuthFirstLoaded(true)
        }
        // update user auth 
        let authInfo = {
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL,
        }
        dispatch(userAuthLoaded(authInfo))
      }
      else{
        // check if first loading is completed
        if(!isAuthFirstLoaded){
          setIsAuthFirstLoaded(true)
        }
        // using signout action to clear user auth, no need to do it here
        // if(userAuth.uid){
        //   // clear user auth 
        // }
        console.log('user is not signed in yet or signed out already');
      }
    })
    
    return ()=>{
      unsubUserAuthListener()
    }
  }, [])
  
  useEffect(() => {
    // user info listener
    let unsubUserInfoListener = null
    // if user is authenticated, then attach a listener to the userInfo
    if(userAuth.uid!==''){
      unsubUserInfoListener = onSnapshot(doc(projectFirestore,`users/${userAuth.uid}`),(doc)=>{
        dispatch(userInfoLoaded({...doc.data(),id:doc.id}))
      }) 
    }
    return ()=>{
      if(unsubUserInfoListener){
        unsubUserInfoListener()
      }
    }

  }, [userAuth.uid])


  // listen to  user status to show snackbar when there is an error
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const handleCloseSnackbar = ()=>{
    setOpenSnackbar(false)
    setCode('')
    setMessage('')
    if(userStatus.id) dispatch(userStatusCleared())
    if(updateStatus.id) dispatch(updateStatusCleared())
    if(projectStatus.id) dispatch(projectStatusCleared())
    if(myWorkStatus.id) dispatch(myWorkStatusCleared())
    if(notifStatus.id) dispatch(notifStatusCleared())
  }
  useEffect(()=>{
    if(userStatus.id || updateStatus.id || projectStatus.id || myWorkStatus.id || notifStatus.id){
      setOpenSnackbar(true)
      if(userStatus.id){
        let code = userStatus.code===200 ?'success':'error'
        setCode(code)
        setMessage(userStatus.message)
      }
      if(updateStatus.id){
        let code = updateStatus.code===200 ?'success':'error'
        setCode(code)
        setMessage(updateStatus.message)
      }
      if(projectStatus.id){
        let code = projectStatus.code===200 ?'success':'error'
        setCode(code)
        setMessage(projectStatus.message)
      }
      if(myWorkStatus.id){
        let code = myWorkStatus.code===200 ?'success':'error'
        setCode(code)
        setMessage(myWorkStatus.message)
      }
      if(notifStatus.id){
        let code = notifStatus.code===200 ?'success':'error'
        setCode(code)
        setMessage(notifStatus.message)
      }
    }
  },[userStatus.id, updateStatus.id, projectStatus.id, myWorkStatus.id, notifStatus.id])



  return (
    <div className="App" >  

      {isAuthFirstLoaded && 
        <Routes>
          <Route path='/login' element={ userAuth.uid==='' ? <Login />:<Navigate replace to={'/'} />} />
          <Route path='/*' element={ userAuth.uid!==''? <Main />:<Navigate replace to={'/login'} />} />
        </Routes>
      }
      {code !=='' &&
        <Snackbar open={openSnackbar} onClose={handleCloseSnackbar} autoHideDuration={3000}>
          <Alert sx={{width:'100%'}} severity={code} onClose={handleCloseSnackbar}>
            {message}
          </Alert>
        </Snackbar>
      }
    </div>
  );
}

export default App;
