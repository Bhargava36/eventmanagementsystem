import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import ThemeToggle from './ThemeToggler';
import useAuth from '../../Hooks/useAuth';
import useToast from '../../Hooks/useToast';
import { API_BASE_URL } from '@/lib/api';

import {
  LayoutDashboard,
  Users,
  Trophy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftOpen,
  CircleX,
  CircleUserRound,
  ScrollText
} from 'lucide-react';

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);

const UserSidebarContent = ({
  isMobile = false,
  collapsed,
  setCollapsed,
  setMobileOpen,
}) => {
  const [showText, setShowText] = useState(!collapsed);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (collapsed) {
      setShowText(false);
    } else {
      const timer = setTimeout(() => {
        setShowText(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  const canShowText = isMobile || showText;

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate('/user/login'); 
  }

  const [profileData, setProfileData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const syncUserData = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setProfileData(stored);
        setImageError(false);
      } catch {}
    };

    const targetId = user?.Id || user?.id || profileData?.Id || profileData?.id;
    if (targetId) {
      fetch(`${API_BASE_URL}/api/users/${targetId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setProfileData((prev) => {
              const updated = { ...prev, ...data.user };
              try {
                localStorage.setItem('user', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            setImageError(false);
          }
        })
        .catch(() => {});
    }

    window.addEventListener('storage', syncUserData);
    window.addEventListener('user-profile-updated', syncUserData);
    window.addEventListener('profileUpdated', syncUserData);
    return () => {
      window.removeEventListener('storage', syncUserData);
      window.removeEventListener('user-profile-updated', syncUserData);
      window.removeEventListener('profileUpdated', syncUserData);
    };
  }, [user?.Id, user?.id]);

  const displayName = profileData?.UserName || user?.UserName || profileData?.name || user?.name || profileData?.username || user?.username || 'Participant';
  const userPhoto = profileData?.Photo || profileData?.photo || user?.Photo || user?.photo || profileData?.ProfilePic || user?.ProfilePic || '';
  const userInitials = (displayName && displayName !== 'Participant') ? displayName.charAt(0).toUpperCase() : (user?.UserName ? user.UserName.charAt(0).toUpperCase() : 'U');

  const menuItems = [
    { name: 'Dashboard',          icon: LayoutDashboard, path: '/user/dashboard',      badge: null, end: true  },
    { name: 'Competitions',       icon: Trophy,          path: '/user/competitions',   badge: null, end: false },
    { name: 'My Teams',           icon: Users,           path: '/user/teams',          badge: null, end: false },
    { name: 'Feedback', icon: ScrollText,    path: '/user/feedback', badge: null, end: false },
    { name: 'Profile',            icon: CircleUserRound, path: '/user/profile',        badge: null, end: false },
  ];

  return (
    <aside
      className={`relative ${
        isMobile ? 'w-[280px]' : collapsed ? 'w-[80px]' : 'w-[280px]'
      } h-screen max-h-screen z-20 shrink-0 border-r-2 border-emerald-700 dark:border-emerald-500 rounded-tr-2xl rounded-br-2xl flex flex-col p-5 bg-white dark:bg-black text-gray-800 dark:text-white shadow-xl transition-all ease-in-out duration-500`}
    >
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-8 -right-7 z-30 w-7 h-9 rounded-r-full text-white bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-800 hover:dark:bg-emerald-400 transition-all duration-300 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {isMobile && (
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center shadow-md hover:scale-105 transition-transform z-10 cursor-pointer"
        >
          <CircleX className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Fixed Header */}
      <div
        className={`flex items-center gap-3 mb-6 mt-2 shrink-0 ${
          !isMobile && collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="relative shrink-0">
          <div
            className={`${
              !isMobile && collapsed ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'
            } rounded-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white font-bold transition-all duration-300 overflow-hidden ring-2 ring-emerald-500/30`}
          >
            {userPhoto && !imageError ? (
              <img
                src={userPhoto}
                alt={displayName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userInitials}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-black"></span>
        </div>
        {canShowText && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="overflow-hidden min-w-0"
          >
            <h3 className="font-bold text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={displayName}>
              {displayName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Participant
            </p>
          </motion.div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-[#1A2440] mb-3 shrink-0"></div>

      {/* Only Navigation Links Scroll */}
      <LayoutGroup id={isMobile ? 'user-nav-mobile' : 'user-nav-desktop'}>
        <nav className="space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1.5 sidebar-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrentActive = item.end
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                title={!isMobile && collapsed ? item.name : ''}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`relative w-full flex items-center ${
                  !isMobile && collapsed ? 'justify-center' : 'justify-between'
                } px-4 py-3 rounded-full cursor-pointer select-none transition-colors duration-200 ${
                  isCurrentActive
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                {isCurrentActive && (
                  <motion.span
                    layoutId={isMobile ? 'user-pill-mobile' : 'user-pill-desktop'}
                    className="absolute inset-0 bg-emerald-700 dark:bg-emerald-500 rounded-full shadow-md z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center ${
                    !isMobile && collapsed ? '' : 'gap-3'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  {canShowText && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.1 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Fixed Footer */}
      <div className="mt-auto shrink-0 pt-3 border-t border-gray-200 dark:border-[#1A2440]">
        <ThemeToggle variant="sidebar" canShowText={canShowText} />
        <div className="border-t border-gray-200 dark:border-[#1A2440] my-3"></div>
        <button
          onClick={handleLogout}
          title={!isMobile && collapsed ? 'Logout' : ''}
          className={`w-full flex items-center ${
            !isMobile && collapsed ? 'justify-center' : 'gap-3'
          } px-4 py-3 rounded-full transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {canShowText && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 1 }}
              className="font-medium text-sm whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
};

const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      <div className="hidden lg:flex h-screen sticky top-0 z-20">
        <UserSidebarContent
          isMobile={false}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <UserSidebarContent
          isMobile={true}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto h-screen bg-gray-50 dark:bg-black transition-colors">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-emerald-700 dark:bg-emerald-500 text-white hover:bg-emerald-800 dark:hover:bg-emerald-600 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <div className="mt-2">{logoElement}</div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-gray-900 dark:text-white">
                AYOJAN
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 tracking-widest">
                EMS
              </span>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default UserSidebar;