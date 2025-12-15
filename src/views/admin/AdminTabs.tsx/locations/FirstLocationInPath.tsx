import React, { useEffect, useMemo, useState } from "react";
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
import { Add, Edit, Save, Close, LocationOn, LocationOff } from "@mui/icons-material";
import axios from "axios";

interface Department {
  deptName: string;
  deptCode: number;
}

interface Clinic {
  clinicName: string;
  clinicCode: number;
  deptCode: number;
}

interface PathLocation {
  locationId: number;
  locationName: string;
  pathId: number;
}

interface RowType {
  pathId?: number;
  department: string;
  departmentCode?: number;
  clinic: string;
  clinicCode?: number;
  prefix: string;
  firstLocation: string;
  locationId?: number;
  status: "Active" | "Inactive";
}

export default function FirstLocationInPath(): React.JSX.Element {
  const [data, setData] = useState<RowType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [locations, setLocations] = useState<PathLocation[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<RowType>>({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Fetch all departments and clinics
        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-dept-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-clinic-list", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://10.99.9.20:8555/qsys/api/masters/first-path/get", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setDepartments(deptRes.data.result || []);
        setClinics(clinicRes.data.result || []);

        // Extract table data
        const rows: RowType[] = (pathRes.data.result || []).map((p: any) => ({
          pathId: p.pathId,
          prefix: p.pathName,
          departmentCode: p.dept,
          department: deptRes.data.result.find((d: Department) => d.deptCode === p.dept)?.deptName ?? "",
          clinicCode: p.clinic,
          clinic: clinicRes.data.result.find((c: Clinic) => c.clinicCode === p.clinic)?.clinicName ?? "",
          firstLocation: p.locations?.[0]?.locationName ?? "",
          locationId: p.locations?.[0]?.locationId,
          status: p.activeYn === "Y" ? "Active" : "Inactive",
        }));

        setData(rows);

        // Flatten all locations with pathId for filtering later
        const allLocations: PathLocation[] = [];
        (pathRes.data.result || []).forEach((p: any) => {
          (p.locations || []).forEach((l: any) => {
            allLocations.push({ locationId: l.locationId, locationName: l.locationName, pathId: p.pathId });
          });
        });
        setLocations(allLocations);

      } catch (err) {
        console.error("Load error", err);
      }
    };
    loadAll();
  }, [token]);

 const saveRow = async (rowIndex: number) => {
  const row = editingRow !== null ? (editRowData as RowType) : data[rowIndex];
  if (!row) return;

  const payload = {
    pathId: row.pathId ?? 0,
    pathName: row.prefix,
    pathNameAr: row.prefix,
    dept: row.departmentCode,
    clinic: row.clinicCode,
    activeYn: row.status === "Active" ? "Y" : "N",
    locations: [
      {
        locationId: row.locationId,
        locationName: row.firstLocation,
        locationNameAr: row.firstLocation,
        activeYN: "Y",
        gender: "A",
      },
    ],
  };

  try {
    await axios.post(
      "http://10.99.9.20:8555/qsys/api/masters/first-path/save",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setData((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, ...row } : r))
    );

    setEditingRow(null);
    setEditRowData({});
  } catch (err) {
    console.error("Save failed", err);
  }
};


  const toggleStatus = async (rowIndex: number) => {
    const curr = data[rowIndex];
    if (!curr) return;
    const newStatus = curr.status === "Active" ? "Inactive" : "Active";

    setData((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, status: newStatus } : r)));

    const payload = {
      pathId: curr.pathId,
      pathName: curr.prefix,
      pathNameAr: curr.prefix,
      dept: curr.departmentCode,
      clinic: curr.clinicCode,
      activeYn: newStatus === "Active" ? "Y" : "N",
      locations: [
        {
          locationId: curr.locationId,
          locationName: curr.firstLocation,
          locationNameAr: curr.firstLocation,
          activeYN: "Y",
          gender: "A",
        },
      ],
    };

    try {
      await axios.post("http://10.99.9.20:8555/qsys/api/masters/master-path/update", payload, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      setData((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, status: curr.status } : r)));
      console.error("Toggle failed", err);
    }
  };

  const addNewRow = () => {
    const newRow: RowType = { pathId: 0, department: "", clinic: "", prefix: "", firstLocation: "", locationId: undefined, status: "Active" };
    setData((prev) => [...prev, newRow]);
    setEditingRow(data.length);
    setEditRowData(newRow);
  };

  const columns = useMemo<MRT_ColumnDef<RowType>[]>(() => [
    {
      header: "Department",
      accessorKey: "department",
      Cell: ({ cell, row }) => (
        <TextField
          select
          variant="standard"
          disabled={editingRow !== row.index}
          value={editingRow === row.index ? editRowData.department ?? "" : cell.getValue<string>()}
          onChange={(e) => {
            const selectedName = e.target.value;
            const dept = departments.find((d) => d.deptName === selectedName);
            setEditRowData({ ...editRowData, department: selectedName, departmentCode: dept?.deptCode, clinic: "", clinicCode: undefined });
          }}
          sx={{ minWidth: 160 }}
        >
          {departments.map((d) => (<MenuItem key={d.deptCode} value={d.deptName}>{d.deptName}</MenuItem>))}
        </TextField>
      ),
    },
    {
      header: "Clinic",
      accessorKey: "clinic",
      Cell: ({ cell, row }) => {
        // filter clinics by selected department
        const deptCode = editRowData.departmentCode ?? row.original.departmentCode;
        const filteredClinics = clinics.filter(c => c.deptCode === deptCode);
        return (
          <TextField
            select
            variant="standard"
            disabled={editingRow !== row.index}
            value={editingRow === row.index ? editRowData.clinic ?? "" : cell.getValue<string>()}
            onChange={(e) => {
              const selectedName = e.target.value;
              const clinicObj = clinics.find(c => c.clinicName === selectedName);
              setEditRowData({ ...editRowData, clinic: selectedName, clinicCode: clinicObj?.clinicCode });
            }}
            sx={{ minWidth: 160 }}
          >
            {filteredClinics.map(c => (<MenuItem key={c.clinicCode} value={c.clinicName}>{c.clinicName}</MenuItem>))}
          </TextField>
        );
      },
    },
    {
      header: "Prefix",
      accessorKey: "prefix",
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          disabled={editingRow !== row.index}
          value={editingRow === row.index ? editRowData.prefix ?? "" : cell.getValue<string>()}
          onChange={(e) => setEditRowData({ ...editRowData, prefix: e.target.value })}
          sx={{ minWidth: 120 }}
        />
      ),
    },
    {
      header: "First Location in Path",
      accessorKey: "firstLocation",
      Cell: ({ cell, row }) => {
        const pathId = row.original.pathId;
        const filteredLocations = locations.filter(l => l.pathId === pathId);
        return (
          <TextField
            select
            variant="standard"
            disabled={editingRow !== row.index}
            value={editingRow === row.index ? editRowData.firstLocation ?? "" : cell.getValue<string>()}
            onChange={(e) => {
              const sel = locations.find(l => l.locationName === e.target.value && l.pathId === pathId);
              setEditRowData({ ...editRowData, firstLocation: e.target.value, locationId: sel?.locationId });
            }}
            sx={{ minWidth: 200 }}
          >
            {filteredLocations.map(l => (<MenuItem key={l.locationId} value={l.locationName}>{l.locationName}</MenuItem>))}
          </TextField>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      enableEditing: false,
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
              <IconButton onClick={() => saveRow(rowIndex)}><Save /></IconButton>
              <IconButton onClick={() => { setEditingRow(null); setEditRowData({}); }}><Close /></IconButton>
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
  ], [departments, clinics, locations, editingRow, editRowData, data]);

  return (
    <Box sx={{ p: 2, backgroundColor: "#f4f4f4", borderRadius: 2 }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1, alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Add">
              <IconButton onClick={addNewRow} sx={{ borderRadius: 1, width: "1em", height: "1em", backgroundColor: "#667085", color: "#fff", "&:hover": { backgroundColor: "#50566a" } }}>
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />
    </Box>
  );
}
