import React, { useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, Chip, IconButton, TextField, Tooltip } from "@mui/material";
import { Edit, Save, Close } from "@mui/icons-material";
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

interface Location {
  locationId?: number;
  locationName: string;
  locationNameAr: string;
  pathId: number;
  activeYN: string;
  gender: string;
}

interface LocationRow {
  pathId: number;
  name: string;
  department: string;
  clinic: string;
  counters: Location[];
  clinics?: Clinic[];
}

export default function LocationCounters(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const [newCounter, setNewCounter] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-dept-list", { headers }),
          axios.get("http://10.99.9.20:8555/qsys/api/masters/master-clinic-list", { headers }),
          axios.post("http://10.99.9.20:8555/qsys/api/masters/master-path/get", { headers }),
        ]);

        const deptList: Department[] = (deptRes.data?.result || []).map((d: any) => ({
          name: d.deptName,
          code: d.deptCode,
        }));
        const clinicList: Clinic[] = (clinicRes.data?.result || []).map((c: any) => ({
          name: c.clinicName,
          code: c.clinicCode,
          deptCode: c.deptCode,
        }));

        const paths = pathRes.data?.result || [];
        const mappedData: LocationRow[] = paths.map((path: any) => {
          const dept = deptList.find((d) => d.code === path.dept);
          const clinic = clinicList.find((c) => c.code === path.clinic);

          return {
            pathId: path.pathId,
            name: path.pathName ?? "",
            department: dept ? dept.name : "—",
            clinic: clinic ? clinic.name : "—",
            counters: path.locations?.map((l: any) => ({
              locationId: l.locationId,
              locationName: l.locationName,
              locationNameAr: l.locationNameAr,
              pathId: path.pathId,
              activeYN: l.activeYN,
              gender: l.gender,
            })) || [],
            clinics: clinicList,
          };
        });

        setDepartments(deptList);
        setClinics(clinicList);
        setData(mappedData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  const handleSaveCounters = async (rowIndex: number) => {
    if (!editRowData.counters?.length) return;

    try {
      await axios.post(
        "http://10.99.9.20:8555/qsys/api/masters/master-room/update-room-by-path",
        editRowData.counters,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData((prev) =>
        prev.map((r, i) =>
          i === rowIndex ? { ...r, counters: editRowData.counters ?? r.counters } : r
        )
      );

      setEditingRow(null);
      setEditRowData({});
      setNewCounter("");
    } catch (err) {
      console.error("Failed to save counters", err);
    }
  };

  const columns: MRT_ColumnDef<LocationRow>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Department", accessorKey: "department" },
    { header: "Clinic", accessorKey: "clinic" },
    {
      header: "Counters",
      accessorKey: "counters",
      Cell: ({ row }) => {
        const rowIndex = row.index;
        const counters =
          editingRow === rowIndex ? editRowData.counters ?? [] : row.original.counters;

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {counters.map((c, idx) => (
                <Chip
                  key={c.locationId ?? idx}
                  label={c.locationName}
                  size="small"
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
                        counters: [
                          ...(prev.counters ?? []),
                          {
                            locationName: newCounter.trim(),
                            locationNameAr: newCounter.trim(),
                            pathId: row.original.pathId,
                            activeYN: "Y",
                            gender: "A",
                          },
                        ],
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
      header: "Actions",
      Cell: ({ row }) => {
        const rowIndex = row.index;
        const isEditing = editingRow === rowIndex;

        if (isEditing) {
          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => handleSaveCounters(rowIndex)}>
                <Save />
              </IconButton>
              <IconButton
                onClick={() => {
                  setEditingRow(null);
                  setEditRowData({});
                  setNewCounter("");
                }}
              >
                <Close />
              </IconButton>
            </Box>
          );
        }

        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Counters">
              <IconButton
                onClick={() => {
                  setEditingRow(rowIndex);
                  setEditRowData({ ...data[rowIndex] });
                }}
                sx={{ color: "#2FDCC7" }}
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
        width: "100%",
        minHeight: "100vh",
        padding: 2,
        backgroundColor: "#f4f4f4",
        borderRadius: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
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
          sx: {
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            width: "100%",
            flex: 1,
          },
        }}
      />
    </Box>
  );
}
