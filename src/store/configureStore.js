import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";
// import {allProjectsLoaded} from "./projectSlice";

const store = configureStore({
    reducer: reducer,
    middleware: (getDefaultMiddleware)=>{
        return getDefaultMiddleware({
            serializableCheck:false
            // serializableCheck:{
            //     ignoreActions:['project/allProjectsLoaded'],
            //     // ignoredActionPaths:['payload'],
            //     ignoredPaths:['entities.project.allProjects'],
            // }
        }).concat()
    }
})

export default store;