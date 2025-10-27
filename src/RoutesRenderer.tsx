// src/RoutesRenderer.tsx
import React from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';

const RoutesRenderer: React.FC = () => {
  return useRoutes(routes);
};

export default RoutesRenderer;
