import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import { useState } from 'react';
import AllLocations from './AdminTabs.tsx/locations/AllLocations';
import { Typography } from '@mui/material';
import LocationPrefix from './AdminTabs.tsx/locations/LocationPrefix';
import FirstLocationInPath from './AdminTabs.tsx/locations/FirstLocationInPath';
import PathsDashboard from './AdminTabs.tsx/Paths/PathsDashboard';
import Settings from './AdminTabs.tsx/Settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default function QueueRouteManagement() {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
const [innerValue, setInnerValue] = useState(0);

const handleInnerChange = (event: React.SyntheticEvent, newValue: number) => {
  setInnerValue(newValue);
};
  const mainColor = '#352D66'; // dark purple
  const activeBg = '#ffffff';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: mainColor,
          height: 60, // restored original AppBar height
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            minHeight: '100%',
            px: 0, // no extra space at sides
          }}
        >
          {/* Tabs flush left */}
          <Tabs
            value={value}
            onChange={handleChange}
            sx={{
              ml: 0,
              '& .MuiTabs-flexContainer': {
                alignItems: 'flex-end',
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {/* Locations tab */}
            <Tab
              icon={<LocationOnIcon />}
              iconPosition="start"
              label="Locations"
              {...a11yProps(0)}
              sx={{
                textTransform: 'none',
                color: '#fff',
                fontWeight: 500,
                fontSize: '0.95rem',
                px: 3,
                minHeight: 48,
                '&.Mui-selected': {
                  color: mainColor,
                  backgroundColor: activeBg,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 10,
                  alignSelf: 'flex-end',
                },
              }}
            />

            {/* Paths tab */}
            <Tab
              icon={<RouteIcon />}
              iconPosition="start"
              label="Paths"
              {...a11yProps(1)}
              sx={{
                textTransform: 'none',
                color: '#fff',
                fontWeight: 500,
                fontSize: '0.95rem',
                px: 3,
                minHeight: 48,
                '&.Mui-selected': {
                  color: mainColor,
                  backgroundColor: activeBg,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10 ,
                  alignSelf: 'flex-end',
                },
              }}
            />
          </Tabs>

          {/* Settings Icon flush right, only top-left rounded */}
          <IconButton
            onClick={() => setValue(2)}
            sx={{
              mr: 0,
              color: value === 2 ? mainColor : '#fff',
              backgroundColor: value === 2 ? activeBg : 'transparent',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
              alignSelf: 'flex-end',
              minHeight: 42, // match tab height
              transition: '0.2s',
              '&:hover': {
                backgroundColor: activeBg,
                color: mainColor,
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{padding: "2rem", marginLeft: "2rem"}}>
        {/* will add conditions for locations title also */}
<Typography
  variant="h6" // larger text
  sx={{
    // fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 32,
  }}
>
  
  {value===0 ? "All Locations" : value===1 ? "Paths" : "Settings"}
</Typography>
      {/* Example tab panels */}
<CustomTabPanel value={value} index={0}>
  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
    {/* Inner Tabs */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        borderRadius: '5px 5px 0 0',
        width: 'fit-content',
        px: 0.5,
        py: 0.3,
        mb: 3,
    p: 0.5, // slight padding to make grey surround the tabs
        marginBottom: 0
      }}
    >
      {['All Locations', 'Location Prefix', 'First Location in Path'].map((label, i) => (
        <Box
          key={i}
          onClick={() => setInnerValue(i)}
          sx={{
            cursor: 'pointer',
            px: 3,
            py: 0.8,
            borderRadius: '8px',
            backgroundColor: innerValue === i ? '#fff' : 'transparent',
            boxShadow:
              innerValue === i ? '0px 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
            color: innerValue === i ? '#000' : '#555',
            fontWeight: innerValue === i ? 600 : 500,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: innerValue === i ? '#fff' : '#eaeaea',
            },
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  </Box>

  {/* Panels for inner tabs */}
  {innerValue === 0 && <AllLocations />}
  {innerValue === 1 && <LocationPrefix />}
  {innerValue === 2 && <FirstLocationInPath />}
</CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
       <PathsDashboard/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
       <Settings/>
      </CustomTabPanel></div>
    </Box>
  );
}
