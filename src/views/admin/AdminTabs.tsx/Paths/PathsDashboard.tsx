import React, { useState } from 'react';
import { FormControl, Select, MenuItem, Box } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import RouteIcon from '@mui/icons-material/Route';
import PathTable from './PathsTable';
import PathsGraph from './PathsGraph';

export default function PathsDashboard() {
  const allLocations = ['Cardio', 'Dental', 'Pharmacy', 'Lab'];
  const [selectedPath, setSelectedPath] = useState('');
  const [tabValue, setTabValue] = useState(0);

  interface PathRow {
    currentPath: string;
    nextPath: string[];
    description: string;
    prefix: string;
    status: 'Active' | 'Inactive';
  }

  const [data, setData] = useState<PathRow[]>([
    { currentPath: 'Cardio', nextPath: ['Dental', 'Pharmacy'], description: 'Heart check', prefix: 'C1', status: 'Active' },
    { currentPath: 'Dental', nextPath: ['Pharmacy'], description: 'Tooth care', prefix: 'D1', status: 'Inactive' },
    { currentPath: 'Lab', nextPath: ['Cardio', 'Dental'], description: 'Lab tests', prefix: 'L1', status: 'Active' },
  ]);

  // 🔹 Filter logic for display only
  const filteredData = selectedPath
    ? data.filter(
        (row) =>
          row.currentPath === selectedPath ||
          row.nextPath.includes(selectedPath)
      )
    : data;

  // 🔹 Determine if selectedPath is a valid currentPath
  const selectedCurrentPath = data.some(
    (row) => row.currentPath === selectedPath
  )
    ? selectedPath
    : '';

  const handlePathChange = (value: string) => {
    setSelectedPath(value);
    if (!value) setTabValue(1); // switch to table when unselected
  };

  const tabs = [
    { icon: <RouteIcon /> },
    { icon: <TableChartIcon /> },
  ];

  // 🔹 handle data update from PathTable
  const handleDataUpdate = (updatedRows: PathRow[]) => {
    setData(updatedRows);
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
            <em>All Paths</em>
          </MenuItem>
          {allLocations.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f4f4f4',
            borderRadius: '5px 5px 0 0',
            px: 0.5,
            py: 0.3,
          }}
        >
          {tabs.map((tab, index) => (
            <Box
              key={index}
              onClick={() => setTabValue(index)}
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

      {/* Panels */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: '#f4f4f4',
          height: '570px',
          borderRadius: 2,
        }}
      >
        {tabValue === 0 && (
          <PathsGraph data={filteredData} selectedPath={selectedPath} />
        )}
      {tabValue === 1 && (
  <PathTable
    data={data}
    selectedPath={selectedPath}
    allLocations={allLocations} // <-- this is your array of all available locations
    onDataChange={(updated) => {
      console.log('Updated table data:', updated);
      // setData(updated); // enable this if you want to persist edits
    }}
  />
)}


      </Box>
    </Box>
  );
}
