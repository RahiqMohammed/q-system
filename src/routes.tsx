import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserQueue from './views/User/userViewComponents/UserQueue';

// Lazy-loaded pages
const FlowTemprory = lazy(() => import('./views/FlowTemprory'));
const AdminDashboard = lazy(() => import('./views/admin/QueueRouteManagement'));
const UserDashboard = lazy(() => import('./views/User/UserQueueManagment')); // adjust path if needed
const QueueTV = lazy(() => import('./views/tv/QueueTV')); // adjust path if needed
const TVQueue = lazy(() => import('./views/tv/TVQueue')); // adjust path if needed

export default function AppRoutes() {
  return (
    <Router>
      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<FlowTemprory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/:counter" element={<UserQueue />} />
          <Route path="/tv" element={<TVQueue />} />
          <Route path='/tv/tv-screen' element={<QueueTV />} />

          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </Suspense>
    </Router>
  );
}
