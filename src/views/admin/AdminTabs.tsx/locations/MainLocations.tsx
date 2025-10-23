import * as React from 'react';
import { useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
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
  Add,
  LocationOn,
  LocationOff,
  Close,
  Save,
} from '@mui/icons-material';

interface LocationRow {
  name: string;
  department: string;
  clinic: string;
  prefix: string;
  status: 'Active' | 'Inactive';
}

const locationOptions = ['X-Ray', 'Cardio', 'Dentistry', 'Lab'];
const departmentOptions = ['Radiology', 'Cardiology', 'Dentistry'];
const clinicOptions = ['Main Clinic', 'Branch Clinic', 'First Aid'];

export default function MainLocations(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([
    { name: 'X-Ray', department: 'Radiology', clinic: 'Main Clinic', prefix: 'XR', status: 'Active' },
    { name: 'Cardio', department: 'Cardiology', clinic: 'Branch Clinic', prefix: 'CR', status: 'Inactive' },
  ]);

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      Cell: ({ row }) => (
        <TextField
          select
          variant="standard"
          value={editingRow === row.index ? editRowData.name ?? '' : row.original.name}
          disabled={editingRow !== row.index}
          onChange={(e) => setEditRowData((prev) => ({ ...prev, name: e.target.value }))}
          sx={{ select: { color: '#1C1C1C' } }}
        >
          {locationOptions.map((loc) => (
            <MenuItem key={loc} value={loc}>{loc}</MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department',
      Cell: ({ row }) => (
        <TextField
          select
          variant="standard"
          value={editingRow === row.index ? editRowData.department ?? '' : row.original.department}
          disabled={editingRow !== row.index}
          onChange={(e) => setEditRowData((prev) => ({ ...prev, department: e.target.value }))}
          sx={{ select: { color: '#1C1C1C' } }}
        >
          {departmentOptions.map((dep) => (
            <MenuItem key={dep} value={dep}>{dep}</MenuItem>
          ))}
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
          value={editingRow === row.index ? editRowData.clinic ?? '' : row.original.clinic}
          disabled={editingRow !== row.index}
          onChange={(e) => setEditRowData((prev) => ({ ...prev, clinic: e.target.value }))}
          sx={{ select: { color: '#1C1C1C' } }}
        >
          {clinicOptions.map((clinic) => (
            <MenuItem key={clinic} value={clinic}>{clinic}</MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: 'Prefix',
      accessorKey: 'prefix',
      Cell: ({ row }) => (
        <TextField
          variant="standard"
          value={editingRow === row.index ? editRowData.prefix ?? '' : row.original.prefix}
          disabled={editingRow !== row.index}
          onChange={(e) => setEditRowData((prev) => ({ ...prev, prefix: e.target.value }))}
          sx={{ input: { color: '#1C1C1C' } }}
        />
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      Cell: ({ cell }) => {
        const status = cell.getValue<'Active' | 'Inactive'>();
        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: status === 'Active' ? '#CFFFEF' : '#FFD6D6',
              color: status === 'Active' ? '#2FDCC7' : '#E53935',
              fontWeight: 600,
            }}
          />
        );
      },
    },
    {
      header: 'Actions',
      Cell: ({ row }) => {
        const rowIndex = row.index;
        const isEditing = editingRow === rowIndex;
        const status = data[rowIndex].status;

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
                  if (!editRowData.name && !editRowData.department && !editRowData.clinic && !editRowData.prefix) {
                    setData((prev) => prev.slice(0, -1));
                  }
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

            <Tooltip title={status === 'Active' ? 'Deactivate' : 'Activate'}>
              <IconButton
                onClick={() =>
                  setData((prev) =>
                    prev.map((r, i) => i === rowIndex ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r)
                  )
                }
                sx={{ color: '#2FDCC7' }}
              >
                {status === 'Active' ? <LocationOn /> : <LocationOff />}
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
        renderTopToolbarCustomActions={() => (
              <Box
                      sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: 1,
              alignItems: 'center',
              gap: 0.5,
              height: '100%',      // fill parent's height
              flexGrow: 1,         // grow to fill available horizontal space
            }}
                    >
            <Tooltip title="Add Row">
              <IconButton
                onClick={() => {
                  const newRow: LocationRow = {
                    name: '',
                    department: '',
                    clinic: '',
                    prefix: '',
                    status: 'Active',
                  };
                  setData((prev) => [...prev, newRow]);
                  setEditingRow(data.length);
                  setEditRowData(newRow);
                }}
                  sx={{
                    borderRadius: 1,
                    width: "1em",
                    height: "1em",
                 
                 
                    backgroundColor: '#667085',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#50566a' },
                  }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    </Box>
  );
}
