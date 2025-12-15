import React, { useEffect, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Chip, TextField, MenuItem, IconButton, Tooltip } from "@mui/material";
import { Edit, Save, Close, LocationOn, LocationOff } from "@mui/icons-material";
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
  locations: Location[];
  deptCode?: number;
  clinicCode?: number;
  pathId?: number;
}

export default function AllLocations(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch departments, clinics, and paths
        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-dept-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-clinic-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-path/get", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const depts: Department[] = deptRes.data.result.map((d: any) => ({ name: d.deptName, code: d.deptCode }));
        const cls: Clinic[] = clinicRes.data.result.map((c: any) => ({ name: c.clinicName, code: c.clinicCode }));
        const paths = pathRes.data.result;

        const mappedData: LocationRow[] = paths.map((path: any) => {
          const dept = depts.find(d => d.code === path.dept);
          const clinic = cls.find(c => c.code === path.clinic);
          return {
            name: path.pathName,
            department: dept ? dept.name : "—",
            clinic: clinic ? clinic.name : "—",
            status: path.activeYn === "Y" ? "Active" : "Inactive",
            locations: path.locations ?? [],
            deptCode: path.dept,
            clinicCode: path.clinic,
            pathId: path.pathId,
          };
        });

        setData(mappedData);
        setDepartments(depts);
        setClinics(cls);
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
      const clinic = clinics.find(c => c.name === row.clinic);

      if (!row.pathId) return;

      await axios.post(
        "http://10.99.9.20:8555/qsys/api/masters/master-path/update",
        {
          pathId: row.pathId,
          pathName: row.name,
          pathNameAr: row.name,
          dept: dept?.code,
          clinic: clinic?.code,
          activeYn: row.status === "Active" ? "Y" : "N",
          locations: row.locations ?? [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(prev => {
        const newData = [...prev];
        if (editingRow !== null) {
          newData[editingRow] = { ...prev[editingRow], ...row } as LocationRow;
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
    saveRow(rowIndex);
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
          onChange={e => setEditRowData(prev => ({ ...prev, department: e.target.value }))}
        >
          {departments.map(d => <MenuItem key={d.code} value={d.name}>{d.name}</MenuItem>)}
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
        >
          {clinics.map(c => <MenuItem key={c.code} value={c.name}>{c.name}</MenuItem>)}
        </TextField>
      ),
    },
    {
      header: "Locations",
      accessorKey: "locations",
      Cell: ({ cell, row }) => {
        const locations = editingRow === row.index ? editRowData.locations ?? [] : cell.getValue<Location[]>();
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {locations.map(loc => (
              <Chip key={loc.locationId ?? loc.locationName} label={loc.locationName} size="small" />
            ))}
          </Box>
        );
      },
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
              <IconButton onClick={() => saveRow(rowIndex)}><Save /></IconButton>
              <IconButton onClick={() => { setEditingRow(null); setEditRowData({}); }}><Close /></IconButton>
            </Box>
          );
        }

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton onClick={() => { setEditingRow(rowIndex); setEditRowData({ ...data[rowIndex] }); }}><Edit /></IconButton>
            </Tooltip>
            <Tooltip title={status === "Active" ? "Deactivate" : "Activate"}>
              <IconButton onClick={() => toggleStatus(rowIndex)}>
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
      />
    </Box>
  );
}
