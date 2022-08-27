import React, { useEffect, useState } from 'react'
import {Avatar, Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Paper, Stack, TextField, Tooltip, Typography} from '@mui/material'
import { blue, grey, purple } from '@mui/material/colors'
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EditIcon from '@mui/icons-material/Edit';
import { useSelector } from 'react-redux';
import { selectUserInfo, selectUserProcessing, selectUserStatus, updateProfilePhoto, updateUserProfile, userInfoLoaded } from '../store/userSlice';
import { colorMap } from '../utils/colorMap';
import { useDispatch } from 'react-redux';
import { projectFirestore } from '../firebase/config';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import Indicator from './indicator/Indicator';

export default function Profile() {

    const {profileId} = useParams()
    const [theCheckedProfile, setTheCheckedProfile] = useState(null)
    const dispatch = useDispatch()
    const userInfo = useSelector(selectUserInfo)
    const userStatus = useSelector(selectUserStatus)
    const isProcessing = useSelector(selectUserProcessing)

    // initialize the checked profile based on the profileId
    useEffect(()=>{
        // check the logged in user's profile
        if(profileId === userInfo.id) setTheCheckedProfile(userInfo)
        // check other users' profiles
        else {
            getDoc(doc(projectFirestore,`users/${profileId}`))
            .then(docSnap=>{
                setTheCheckedProfile({...docSnap.data(),id:docSnap.id})
            })
        }
    },[])

    // edit Title
    const [openEditTitle, setOpenEditTitle] = useState(false)
    const [title, setTitle] = useState('')
    const handleOpenEditTitle = ()=>{
        setOpenEditTitle(true)
        setTitle(userInfo.title)
    }
    const handleChangeTitle = (e)=>{
        setTitle(e.target.value)
    }
    const handleEditTitleConfirm = (e)=>{
        e.preventDefault()
        // TODO: dispatch an action to update the title
        dispatch(updateUserProfile({userId:userInfo.id,userProp:'title',userPropValue:title}))
    }
    // edit phone
    const [openEditPhone, setOpenEditPhone] = useState(false)
    const [phone, setPhone] = useState('')
    const handleOpenEditPhone = ()=>{
        setOpenEditPhone(true)
        setPhone(userInfo.phone)
    }
    const handleChangePhone = (e)=>{
        setPhone(e.target.value)
    }
    const handleEditPhoneConfirm = (e)=>{
        e.preventDefault()
        // TODO: dispatch an action to update the phone
        dispatch(updateUserProfile({userId:userInfo.id,userProp:'phone',userPropValue:phone}))
    }
    // edit location
    const [openEditLocation, setOpenEditLocation] = useState(false)
    const [location, setLocation] = useState('')
    const handleOpenEditLocation =()=>{
        setOpenEditLocation(true)
        setLocation(userInfo.location)
    }
    const handleChangeLocation = (e)=>{
        setLocation(e.target.value)
    }
    const handleEditLocationConfirm = (e)=>{
        e.preventDefault()
        // TODO: dispatch an action to update the location
        dispatch(updateUserProfile({userId:userInfo.id,userProp:'location',userPropValue:location}))
    }
    // edit expertise
    const [openEditExpertise, setOpenEditExpertise] = useState(false)
    const [expertise, setExpertise] = useState('')
    const handleOpenEditExpertise = ()=>{
        setOpenEditExpertise(true)
        setExpertise(userInfo.expertise)
    }
    const handleChangeExpertise = (e)=>{
        setOpenEditExpertise(e.target.value)
    }
    const handleEditExpertiseConfirm = (e)=>{
        e.preventDefault()
        // TODO: dispatch an action to update the expertise
        dispatch(updateUserProfile({userId:userInfo.id,userProp:'expertise',userPropValue:expertise}))
    }

    // listen to the response of editing operations to close the editing form
    useEffect(()=>{
        if(openEditTitle) setOpenEditTitle(false)
        if(openEditPhone) setOpenEditPhone(false)
        if(openEditLocation) setOpenEditLocation(false)
        if(openEditExpertise) setOpenEditExpertise(false)
    },[userStatus.id])

    // update profile photo
    const [openUpdatePhoto, setOpenUpdatePhoto] = useState(false)
    const [photo, setPhoto] = useState('')
    const [photoPreview, setPhotoPreview] = useState('')
    const handleOpenUpdatePhoto =()=>{
        setOpenUpdatePhoto(true)
        setPhoto('')
        setPhotoPreview(userInfo.photoURL? userInfo.photoURL : '')
    }
    const handleChangePhoto = (e)=>{
        setPhoto(e.target.files[0])
    }
    // update photo preview
    useEffect(()=>{
        if(photo){
            let reader = new FileReader()
            reader.onload =()=>{
                console.log('the reader result: ',reader.result)
                setPhotoPreview(reader.result)
            }
            reader.onerror = ()=>{
                console.log("Error loading photo file: " + reader.result)
            }
            reader.readAsDataURL(photo)
        }
    },[photo])
    const handleCloseUpdatePhoto = (e)=>{
        setOpenUpdatePhoto(false)
    }
    const handleUpdatePhoto = ()=>{
        dispatch(updateProfilePhoto({fileBase64:photoPreview}))
    }

    // listen to the response from 'updateProfilePhoto' method
    useEffect(()=>{
        if(userStatus.id){
            if(userStatus.code===200){
                setPhoto('')
            }
        }
    },[userStatus.id])

  return (
    <>
        {theCheckedProfile &&
            <Box sx={{width:'100%',height:'100%',position:'relative',overflowY:'auto'}}>
                <Helmet>
                    <title>{`Profile (@${theCheckedProfile.username}) / Boards`}</title>
                    <meta name="description" content={`Profile Page (${theCheckedProfile.username}) / Boards`} />
                </Helmet>
                <Stack direction='column'>
                    <Stack direction='column' p={3} sx={{bgcolor:purple[400]}}>
                        <Box sx={{alignSelf:'center',position:'relative',mb:1.5}}>
                            <Avatar src={theCheckedProfile.photoURL} sx={{position:'relative','&.MuiAvatar-root':{fontSize:{xs:'200%',md:'300%',lg:'400%'}},alignSelf:'center',width:{xs:100,md:120,lg:140},height:{xs:100,md:120,lg:140},bgcolor:colorMap[theCheckedProfile.bgColor],outline:'5px solid white'}}>
                                {theCheckedProfile.username.at(0).toUpperCase()}
                            </Avatar>
                            {theCheckedProfile.id === userInfo.id &&
                            <IconButton size='small' sx={{position:'absolute',bottom:0,right:0,bgcolor:'white','&:hover':{bgcolor:'white'}}} color='primary' onClick={handleOpenUpdatePhoto} >
                                <PhotoCamera fontSize='inherit' />
                            </IconButton>}
                        </Box>
                        <Typography variant='h5' fontWeight={500} color='white'>{`${theCheckedProfile.username.at(0).toUpperCase()}${theCheckedProfile.username.slice(1)}`}</Typography> 
                        <Typography variant='subtitle1' fontWeight={500} color='white'>{theCheckedProfile.email}</Typography>
                    </Stack>
                    <Stack direction='column' alignSelf={'center'} p={2} spacing={2} width={{xs:'90%',md:'70%',lg:'60%'}} maxWidth={'600px'}>
                        <Stack direction='row' spacing={3}>
                            <Box sx={{p:1,width:45,height:45, borderRadius:'50%',border:`1px solid ${grey[500]}`}}>
                                <PersonIcon sx={{color:grey[500]}}/>
                            </Box>
                            {theCheckedProfile.id === userInfo.id 
                            ?<>
                                {!openEditTitle
                                ?
                                    <Stack onClick={handleOpenEditTitle} direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                        <Typography textAlign='left' variant='body1' >Title:  {userInfo.title}</Typography>
                                        <EditIcon sx={{color:blue[500],opacity:0,transition:'all 0.2s ease-in-out'}}/>
                                    </Stack>
                                :
                                    <form style={{flexGrow:1}} onSubmit={handleEditTitleConfirm}>
                                        <TextField placeholder='Edit your title...' value={title} onChange={handleChangeTitle} autoFocus sx={{width:'100%','& .MuiInputBase-input':{p:1.3}}} onBlur={handleEditTitleConfirm} />
                                    </form>
                                }
                            
                            </>
                            :<>
                                <Stack direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                    <Typography textAlign='left' variant='body1' >Title:  {theCheckedProfile.title}</Typography>
                                </Stack>
                            </>}
                        </Stack>
                        <Stack direction='row' spacing={3}>
                            <Box sx={{p:1,width:45,height:45, borderRadius:'50%',border:`1px solid ${grey[500]}`}}>
                                <LocalPhoneIcon sx={{color:grey[500]}}/>
                            </Box>
                            {theCheckedProfile.id === userInfo.id
                            ?<>
                                {!openEditPhone
                                ?
                                    <Stack onClick={handleOpenEditPhone} direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                        <Typography textAlign='left' variant='body1' >Phone:  {userInfo.phone}</Typography>
                                        <EditIcon sx={{color:blue[500],opacity:0,transition:'all 0.2s ease-in-out'}}/>
                                    </Stack>
                                :
                                    <form style={{flexGrow:1}} onSubmit={handleEditPhoneConfirm}>
                                        <TextField placeholder='Edit your phone...' value={phone} onChange={handleChangePhone} autoFocus sx={{width:'100%','& .MuiInputBase-input':{p:1.3}}} onBlur={handleEditPhoneConfirm} />
                                    </form>
                                }
                            </>
                            :<>
                                <Stack direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                    <Typography textAlign='left' variant='body1' >Phone:  {theCheckedProfile.phone}</Typography>
                                </Stack>
                            </>}
                        </Stack>
                        <Stack direction='row' spacing={3}>
                            <Box sx={{p:1,width:45,height:45, borderRadius:'50%',border:`1px solid ${grey[500]}`}}>
                                <LocationOnIcon sx={{color:grey[500]}}/>
                            </Box>
                            {theCheckedProfile.id === userInfo.id
                            ?<>
                                {!openEditLocation
                                ?
                                    <Stack onClick={handleOpenEditLocation} direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                        <Typography textAlign='left' variant='body1' >Location:  {userInfo.location}</Typography>
                                        <EditIcon sx={{color:blue[500],opacity:0,transition:'all 0.2s ease-in-out'}}/>
                                    </Stack>
                                :
                                    <form style={{flexGrow:1}} onSubmit={handleEditLocationConfirm}>
                                        <TextField placeholder='Edit your location...' value={location} onChange={handleChangeLocation} autoFocus sx={{width:'100%','& .MuiInputBase-input':{p:1.3}}} onBlur={handleEditLocationConfirm} />
                                    </form>
                                }
                            </>
                            :<>
                                <Stack direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                    <Typography textAlign='left' variant='body1' >Location:  {theCheckedProfile.location}</Typography>
                                </Stack>
                            </>}
                        </Stack>
                        <Stack direction='row' spacing={3}>
                            <Box sx={{p:1,width:45,height:45, borderRadius:'50%',border:`1px solid ${grey[500]}`}}>
                                <PsychologyIcon sx={{color:grey[500]}}/>
                            </Box>
                            {theCheckedProfile.id === userInfo.id
                            ?<>
                                {!openEditExpertise
                                ?
                                    <Stack onClick={handleOpenEditExpertise} direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                        <Typography textAlign='left' variant='body1' >Expertise:  {userInfo.expertise}</Typography>
                                        <EditIcon sx={{color:blue[500],opacity:0,transition:'all 0.2s ease-in-out'}}/>
                                    </Stack>
                                :
                                    <form style={{flexGrow:1}} onSubmit={handleEditExpertiseConfirm}>
                                        <TextField placeholder='Edit your expertise...' value={expertise} onChange={handleChangeExpertise} autoFocus sx={{width:'100%','& .MuiInputBase-input':{p:1.3}}} onBlur={handleEditExpertiseConfirm} />
                                    </form>
                                }
                            </>
                            :<>
                                <Stack direction='row' justifyContent={'space-between'} sx={{cursor:'pointer',flexGrow:1,p:1,outline:'1px dashed transparent',transition:'all 0.2s ease-in-out','&:hover':{outline:`1px dashed ${blue[400]}`,'& .MuiSvgIcon-root':{opacity:1}}}}>
                                    <Typography textAlign='left' variant='body1' >Expertise:  {theCheckedProfile.expertise}</Typography>
                                </Stack>
                            </>}
                        </Stack>
                    </Stack>    
                </Stack>
                
                {/* update profile photo dialog  */}
                <Dialog open={openUpdatePhoto} onClose={handleCloseUpdatePhoto} sx={{transition:'backdrop-filter 0.2s ease-in-out',backdropFilter:'blur(5px)','& .MuiDialog-paper':{overflowY:'unset',width:{xs:'100%',sm:'450px'},height:{xs:'80%',sm:'450px'}},'& .MuiDialog-container':{bgcolor:'rgba(255,255,255,0.6)'}}}>
                    <DialogContent sx={{width:'100%',aspectRatio:(1/1).toString()}}>
                        <Box sx={{p:1,width:'100%',aspectRatio:(1/1).toString()}}>
                            {photoPreview 
                            ? <Paper sx={{p:1,width:'100%',aspectRatio:(1/1).toString(),bgcolor:grey[300]}}><img src={photoPreview} alt='profile' style={{width:'100%', height:'100%', objectFit:'cover',bgcolor:'red'}} /> </Paper>
                            : <Paper sx={{position:'relative',width:'100%', height:'100%', bgcolor:grey[300],borderRadius:'5px',display:'flex',justifyContent: 'center',alignItems: 'center'}}>
                                <AddIcon sx={{fontSize:64,color:'white'}}/>
                                <Typography variant='h5' sx={{position:'absolute',bottom:40,left:0,right:0,textAlign:'center',color:'white'}}>choose a photo</Typography>
                            </Paper>
                            }
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Tooltip title='choose a photo'>
                            <IconButton variant='outlined' sx={{mr:2}} color="primary" aria-label="upload picture" component="label">
                                <input hidden accept="image/*" type="file" onChange={handleChangePhoto} />
                                <PhotoCamera />
                            </IconButton>
                        </Tooltip>
                        <Button variant='contained' color='warning' onClick={handleCloseUpdatePhoto}>cancel</Button>
                        <Button variant='contained' color='primary' disabled={photo===''? true:false} onClick={handleUpdatePhoto}>confirm</Button>
                    </DialogActions>
                </Dialog>

                {/* backdrop loading indicator -- creating project  */}
                <Indicator open={isProcessing} />
            </Box>
        }
    </>
  )
}
