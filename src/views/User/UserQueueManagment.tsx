import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
} from '@mui/material';

export default function UserQueueManagment() {
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
            sx={{
              textAlign: 'left',
              backgroundColor: '#ffffff',
              border: 'none',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            MenuProps={{
              PaperProps: { sx: { textAlign: 'left' } },
            }}
          >
            <MenuItem value="">
              <em>Select a Counter</em>
            </MenuItem>

            <MenuItem value="R1">Radiology - Room 1</MenuItem>
            <MenuItem value="R2">Radiology - Room 2</MenuItem>
            <MenuItem value="P1">Pharmacy - Window 1</MenuItem>
            <MenuItem value="P2">Pharmacy - Window 2</MenuItem>
            <MenuItem value="B1">Billing - Counter 1</MenuItem>
            <MenuItem value="B2">Billing - Counter 2</MenuItem>
            <MenuItem value="L1">Laboratory - Sample Desk</MenuItem>
            <MenuItem value="ER1">Emergency - Check-in Desk</MenuItem>
            <MenuItem value="OP1">Outpatient - Reception</MenuItem>
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
      >
        Continue
      </Button>
    </Box>
  );
}
