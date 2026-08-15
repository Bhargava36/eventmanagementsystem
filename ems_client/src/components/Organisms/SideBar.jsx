import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  MessageCircleQuestionMark
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Events', icon: Calendar, badge: '12' },
    { name: 'Notifications', icon: Bell, badge: '4', dot: true },
    { name: 'Feedback', icon: MessageCircleQuestionMark, badge: null },
    { name: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="relative w-[280px] h-screen border-2 border-emerald-700 dark:border-emerald-500 rounded-2xl flex flex-col p-5 bg-white dark:bg-black text-gray-800 dark:text-white shadow-xl transition-colors duration-300">
        <button className="absolute top-8 -right-3 w-8 h-9 rounded-r-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center shadow-md hover:scale-105 transition-transform z-10">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-center gap-3 mb-8 mt-2">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
              SA
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-[#0F1729]"></span>
          </div>
          <div>
            <h3 className="font-bold text-base">Super Admin</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-[#1A2440] mb-4"></div>


        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className="w-full flex items-center justify-between px-4 py-3 rounded-full transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-800"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.dot && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#0F1729] text-emerald-700 dark:text-emerald-500">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="border-t border-gray-200 dark:border-[#1A2440] my-4"></div>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Sidebar;