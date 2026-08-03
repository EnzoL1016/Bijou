import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default PrivateRoute;