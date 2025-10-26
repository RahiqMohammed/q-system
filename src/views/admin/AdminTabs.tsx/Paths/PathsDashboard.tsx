import React, { useState } from 'react';
import { FormControl, Select, MenuItem, Box } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import RouteIcon from '@mui/icons-material/Route';
import PathTable from './PathsTable';
import PathsGraph from './PathsGraph';

export default function PathsDashboard() {
  const options = ['Cardio', 'Dental', 'Pharmacy', 'Lab'];
  const [selectedPath, setSelectedPath] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  interface PathRow {
    currentPath: string;
    nextPath: string[];
    description: string;
    prefix: string;
    status: 'Active' | 'Inactive';
  }

  const [data] = useState<PathRow[]>([
    { currentPath: 'Cardio', nextPath: ['Dental', 'Pharmacy'], description: 'Heart check', prefix: 'C1', status: 'Active' },
    { currentPath: 'Dental', nextPath: ['Pharmacy'], description: 'Tooth care', prefix: 'D1', status: 'Inactive' },
    { currentPath: 'Lab', nextPath: ['Cardio', 'Dental'], description: 'Lab tests', prefix: 'L1', status: 'Active' },
  ]);

  // Filter data based on selectedPath
  const filteredData = selectedPath
    ? data.filter(
        (row) =>
          row.currentPath === selectedPath || row.nextPath.includes(selectedPath)
      )
    : data;

  const tabs = [
    { icon: <RouteIcon /> },
    { icon: <TableChartIcon /> },
  ];

  const handlePathChange = (value: string) => {
    setSelectedPath(value);
    if (!value) setTabValue(1); // 👈 Switch to table when unselected
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Select box */}
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <Select
          value={selectedPath}
          displayEmpty
          onChange={(e) => handlePathChange(e.target.value)}
          sx={{
            textAlign: 'left',
            backgroundColor: '#f4f4f4',
            border: 'none',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
          }}
          MenuProps={{
            PaperProps: { sx: { textAlign: 'left' } },
          }}
        >
          <MenuItem value="">
            <em>All Paths</em> {/* 👈 Now clickable to unselect */}
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f4f4f4',
            borderRadius: '5px 5px 0 0',
            px: 0.5,
            py: 0.3,
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          {tabs.map((tab, index) => (
            <Box
              key={index}
              onClick={() => handleTabChange(index)}
              sx={{
                cursor: 'pointer',
                px: 3,
                py: 0.8,
                borderRadius: '8px',
                backgroundColor: tabValue === index ? '#fff' : 'transparent',
                boxShadow:
                  tabValue === index
                    ? '0px 2px 6px rgba(0, 0, 0, 0.08)'
                    : 'none',
                color: tabValue === index ? '#000' : '#555',
                fontWeight: tabValue === index ? 600 : 500,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: tabValue === index ? '#fff' : '#eaeaea',
                },
              }}
            >
              {tab.icon}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          mt: 2,
          margin: 0,
          padding: 2,
          backgroundColor: '#f4f4f4',
          height: '570px',
          borderRadius: '0 2 2 2',
        }}
      >
        {tabValue === 0 && (
          <PathsGraph data={filteredData} selectedPath={selectedPath} />
        )}
        {tabValue === 1 && (
          <PathTable data={filteredData} selectedPath={selectedPath} />
        )}
      </Box>
    </Box>
  );
}
