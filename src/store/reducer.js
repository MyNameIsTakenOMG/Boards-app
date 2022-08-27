import { combineReducers } from "@reduxjs/toolkit";
import entitiesReducer from './entities';


const reducer = combineReducers({
    entities: entitiesReducer,
})

export default reducer;