import React, { useState } from "react";
import {
FormControl,
Select,
MenuItem,
Box,
Button,
Typography,
Checkbox,
ListItemText,
Chip,
FormHelperText,
Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// 12 counters, each with 1 current + 5 next patients
const countersData = [
{
id: 1,
name: "Radiology - Room 1",
currentPatient: { prefix: "R", number: 101, name: "أحمد علي" },
nextPatients: [
{ prefix: "R", number: 102, name: "محمد سالم" },
{ prefix: "R", number: 103, name: "عائشة سعيد" },
{ prefix: "R", number: 104, name: "هند عبدالله" },
{ prefix: "R", number: 105, name: "سعيد علي" },
{ prefix: "R", number: 106, name: "منى خالد" },
],
},
{ id: 2, name: "Pharmacy - Window 1", currentPatient: { prefix: "P", number: 201, name: "رحيق الحضرمي" }, nextPatients: [{ prefix: "P", number: 202, name: "عبدالعزيز خميس" }, { prefix: "P", number: 203, name: "منى سالم" }, { prefix: "P", number: 204, name: "هالة يوسف" }, { prefix: "P", number: 205, name: "خالد أحمد" }, { prefix: "P", number: 206, name: "سارة علي" }] },
{ id: 3, name: "Billing - Counter 1", currentPatient: { prefix: "B", number: 301, name: "عبدالله ناصر" }, nextPatients: [{ prefix: "B", number: 302, name: "هند علي" }, { prefix: "B", number: 303, name: "سعيد حمد" }, { prefix: "B", number: 304, name: "علياء سالم" }, { prefix: "B", number: 305, name: "رامي خالد" }, { prefix: "B", number: 306, name: "مها سعيد" }] },
{ id: 4, name: "Laboratory - Sample Desk", currentPatient: { prefix: "L", number: 401, name: "سارة محمد" }, nextPatients: [{ prefix: "L", number: 402, name: "يوسف سالم" }, { prefix: "L", number: 403, name: "منى عبدالله" }, { prefix: "L", number: 404, name: "طارق علي" }, { prefix: "L", number: 405, name: "ليلى خالد" }, { prefix: "L", number: 406, name: "هشام سعيد" }] },
{ id: 5, name: "Consultation - Room 2", currentPatient: { prefix: "C", number: 501, name: "محمد حسن" }, nextPatients: [{ prefix: "C", number: 502, name: "ليلى يوسف" }, { prefix: "C", number: 503, name: "سالم علي" }, { prefix: "C", number: 504, name: "أميرة خالد" }, { prefix: "C", number: 505, name: "عبدالله سالم" }, { prefix: "C", number: 506, name: "هند علي" }] },
{ id: 6, name: "Cardiology - Room 3", currentPatient: { prefix: "CA", number: 601, name: "علي محمود" }, nextPatients: [{ prefix: "CA", number: 602, name: "ليلى حسن" }, { prefix: "CA", number: 603, name: "سعيد سالم" }, { prefix: "CA", number: 604, name: "منى يوسف" }, { prefix: "CA", number: 605, name: "طارق خالد" }, { prefix: "CA", number: 606, name: "هالة علي" }] },
{ id: 7, name: "Dermatology - Room 4", currentPatient: { prefix: "D", number: 701, name: "مها سالم" }, nextPatients: [{ prefix: "D", number: 702, name: "رائد يوسف" }, { prefix: "D", number: 703, name: "سارة خالد" }, { prefix: "D", number: 704, name: "علياء حسن" }, { prefix: "D", number: 705, name: "هشام سالم" }, { prefix: "D", number: 706, name: "منى عبد الله" }] },
{ id: 8, name: "ENT - Room 5", currentPatient: { prefix: "E", number: 801, name: "أحمد خالد" }, nextPatients: [{ prefix: "E", number: 802, name: "ليلى علي" }, { prefix: "E", number: 803, name: "سعيد محمود" }, { prefix: "E", number: 804, name: "منى يوسف" }, { prefix: "E", number: 805, name: "طارق علي" }, { prefix: "E", number: 806, name: "هالة سالم" }] },
{ id: 9, name: "Ophthalmology - Room 6", currentPatient: { prefix: "O", number: 901, name: "علي محمد" }, nextPatients: [{ prefix: "O", number: 902, name: "ليلى خالد" }, { prefix: "O", number: 903, name: "سعيد علي" }, { prefix: "O", number: 904, name: "منى يوسف" }, { prefix: "O", number: 905, name: "طارق سالم" }, { prefix: "O", number: 906, name: "هالة علي" }] },
{ id: 10, name: "Surgery - Room 7", currentPatient: { prefix: "S", number: 1001, name: "سامر خالد" }, nextPatients: [{ prefix: "S", number: 1002, name: "ليلى يوسف" }, { prefix: "S", number: 1003, name: "علي حسن" }, { prefix: "S", number: 1004, name: "هالة خالد" }, { prefix: "S", number: 1005, name: "رامي سعيد" }, { prefix: "S", number: 1006, name: "منى أحمد" }] },
{ id: 11, name: "Pediatrics - Room 8", currentPatient: { prefix: "P", number: 1101, name: "ليلى سالم" }, nextPatients: [{ prefix: "P", number: 1102, name: "سالم محمود" }, { prefix: "P", number: 1103, name: "هند خالد" }, { prefix: "P", number: 1104, name: "طارق يوسف" }, { prefix: "P", number: 1105, name: "منى حسن" }, { prefix: "P", number: 1106, name: "سعيد علي" }] },
{ id: 12, name: "Neurology - Room 9", currentPatient: { prefix: "N", number: 1201, name: "هشام خالد" }, nextPatients: [{ prefix: "N", number: 1202, name: "ليلى سالم" }, { prefix: "N", number: 1203, name: "محمد سعيد" }, { prefix: "N", number: 1204, name: "منى يوسف" }, { prefix: "N", number: 1205, name: "طارق خالد" }, { prefix: "N", number: 1206, name: "هالة علي" }] },
];

export default function TVCountersSelection() {
const navigate = useNavigate();
const [selectedCounters, setSelectedCounters] = useState<string[]>([]);

const handleChange = (event: any) => {
const value = event.target.value as string[];
if (value.includes("all")) {
setSelectedCounters(
selectedCounters.length === countersData.length
? []
: countersData.map((c) => c.name)
);
} else {
setSelectedCounters(value);
}
};

const isAllSelected = selectedCounters.length === countersData.length;

const handleContinue = () => {
const selectedData = countersData.filter((c) =>
selectedCounters.includes(c.name)
);
navigate("/tv/tv-screen", { state: { countersData: selectedData } });
};

return (
<Box
sx={{
width: "100%",
minHeight: "100vh",
backgroundColor: "#1A1A2E",
p: 5,
display: "flex",
flexDirection: "column",
gap: 3,
}}
>
<Typography
variant="h3"
sx={{ color: "#2FDCC7", fontWeight: "bold" }}
>
Al Shifaa Hospital </Typography>
<Typography
variant="h5"
sx={{ color: "#FFFFFF", mb: 2 }}
>
Select Counters to Display on TV </Typography>


  <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "#2C2B52" }}>
    <FormControl sx={{ width: "100%" }}>
      <Select
        multiple
        displayEmpty
        value={selectedCounters}
        onChange={handleChange}
        renderValue={(selected) => {
          if (!selected.length) return <em style={{ color: "#999" }}>Select Counters</em>;
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} sx={{ backgroundColor: "#2FDCC7", color: "#1A1A2E" }} />
              ))}
            </Box>
          );
        }}
        sx={{ backgroundColor: "#fff", borderRadius: 2 }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 400 } } }}
      >
        <MenuItem value="all">
          <Checkbox checked={isAllSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>
        {countersData.map((counter) => (
          <MenuItem key={counter.id} value={counter.name}>
            <Checkbox checked={selectedCounters.includes(counter.name)} />
            <ListItemText primary={counter.name} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText sx={{ color: "#FFF" }}>
        Maximum counters per TV: 12
      </FormHelperText>
    </FormControl>
  </Paper>

  <Button
    variant="contained"
    sx={{
      mt: 3,
      backgroundColor: "#2FDCC7",
      color: "#1A1A2E",
      fontWeight: "bold",
      "&:hover": { backgroundColor: "#28CBB6" },
    }}
    onClick={handleContinue}
  >
    Continue
  </Button>
</Box>


);
}
