import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  PanelLeftOpen,
  CircleX,
} from 'lucide-react';

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', badge: null, end: false },
  { name: 'Teams', icon: Users, path: '/admin/teams', badge: null, end: false },
  { name: 'Profile', icon: CircleUserRound, path: '/admin/profile', badge: null, end: false },
];

const SidebarContent = ({
  isMobile = false,
  collapsed,
  setCollapsed,
  setMobileOpen,
}) => {
  const [showText, setShowText] = useState(!collapsed);
  const navigate = useNavigate();

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
    navigate('/');
  }

  return (
    <aside
      className={`relative ${
        isMobile ? 'w-[280px]' : collapsed ? 'w-[80px]' : 'w-[280px]'
      } h-screen relative z-10 shrink-0 border-r-2 border-emerald-700 dark:border-emerald-500 rounded-tr-2xl rounded-br-2xl flex flex-col p-5 bg-white dark:bg-black text-gray-800 dark:text-white shadow-xl transition-all ease-in-out duration-500`}
    >
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-8 -right-8 -z-10 w-8 h-9 rounded-r-full text-white bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center shadow-md hover:bg-transparent hover:dark:text-white hover:text-black hover:border-2 hover:border-emerald-500 transition-transform transition-all duration-500 ease-in-out z-10 cursor-pointer"
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

      <div
        className={`flex items-center gap-3 mb-8 mt-2 ${
          !isMobile && collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="relative shrink-0">
          <div
            className={`${
              !isMobile && collapsed ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'
            } rounded-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white font-bold transition-all duration-300`}
          >
            A
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-black"></span>
        </div>
        {canShowText && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.5 }}
            className="overflow-hidden"
          >
            <h3 className="font-bold text-base whitespace-nowrap">Admin</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Administrator
            </p>
          </motion.div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-[#1A2440] mb-4"></div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              title={!isMobile && collapsed ? item.name : ''}
              onClick={() => isMobile && setMobileOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center ${
                  !isMobile && collapsed ? 'justify-center' : 'justify-between'
                } px-4 py-3 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 dark:bg-emerald-500 text-white shadow-md'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center ${
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
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className="font-medium text-sm whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-gray-200 dark:border-[#1A2440] my-4"></div>
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

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      <div className="hidden lg:flex h-screen sticky top-0">
        <SidebarContent
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
        <SidebarContent
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
                HACK_HUB
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

export default Sidebar;