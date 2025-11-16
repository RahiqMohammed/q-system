import React, { useState, useEffect } from "react";
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
import {
  Edit,
  Add,
  LocationOn,
  LocationOff,
  Close,
  Save,
} from "@mui/icons-material";
import axios from "axios";

interface Department {
  name: string;
  code: number;
}

interface Clinic {
  name: string;
  code: number;
}

interface LocationRow {
  name: string;
  department: string;
  clinic: string;
  counters: string[];
  status: "Active" | "Inactive";
  clinics?: Clinic[];
}

const departmentColors: Record<string, string> = {
  Radiology: "#FFD6E0",
  Cardiology: "#E0D6FF",
  Dentistry: "#D6F0FF",
};

const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIk1BTkFHRU1FTlQiLCJVU0VSIl0sInN1YiI6Ii0xMDAxIiwiaWF0IjoxNzYyOTQxNzAxLCJleHAiOjE3NjMwMjgxMDF9.-olNaUnpOaN3hUq4sir4QSqs925Dr8eKAW4LPSGmIjc";

export default function AllLocations(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const [newCounter, setNewCounter] = useState("");

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8099/qsys/api/masters/master-dept-list",
          { headers: { Authorization: AUTH_TOKEN } }
        );
        const deptArray = res.data.result.map((dep: any) => ({
          name: dep.deptName,
          code: dep.deptCode,
        }));
        setDepartments(deptArray);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8099/qsys/api/masters/master-locations-list",
          { headers: { Authorization: AUTH_TOKEN } }
        );
        const locations: LocationRow[] =
          res.data.result?.map((loc: any) => ({
            name: loc.name,
            department: loc.department,
            clinic: loc.clinic,
            counters: loc.counters || [],
            status: loc.status === "Active" ? "Active" : "Inactive",
            clinics: [],
          })) || [];
        setData(locations);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // Fetch clinics based on department
  useEffect(() => {
    const fetchClinics = async () => {
      if (!editRowData.department) return;
      try {
        const dep = departments.find((d) => d.name === editRowData.department);
        if (!dep) return;

        const res = await axios.get(
          `http://localhost:8099/qsys/api/masters/master-clinic-list?depId=${dep.code}`,
          { headers: { Authorization: AUTH_TOKEN } }
        );
        const clinicArray = res.data.result.map((c: any) => ({
          name: c.clinicName,
          code: c.clinicCode,
        }));
        setEditRowData((prev) => ({ ...prev, clinics: clinicArray }));
      } catch (err) {
        console.error("Failed to fetch clinics:", err);
      }
    };
    fetchClinics();
  }, [editRowData.department, departments]);

  const columns: MRT_ColumnDef<LocationRow>[] = [
    {
      header: "Name",
      accessorKey: "name",
      Cell: ({ cell, row }) => (
        <TextField
          variant="standard"
          value={
            editingRow === row.index ? editRowData.name ?? "" : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({ ...prev, name: e.target.value }))
          }
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
          value={
            editingRow === row.index ? editRowData.department ?? "" : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({
              ...prev,
              department: e.target.value,
              clinic: "",
            }))
          }
          sx={{ select: { color: "#1C1C1C" } }}
        >
          {departments.map((dep) => (
            <MenuItem key={dep.code} value={dep.name}>
              {dep.name}
            </MenuItem>
          ))}
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
          value={
            editingRow === row.index ? editRowData.clinic ?? "" : cell.getValue<string>()
          }
          disabled={editingRow !== row.index}
          onChange={(e) =>
            setEditRowData((prev) => ({ ...prev, clinic: e.target.value }))
          }
          sx={{ select: { color: "#1C1C1C" } }}
        >
          {(editingRow === row.index ? editRowData.clinics ?? [] : []).map((clinic) => (
            <MenuItem key={clinic.code} value={clinic.name}>
              {clinic.name}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      header: "Counters",
      accessorKey: "counters",
      Cell: ({ cell, row }) => {
        const rowIndex = row.index;
        const counters =
          editingRow === rowIndex ? editRowData.counters ?? [] : cell.getValue<string[]>();
        const department =
          editingRow === rowIndex
            ? editRowData.department ?? "Radiology"
            : data[rowIndex].department;
        const color = departmentColors[department] ?? "#eee";

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
                            counters: prev.counters?.filter((cc) => cc !== c),
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
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    if (newCounter.trim() !== "") {
                      setEditRowData((prev) => ({
                        ...prev,
                        counters: [...(prev.counters ?? []), newCounter.trim()],
                      }));
                      setNewCounter("");
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
      header: "Status",
      accessorKey: "status",
      Cell: ({ cell }) => {
        const status = cell.getValue<"Active" | "Inactive">();
        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: status === "Active" ? "#CFFFEF" : "#FFD6D6",
              color: status === "Active" ? "#2FDCC7" : "#E53935",
              fontWeight: 600,
            }}
          />
        );
      },
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
              <IconButton
                onClick={() => {
                  setData((prev) =>
                    prev.map((r, i) =>
                      i === rowIndex ? ({ ...r, ...editRowData } as LocationRow) : r
                    )
                  );
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{ color: "#667085" }}
              >
                <Save />
              </IconButton>

              <IconButton
                onClick={() => {
                  if (
                    editRowData.name === "" &&
                    editRowData.department === "" &&
                    editRowData.clinic === "" &&
                    (editRowData.counters?.length ?? 0) === 0
                  ) {
                    setData((prev) => prev.slice(0, -1));
                  }
                  setEditingRow(null);
                  setEditRowData({});
                }}
                sx={{ color: "#667085" }}
              >
                <Close />
              </IconButton>
            </Box>
          );
        }

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => {
                  setEditingRow(rowIndex);
                  setEditRowData({ ...data[rowIndex], clinics: [] });
                }}
                sx={{ color: "#2FDCC7" }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title={status === "Active" ? "Deactivate" : "Activate"}>
              <IconButton
                onClick={() =>
                  setData((prev) =>
                    prev.map((r, i) =>
                      i === rowIndex
                        ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" }
                        : r
                    )
                  )
                }
                sx={{ color: "#2FDCC7" }}
              >
                {status === "Active" ? <LocationOn /> : <LocationOff />}
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
        backgroundColor: "#f4f4f4",
        height: "670px",
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
          sx: { borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
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
                    name: "",
                    department: "",
                    clinic: "",
                    counters: [],
                    status: "Active",
                    clinics: [],
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
