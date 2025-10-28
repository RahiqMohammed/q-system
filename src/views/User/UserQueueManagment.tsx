import React, {useState} from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UserQueueManagment() {
    const navigate = useNavigate();
    const [counter, setCounter] = useState('');

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        p: '10rem',
      }}
    >
      {/* Header */}
      <Typography
        variant="h6"
        sx={{
          textAlign: 'left',
          fontSize: 32,
        }}
      >
        Welcome again
      </Typography>

      <Typography
        variant="h6"
        sx={{
          color: '#667085',
          textAlign: 'left',
          fontSize: 18,
          mb: '1rem',
        }}
      >
        Dr. Zuwaina Al Badawi
      </Typography>

      {/* Counter Selector */}
      <Box
        sx={{
          width: '100%',
          height: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#352D66',
          borderRadius: '0.5rem',
          mb: '1rem',
        }}
      >
       <FormControl sx={{ width: '90%' }} variant="outlined">
      <Select
        displayEmpty
        value={counter}
        onChange={(e) => setCounter(e.target.value)}
        sx={{
          textAlign: 'left',
          backgroundColor: '#ffffff',
          border: 'none',
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
        MenuProps={{
          PaperProps: { sx: { textAlign: 'left' } },
        }}
        renderValue={(selected) => {
          if (selected === '') {
            return <em>Select a Counter</em>;
          }
          return selected;
        }}
      >
        <MenuItem value="Radiology - Room 1">Radiology - Room 1</MenuItem>
        <MenuItem value="Radiology - Room 2">Radiology - Room 2</MenuItem>
        <MenuItem value="Pharmacy - Window 1">Pharmacy - Window 1</MenuItem>
        <MenuItem value="Pharmacy - Window 2">Pharmacy - Window 2</MenuItem>
        <MenuItem value="Billing - Counter 1">Billing - Counter 1</MenuItem>
        <MenuItem value="Billing - Counter 2">Billing - Counter 2</MenuItem>
        <MenuItem value="Laboratory - Sample Desk">Laboratory - Sample Desk</MenuItem>
        <MenuItem value="Emergency - Check-in Desk">Emergency - Check-in Desk</MenuItem>
        <MenuItem value="Outpatient - Reception">Outpatient - Reception</MenuItem>
      </Select>
    </FormControl>
      </Box>

      {/* Continue Button */}
      <Button
        sx={{
          backgroundColor: '#2FDCC7',
          color: '#FFFFFF',
          width: '12rem',
          height: '4rem',
          borderRadius: '0.5rem',
          alignSelf: 'flex-end',
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: '#28CBB6',
          },
        }}
        onClick={()=> navigate('/user/:counter')}
      >
        Continue
      </Button>
    </Box>
  );
}
