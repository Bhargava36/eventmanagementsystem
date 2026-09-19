import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../Hooks/useAuth';
import Unauthorized from '../ui/Unauthorized';

export default function ProtectedRoute({ allowedRoles = [], redirectPath, children }) {
  const { isAuthenticated, role, isLoading, getRoleLoginPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const targetLogin =
      redirectPath ||
      (allowedRoles.length > 0 ? getRoleLoginPath(allowedRoles[0]) : '/login');

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
    return <Unauthorized allowedRoles={allowedRoles} />;
  }

  return children ? children : <Outlet />;
}
