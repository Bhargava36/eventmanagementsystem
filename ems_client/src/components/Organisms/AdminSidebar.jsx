import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import ThemeToggle from './ThemeToggler';
import NotificationBellDropdown from '../Molecules/NotificationBellDropdown';
import useAuth from '../../Hooks/useAuth';
import useToast from '../../Hooks/useToast';
import { getTrackVisibility, isSoloTeamSize, getEventTypeInfo } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  PanelLeftOpen,
  CircleX,
  Radio,
  Sliders,
  Atom,
  UserPen,
  Trophy,
  Send,
  MessageCircleQuestion,
  ChevronDown,
  Layers,
  Check,
  GraduationCap,
  Video,
  Presentation,
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  FileText,
  Podium,
  Mic,
  Building2,
  QrCode,
  Camera,
} from 'lucide-react';
import { GiTeamIdea } from "react-icons/gi";
import { LuClipboardCheck,LuUserCheck } from "react-icons/lu";
const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);
const SidebarContent = ({
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
  const [adminData, setAdminData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  });
  const [imageError, setImageError] = useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const handleSwitchEvent = async (targetEvent) => {
    if (!targetEvent || Number(targetEvent.Id) === Number(adminData?.EventId)) return;
    const targetAdminId = adminData?.Id || adminData?.id || user?.Id || user?.id;
    const updated = {
      ...adminData,
      EventId: targetEvent.Id,
      EventName: targetEvent.EventName,
      HackathonMode: targetEvent.HackathonMode,
      EventType: targetEvent.EventType || 'Hackathon',
      Location: targetEvent.Location,
    };
    try {
      localStorage.setItem('admin', JSON.stringify(updated));
      localStorage.removeItem(`admin_dashboard_cache_${targetEvent.Id}`);
      localStorage.removeItem(`admin_dashboard_cache_${adminData?.EventId}`);
    } catch (e) {}
    setAdminData(updated);
    // Call backend switch-event to persist selection in users.EventId
    if (targetAdminId) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/switch-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ AdminId: targetAdminId, EventId: targetEvent.Id }),
        });
      } catch (e) {
        console.warn('Backend switch failed:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('admin-event-updated', { detail: targetEvent }));
    toast.success(`Switched workspace to: ${targetEvent.EventName}`);
    navigate('/admin/dashboard');
    setTimeout(() => window.location.reload(), 250);
  };
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
  useEffect(() => {
    const syncAdminData = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        setAdminData(stored);
        setImageError(false);
      } catch {
        // ignore
      }
    };
    const targetAdminId = adminData?.Id || adminData?.id || user?.Id || user?.id;
    if (targetAdminId) {
      fetch(`${API_BASE_URL}/api/admin/${targetAdminId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          const adminObj = data.admin || (data.events?.[0]?.AdminName ? data.events[0] : null) || {};
          let eventsList = [];
          if (Array.isArray(data.events) && data.events.length > 0 && data.events[0]?.EventName && !data.events[0]?.AdminName) {
            eventsList = data.events;
          } else if (Array.isArray(adminObj?.events)) {
            eventsList = adminObj.events;
          } else if (Array.isArray(data.events?.[0]?.events)) {
            eventsList = data.events[0].events;
          }
          setAdminData((prev) => {
            // Find active event among assigned events, or fallback to prev.EventId
            const activeId = prev?.EventId || adminObj.EventId;
            const currentEvent = eventsList.find((e) => Number(e.Id) === Number(activeId)) || eventsList[0] || null;
            const updated = {
              ...prev,
              Id: adminObj.Id || prev?.Id,
              AdminName: adminObj.AdminName || prev?.AdminName,
              UserName: adminObj.UserName || prev?.UserName,
              Email: adminObj.Email || prev?.Email,
              Mobile: adminObj.Mobile || prev?.Mobile,
              Photo: adminObj.Photo || prev?.Photo,
              EventId: currentEvent ? currentEvent.Id : activeId,
              EventName: currentEvent ? currentEvent.EventName : prev?.EventName,
              HackathonMode: currentEvent ? currentEvent.HackathonMode : prev?.HackathonMode,
              EventType: currentEvent ? currentEvent.EventType : prev?.EventType,
              Location: currentEvent ? currentEvent.Location : prev?.Location,
              events: eventsList.length > 0 ? eventsList : (prev?.events || [])
            };
            try {
              localStorage.setItem('admin', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          setImageError(false);
        })
        .catch(() => {});
    }
    const targetEventId = adminData?.EventId || user?.EventId;
    if (targetEventId) {
      fetch(`${API_BASE_URL}/api/events/${targetEventId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          const ev = data.event || data;
          if (ev) {
            setAdminData((prev) => {
              const updated = {
                ...prev,
                HackathonMode: ev.HackathonMode || prev?.HackathonMode,
                EventName: ev.EventName || prev?.EventName,
                Location: ev.Location || prev?.Location,
                TeamSize: ev.TeamSize || prev?.TeamSize,
              };
              try {
                localStorage.setItem('admin', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
        })
        .catch(() => {});
    }
    window.addEventListener('storage', syncAdminData);
    window.addEventListener('admin-event-updated', syncAdminData);
    window.addEventListener('admin-profile-updated', syncAdminData);
    window.addEventListener('profileUpdated', syncAdminData);
    return () => {
      window.removeEventListener('storage', syncAdminData);
      window.removeEventListener('admin-event-updated', syncAdminData);
      window.removeEventListener('admin-profile-updated', syncAdminData);
      window.removeEventListener('profileUpdated', syncAdminData);
    };
  }, [adminData?.EventId, user?.EventId, adminData?.Id, user?.Id]);
  const canShowText = isMobile || showText;
  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  }
  const adminDisplayName = adminData?.AdminName || user?.AdminName || adminData?.UserName || user?.UserName || adminData?.name || user?.name || 'Admin';
  const adminPhoto = adminData?.Photo || adminData?.photo || user?.Photo || user?.photo || adminData?.ProfilePic || '';
  const rawMode = adminData?.HackathonMode || user?.HackathonMode;
  const { showVirtual, showPhysical, isBoth } = getTrackVisibility(rawMode, adminData?.Location);
  const typeInfo = getEventTypeInfo(adminData?.EventType);
  const isIndividual = isSoloTeamSize(adminData?.TeamSize || user?.TeamSize) || typeInfo.isWorkshop || typeInfo.isWebinar || typeInfo.isSeminar || typeInfo.isAlumni;
  // Track operation labels based on event type
  let virtualTrackName = isBoth ? 'Virtual Event' : 'Event Operations';
  let physicalTrackName = isBoth ? 'Physical Event' : 'Event Operations';
  if (typeInfo.isWorkshop) {
    virtualTrackName = isBoth ? 'Online Workshop' : 'Workshop Sessions';
    physicalTrackName = isBoth ? 'In-Person Workshop' : 'Workshop Operations';
  } else if (typeInfo.isWebinar) {
    virtualTrackName = 'Live Stream & Meet';
    physicalTrackName = 'Webinar Operations';
  } else if (typeInfo.isSeminar) {
    virtualTrackName = isBoth ? 'Virtual Broadcast' : 'Webinar / Stream';
    physicalTrackName = isBoth ? 'Conference Venue' : 'Conference Operations';
  } else if (typeInfo.isCodingContest) {
    virtualTrackName = isBoth ? 'Online Contest' : 'Contest Operations';
    physicalTrackName = isBoth ? 'Onsite Contest' : 'Contest Operations';
  } else if (typeInfo.isTechFest) {
    virtualTrackName = isBoth ? 'Virtual Fest' : 'Fest Operations';
    physicalTrackName = isBoth ? 'Fest Arena' : 'Fest Operations';
  }
  // Only Hackathons and Contests/Fests use judging evaluators and scorecard results
  const hasEvaluators = typeInfo.isHackathon || typeInfo.isCodingContest || typeInfo.isTechFest;
  // Dynamic participant naming
  let participantLabel = 'Registered Teams';
  if (typeInfo.isWorkshop) {
    participantLabel = 'Registered Attendees';
  } else if (typeInfo.isWebinar) {
    participantLabel = 'Registered Delegates';
  } else if (typeInfo.isSeminar) {
    participantLabel = 'Registered Delegates';
  } else if (typeInfo.isAlumni) {
    participantLabel = 'Registered Alumni';
  } else if (typeInfo.isCodingContest) {
    participantLabel = isIndividual ? 'Registered Contestants' : 'Contest Teams';
  } else if (typeInfo.isProjectExpo) {
    participantLabel = 'Exhibiting Teams';
  } else {
    participantLabel = isIndividual ? 'Registered Participants' : 'Registered Teams';
  }
  // Dynamic core team naming
  let coreTeamLabel = 'Core Team';
  if (typeInfo.isWorkshop) {
    coreTeamLabel = 'Instructors & Team';
  } else if (typeInfo.isWebinar) {
    coreTeamLabel = 'Keynote Speakers';
  } else if (typeInfo.isSeminar) {
    coreTeamLabel = 'Speakers & Committee';
  }
  const menuItems = [
    {
      name: 'My Events',
      icon: Layers,
      path: '/admin/my-events',
      badge: adminData?.events?.length > 1 ? `${adminData.events.length}` : null,
      end: false,
    },
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      badge: null,
      end: true,
    },
    ...(typeInfo.isWorkshop
      ? [
        {
          name: 'Curriculum & Agenda',
          icon: BookOpen,
          path: '/admin/workshop/curriculum',
          badge: null,
          end: false,
        },
        {
          name: 'Study Materials',
          icon: FileText,
          path: '/admin/workshop/resources',
          badge: null,
          end: false,
        },
        {
          name: 'Instructors & Trainers',
          icon: GraduationCap,
          path: '/admin/workshop/instructors',
          badge: null,
          end: false,
        },
        {
          name: 'Attendance Tracker',
          icon: CalendarCheck,
          path: '/admin/workshop/attendance',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(typeInfo.isWebinar
      ? [
        {
          name: 'Keynote Agenda',
          icon: Presentation,
          path: '/admin/webinar/agenda',
          badge: null,
          end: false,
        },
        {
          name: 'Decks & Recordings',
          icon: Video,
          path: '/admin/webinar/resources',
          badge: null,
          end: false,
        },
        {
          name: 'Keynote Speakers',
          icon: Mic,
          path: '/admin/webinar/speakers',
          badge: null,
          end: false,
        },
        {
          name: 'Attendance & Joins',
          icon: LuUserCheck,
          path: '/admin/webinar/attendance',
          badge: null,
          end: false,
        },
        {
          name: 'Live Q&A Moderation',
          icon: MessageCircleQuestion,
          path: '/admin/webinar/qa',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(typeInfo.isSeminar
      ? [
        {
          name: 'Seminar Overview',
          icon: Building2,
          path: '/admin/seminar/overview',
          badge: null,
          end: false,
        },
        {
          name: 'Keynote Speakers',
          icon: Mic,
          path: '/admin/seminar/speakers',
          badge: null,
          end: false,
        },
        {
          name: 'Conference Agenda',
          icon: CalendarDays,
          path: '/admin/seminar/agenda',
          badge: null,
          end: false,
        },
        {
          name: 'Seminar Attendance',
          icon: CalendarCheck,
          path: '/admin/seminar/attendance',
          badge: null,
          end: false,
        },
        {
          name: 'Proceedings & Slides',
          icon: FileText,
          path: '/admin/seminar/resources',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(typeInfo.isAlumni
      ? [
        {
          name: 'Reunion Overview',
          icon: Building2,
          path: '/admin/alumni/overview',
          badge: null,
          end: false,
        },
        {
          name: 'Reunion Agenda',
          icon: CalendarDays,
          path: '/admin/alumni/agenda',
          badge: null,
          end: false,
        },
        {
          name: 'Registrations & RSVPs',
          icon: Users,
          path: '/admin/alumni/registrations',
          badge: null,
          end: false,
        },
        {
          name: 'Gate & Food Scanner',
          icon: QrCode,
          path: '/admin/alumni/attendance',
          badge: null,
          end: false,
        },
        {
          name: 'Invite Dispatcher',
          icon: Send,
          path: '/admin/alumni/invites',
          badge: null,
          end: false,
        },
        {
          name: 'Memory Wall & Gallery',
          icon: Camera,
          path: '/admin/alumni/memories',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(typeInfo.isProjectExpo
      ? [
        {
          name: 'Project Submissions',
          icon: FileText,
          path: '/admin/expo/projects',
          badge: null,
          end: false,
        },
        {
          name: 'Booth / Stall Allocation',
          icon: Building2,
          path: '/admin/expo/booths',
          badge: null,
          end: false,
        },
        {
          name: 'Presentation Schedules',
          icon: CalendarDays,
          path: '/admin/expo/schedules',
          badge: null,
          end: false,
        },
        {
          name: 'Jury & Evaluation',
          icon: LuClipboardCheck,
          path: '/admin/expo/evaluation',
          badge: null,
          end: false,
        },
        {
          name: 'Results & Winners',
          icon: Trophy,
          path: '/admin/expo/results',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(showVirtual && !typeInfo.isWorkshop && !typeInfo.isWebinar && !typeInfo.isSeminar && !typeInfo.isAlumni && !typeInfo.isProjectExpo
      ? [
        {
          name: virtualTrackName,
          icon: Radio,
          path: '/admin/virtual-event',
          badge: null,
          end: false,
        },
        ...(hasEvaluators
          ? [
            {
              name: isBoth ? 'Virtual Results' : 'Results',
              icon: Award,
              path: '/admin/virtual-results',
              badge: null,
              end: false,
            },
          ]
          : []),
      ]
      : []),
    ...(showPhysical && !typeInfo.isWorkshop && !typeInfo.isWebinar && !typeInfo.isSeminar && !typeInfo.isAlumni && !typeInfo.isProjectExpo
      ? [
        {
          name: physicalTrackName,
          icon: GiTeamIdea,
          path: '/admin/physical-event',
          badge: null,
          end: false,
        },
        ...(hasEvaluators
          ? [
            {
              name: isBoth ? 'Physical Results' : 'Results',
              icon: Podium,
              path: '/admin/physical-results',
              badge: null,
              end: false,
            },
          ]
          : []),
      ]
      : []),
    ...(hasEvaluators && !typeInfo.isAlumni && !typeInfo.isProjectExpo
      ? [
        {
          name: 'Evaluators',
          icon: LuClipboardCheck,
          path: '/admin/evaluators',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(!typeInfo.isWorkshop && !typeInfo.isWebinar && !typeInfo.isSeminar && !typeInfo.isAlumni && !typeInfo.isProjectExpo
      ? [
        {
          name: coreTeamLabel,
          icon: LuUserCheck,
          path: '/admin/core-team',
          badge: null,
          end: false,
        },
      ]
      : []),
    ...(!typeInfo.isAlumni
      ? [
        {
          name: participantLabel,
          icon: typeInfo.isWebinar ? Radio : typeInfo.isWorkshop ? GraduationCap : Users,
          path: '/admin/teams',
          badge: null,
          end: false,
        },
      ]
      : []),
    {
      name: 'Broadcast Emailer',
      icon: Send,
      path: '/admin/broadcast-emailer',
      badge: null,
      end: false,
    },
    {
      name: 'Event Settings',
      icon: Sliders,
      path: '/admin/settings',
      badge: null,
      end: false,
    },
    {
      name: 'Feedback',
      icon: MessageCircleQuestion,
      path: '/admin/feedback',
      badge: null,
    },
    {
      name: 'Profile',
      icon: CircleUserRound,
      path: '/admin/profile',
      badge: null,
      end: false,
    },
  ];
  return (
    <aside
      className={`relative ${isMobile ? 'w-[280px]' : collapsed ? 'w-[90px]' : 'w-[280px]'
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
        className={`flex items-center gap-3 mb-6 mt-2 shrink-0 ${!isMobile && collapsed ? 'justify-center' : ''
          }`}
      >
        <div className="relative shrink-0">
          <div
            className={`${!isMobile && collapsed ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'
              } rounded-full bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white font-bold transition-all duration-300 overflow-hidden ring-2 ring-emerald-500/30`}
          >
            {adminPhoto && !imageError ? (
              <img
                src={adminPhoto}
                alt={adminDisplayName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{adminDisplayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-black"></span>
        </div>
        {canShowText && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="overflow-hidden"
          >
            <h3 className="font-bold text-base whitespace-nowrap capitalize">{adminDisplayName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Administrator
            </p>
          </motion.div>
        )}
      </div>
      <div className="border-t border-gray-200 dark:border-[#1A2440] mb-3 shrink-0"></div>
      {/* Only Navigation Links Scroll */}
      <LayoutGroup id={isMobile ? 'admin-nav-mobile' : 'admin-nav-desktop'}>
        <nav className="space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
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
                  !isMobile && collapsed ? 'justify-center px-5' : 'justify-between px-4'
                } py-3 rounded-xl cursor-pointer select-none transition-colors duration-200 ${
                  isCurrentActive
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                {isCurrentActive && (
                  <motion.span
                    layoutId={isMobile ? 'admin-tab-mobile' : 'admin-tab-desktop'}
                    className="absolute inset-0 bg-emerald-700 dark:bg-emerald-500 rounded-xl shadow-md z-0"
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
      <div className="mt-auto shrink-0 pt-1 ">
        <ThemeToggle variant="sidebar" canShowText={canShowText} />
        <div className="border-t border-gray-200 dark:border-[#1A2440] my-1"></div>
        <button
          onClick={handleLogout}
          title={!isMobile && collapsed ? 'Logout' : ''}
          className={`w-full flex items-center ${!isMobile && collapsed ? 'justify-center' : 'gap-3'
            } px-4 py-3 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer`}
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
      <div className="hidden lg:flex h-screen sticky top-0 z-20">
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
        className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent
          isMobile={true}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto h-screen bg-gray-50 dark:bg-black transition-colors relative">
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
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
          <NotificationBellDropdown align="right" />
        </div>
        {/* Floating Top-Right Notification Island on Desktop */}
        <div className="hidden lg:flex fixed top-5 right-6 z-40 items-center">
          <NotificationBellDropdown align="right" variant="floating" />
        </div>
        <Outlet />
      </div>
    </div>
  );
};
export default Sidebar;
