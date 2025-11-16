import React, { FC, ReactNode } from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import TvIcon from '@mui/icons-material/Tv';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

interface Flow {
  role: string;
  buttonText: string;
  color: string;
  icon: ReactNode;
}

const userFlows: Flow[] = [
  {
    role: 'Admin',
    buttonText: 'Go to Admin',
    color: '#2FDCC7',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 70 }} />,
  },
  {
    role: 'User',
    buttonText: 'Go to User',
    color: '#352D66',
    icon: <PersonIcon sx={{ fontSize: 70 }} />,
  },
  {
    role: 'TV',
    buttonText: 'Go to TV',
    color: '#E67E22',
    icon: <TvIcon sx={{ fontSize: 70 }} />,
  },
];

const FlowTemprory: FC = () => {
  const navigate = useNavigate();

  // 🔥 Login API added here
const login = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8099/qsys/auth/login",
      null,
      {
        params: {
          persCode: "-1001",
          deptId: "1",
        },
      }
    );

    localStorage.setItem("token", response.data.token);
    return response.data.token;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return null;
  }
};


  // 🔥 Updated to call login first before navigating
  const handleClick = async (role: string) => {
    const token = await login();
    if (!token) return;

    if (role === 'Admin') navigate('/admin');
    else if (role === 'User') navigate('/user');
    else if (role === 'TV') navigate('/tv');
  };

  return (
    <Box
      sx={{
        p: 4,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Top row: Admin and User */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', width: '100%', alignItems: "center", p: 4 }}>
        {userFlows.slice(0, 2).map((flow) => (
          <Box key={flow.role} sx={{ flex: '0 1 320px', }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card
                sx={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 4,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  boxShadow: 4,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
              >
                {flow.icon}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: flow.color, mt: 3, mb: 3 }}
                >
                  {flow.role}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: flow.color,
                    '&:hover': { backgroundColor: flow.color + 'cc' },
                  }}
                  onClick={() => handleClick(flow.role)}
                >
                  {flow.buttonText}
                </Button>
              </Card>
            </motion.div>
          </Box>
        ))}
      </Box>

      {/* Bottom row: TV centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ flex: '0 1 320px' }}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 4,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255,255,255,0.7)',
                boxShadow: 4,
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
            >
              {userFlows[2].icon}
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: userFlows[2].color, mt: 3, mb: 3 }}
              >
                {userFlows[2].role}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: userFlows[2].color,
                  '&:hover': { backgroundColor: userFlows[2].color + 'cc' },
                }}
                onClick={() => handleClick(userFlows[2].role)}
              >
                {userFlows[2].buttonText}
              </Button>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default FlowTemprory;
