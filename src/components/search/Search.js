import React, { useState } from 'react'
import { Avatar, Box, Chip, Grid, Paper, Stack, TextField, Tooltip, Typography} from '@mui/material'
import { grey, purple } from '@mui/material/colors'
import LaunchIcon from '@mui/icons-material/Launch';
import { InstantSearch } from 'react-instantsearch-hooks-web'
import { searchClient, searchClient2 } from '../../algolia/config';
import AlgoliaSearchBox from '../algoliaSearch/AlgoliaSearchBox';
import './Search.css'
import SearchResultContainer from './SearchResultContainer';
import { Helmet } from 'react-helmet';


const filterIndexMap = {
    people: 'boardsapp_username',
    projects:'boardsapp_projectname'
}


export default function Search() {

    const [filter, setFilter] = useState('projects')

    const handleClick = (filter)=>(e) => {
        console.info('You clicked the Chip filter: ', filter);
        setFilter(filter)
      };
    
  return (
    // the root 
    <Box className="search-root" sx={{width:'100%',height:'100%',position:'relative',overflowY:'auto',pb:3}}>
        <Helmet>
            <title>Search / Boards</title>
            <meta name="description" content="Search for people or projects / Boards" />
        </Helmet>
        <InstantSearch searchClient={filter==='people'?searchClient:searchClient2} indexName={filterIndexMap[filter]}>
        <Stack direction='column' width='100%' alignItems='center' position='relative'>
            <Stack direction='column' spacing={2}  width={{xs:'90%',sm:'80%',md:'75%'}} maxWidth={'1080px'} sx={{zIndex:10,py:2,bgcolor:'white',position:'sticky',top:0,left:0}} >

                <AlgoliaSearchBox  />
                {/* filters  */}
                <Stack direction='row' spacing={1}>
                    <Typography variant='body1' alignSelf={'center'} >Filters: </Typography>
                    <Typography onClick={handleClick('projects')} variant='body2' alignSelf={'center'} sx={{'&:hover':{outline:`2px solid ${purple[400]}`}, py:0.5,px:1.5,borderRadius:'50px',cursor:'pointer',color:filter==='projects'?'white':purple[400],backgroundColor:filter==='projects' ?purple[400]:'white',border:`1px solid ${purple[400]}`}}>Projects</Typography>
                    <Typography onClick={handleClick('people')} variant='body2' alignSelf={'center'} sx={{'&:hover':{outline:`2px solid ${purple[400]}`}, py:0.5,px:1.5,borderRadius:'50px',cursor:'pointer',color:filter==='people' ?'white':purple[400],backgroundColor:filter==='people'?purple[400]:'white',border:`1px solid ${purple[400]}`}}>People</Typography>
                </Stack> 
            </Stack>
            {/* search results container  */}
            <SearchResultContainer filter={filter} />
        </Stack>
        </InstantSearch>

    </Box>
  )
}
