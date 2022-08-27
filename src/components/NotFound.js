import React from "react";
import { Helmet } from "react-helmet";
import {NavLink} from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <Helmet>
        <title>404 - Not Found / Boards</title>
        <meta name="description" content="Page not found -- Boards" />
      </Helmet>
      <h4>not found</h4>
        <NavLink style={({isActive})=>{
            return {
                color: isActive ? 'red' : 'blue',
                textDecoration:'none'
            }
        }} to='/home' state={{from:'from not found'}}>Go to home</NavLink>
    </div>
  );
}
