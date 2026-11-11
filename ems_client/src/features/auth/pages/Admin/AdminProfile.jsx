import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api';
import {
  Pencil,
  Shield,
  ShieldCheck,
  BadgeCheck,
  Mail,
  Phone,
  User,
  Users,
  UsersRound,
  ChevronRight,
  X,
  Save,
  Activity,
  Layers,
  CalendarDays,
  KeyRound,
  ArrowRight,
  Camera,
  Loader2,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  Sliders,
  Send,
  Target,
  RefreshCw,
  FolderGit2,
  Radio,
  Building2,
  Trophy,
  QrCode,
  Award,
  MessageCircleQuestion
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useToast from '../../../../Hooks/useToast';
import { parseJwt } from '../../../../Contexts/AuthContext';
import { getEventTypeInfo } from '../../../../lib/utils';
import WaveDots from '../../../../components/Atoms/WaveDots';
import ActiveSessionsCard from '../../components/ActiveSessionsCard';
import TwoFactorSettingsCard from '../../components/TwoFactorSettingsCard';
function getStoredAdminData() {
  try {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) return JSON.parse(adminStr);
  } catch (e) {
    console.warn('Error reading admin from storage:', e);
  }
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
  } catch (e) {
    console.warn('Error reading user from storage:', e);
  }
  return null;
}
export default function AdminProfile() {
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(() => getStoredAdminData());
  const [activeEvent, setActiveEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Event-specific live metrics
  const [teamsCount, setTeamsCount] = useState(0);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    AdminName: '',
    Email: '',
    Mobile: '',
    EventId: '',
    Photo: ''
  });
  const activeEventId = profile?.EventId;
  const activeTypeInfo = getEventTypeInfo(activeEvent?.EventType || profile?.EventType);
  // Sync with global event updates
  useEffect(() => {
    const handleEventUpdated = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        const updated = e?.detail ? { ...stored, ...e.detail } : stored;
        setProfile(updated);
      } catch (err) {
        console.error('Error handling event updated:', err);
      }
    };
    window.addEventListener('admin-event-updated', handleEventUpdated);
    window.addEventListener('storage', handleEventUpdated);
    return () => {
      window.removeEventListener('admin-event-updated', handleEventUpdated);
      window.removeEventListener('storage', handleEventUpdated);
    };
  }, []);
  const fetchAdminProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      if (!token || !decoded || (decoded.role && decoded.role !== 'admin')) {
        toast.error('Unauthorized session. Please login as admin.');
        navigate('/admin/login');
        return;
      }
      const targetId = decoded.Id || decoded.id;
      if (!targetId) {
        toast.error('Admin ID not found in token.');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/${targetId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch admin profile');
      }
      const data = await res.json();
      const adminData = data.events?.[0] || data.admin || data;
      if (adminData) {
        // Read active stored admin to preserve active EventId selection
        const stored = getStoredAdminData() || {};
        const mergedAdmin = {
          ...adminData,
          ...stored,
          Photo: adminData.Photo || stored.Photo || '',
          AdminName: adminData.AdminName || stored.AdminName || '',
          Email: adminData.Email || stored.Email || '',
          Mobile: adminData.Mobile || stored.Mobile || '',
          events: adminData.events || stored.events || []
        };
        setProfile(mergedAdmin);
        setAllEvents(adminData.events || []);
        setFormData({
          AdminName: mergedAdmin.AdminName || '',
          Email: mergedAdmin.Email || '',
          Mobile: mergedAdmin.Mobile || '',
          EventId: mergedAdmin.EventId || '',
          Photo: mergedAdmin.Photo || ''
        });
        const currentEvId = mergedAdmin.EventId;
        if (currentEvId) {
          // Fetch active event details
          try {
            const evRes = await fetch(`${API_BASE_URL}/api/events/${currentEvId}`);
            if (evRes.ok) {
              const eData = await evRes.json();
              const ev = eData.event || eData;
              setActiveEvent(ev);
            }
          } catch (e) {
            console.warn('Could not fetch assigned event info:', e);
          }
          // Fetch event-specific statistics
          try {
            const [teamsRes, usersRes, feedbackRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/teams/event/${currentEvId}/count`),
              fetch(`${API_BASE_URL}/api/event_reg/event/${currentEvId}/count`),
              fetch(`${API_BASE_URL}/api/feedback/event/${currentEvId}`)
            ]);
            if (teamsRes.ok) {
              const td = await teamsRes.json();
              setTeamsCount(td.count || 0);
            }
            if (usersRes.ok) {
              const ud = await usersRes.json();
              setRegistrationsCount(ud.count || 0);
            }
            if (feedbackRes.ok) {
              const fd = await feedbackRes.json();
              setFeedbackCount(fd.count || (Array.isArray(fd.feedback) ? fd.feedback.length : 0));
            }
          } catch (e) {
            console.warn('Could not fetch event stats:', e);
          }
          // If workshop or webinar, fetch extra metrics (sessions, attendance, speakers/instructors)
          const evTypeInfo = getEventTypeInfo(mergedAdmin.EventType || activeEvent?.EventType);
          const isSessionEvent = evTypeInfo.isWorkshop || evTypeInfo.isWebinar;
          if (isSessionEvent) {
            try {
              const apiPrefix = evTypeInfo.isWebinar ? 'webinars' : 'workshops';
              const [sessRes, attRes, instRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/${apiPrefix}/${currentEvId}/sessions`),
                fetch(`${API_BASE_URL}/api/${apiPrefix}/${currentEvId}/attendance`),
                fetch(`${API_BASE_URL}/api/core_team/event/${currentEvId}`)
              ]);
              if (sessRes.ok) {
                const sd = await sessRes.json();
                setSessionsCount((sd.sessions || []).length);
              }
              if (attRes.ok) {
                const ad = await attRes.json();
                const list = ad.attendees || [];
                const present = list.filter((a) => a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present').length;
                setCheckedInCount(present);
              }
              if (instRes.ok) {
                const idData = await instRes.json();
                const members = Array.isArray(idData) ? idData : idData.team || idData.data || idData.members || [];
                setInstructorsCount(members.length);
              }
            } catch (wErr) {
              console.warn('Session event metrics fetch error:', wErr);
            }
          } else if (evTypeInfo.isAlumni) {
            try {
              const res = await fetch(`${API_BASE_URL}/api/alumni/${currentEvId}/registrations`);
              if (res.ok) {
                const data = await res.json();
                const list = data.registrations || [];
                setTeamsCount(list.length);
                setRegistrationsCount(list.length);
                const checkedIn = list.filter((r) => r.GateCheckInStatus === 'CheckedIn').length;
                setCheckedInCount(checkedIn);
              }
            } catch (aErr) {
              console.warn('Alumni metrics fetch error:', aErr);
            }
          } else if (evTypeInfo.isProjectExpo) {
            try {
              const expoRes = await fetch(`${API_BASE_URL}/api/project_expo/events/${currentEvId}/projects`);
              if (expoRes.ok) {
                const ed = await expoRes.json();
                setSessionsCount((ed.projects || []).length);
              }
            } catch (pErr) {
              console.warn('Project Expo metrics fetch error:', pErr);
            }
          } else if (evTypeInfo.isSeminar) {
            try {
              const [sessRes, attRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/seminars/${currentEvId}/sessions`),
                fetch(`${API_BASE_URL}/api/seminars/${currentEvId}/attendance`)
              ]);
              if (sessRes.ok) {
                const sd = await sessRes.json();
                setSessionsCount((sd.sessions || []).length);
              }
              if (attRes.ok) {
                const ad = await attRes.json();
                const list = ad.attendees || [];
                const present = list.filter((a) => a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present').length;
                setCheckedInCount(present);
              }
            } catch (sErr) {
              console.warn('Seminar metrics fetch error:', sErr);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate, toast, activeEvent?.EventType]);
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile, activeEventId]);
  // Handle Switching active event from profile
  const handleSwitchEvent = (targetEvent) => {
    if (!targetEvent || Number(targetEvent.Id) === Number(activeEventId)) return;
    try {
      const curAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
      const updated = {
        ...curAdmin,
        EventId: targetEvent.Id,
        EventName: targetEvent.EventName,
        EventType: targetEvent.EventType,
        HackathonMode: targetEvent.HackathonMode
      };
      localStorage.setItem('admin', JSON.stringify(updated));
      setProfile(updated);
      setActiveEvent(targetEvent);
      window.dispatchEvent(new CustomEvent('admin-event-updated', { detail: targetEvent }));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Active focus switched to "${targetEvent.EventName}"`);
    } catch (err) {
      console.error('Failed to switch active event:', err);
      toast.error('Failed to switch event focus');
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    try {
      setUploadingPhoto(true);
      let photoUrl = '';
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        const upRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
          method: 'POST',
          body: uploadForm
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          photoUrl = upData.fileUrl || upData.url || '';
        }
      } catch (upErr) {
        console.warn('Direct upload failed, using base64 fallback:', upErr);
      }
      if (!photoUrl) {
        photoUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      const targetId = decoded?.Id || decoded?.id || profile?.Id;
      const payload = {
        ...formData,
        Photo: photoUrl
      };
      const res = await fetch(`${API_BASE_URL}/api/admin/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update photo');
      }
      const updatedAdmin = {
        ...(profile || {}),
        ...payload,
        Photo: photoUrl
      };
      setProfile(updatedAdmin);
      setFormData((prev) => ({ ...prev, Photo: photoUrl }));
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      localStorage.setItem('user', JSON.stringify(updatedAdmin));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('admin-profile-updated'));
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success('Admin avatar updated successfully!');
    } catch (err) {
      console.error('Error uploading admin photo:', err);
      toast.error(err.message || 'Failed to update photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const handleEditClick = () => {
    if (!profile) return;
    setFormData({
      AdminName: profile.AdminName || '',
      Email: profile.Email || '',
      Mobile: profile.Mobile || '',
      EventId: profile.EventId || '',
      Photo: profile.Photo || ''
    });
    setShowEdit(true);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.AdminName.trim() || !formData.Email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      const targetId = decoded?.Id || decoded?.id || profile?.Id;
      const payload = {
        ...formData,
        Photo: formData.Photo || profile?.Photo || ''
      };
      const res = await fetch(`${API_BASE_URL}/api/admin/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      toast.success('Admin profile updated successfully!');
      const updatedAdmin = {
        ...(profile || {}),
        ...payload
      };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      localStorage.setItem('user', JSON.stringify(updatedAdmin));
      setProfile(updatedAdmin);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('admin-profile-updated'));
      window.dispatchEvent(new Event('profileUpdated'));
      setShowEdit(false);
      await fetchAdminProfile();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };
  const currentAdmin = profile || {
    AdminName: 'Administrator',
    Email: 'admin@ayojan.com',
    Mobile: '',
    Id: 1
  };
  const adminName = currentAdmin.AdminName || 'Administrator';
  const joinedDate = currentAdmin.createdAt
    ? new Date(currentAdmin.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Active Lead';
  // Personal Credential rows
  const credentialItems = [
    { label: 'Full Legal Name', value: currentAdmin.AdminName || 'Administrator', icon: User },
    { label: 'Official Email', value: currentAdmin.Email, isVerified: true, icon: Mail },
    { label: 'Mobile Number', value: currentAdmin.Mobile || 'Not provided', icon: Phone },
    {
      label: 'Active Event Focus',
      value: activeEvent?.EventName || currentAdmin.EventName || (currentAdmin.EventId ? `Event #${currentAdmin.EventId}` : 'Assigned Event'),
      badge: activeTypeInfo.label,
      icon: activeTypeInfo.isWorkshop ? GraduationCap : Layers
    },
    { label: 'Admin Security Scope', value: 'Level 2 • Event Administrator', isBadge: true, icon: ShieldCheck },
    {
      label: 'Account Created',
      value: currentAdmin.createdAt
        ? new Date(currentAdmin.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : 'Active Session',
      icon: CalendarDays
    }
  ];
  // Dynamic quick action links based on active event type
  const quickActions = activeTypeInfo.isProjectExpo
    ? [
        {
          title: 'Exhibiting Teams',
          desc: 'Formed squads, team rosters & colleges',
          path: '/admin/teams',
          icon: Users,
          count: `${teamsCount} Squads`
        },
        {
          title: 'Project Submissions',
          desc: 'Abstracts, prototypes & hardware/software specs',
          path: '/admin/expo/projects',
          icon: FileText,
          count: 'Submissions'
        },
        {
          title: 'Booth / Stall Allocation',
          desc: 'Stall numbers, zones, power & venue setups',
          path: '/admin/expo/booths',
          icon: Building2,
          count: 'Stall Maps'
        },
        {
          title: 'Presentation Schedules',
          desc: 'Demo time slots & jury panel assignments',
          path: '/admin/expo/schedules',
          icon: CalendarDays,
          count: 'Demo Slots'
        },
        {
          title: 'Jury & Evaluation',
          desc: 'Rounds, scoring rubrics & live evaluator sheets',
          path: '/admin/expo/evaluation',
          icon: Award,
          count: 'Evaluation Hub'
        },
        {
          title: 'Results & Winners',
          desc: 'Round standings, official awards & trophies',
          path: '/admin/expo/results',
          icon: Trophy,
          count: 'Podium'
        },
        {
          title: 'Expo Event Settings',
          desc: 'Timelines, guidelines & stall configurations',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Broadcast Emailer',
          desc: 'Send mass emails & announcements to teams',
          path: '/admin/broadcast-emailer',
          icon: Send,
          count: 'Send Mails'
        },
        {
          title: 'Exhibitor Feedback',
          desc: 'Team ratings & expo experience reviews',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ]
    : activeTypeInfo.isAlumni
    ? [
        {
          title: 'Reunion Overview',
          desc: 'Milestone batches, statistics & alumni records',
          path: '/admin/alumni/overview',
          icon: Building2,
          count: 'Overview'
        },
        {
          title: 'Reunion Agenda',
          desc: 'Activities, keynote speeches & reunion schedule',
          path: '/admin/alumni/agenda',
          icon: CalendarDays,
          count: 'Timeline'
        },
        {
          title: 'Registrations & RSVPs',
          desc: 'Attending alumni, batch filters & guest counts',
          path: '/admin/alumni/registrations',
          icon: Users,
          count: `${teamsCount} RSVPs`
        },
        {
          title: 'Gate & Food Scanner',
          desc: 'Barcode/QR scanning for alumni passes & food',
          path: '/admin/alumni/attendance',
          icon: QrCode,
          count: `${checkedInCount} Scanned`
        },
        {
          title: 'Invite Dispatcher',
          desc: 'Personalized reunion invites & RSVP links',
          path: '/admin/alumni/invites',
          icon: Send,
          count: 'Invitations'
        },
        {
          title: 'Memory Wall & Gallery',
          desc: 'Reunion photo gallery, throwback stories & wall',
          path: '/admin/alumni/memories',
          icon: Camera,
          count: 'Memories'
        },
        {
          title: 'Reunion Settings',
          desc: 'Venue details, batch rules & RSVP capacity',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Alumni Feedback',
          desc: 'Reunion ratings & attendee testimonials',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ]
    : activeTypeInfo.isSeminar
    ? [
        {
          title: 'Conference Overview',
          desc: 'Call for papers, conference tracks & scope',
          path: '/admin/seminar/overview',
          icon: Building2,
          count: 'Scope'
        },
        {
          title: 'Keynote Speakers',
          desc: 'Chief guests, professors & invited speakers',
          path: '/admin/seminar/speakers',
          icon: UsersRound,
          count: `${instructorsCount} Speakers`
        },
        {
          title: 'Conference Agenda',
          desc: 'Plenary tracks, keynote sessions & timings',
          path: '/admin/seminar/agenda',
          icon: CalendarDays,
          count: `${sessionsCount} Sessions`
        },
        {
          title: 'Seminar Attendance',
          desc: 'Auditorium QR verification & check-ins',
          path: '/admin/seminar/attendance',
          icon: Clock,
          count: `${checkedInCount} Present`
        },
        {
          title: 'Proceedings & Slides',
          desc: 'Research paper PDFs, presentations & booklet',
          path: '/admin/seminar/resources',
          icon: BookOpen,
          count: 'Proceedings'
        },
        {
          title: 'Registered Delegates',
          desc: 'Delegate registration list & affiliations',
          path: '/admin/teams',
          icon: GraduationCap,
          count: `${teamsCount} Delegates`
        },
        {
          title: 'Conference Settings',
          desc: 'Paper criteria, venue & certificate rules',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Delegate Feedback',
          desc: 'Conference ratings & research feedback',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ]
    : activeTypeInfo.isWebinar
    ? [
        {
          title: 'Registered Delegates',
          desc: 'Individual delegate registrations & profiles',
          path: '/admin/teams',
          icon: GraduationCap,
          count: `${teamsCount} Delegates`
        },
        {
          title: 'Keynote Agenda',
          desc: 'Live streams, keynotes & panel talks',
          path: '/admin/webinar/agenda',
          icon: Calendar,
          count: `${sessionsCount} Keynotes`
        },
        {
          title: 'Decks & Recordings',
          desc: 'Presentation slides, video archives & briefs',
          path: '/admin/webinar/resources',
          icon: BookOpen,
          count: 'Materials'
        },
        {
          title: 'Keynote Speakers',
          desc: 'Distinguished dignitaries & panel moderators',
          path: '/admin/webinar/speakers',
          icon: UsersRound,
          count: `${instructorsCount} Speakers`
        },
        {
          title: 'Attendance & Joins',
          desc: 'Virtual join check-ins & presence matrix',
          path: '/admin/webinar/attendance',
          icon: Clock,
          count: `${checkedInCount} Joined`
        },
        {
          title: 'Webinar Settings',
          desc: 'Streaming URLs, delegate cap & guidelines',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Delegate Feedback',
          desc: 'Session ratings & delegate reviews',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ]
    : activeTypeInfo.isWorkshop
    ? [
        {
          title: 'Registered Attendees',
          desc: 'Individual participant profiles & colleges',
          path: '/admin/teams',
          icon: GraduationCap,
          count: `${teamsCount} Attendees`
        },
        {
          title: 'Curriculum & Agenda',
          desc: 'Session schedules, timelines & lab demos',
          path: '/admin/workshop/curriculum',
          icon: Calendar,
          count: `${sessionsCount} Sessions`
        },
        {
          title: 'Study Materials & Kits',
          desc: 'PDFs, slide decks, GitHub repositories',
          path: '/admin/workshop/resources',
          icon: BookOpen,
          count: 'Resources'
        },
        {
          title: 'Instructors & Trainers',
          desc: 'Lead facilitators, tech leads & mentors',
          path: '/admin/workshop/instructors',
          icon: UsersRound,
          count: `${instructorsCount} Instructors`
        },
        {
          title: 'Attendance Tracker',
          desc: 'Live QR check-in & verification records',
          path: '/admin/workshop/attendance',
          icon: Clock,
          count: `${checkedInCount} Present`
        },
        {
          title: 'Workshop Settings',
          desc: 'Prerequisites, tools & capacity settings',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Attendee Feedback',
          desc: 'Course ratings & participant feedback',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ]
    : [
        {
          title: 'Registered Teams',
          desc: 'Formed squads, team rosters & colleges',
          path: '/admin/teams',
          icon: Users,
          count: `${teamsCount} Squads`
        },
        {
          title: 'Core Organizing Team',
          desc: 'Event committee, coordinators & heads',
          path: '/admin/core-team',
          icon: UsersRound,
          count: 'Coordinators'
        },
        {
          title: 'Problem Statements & Themes',
          desc: 'Hackathon domains, hardware & software tracks',
          path: '/admin/physical-event',
          icon: Target,
          count: 'Track Hub'
        },
        {
          title: 'Event Rules & Settings',
          desc: 'Timelines, round controls & registrations',
          path: '/admin/settings',
          icon: Sliders,
          count: 'Configure'
        },
        {
          title: 'Broadcast Emailer',
          desc: 'Send mass emails & announcements to teams',
          path: '/admin/broadcast-emailer',
          icon: Send,
          count: 'Send Mails'
        },
        {
          title: 'Participant Feedback',
          desc: 'Hackathon evaluations & venue feedback',
          path: '/admin/feedback',
          icon: MessageSquare,
          count: `${feedbackCount} Reviews`
        }
      ];
  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-zinc-100 transition-colors p-4 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Breadcrumb & Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Event Administration</span>
              <span className="text-slate-400 dark:text-zinc-600">•</span>
              <span className="text-slate-500 dark:text-zinc-400">Profile &amp; Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Administrator Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Manage your administrator credentials, supervising workspace, and event operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/my-events"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>My Events ({allEvents.length})</span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (showEdit) {
                  setShowEdit(false);
                } else {
                  handleEditClick();
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition"
            >
              {showEdit ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
        {/* Hero Banner with Avatar & Verified Identity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8 lg:p-10"
        >
          <WaveDots
            rows={8}
            cols={12}
            className="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 z-0 opacity-40 dark:opacity-20"
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar Uploader */}
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-xl shadow-emerald-700/20 border-4 border-white dark:border-zinc-900 relative overflow-hidden">
                  {profile?.Photo ? (
                    <img src={profile.Photo} alt={adminName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{adminName.charAt(0).toUpperCase()}</span>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white dark:border-black transition hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Upload avatar photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              {/* Identity & Badges */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize">
                    {adminName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    Verified Administrator
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AYOJAN Operations Lead • Active Workspace Supervisor</span>
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[220px] font-medium">{currentAdmin.Email}</span>
                  </div>
                  {currentAdmin.Mobile && (
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium">{currentAdmin.Mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Dedicated Active Event Focus Row Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              {activeTypeInfo.isWorkshop ? (
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Layers className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Active Event Focus
                </span>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {activeTypeInfo.label || activeTypeInfo.badge || 'Event'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Workspace
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                {activeEvent?.EventName || currentAdmin.EventName || 'Assigned Event'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-0.5">
                <div className="flex items-center gap-1.5 font-medium">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mode: <strong className="text-slate-700 dark:text-zinc-200">{activeEvent?.HackathonMode || 'Physical'}</strong></span>
                </div>
                {activeEvent?.Location && (
                  <>
                    <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 font-medium truncate max-w-[240px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{activeEvent.Location}</span>
                    </div>
                  </>
                )}
                <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
                <span className="font-semibold text-slate-400 dark:text-zinc-500">
                  ID #{activeEvent?.Id || currentAdmin.EventId || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">
            <Link
              to="/admin/settings"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Event Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/my-events"
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>Switch Event</span>
            </Link>
          </div>
        </motion.div>
        {/* Live Metrics Grid — Dynamically tailored for Workshop vs Hackathon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Card 1: Registrations / Attendees */}
          <Link
            to={activeTypeInfo.isAlumni ? '/admin/alumni/registrations' : '/admin/teams'}
            className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 transition group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {activeTypeInfo.isWorkshop
                  ? 'Registered Attendees'
                  : activeTypeInfo.isWebinar || activeTypeInfo.isSeminar
                  ? 'Registered Delegates'
                  : activeTypeInfo.isAlumni
                  ? 'Registered Alumni'
                  : activeTypeInfo.isProjectExpo
                  ? 'Exhibiting Teams'
                  : 'Registered Teams'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                {activeTypeInfo.isWorkshop || activeTypeInfo.isWebinar || activeTypeInfo.isSeminar ? (
                  <GraduationCap className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {teamsCount}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold transition">
                <span>
                  {activeTypeInfo.isWorkshop
                    ? 'Solo attendee list'
                    : activeTypeInfo.isWebinar || activeTypeInfo.isSeminar
                    ? 'Delegate roster'
                    : activeTypeInfo.isAlumni
                    ? 'Alumni RSVP list'
                    : activeTypeInfo.isProjectExpo
                    ? 'Project squads'
                    : 'Squad formation roster'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          {/* Card 2: Attendance / Live Participants */}
          <Link
            to={
              activeTypeInfo.isWorkshop
                ? '/admin/workshop/attendance'
                : activeTypeInfo.isAlumni
                ? '/admin/alumni/attendance'
                : activeTypeInfo.isSeminar
                ? '/admin/seminar/attendance'
                : activeTypeInfo.isWebinar
                ? '/admin/webinar/attendance'
                : activeTypeInfo.isProjectExpo
                ? '/admin/expo/schedules'
                : '/admin/teams'
            }
            className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 transition group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {activeTypeInfo.isWorkshop || activeTypeInfo.isAlumni || activeTypeInfo.isSeminar
                  ? 'Live Check-ins'
                  : activeTypeInfo.isWebinar
                  ? 'Joined Delegates'
                  : activeTypeInfo.isProjectExpo
                  ? 'Demo Schedules'
                  : 'Total Participants'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                {activeTypeInfo.isWorkshop || activeTypeInfo.isAlumni || activeTypeInfo.isSeminar ? (
                  <Clock className="w-4 h-4" />
                ) : activeTypeInfo.isProjectExpo ? (
                  <CalendarDays className="w-4 h-4" />
                ) : (
                  <UsersRound className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTypeInfo.isWorkshop || activeTypeInfo.isAlumni || activeTypeInfo.isSeminar || activeTypeInfo.isWebinar
                  ? checkedInCount
                  : activeTypeInfo.isProjectExpo
                  ? teamsCount
                  : registrationsCount}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold transition">
                <span>
                  {activeTypeInfo.isWorkshop || activeTypeInfo.isAlumni || activeTypeInfo.isSeminar
                    ? 'Verified present'
                    : activeTypeInfo.isWebinar
                    ? 'Live attendees'
                    : activeTypeInfo.isProjectExpo
                    ? 'Demo slots'
                    : 'Total registrations'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          {/* Card 3: Curriculum Sessions / Core Team / Booths */}
          <Link
            to={
              activeTypeInfo.isProjectExpo
                ? '/admin/expo/booths'
                : activeTypeInfo.isAlumni
                ? '/admin/alumni/agenda'
                : activeTypeInfo.isSeminar
                ? '/admin/seminar/agenda'
                : activeTypeInfo.isWebinar
                ? '/admin/webinar/agenda'
                : activeTypeInfo.isWorkshop
                ? '/admin/workshop/curriculum'
                : '/admin/core-team'
            }
            className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 transition group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {activeTypeInfo.isProjectExpo
                  ? 'Booth Allocation'
                  : activeTypeInfo.isAlumni
                  ? 'Reunion Agenda'
                  : activeTypeInfo.isSeminar
                  ? 'Conference Agenda'
                  : activeTypeInfo.isWebinar
                  ? 'Keynote Agenda'
                  : activeTypeInfo.isWorkshop
                  ? 'Curriculum Sessions'
                  : 'Organizing Team'}
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                {activeTypeInfo.isProjectExpo ? (
                  <Building2 className="w-4 h-4" />
                ) : activeTypeInfo.isWorkshop || activeTypeInfo.isWebinar || activeTypeInfo.isSeminar || activeTypeInfo.isAlumni ? (
                  <Calendar className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeTypeInfo.isWorkshop || activeTypeInfo.isWebinar || activeTypeInfo.isSeminar
                  ? sessionsCount
                  : activeTypeInfo.isProjectExpo
                  ? 'Stalls'
                  : 'Active'}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold transition">
                <span>
                  {activeTypeInfo.isProjectExpo
                    ? 'Stall setup & maps'
                    : activeTypeInfo.isAlumni
                    ? 'Scheduled activities'
                    : activeTypeInfo.isSeminar
                    ? 'Plenary tracks'
                    : activeTypeInfo.isWebinar
                    ? 'Live stream schedule'
                    : activeTypeInfo.isWorkshop
                    ? 'Scheduled modules'
                    : 'Committee coordinators'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
          {/* Card 4: Feedback Reviews */}
          <Link
            to="/admin/feedback"
            className="bg-white dark:bg-black rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 transition group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Feedback Reviews
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {feedbackCount}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold transition">
                <span>Event ratings &amp; reviews</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
        {/* Main Content: Left Column (Personal Details & Edit) + Right Column (Quick Actions & Managed Events) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Personal Information OR Edit Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {showEdit ? (
                <motion.div
                  key="edit-form-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-black rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Pencil className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Edit Profile Details
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Update your name, contact email, and mobile number.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setShowEdit(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                      title="Cancel editing"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSave} className="space-y-5">
                    {/* Photo Row in Form */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <div className="relative w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 overflow-hidden flex items-center justify-center shrink-0">
                        {profile?.Photo || formData.Photo ? (
                          <img src={formData.Photo || profile.Photo} alt="Admin preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-emerald-600">{adminName.charAt(0).toUpperCase()}</span>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Profile Photo</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">JPG, PNG or WEBP up to 5MB</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            name="AdminName"
                            value={formData.AdminName}
                            onChange={(e) => setFormData({ ...formData, AdminName: e.target.value })}
                            required
                            placeholder="e.g. Swathi"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Official Email <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            name="Email"
                            value={formData.Email}
                            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                            required
                            placeholder="admin@ayojan.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            name="Mobile"
                            value={formData.Mobile}
                            onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setShowEdit(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="credentials-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                >
                  <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Administrator Credentials &amp; Details
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Active Account
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {credentialItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white break-all">
                              {item.value}
                            </span>
                            {item.isVerified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                            )}
                            {item.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {item.badge}
                              </span>
                            )}
                            {item.isBadge && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-lg font-bold bg-emerald-600 text-white shadow-sm">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* My Supervised Events Showcase */}
            {allEvents.length > 0 && (
              <div className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        My Supervised Events
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Events assigned to your administration account.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/my-events"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {allEvents.map((ev) => {
                    const isSelected = Number(ev.Id) === Number(activeEventId);
                    const evType = getEventTypeInfo(ev.EventType);
                    return (
                      <div
                        key={ev.Id}
                        className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {evType.badge}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Active Focus
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {ev.EventName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span className="truncate">{ev.Location || 'Campus Venue'}</span>
                          </p>
                        </div>
                        {!isSelected ? (
                          <button
                            type="button"
                            onClick={() => handleSwitchEvent(ev)}
                            className="mt-3 w-full py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                          >
                            Set Active Focus
                          </button>
                        ) : (
                          <div className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Currently Active in Portal</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <TwoFactorSettingsCard />
            <ActiveSessionsCard />
          </div>
          {/* Right Column: Tailored Quick Actions & Security */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeTypeInfo.isProjectExpo
                      ? 'Project Expo Control Actions'
                      : activeTypeInfo.isAlumni
                      ? 'Alumni Meet Control Actions'
                      : activeTypeInfo.isSeminar
                      ? 'Seminar & Conference Actions'
                      : activeTypeInfo.isWebinar
                      ? 'Webinar Control Actions'
                      : activeTypeInfo.isWorkshop
                      ? 'Workshop Management Actions'
                      : activeTypeInfo.isCodingContest
                      ? 'Coding Contest Control Actions'
                      : 'Hackathon Control Actions'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {activeTypeInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Direct navigation for &ldquo;{activeEvent?.EventName || 'Active Event'}&rdquo;
                </p>
              </div>
              <div className="space-y-2.5 pt-1">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={i}
                      to={action.path}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {action.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {action.count}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* Security Scope Card */}
            <div className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Security &amp; Session Scope
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Administrator access control parameters
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Session Status</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Authenticated &amp; Live
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Role Authority</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    Event Lead (Full Controls)
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Password Recovery</span>
                  <Link
                    to="/forgot-password"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Reset Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer info */}
        <div className="text-center pt-4 pb-2 text-xs text-slate-400 dark:text-zinc-600">
          <p>© 2026 AYOJAN Event Management System • Authorized Administrator Session</p>
        </div>
      </div>
    </div>
  );
}
