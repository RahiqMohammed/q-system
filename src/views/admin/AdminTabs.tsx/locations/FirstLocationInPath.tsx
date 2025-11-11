import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit,
  Save,
  Close,
} from '@mui/icons-material';

import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

interface LocationRow {
  department: string;
  clinic: string;
  prefix: string;
  firstLocationInPath: string; // New column
}

const locationOptions = ['X-Ray', 'Cardio', 'Dentistry', 'Lab'];


export default function FirstLocationInPath(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([
    {  department: 'Radiology', clinic: 'Main Clinic', prefix: 'XR', firstLocationInPath: '' },
    { department: 'Cardiology', clinic: 'Branch Clinic', prefix: 'CR', firstLocationInPath: '' },
  ]);

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: 'Department',
      accessorKey: 'department',
      Cell: ({ row }) => (
        <TextField
          select
          variant="standard"
          value={row.original.department}
          disabled
          sx={{ select: { color: '#1C1C1C' } }}
        >
          <MenuItem value={row.original.department}>{row.original.department}</MenuItem>
        </TextField>
      ),
    },
    {
      header: 'Clinic',
      accessorKey: 'clinic',
      Cell: ({ row }) => (
        <TextField
          select
          variant="standard"
          value={row.original.clinic}
          disabled
          sx={{ select: { color: '#1C1C1C' } }}
        >
          <MenuItem value={row.original.clinic}>{row.original.clinic}</MenuItem>
        </TextField>
      ),
    },
    {
      header: 'Prefix',
      accessorKey: 'prefix',
      Cell: ({ row }) => (
        <TextField
          variant="standard"
          value={row.original.prefix}
          disabled
          sx={{ input: { color: '#1C1C1C' } }}
        />
      ),
    },
    {
      header: 'First Location in Path',
      accessorKey: 'firstLocationInPath',
      Cell: ({ row }) => {
        const availableLocations = locationOptions
        return (
          <TextField
            select
            variant="standard"
            value={editingRow === row.index ? editRowData.firstLocationInPath ?? '' : row.original.firstLocationInPath}
            disabled={editingRow !== row.index}
            onChange={(e) => setEditRowData((prev) => ({ ...prev, firstLocationInPath: e.target.value }))}
            sx={{ select: { color: '#1C1C1C' } }}
          >
            {availableLocations.map((loc) => (
              <MenuItem key={loc} value={loc}>{loc}</MenuItem>
            ))}
          </TextField>
        );
      },
    },
    {
      header: 'Actions',
      Cell: ({ row }) => {
        const rowIndex = row.index;
        const isEditing = editingRow === rowIndex;

        if (isEditing) {
          return (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => {
                  setData((prev) =>
                    prev.map((r, i) => i === rowIndex ? ({ ...r, ...editRowData } as LocationRow) : r)
                  );
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{ color: '#667085' }}
              >
                <Save />
              </IconButton>

              <IconButton
                onClick={() => {
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{ color: '#667085' }}
              >
                <Close />
              </IconButton>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => {
                  setEditingRow(rowIndex);
                  setEditRowData({ ...data[rowIndex] });
                }}
                sx={{ color: '#2FDCC7' }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        margin: 0,
        padding: 2,
        backgroundColor: '#f4f4f4',
        height: '670px',
        borderRadius: 2,
      }}
    >
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        enableSorting
        enablePagination
        enableRowActions={false}
        muiTablePaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        }}
      />
    </Box>
  );
}
