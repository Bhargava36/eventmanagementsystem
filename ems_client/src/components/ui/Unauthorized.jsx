import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import useAuth from '../../Hooks/useAuth';
import useToast from '../../Hooks/useToast';

export default function Unauthorized({ allowedRoles = [] }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { role, user, logout, getDefaultDashboard } = useAuth();

  const formattedRole = (r) => {
    if (!r) return 'Guest';
    return r.replace('_', ' ').toUpperCase();
  };

  const dashboardPath = getDefaultDashboard(role);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-lg w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-inner">
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 mb-3 tracking-wide">
            403 • ACCESS RESTRICTED
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            Unauthorized Access
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            You don’t have the required permissions to view this portal.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-6 text-left text-xs sm:text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Your Current Role:</span>
              <span className="font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                {formattedRole(role)}
              </span>
            </div>
            {allowedRoles.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Required Role:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {allowedRoles.map(formattedRole).join(' or ')}
                </span>
              </div>
            )}
            {user?.Email && (
              <div className="flex justify-between items-center truncate">
                <span className="text-gray-500 dark:text-gray-400">Signed In As:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {user.Email}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate(dashboardPath)}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-sm transition-colors cursor-pointer"
              title="Sign out and switch accounts"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
