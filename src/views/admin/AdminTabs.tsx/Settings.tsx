import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

export default function FullWidthTimePicker() {
  const [value, setValue] = useState<Dayjs | null>(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Typography
        variant="h6"
        sx={{
          color: '#667085',
          textAlign: 'left',
          fontSize: 18,
          marginBottom: '1rem',
        }}
      >
        Queue Reset Time
      </Typography>

      <Box sx={{ width: '100%' }}>
        <TimePicker
          label="Reset Time"
          value={value}
          onChange={(newValue) => setValue(newValue)}
          views={['hours', 'minutes', 'seconds']}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#2FDCC7' },
              '&:hover fieldset': { borderColor: '#352D66' },
              '&.Mui-focused fieldset': { borderColor: '#352D66' },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#352D66',
            },
          }}
          slotProps={{
            textField: { fullWidth: true },
            actionBar: { actions: ['cancel', 'accept'] },
          }}
        />
      </Box>

      {/* <Typography
        sx={{
          color: '#352D66',
          fontWeight: 500,
          marginTop: '1rem',
        }}
      >
        Selected Time: {value?.format('HH:mm:ss') || '--:--:--'}
      </Typography> */}

      {/* ✅ Custom styles */}
      <style>
        {`
          /* Clock & selected item colors */
          .MuiClock-pin, 
          .MuiClockPointer-root, 
          .MuiClockPointer-thumb {
            background-color: #2FDCC7 !important;
          }
          .MuiClockPointer-thumb {
            border: 2px solid #352D66 !important;
          }
          .Mui-selected {
            background-color: #2FDCC7 !important;
            color: #fff !important;
          }

          /* Action buttons (OK and Cancel) */
          .MuiPickersLayout-actionBar button {
            border-radius: 8px !important;
            padding: 4px 12px !important;
            text-transform: none !important;
            font-weight: 500 !important;
            font-family: inherit !important;
          }

          /* OK button */
          .MuiPickersLayout-actionBar button:nth-of-type(2) {
            background-color: #352D66 !important;
            color: #FFFFFF !important;
          }
          .MuiPickersLayout-actionBar button:nth-of-type(2):hover {
            background-color: #2a2250 !important;
          }

          /* Cancel button — your normal gray */
          .MuiPickersLayout-actionBar button:nth-of-type(1) {
            background-color: #667085 !important;
            color: #FFFFFF !important;
          }
          .MuiPickersLayout-actionBar button:nth-of-type(1):hover {
            background-color: #E4E7EC !important;
          }
        `}
      </style>
    </LocalizationProvider>
  );
}
