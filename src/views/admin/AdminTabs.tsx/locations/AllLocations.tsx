import React, { useEffect, useState, useRef } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Edit, Add, Close, Save, LocationOn, LocationOff } from "@mui/icons-material";
import axios from "axios";

interface Department {
  name: string;
  code: number;
}

interface Clinic {
  name: string;
  code: number;
}

interface Location {
  locationId?: number;
  locationName: string;
  locationNameAr: string;
  activeYN: string;
  gender: string;
}

interface LocationRow {
  name: string;
  department: string;
  clinic: string;
  status: "Active" | "Inactive";
  clinics?: Clinic[];
  deptCode?: number;
  clinicCode?: number;
  pathId?: number;
  locations?: Location[];
}

export default function AllLocations(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const tableRef = useRef<any>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://localhost:8099/qsys/api/masters/master-dept-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8099/qsys/api/masters/master-clinic-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8099/qsys/api/masters/master-path/get", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const departments: Department[] = deptRes.data.result.map((d: any) => ({ name: d.deptName, code: d.deptCode }));
        const clinics: Clinic[] = clinicRes.data.result.map((c: any) => ({ name: c.clinicName, code: c.clinicCode }));

        const paths = pathRes.data.result;
        const mappedData: LocationRow[] = paths.map((path: any) => {
          const dept = departments.find(d => d.code === path.dept);
          const clinic = clinics.find(c => c.code === path.clinic);
          return {
            name: path.pathName,
            department: dept ? dept.name : "—",
            clinic: clinic ? clinic.name : "—",
            status: path.activeYn === "Y" ? "Active" : "Inactive",
            clinics,
            deptCode: path.dept,
            clinicCode: path.clinic,
            pathId: path.pathId,
            locations: path.locations ?? [],
          };
        });

        setData(mappedData);
        setDepartments(departments);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const saveRow = async (rowIndex: number) => {
    const row = editingRow !== null ? editRowData : data[rowIndex];
    if (!row?.name || !row?.department || !row?.clinic) return;

    try {
      const dept = departments.find(d => d.name === row.department);
      const clinic = row.clinics?.find(c => c.name === row.clinic);

      let pathId = row.pathId;

      if (!pathId) {
        // New row: save first to get pathId
        const res = await axios.post(
          "http://localhost:8099/qsys/api/masters/master-path/save",
          {
            pathName: row.name,
            pathNameAr: row.name,
            dept: dept?.code,
            clinic: clinic?.code,
            activeYn: "Y",
            locations: row.locations ?? [],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        pathId = res.data.result?.pathId;
      }

      // Update entire row
      await axios.post(
        "http://localhost:8099/qsys/api/masters/master-path/update",
        {
          pathId,
          pathName: row.name,
          pathNameAr: row.name,
          dept: dept?.code,
          clinic: clinic?.code,
          activeYn: row.status === "Active" ? "Y" : "N",
          locations: row.locations ?? [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRow: LocationRow = {
        ...row,
        deptCode: dept?.code,
        clinicCode: clinic?.code,
        pathId,
      } as LocationRow;

      setData(prev => {
        const newData = [...prev];
        if (editingRow !== null) {
          newData[editingRow] = updatedRow;
        } else {
          newData.push(updatedRow);
        }
        return newData;
      });

      setEditingRow(null);
      setEditRowData({});
    } catch (err) {
      console.error("Failed to save row", err);
    }
  };

  const toggleStatus = (rowIndex: number) => {
    setData(prev =>
      prev.map((r, i) =>
        i === rowIndex ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r
      )
    );
    saveRow(rowIndex); // call API to update entire row
  };

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: "Name",
      accessorKey: "name",
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          value={editingRow === row.index ? editRowData.name ?? "" : cell.getValue<string>()}
          disabled={editingRow !== row.index}
          onChange={e => setEditRowData(prev => ({ ...prev, name: e.target.value }))}
          sx={{ input: { color: "#1C1C1C" } }}
        />
      ),
    },
    {
      header: "Department",
      accessorKey: "department",
      Cell: ({ cell, row }) => (
        <TextField
          select
          variant="standard"
          value={editingRow === row.index ? editRowData.department ?? "" : cell.getValue<string>()}
          disabled={editingRow !== row.index}
          onChange={e => setEditRowData(prev => ({ ...prev, department: e.target.value, clinic: "" }))}
          sx={{ select: { color: "#1C1C1C" } }}
        >
          {departments.map(dep => <MenuItem key={dep.code} value={dep.name}>{dep.name}</MenuItem>)}
        </TextField>
      ),
    },
    {
      header: "Clinic",
      accessorKey: "clinic",
      Cell: ({ cell, row }) => (
        <TextField
          select
          variant="standard"
          value={editingRow === row.index ? editRowData.clinic ?? "" : cell.getValue<string>()}
          disabled={editingRow !== row.index}
          onChange={e => setEditRowData(prev => ({ ...prev, clinic: e.target.value }))}
          sx={{ select: { color: "#1C1C1C" } }}
        >
          {(editingRow === row.index ? editRowData.clinics ?? [] : row.original.clinics ?? []).map(c => (
            <MenuItem key={c.code} value={c.name}>{c.name}</MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      Cell: ({ row }) => (
        <Chip
          label={row.original.status}
          sx={{
            backgroundColor: row.original.status === "Active" ? "#CFFFEF" : "#FFD6D6",
            color: row.original.status === "Active" ? "#2FDCC7" : "#E53935",
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      header: "Actions",
      Cell: ({ row }) => {
        const rowIndex = row.index;
        const isEditing = editingRow === rowIndex;
        const status = data[rowIndex].status;

        if (isEditing) {
          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => saveRow(rowIndex)} sx={{ color: "#667085" }}>
                <Save />
              </IconButton>
              <IconButton onClick={() => { setEditingRow(null); setEditRowData({}); }} sx={{ color: "#667085" }}>
                <Close />
              </IconButton>
            </Box>
          );
        }

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => { setEditingRow(rowIndex); setEditRowData({ ...data[rowIndex] }); }} sx={{ color: "#2FDCC7" }}>
                <Edit />
              </IconButton>
            </Tooltip>

            <Tooltip title={status === "Active" ? "Deactivate" : "Activate"}>
              <IconButton onClick={() => toggleStatus(rowIndex)} sx={{ color: "#2FDCC7" }}>
                {status === "Active" ? <LocationOn /> : <LocationOff />}
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ margin: 0, padding: 2, backgroundColor: "#f4f4f4", borderRadius: 2 }}>
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnActions={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        enableSorting
        enablePagination
        initialState={{ pagination: { pageSize: 10, pageIndex: 0 } }}
        muiTablePaperProps={{ sx: { borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" } }}
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
                    status: 'Active',
                    clinics: data[0]?.clinics ?? [],
                    locations: [],
                  };
                  setData(prev => [...prev, newRow]);
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
                  }}              >
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    </Box>
  );
}
