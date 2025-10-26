import React, { useState } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Chip } from '@mui/material';

interface PathRow {
  currentPath: string;
  nextPath: string[];
  description: string;
  prefix: string;
  status: 'Active' | 'Inactive';
}

interface Props {
  data: PathRow[];
  selectedPath: string;
}
// background colors for paths
const pathColors: Record<string, string> = {
  Cardio: '#FFD6E0',
  Dental: '#E0D6FF',
  Pharmacy: '#D6F0FF',
  Lab: '#FFE5B4',
};

export default function PathTable({ data, selectedPath }: Props): React.JSX.Element {
  // const [data] = useState<PathRow[]>([
  //   { currentPath: 'Cardio', nextPath: ['Dental', 'Pharmacy'], description: 'Heart check', prefix: 'C1', status: 'Active' },
  //   { currentPath: 'Dental', nextPath: ['Pharmacy'], description: 'Tooth care', prefix: 'D1', status: 'Inactive' },
  //   { currentPath: 'Lab', nextPath: ['Cardio', 'Dental'], description: 'Lab tests', prefix: 'L1', status: 'Active' },
  // ]);

  // flatten data but mark first row to show currentPath
  const processedData = data.flatMap((row) =>
    row.nextPath.map((next, index) => ({
      currentPath: index === 0 ? row.currentPath : '', // only first row shows value
      nextPath: next,
      description: row.description,
      prefix: row.prefix,
      status: row.status,
      rowSpan: row.nextPath.length, // number of rows for merged background
    }))
  );

  const columns: MRT_ColumnDef<typeof processedData[number]>[] = [
    {
      header: 'Current Path',
      accessorKey: 'currentPath',
      Cell: ({ cell, row }) => {
        const value = cell.getValue<string>();
        if (!value) return null;

        const rowSpan = row.original.rowSpan || 1; // how many rows to cover

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
            {/* background stretched across multiple rows */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `calc(${rowSpan * 100}% + ${rowSpan - 1}px)`, // stretch + account for borders
                backgroundColor: pathColors[value] || '#eee',
                zIndex: -1,
              }}
            />
            {value}
          </Box>
        );
      },
      muiTableBodyCellProps: ({ cell }) => ({
        sx: {
          padding: 0,
          borderBottom: 'none', // remove bottom border
        },
      }),
    },
    {
      header: 'Next Path',
      accessorKey: 'nextPath',
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: pathColors[value] || '#eee',
              px: 1,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
            }}
          >
            {value}
          </Box>
        );
      },
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Prefix',
      accessorKey: 'prefix',
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
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: '#f4f4f4', borderRadius: 2 }}>
      <MaterialReactTable
        columns={columns}
        data={processedData}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        enableSorting
        enablePagination
        enableRowActions={false}
        enableGlobalFilter={false}
        muiTablePaperProps={{
          sx: { borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        }}
        muiTableBodyRowProps={({ row }) => ({
          sx: {
            '&:not(:first-of-type) td:first-of-type': {
              borderTop: 0, // remove top border for merged rows
            },
          },
        })}
      />
    </Box>
  );
}
