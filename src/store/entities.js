import { combineReducers } from "@reduxjs/toolkit";
import projectReducer from './projectSlice';
import userReducer from './userSlice';
import updateReducer from './updateSlice';
import notifReducer from './notifSlice';
import myWorkReducer from './myWorkSlice'

const entitiesReducer = combineReducers({
    project: projectReducer,
    user: userReducer,
    update: updateReducer,
    notif: notifReducer,
    myWork: myWorkReducer
})

export default entitiesReducer;