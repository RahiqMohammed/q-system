import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Save from '@mui/icons-material/Save';
import Close from '@mui/icons-material/Close';

interface PathRow {
  currentPath: string;
  nextPath: string[];
  description: string;
  // prefix: string;
  status: 'Active' | 'Inactive';
}

interface Props {
  data: PathRow[];
  selectedPath: string;
  allLocations: string[];
  onDataChange?: (updated: PathRow[]) => void;
}

const pathColors: Record<string, string> = {
  Cardio: '#FFD6E0',
  Dental: '#E0D6FF',
  Pharmacy: '#D6F0FF',
  Lab: '#FFE5B4',
};

export default function PathTable({
  data,
  selectedPath,
  allLocations,
  onDataChange,
}: Props) {
  const [tableData, setTableData] = useState<PathRow[]>(data);

  // Sync local tableData when parent data changes
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Editing state for a single flattened row
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editNext, setEditNext] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  // const [editPrefix, setEditPrefix] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');

  // Flatten tableData for display
  const flattened = useMemo(() => {
    return tableData.flatMap((r, rowIdx) =>
      r.nextPath.map((n, idx) => ({
        _rowKey: `${r.currentPath}-${idx}`,
        ownerCurrentPath: r.currentPath,
        ownerIndex: rowIdx,
        flatIndex: idx,
        currentPath: idx === 0 ? r.currentPath : '',
        nextPath: n,
        description: r.description,
        // prefix: r.prefix,
        status: r.status,
        ownerRow: r,
      }))
    );
  }, [tableData]);

  // Filter by selectedPath
  const displayed = useMemo(() => {
    if (!selectedPath) return flattened;
    return flattened.filter((f) => f.ownerCurrentPath === selectedPath);
  }, [flattened, selectedPath]);

  // Compute options for Next Path dropdown
  const nextOptionsForOwner = (ownerCurrentPath: string) => {
    const owner = tableData.find((r) => r.currentPath === ownerCurrentPath);
    const used = new Set(owner?.nextPath.filter(Boolean) ?? []);
    return allLocations.filter(
      (loc) => loc !== ownerCurrentPath && !used.has(loc)
    );
  };

  // Add new placeholder row
  const handleAdd = () => {
    if (!selectedPath) return;
    const updated = tableData.map((r) =>
      r.currentPath === selectedPath
        ? { ...r, nextPath: [...r.nextPath, ''] }
        : r
    );
    setTableData(updated);
    onDataChange?.(updated);

    const ownerRow = updated.find((r) => r.currentPath === selectedPath)!;
    const newIndex = ownerRow.nextPath.length - 1;
    const newKey = `${selectedPath}-${newIndex}`;
    setEditingKey(newKey);
    setEditNext(nextOptionsForOwner(selectedPath)[0] || '');
    setEditDescription(ownerRow.description);
    // setEditPrefix(ownerRow.prefix);
    setEditStatus(ownerRow.status);
  };

  const parseKey = (key: string) => {
    const parts = key.split('-');
    const idx = Number(parts.pop());
    const owner = parts.join('-');
    return { owner, idx };
  };

  const handleSave = (key: string) => {
    const { owner, idx } = parseKey(key);
    const updated = tableData.map((r) => {
      if (r.currentPath !== owner) return r;
      const next = [...r.nextPath];
      next[idx] = editNext;
      return {
        ...r,
        nextPath: next,
        description: editDescription,
        // prefix: editPrefix,
        status: editStatus,
      };
    });
    setTableData(updated);
    onDataChange?.(updated);
    setEditingKey(null);
    setEditNext('');
    setEditDescription('');
    // setEditPrefix('');
    setEditStatus('Active');
  };

  const handleCancel = (key: string) => {
    const { owner, idx } = parseKey(key);
    const updated = tableData.map((r) => {
      if (r.currentPath !== owner) return r;
      if (r.nextPath[idx] === '') {
        const newNext = r.nextPath.filter((_, i) => i !== idx);
        return { ...r, nextPath: newNext };
      }
      return r;
    });
    setTableData(updated);
    onDataChange?.(updated);
    setEditingKey(null);
    setEditNext('');
    setEditDescription('');
    // setEditPrefix('');
    setEditStatus('Active');
  };

  const columns: MRT_ColumnDef<typeof displayed[number]>[] = [
    {
      header: 'Current Path',
      accessorKey: 'currentPath',
      Cell: ({ row, cell }) => {
        const value = cell.getValue<string>();
        if (!value) return null;
        const rowSpan = row.original.ownerRow.nextPath.length;
        return (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              px: 1,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `calc(${rowSpan * 100}% + ${rowSpan - 1}px)`,
                backgroundColor: pathColors[value] || '#eee',
                zIndex: -1,
              }}
            />
            {value}
          </Box>
        );
      },
      muiTableBodyCellProps: () => ({ sx: { padding: 0, borderBottom: 'none' } }),
    },
    {
      header: 'Next Path',
      accessorKey: 'nextPath',
      Cell: ({ row }) => {
        const key = row.original._rowKey;
        const ownerCP = row.original.ownerCurrentPath;
        const isEditing = editingKey === key;
        if (isEditing) {
          const opts = nextOptionsForOwner(ownerCP);
          const existing = row.original.nextPath;
          const options =
            existing && !opts.includes(existing) ? [existing, ...opts] : opts;
          return (
            <Select
              value={editNext}
              onChange={(e) => setEditNext(e.target.value)}
              size="small"
              fullWidth
            >
              {options.map((loc) => (
                <MenuItem key={loc || 'EMPTY'} value={loc}>
                  {loc || <em>(empty)</em>}
                </MenuItem>
              ))}
            </Select>
          );
        }
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: pathColors[row.original.nextPath] || '#eee',
              px: 1,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
            }}
          >
            {row.original.nextPath}
          </Box>
        );
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
      Cell: ({ row, cell }) =>
        editingKey === row.original._rowKey ? (
          <TextField
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            size="small"
            fullWidth
          />
        ) : (
          cell.getValue<string>()
        ),
    },
    // {
    //   header: 'Prefix',
    //   accessorKey: 'prefix',
    //   Cell: ({ row, cell }) =>
    //     editingKey === row.original._rowKey ? (
    //       <TextField
    //         value={editPrefix}
    //         onChange={(e) => setEditPrefix(e.target.value)}
    //         size="small"
    //         fullWidth
    //       />
    //     ) : (
    //       cell.getValue<string>()
    //     ),
    // },
    {
      header: 'Status',
      accessorKey: 'status',
      Cell: ({ row, cell }) =>
        editingKey === row.original._rowKey ? (
          <Select
            value={editStatus}
            onChange={(e) =>
              setEditStatus(e.target.value as 'Active' | 'Inactive')
            }
            size="small"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        ) : (
          <Chip
            label={cell.getValue<'Active' | 'Inactive'>()}
            sx={{
              backgroundColor:
                cell.getValue<'Active' | 'Inactive'>() === 'Active'
                  ? '#CFFFEF'
                  : '#FFD6D6',
              color:
                cell.getValue<'Active' | 'Inactive'>() === 'Active'
                  ? '#2FDCC7'
                  : '#E53935',
              fontWeight: 600,
            }}
          />
        ),
    },
    {
      header: 'Actions',
      id: 'actions',
      Cell: ({ row }) => {
        const key = row.original._rowKey;
        if (editingKey !== key) return null;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => handleSave(key)}>
              <Save />
            </IconButton>
            <IconButton onClick={() => handleCancel(key)}>
              <Close />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: '#f4f4f4', borderRadius: 2 }}>
      <MaterialReactTable
        columns={columns}
        data={displayed}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        enableSorting
        enablePagination
        enableGlobalFilter={false}
        renderTopToolbarCustomActions={() =>
          selectedPath && (
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
                          
                           onClick={handleAdd}
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
          )
        }
        muiTablePaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        }}
        muiTableBodyRowProps={() => ({
          sx: { '&:not(:first-of-type) td:first-of-type': { borderTop: 0 } },
        })}
      />
    </Box>
  );
}
