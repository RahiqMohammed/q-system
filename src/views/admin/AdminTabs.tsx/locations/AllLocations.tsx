import * as React from 'react';
import { useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  Box,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Add,
  LocationOn,
  LocationOff,
  FilterList,
  Close,
  Save,
} from '@mui/icons-material';

interface LocationRow {
  name: string;
  department: string;
  clinic: string;
  counters: string[];
  status: 'Active' | 'Inactive';
}

const departmentColors: Record<string, string> = {
  Radiology: '#FFD6E0',
  Cardiology: '#E0D6FF',
  Dentistry: '#D6F0FF',
};

export default function AllLocations(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([
    {
      name: 'X-Ray',
      department: 'Radiology',
      clinic: 'Main Clinic',
      counters: ['A1', 'A2'],
      status: 'Active',
    },
    {
      name: 'Cardio',
      department: 'Cardiology',
      clinic: 'Branch Clinic',
      counters: ['B1'],
      status: 'Inactive',
    },
  ]);

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const [newCounter, setNewCounter] = useState('');

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          value={
            editingRow === row.index
              ? editRowData.name ?? ''
              : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({ ...prev, name: e.target.value }))
          }
          sx={{ input: { color: '#1C1C1C' } }}
        />
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department',
      Cell: ({ cell, row }) => (
        <TextField
          select
          variant="standard"
          value={
            editingRow === row.index
              ? editRowData.department ?? ''
              : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({ ...prev, department: e.target.value }))
          }
          sx={{ select: { color: '#1C1C1C' } }}
        >
          {['Radiology', 'Cardiology', 'Dentistry'].map((dep) => (
            <MenuItem key={dep} value={dep}>
              {dep}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: 'Clinic',
      accessorKey: 'clinic',
      Cell: ({ cell, row }) => (
        <TextField
          select
          variant="standard"
          value={
            editingRow === row.index
              ? editRowData.clinic ?? ''
              : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({ ...prev, clinic: e.target.value }))
          }
          sx={{ select: { color: '#1C1C1C' } }}
        >
          {['Main Clinic', 'Branch Clinic', 'First Aid'].map((clinic) => (
            <MenuItem key={clinic} value={clinic}>
              {clinic}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: 'Counters',
      accessorKey: 'counters',
      Cell: ({ cell, row }) => {
        const rowIndex = row.index;
        const counters =
          editingRow === rowIndex
            ? editRowData.counters ?? []
            : cell.getValue<string[]>();
        const department =
          editingRow === rowIndex
            ? editRowData.department ?? 'Radiology'
            : data[rowIndex].department;
        const color = departmentColors[department] ?? '#eee';

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {counters.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  sx={{ backgroundColor: color }}
                  onDelete={
                    editingRow === rowIndex
                      ? () =>
                          setEditRowData((prev) => ({
                            ...prev,
                            counters: prev.counters?.filter(
                              (cc) => cc !== c
                            ),
                          }))
                      : undefined
                  }
                />
              ))}
            </Box>
            {editingRow === rowIndex && (
              <TextField
                size="small"
                variant="standard"
                placeholder="Add counter"
                value={newCounter}
                onChange={(e) => setNewCounter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    if (newCounter.trim() !== '') {
                      setEditRowData((prev) => ({
                        ...prev,
                        counters: [
                          ...(prev.counters ?? []),
                          newCounter.trim(),
                        ],
                      }));
                      setNewCounter('');
                    }
                  }
                }}
                sx={{ width: 100 }}
              />
            )}
          </Box>
        );
      },
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
              backgroundColor:
                status === 'Active' ? '#CFFFEF' : '#FFD6D6',
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
                    prev.map((r, i) =>
                      i === rowIndex
                        ? ({ ...r, ...editRowData } as LocationRow)
                        : r
                    )
                  );
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{
                  color: '#667085',
                  '&:hover': { shadow: 0.5 },
                }}
              >
                <Save />
              </IconButton>

              <IconButton
                onClick={() => {
                  if (
                    editRowData.name === '' &&
                    editRowData.department === '' &&
                    editRowData.clinic === '' &&
                    (editRowData.counters?.length ?? 0) === 0
                  ) {
                    setData((prev) => prev.slice(0, -1));
                  }
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{
                  color: '#667085',
                  '&:hover': { shadow: 0.5 },
                }}
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
            <Tooltip
              title={status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              <IconButton
                onClick={() =>
                  setData((prev) =>
                    prev.map((r, i) =>
                      i === rowIndex
                        ? {
                            ...r,
                            status:
                              r.status === 'Active'
                                ? 'Inactive'
                                : 'Active',
                          }
                        : r
                    )
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
         
            {/* Search + Add Row */}
          
              {/* <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                sx={{ minWidth: 250 }}
              /> */}
              <Tooltip title="Add Row">
                <IconButton
               
                  onClick={() => {
                    const newRow: LocationRow = {
                      name: '',
                      department: '',
                      clinic: '',
                      counters: [],
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
                  <Add  />
                </IconButton>
              </Tooltip>
          
          </Box>
        )}
      />
    </Box>
  );
}
