import React, { useEffect, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Box, Chip, IconButton, TextField, Tooltip } from "@mui/material";
import { Edit, Save, Close } from "@mui/icons-material";
import axios from "axios";

interface LocationRow {
  name: string;
  department: string;
  clinic: string;
  counters: string[];
  clinics?: { name: string; code: number }[];
}

export default function LocationCounters(): React.JSX.Element {
  const [data, setData] = useState<LocationRow[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Partial<LocationRow>>({});
  const [newCounter, setNewCounter] = useState("");

  const token = localStorage.getItem("token");

  // Fetch paths, departments, and clinics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, clinicRes, pathRes] = await Promise.all([
          axios.get("http://localhost:8099/qsys/api/masters/master-dept-list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8099/qsys/api/masters/master-clinic-list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8099/qsys/api/masters/master-path/get", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const departments = deptRes.data.result.map((d: any) => ({
          name: d.deptName,
          code: d.deptCode,
        }));

        const clinics = clinicRes.data.result.map((c: any) => ({
          name: c.clinicName,
          code: c.clinicCode,
        }));

        const paths = pathRes.data.result;

        const mappedData: LocationRow[] = paths.map((path: any) => {
          const dept = departments.find((d) => d.code === path.dept);
          const clinic = clinics.find((c) => c.code === path.clinic);

          return {
            name: path.pathName,
            department: dept ? dept.name : "—",
            clinic: clinic ? clinic.name : "—",
            counters: path.locations.map((l: any) => l.locationName),
            clinics,
          };
        });

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
      // Loop through counters to add new ones via API
      for (const counter of editRowData.counters) {
        if (!data[rowIndex].counters.includes(counter)) {
          // Replace with real pathId if available, here we assume rowIndex + 1 for demo
          await axios.post(
            "http://localhost:8099/qsys/api/masters/master-room/save-room-by-path",
            {
              locationName: counter,
              locationNameAr: counter,
              pathId: rowIndex + 1, // adjust to real pathId
              activeYN: "Y",
              gender: "A",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Update table locally
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
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Department",
      accessorKey: "department",
    },
    {
      header: "Clinic",
      accessorKey: "clinic",
    },
    {
      header: "Counters",
      accessorKey: "counters",
      Cell: ({ cell, row }) => {
        const rowIndex = row.index;
        const counters = editingRow === rowIndex ? editRowData.counters ?? [] : cell.getValue<string[]>();
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {counters.map((c) => (
                <Chip
                  key={c}
                  label={c}
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
                  sx={{ color: '#2FDCC7' }}
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
    <Box sx={{ margin: 0, padding: 2, backgroundColor: "#f4f4f4", height: "670px", borderRadius: 2 }}>
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
      />
    </Box>
  );
}
