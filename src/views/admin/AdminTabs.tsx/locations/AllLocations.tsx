import React, { useEffect, useState } from "react";
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
  deptCode: number;
}

interface LocationRow {
  pathName: string;
  pathNameAr?: string;
  department: string;
  clinic: string;
  status: "Active" | "Inactive";
  clinics?: Clinic[];
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
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://localhost:8099/qsys/api/masters/master-dept-list", { headers }),
          axios.get("http://localhost:8099/qsys/api/masters/master-clinic-list", { headers }),
          axios
            .post("http://localhost:8099/qsys/api/masters/master-path/get", { headers })
            .catch(() => ({ data: { result: [] } })),
        ]);

        const deptList: Department[] = (deptRes.data?.result || []).map((d: any) => ({
          name: d.deptName,
          code: d.deptCode,
        }));

        const clinicList: Clinic[] = (clinicRes.data?.result || []).map((c: any) => ({
          name: c.clinicName,
          code: c.clinicCode,
          deptCode: c.deptCode, // important for filtering
        }));

        const paths = pathRes.data?.result || [];
        const mappedData: LocationRow[] = paths.map((path: any) => {
          const dept = deptList.find(d => d.code === path.dept);
          const clinic = clinicList.find(c => c.code === path.clinic);
          return {
            pathName: path.pathName ?? "",
            pathNameAr: path.pathNameAr ?? "",
            department: dept ? dept.name : "",
            clinic: clinic ? clinic.name : "",
            status: path.activeYn === "Y" ? "Active" : "Inactive",
            clinics: clinicList,
            deptCode: path.dept,
            clinicCode: path.clinic,
            pathId: path.pathId,
          } as LocationRow;
        });

        setData(mappedData);
        setDepartments(deptList);
        setClinics(clinicList);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const saveRow = async (rowIndex: number, rowData?: LocationRow) => {
    const row = rowData ?? (editingRow !== null ? (editRowData as LocationRow) : data[rowIndex]);
    if (!row) return;
    if (!row.pathName || !row.department || !row.clinic) return;

    try {
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const dept = departments.find(d => d.name === row.department);
      const clinic = clinics.find(c => c.name === row.clinic);

      if (!dept?.code || !clinic?.code) return;

      const payload: any = {
        pathName: row.pathName,
        pathNameAr: row.pathNameAr ?? row.pathName,
        dept: dept.code,
        clinic: clinic.code,
        activeYn: row.status === "Active" ? "Y" : "N",
      };
      if (row.pathId && row.pathId > 0) payload.pathId = row.pathId;

      if (row.pathId && row.pathId > 0) {
        await axios.post(
          "http://localhost:8099/qsys/api/masters/master-path/update",
          payload,
          { headers }
        );
      } else {
        const createRes = await axios.post(
          "http://localhost:8099/qsys/api/masters/master-path/save",
          payload,
          { headers }
        );
        const newId = createRes?.data?.result?.pathId;
        if (newId) payload.pathId = newId;
      }

      setData(prev => {
        const newData = [...prev];
        newData[rowIndex] = { ...newData[rowIndex], ...row, pathId: payload.pathId ?? row.pathId } as LocationRow;
        return newData;
      });

      setEditingRow(null);
      setEditRowData({});
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (rowIndex: number) => {
    const current = data[rowIndex];
    if (!current) return;

    const newStatus: "Active" | "Inactive" = current.status === "Active" ? "Inactive" : "Active";
    const updatedRow: LocationRow = { ...current, status: newStatus };

    setData(prev => prev.map((r, i) => (i === rowIndex ? updatedRow : r)));
    saveRow(rowIndex, updatedRow);
  };

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: "English Name",
      accessorKey: "pathName",
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          value={editingRow === row.index ? editRowData.pathName ?? "" : cell.getValue<string>()}
          disabled={editingRow !== row.index}
          onChange={e => setEditRowData(prev => ({ ...prev, pathName: e.target.value }))}
        />
      ),
    },
    {
      header: "Arabic Name",
      accessorKey: "pathNameAr",
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          value={editingRow === row.index ? editRowData.pathNameAr ?? "" : cell.getValue<string>()}
          disabled={editingRow !== row.index}
          onChange={e => setEditRowData(prev => ({ ...prev, pathNameAr: e.target.value }))}
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
        >
          {departments.map(dep => (
            <MenuItem key={dep.code} value={dep.name}>{dep.name}</MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: "Clinic",
      accessorKey: "clinic",
      Cell: ({ row }) => {
        const isEditing = editingRow === row.index;
        const selectedDeptName = isEditing ? editRowData.department : row.original.department;
        const selectedDeptCode = departments.find(d => d.name === selectedDeptName)?.code;
        const filteredClinics = selectedDeptCode ? clinics.filter(c => c.deptCode === selectedDeptCode) : clinics;

        return (
          <TextField
            select
            variant="standard"
            value={isEditing ? editRowData.clinic ?? "" : row.original.clinic}
            disabled={!isEditing}
            onChange={e => setEditRowData(prev => ({ ...prev, clinic: e.target.value }))}
          >
            {filteredClinics.map(c => (
              <MenuItem key={c.code} value={c.name}>{c.name}</MenuItem>
            ))}
          </TextField>
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
        const status = data[rowIndex]?.status ?? "Inactive";

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
                                      >            <Tooltip title="Add Row">
              <IconButton
                onClick={() => {
                  const newRow: LocationRow = {
                    pathName: "",
                    pathNameAr: "",
                    department: departments[0]?.name || "",
                    clinic: "",
                    status: "Active",
                    clinics: clinics,
                  };
                  setData(prev => {
                    const newData = [...prev, newRow];
                    setEditingRow(newData.length - 1);
                    setEditRowData(newRow);
                    return newData;
                  });
                }}
                sx={{
                  borderRadius: 1,
                  width: "1em",
                  height: "1em",
                  backgroundColor: "#667085",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#50566a" },
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
