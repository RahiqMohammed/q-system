import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const initialUpcoming = [
  {
    token: "GD115",
    name: "Fathiya Khalfan Al Busaidi",
    pid: "12821171",
    gender: "female",
    pausedFor: "00:12:05",
  },
  {
    token: "GD116",
    name: "Sara Said Al Balushi",
    pid: "345628",
    gender: "female",
    pausedFor: "00:14:09",
  },
  {
    token: "GD117",
    name: "Habib Sultan Al Ismaili",
    pid: "938271",
    gender: "male",
    pausedFor: "00:23:40",
  },
  {
    token: "GD118",
    name: "Thabit Said Al Fuliti",
    pid: "849009",
    gender: "male",
    pausedFor: "00:41:55",
  },
];

export default function UserQueue() {
  const [paused, setPaused] = useState([]);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [current, setCurrent] = useState({
    token: "GD114",
    name: "Fathiya Khalfan Al Busaidi",
    pid: "12821171",
    gender: "female",
    arrivedSince: "00:12:05",
    from: "upcoming", // track source
  });
  const [actionDone, setActionDone] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const genderColor = (gender) => (gender === "female" ? "#f3c3e1" : "#b8e7f6");

  const handlePause = () => {
    if (!current) return;
    setPaused([...paused, { ...current, pausedFor: "00:00:00", from: "paused" }]);
    setCurrent(null);
    setActionDone(true);
  };

  // ✅ Smart Skip Logic
  const handleSkip = () => {
    if (!current) return;
    if (current.from === "paused") {
      setPaused([...paused, current]);
    } else {
      setUpcoming([...upcoming, current]);
    }
    setCurrent(null);
    setActionDone(true);
  };

  const handleFinish = () => {
    if (!current) return;
    setCurrent(null);
    setActionDone(true);
  };

  const handleNext = () => {
    if (upcoming.length === 0) return;
    const [next, ...rest] = upcoming;
    setCurrent({ ...next, from: "upcoming" });
    setUpcoming(rest);
    setActionDone(false);
  };

  const handleReplay = (index) => {
    const patient = paused[index];
    if (!patient) return;
    if (!current) {
      setCurrent({ ...patient, from: "paused" });
      setPaused(paused.filter((_, i) => i !== index));
      setActionDone(false);
    }
  };

  const handleSendToClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSendToSelect = (destination) => {
    console.log(`Sent to ${destination}`);
    setAnchorEl(null);
    setCurrent(null);
    setActionDone(true);
  };

  const handleSendToClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", height: "100vh", m: 0, p: 0 }}>
      {/* Top bar */}
      <Box sx={{ backgroundColor: "#3f2d73", height: 40 }} />

      {/* Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          height: "calc(100vh - 40px)",
          p: 2,
        }}
      >
        {/* Left - Paused Queue */}
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1, overflowY: "auto" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Paused Queue
            </Typography>
            {paused.map((p, i) => (
              <React.Fragment key={i}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: genderColor(p.gender), mr: 1.5 }}>
                      {p.gender === "female" ? <WomanIcon /> : <ManIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {p.token}
                      </Typography>
                      <Typography variant="body2">{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`P.I.D ${p.pid} | Paused for ${p.pausedFor}`}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => handleReplay(i)}>
                    <ReplayIcon color="primary" />
                  </IconButton>
                </Box>
                {i < paused.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>

        {/* Center - Current Token */}
        <Card
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Current Token
            </Typography>

            {current ? (
              <Box
                sx={{
                  border: "2px solid #ccc",
                  borderRadius: 2,
                  p: 4,
                  mb: 3,
                  minWidth: 250,
                }}
              >
                <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                  {current.token}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {current.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`P.I.D ${current.pid}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {`Arrived Since ${current.arrivedSince}`}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 6,
                  mb: 3,
                  minWidth: 250,
                  color: "text.secondary",
                }}
              >
                No Current Patient
              </Box>
            )}

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePause}
                disabled={!current || actionDone}
              >
                Pause
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSkip}
                disabled={!current || actionDone}
              >
                Skip
              </Button>

              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowDropDownIcon />}
                onClick={handleSendToClick}
                disabled={!current || actionDone}
              >
                Send To
              </Button>
              <Menu anchorEl={anchorEl} open={openMenu} onClose={handleSendToClose}>
                {["Doctor", "Pharmacy", "Lab", "Radiology"].map((dest) => (
                  <MenuItem key={dest} onClick={() => handleSendToSelect(dest)}>
                    {dest}
                  </MenuItem>
                ))}
              </Menu>

              <Button
                variant="contained"
                color="success"
                onClick={handleFinish}
                disabled={!current || actionDone}
              >
                Finish
              </Button>

              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={!actionDone || upcoming.length === 0}
              >
                Next Token
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Right - Upcoming Patients */}
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1, overflowY: "auto" }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Upcoming Patients
            </Typography>
            {upcoming.map((p, i) => (
              <React.Fragment key={i}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: genderColor(p.gender), mr: 1.5 }}>
                      {p.gender === "female" ? <WomanIcon /> : <ManIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {p.token}
                      </Typography>
                      <Typography variant="body2">{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`P.I.D ${p.pid}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {i < upcoming.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
