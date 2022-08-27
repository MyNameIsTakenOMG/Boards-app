import {  Button, Stack, Divider,TextField, Typography, Box, Avatar, Backdrop, Paper, CircularProgress, Dialog, useTheme, useMediaQuery, createTheme, ThemeProvider } from '@mui/material'
import { lightBlue ,purple} from '@mui/material/colors';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux';
import { createNewUser, login, selectUserProcessing, sendResetEmail, signinWithGoogleOrGithub } from '../store/userSlice';
import {Helmet} from 'react-helmet'
import { resetSchema, signinSchema, signupSchema } from '../validationSchema/schemas';
import { useSelector } from 'react-redux';

const customFont = createTheme({
    typography:{
        fontFamily:['"Dancing Script"', 'cursive'].join(','),
    }
})

export default function Login() {

    const dispatch = useDispatch()
    const isProcessing = useSelector(selectUserProcessing)

    const [signin, setSignin] = useState({
        si_email: '',
        si_password: '',
    })
    const [signinErr, setsigninErr] = useState({})
    const handleSigninChange = (e) =>{
        setSignin({
            ...signin,
            [e.target.name]: e.target.value
        })
    }

    const [signup, setSignup] = useState({
        su_username: '',
        su_email: '',
        su_password: '',
        su_confirm_password: '',
    })
    const [signupErr, setSignupErr] = useState({})
    const handleSignupChange = (e) =>{
        setSignup({
            ...signup,
            [e.target.name]: e.target.value
        })
    }

    const [reset, setReset] = useState({
        rs_email: '',
    })
    const [resetErr, setResetErr] = useState({})
    const handleResetChange = (e) =>{
        setReset({
            ...reset,
            [e.target.name]: e.target.value
        })
    }
    
    // dialog 
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [signupOrReset, setSignupOrReset] = useState(null)
    const [openDialog, setOpenDialog] = useState(false)
    const handleOpenDialog = (option)=>()=>{
        setOpenDialog(true)
        setSignupOrReset(option)
    }
    const handleCloseDialog = ()=>{
        setOpenDialog(false)
        setTimeout(() => {
            setSignupOrReset(null)
        }, 400);
    }

    // validating function
    const validate = useCallback((schema, value)=>{
        let newErr ={}
        let result = schema.validate(value,{abortEarly:false})
        console.log('result: ',result)
        if(result.error){
            const {details} = result.error
            details.forEach(detail=>{
                newErr[detail.path[0]]=detail.message
            })
        }
        return newErr
    },[])

    // sign in
    const handleSigninConfirm = (e)=>{
        e.preventDefault();
        // clean up err info first
        setsigninErr({})
        // need to validate data later (using JOI maybe)
        let newErr = validate(signinSchema, signin)
        if(Object.keys(newErr).length !== 0) setsigninErr(newErr)
        else  dispatch(login({email:signin.si_email,password:signin.si_password}))
    }
    // sign up 
    const handleSignupConfirm = (e)=>{
        e.preventDefault();
        // clean up err info first
        setSignupErr({})
        // need to validate data later (using JOI maybe)
        let newErr = validate(signupSchema, signup)
        if(Object.keys(newErr).length !== 0) setSignupErr(newErr)
        else dispatch(createNewUser({name:signup.su_username,email:signup.su_email, password:signup.su_password }))
    }
    // reset password
    const handleResetPasswordConfirm = (e)=>{
        e.preventDefault();
        // clean up err info first
        setResetErr({})
        // need to validate data later (using JOI maybe)
        let newErr = validate(resetSchema, reset)
        if(Object.keys(newErr).length !== 0) setResetErr(newErr)
        // else : 
        else dispatch(sendResetEmail({email:reset.rs_email}))
        // ...
    }

    // sign in with google or github
    const handleSigninWithGoogleOrGithub = (providerType)=>{
        dispatch(signinWithGoogleOrGithub({providerType}))
    }

  return (
    <Box sx={{position:'relative',width:'100%',height:'100%',overflowY:'auto',backgroundImage:'url("https://firebasestorage.googleapis.com/v0/b/boards-app-9e576.appspot.com/o/background%2FbgImage.jpg?alt=media&token=a7001ec3-afe9-4ef8-98d5-4d4d3a73ad4e")',backgroundSize:'cover'}}>
        <Helmet >
            <title>Sign In with Boards</title>
            <meta name="description" content="Sign In with Boards" />
        </Helmet>
        <Stack sx={{backdropFilter:'blur(5px)',bgcolor:'rgba(255,255,255,0.8)',position:'relative',transform:'translateY(-50%)',top:'50%',borderRadius:{xs:'0px',sm:'10px'},width:{xs:'100%',sm:'600px'},height:{xs:'100%',sm:'600px'},mx:'auto'}} direction={'column'} px={4} py={5} rowGap={2} height='100%'>
            <Stack direction={'row'}>
                <Box sx={{flexGrow:1, display:'flex',flexFlow:'row nowrap',justifyContent:'end',alignItems:'center',pr:1}}>
                    <ThemeProvider theme={customFont}>
                        <Avatar variant='rounded' sx={{bgcolor:purple[400],fontSize:'200%'}}>B</Avatar>
                    </ThemeProvider>
                </Box>
                <Typography variant='h4' >Boards</Typography>
                <Box sx={{flexGrow:1}}></Box>
            </Stack>
            <Typography variant='h6' >Align actions with your ideas.</Typography>
            <form onSubmit={handleSigninConfirm} style={{display:'flex',flexFlow:'column nowrap',rowGap:'1rem'}}>
                <TextField error={signinErr.si_email?true:false} helperText={signinErr.si_email?signinErr.si_email:''} onChange={handleSigninChange} value={signin.si_email} id='si_email' name='si_email' type={'email'} required label='Email address' placeholder='Please enter your email address' />
                <TextField error={signinErr.si_password?true:false} helperText={signinErr.si_password?signinErr.si_password:''} onChange={handleSigninChange} value={signin.si_password} id='si_password' name='si_password' type={'password'} required label='Password' placeholder='Please enter your password' />
                <Button variant='contained' color='primary' type='submit'>Confirm</Button>
            </form>
            <Divider>or</Divider>
            <Button onClick={()=>{handleSigninWithGoogleOrGithub('google')}} variant='outlined' startIcon={<GoogleIcon />}>Sign in with Google</Button>
            <Button onClick={()=>{handleSigninWithGoogleOrGithub('github')}} variant='outlined'  startIcon={<GitHubIcon />}>Sign in with Github</Button>

            <Stack sx={{mt:'auto'}} direction='column' justifyContent={'center'} alignItems={'center'}>
                <Typography onClick={handleOpenDialog('signup')} variant='body2' color={lightBlue[500]} sx={{cursor:'pointer','&:hover':{textDecorationLine:'underline'}}}>Don't have an account?</Typography>
                <Divider >or</Divider>
                <Typography onClick={handleOpenDialog('reset')} variant='body2' color={lightBlue[500]} sx={{cursor:'pointer','&:hover':{textDecorationLine:'underline'}}}>Forgot the password?</Typography>
            </Stack>
        </Stack>

        {/* overlay */}
        <Dialog fullScreen={fullScreen} open={openDialog} sx={{'& .MuiDialog-paper':{p:4,overflowY:'unset',width:{sm:'90%'},height:{sm:'auto'}}}} onClose={handleCloseDialog}>
            <Stack direction='row' spacing={1} mb={2} sx={{position:'relative'}} justifyContent='center'>
                <Stack direction='row' >
                    <ThemeProvider theme={customFont}>
                        <Avatar variant='rounded' sx={{bgcolor:purple[400],fontSize:'150%',width:32,height:32}}>B</Avatar>
                    </ThemeProvider>
                </Stack>
                <Typography variant='h5' sx={{alignSelf:'center'}}>{signupOrReset==='signup'?'Create new account':'Reset password'}</Typography>
            </Stack>
            {signupOrReset==='signup'&&
                <form onSubmit={handleSignupConfirm} style={{display:'flex',flexFlow:'column nowrap', rowGap:'1rem',marginBottom:'1.5rem'}} >
                    <TextField error={signupErr.su_username?true:false} helperText={signupErr.su_username?signupErr.su_username:''} onChange={handleSignupChange} value={signup.su_username} id='su_username' name='su_username' required label='User name' placeholder='Please enter user name'/>
                    <TextField error={signupErr.su_email?true:false} helperText={signupErr.su_email?signupErr.su_email:''}onChange={handleSignupChange} value={signup.su_email} id='su_email' name='su_email' type={'email'} required label='Email address' placeholder='Please enter your email address' />
                    <TextField error={signupErr.su_password?true:false} helperText={signupErr.su_password?signupErr.su_password:''}onChange={handleSignupChange} value={signup.su_password} id='su_password' name='su_password' type={'password'} required label='Password' placeholder='Please enter your password' />
                    <TextField error={signupErr.su_confirm_password?true:false} helperText={signupErr.su_confirm_password?signupErr.su_confirm_password:''}onChange={handleSignupChange} value={signup.su_confirm_password} id='su_confirm_password' name='su_confirm_password' type={'password'} required label='Confirm Password' placeholder='Please confirm your password' />
                    <Button variant='contained' color='warning' onClick={handleCloseDialog} >cancel</Button>
                    <Button variant='contained' color='primary' type='submit'>Confirm</Button>
                </form>}
            {signupOrReset==='reset'&&
                <form onSubmit={handleResetPasswordConfirm} style={{display: 'flex',flexFlow:'column nowrap',rowGap:'2rem',marginBottom:'1.5rem'}} >
                    <TextField error={resetErr.rs_email?true:false} helperText={resetErr.rs_email?resetErr.rs_email:''} onChange={handleResetChange} value={reset.rs_email} id='rs_email' name='rs_email' type={'email'} required label='Email address' placeholder='Please enter email address' />
                    <Stack direction='column' rowGap={2}>
                        <Button variant='contained' color='warning' onClick={handleCloseDialog}>cancel</Button>
                        <Button variant='contained' color='primary' type='submit'>Confirm</Button>
                    </Stack>
                </form>
            }
        </Dialog>

        {/* backdrop  */}
        <Backdrop sx={{'&.MuiBackdrop-root':{backgroundColor:'transparent'},zIndex: (theme) => theme.zIndex.drawer + 1000}} open={isProcessing}>
            <Paper elevation={5} sx={{width:'240px',height:'200px',display:'flex',flexFlow:'column nowrap',justifyContent:'center'}}>
                <CircularProgress color='secondary' size={100} sx={{alignSelf:'center',width:100,height:100,mb:2}} />
                <Typography variant='body2' color={purple[400]} >Processing...</Typography>
            </Paper>
        </Backdrop>
    </Box>
  )
}
