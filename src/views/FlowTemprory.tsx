import React, { FC, ReactNode } from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

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
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
  },
  {
    role: 'User',
    buttonText: 'Go to User',
    color: '#352D66',
    icon: <PersonIcon sx={{ fontSize: 48 }} />,
  },
];

const FlowTemprory: FC = () => {
  const navigate = useNavigate();

  const handleClick = (role: string) => {
    if (role === 'Admin') navigate('/admin');
    else if (role === 'User') navigate('/user');
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1000, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {userFlows.map((flow) => (
          <Box key={flow.role} sx={{ flex: '1 1 300px', maxWidth: 'calc(50% - 16px)', height: 320 }}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  p: 3,
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: flow.color, mt: 2, mb: 3 }}>
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
    </Box>
  );
};

export default FlowTemprory;
