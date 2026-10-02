import React, { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Crown,
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
  ArrowRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useToast from '../../../../Hooks/useToast';
import { parseJwt } from '../../../../Contexts/AuthContext';
import WaveDots from '../../../../components/Atoms/WaveDots';

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

function AdminProfile() {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState(() => getStoredAdminData());
  const [eventDetails, setEventDetails] = useState(null);
  const [teamsCount, setTeamsCount] = useState(0);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    AdminName: '',
    Email: '',
    Mobile: '',
    EventId: ''
  });

  const fetchAdminProfile = useCallback(async () => {
    try {
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

      const res = await fetch(`http://localhost:3000/api/admin/${targetId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch admin profile');
      }

      const data = await res.json();
      const adminData = data.events?.[0] || data.admin || data;

      if (adminData) {
        setProfile(adminData);
        setFormData({
          AdminName: adminData.AdminName || '',
          Email: adminData.Email || '',
          Mobile: adminData.Mobile || '',
          EventId: adminData.EventId || ''
        });

        const eventId = adminData.EventId;
        if (eventId) {
          try {
            const eventRes = await fetch(`http://localhost:3000/api/events/${eventId}`);
            if (eventRes.ok) {
              const eData = await eventRes.json();
              setEventDetails(eData.event || null);
            }
          } catch (e) {
            console.warn('Could not fetch assigned event info:', e);
          }

          try {
            const [teamsRes, usersRes] = await Promise.all([
              fetch(`http://localhost:3000/api/teams/event/${eventId}/count`),
              fetch(`http://localhost:3000/api/event_reg/event/${eventId}/count`)
            ]);

            if (teamsRes.ok) {
              const td = await teamsRes.json();
              setTeamsCount(td.count || 0);
            }
            if (usersRes.ok) {
              const ud = await usersRes.json();
              setRegistrationsCount(ud.count || 0);
            }
          } catch (e) {
            console.warn('Could not fetch event stats:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  const handleEditClick = () => {
    if (!profile) return;
    setFormData({
      AdminName: profile.AdminName || '',
      Email: profile.Email || '',
      Mobile: profile.Mobile || '',
      EventId: profile.EventId || ''
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

      const res = await fetch(`http://localhost:3000/api/admin/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      toast.success('Admin profile updated successfully!');

      const updatedAdmin = {
        ...(profile || {}),
        AdminName: formData.AdminName,
        Email: formData.Email,
        Mobile: formData.Mobile
      };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      localStorage.setItem('user', JSON.stringify(updatedAdmin));
      setProfile(updatedAdmin);

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
    Email: 'admin@hackhub.com',
    Mobile: '',
    Id: 12,
    createdAt: new Date().toISOString()
  };

  const adminName = currentAdmin.AdminName || 'Administrator';
  const joinedDate = currentAdmin.createdAt
    ? new Date(currentAdmin.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Active Member';

  const credentialItems = [
    { label: 'Full Name', value: currentAdmin.AdminName },
    { label: 'Email Address', value: currentAdmin.Email, isVerified: true },
    { label: 'Phone Number', value: currentAdmin.Mobile || 'Not provided' },
    {
      label: 'Assigned Event',
      value: eventDetails?.EventName || currentAdmin.EventName || (currentAdmin.EventId ? `Event #${currentAdmin.EventId}` : 'Main Hackathon Event')
    },
    { label: 'Country', value: 'India' },
    {
      label: 'Joined Date',
      value: currentAdmin.createdAt
        ? new Date(currentAdmin.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : 'Active Member'
    },
    { label: 'Account Type', value: 'Event Admin', isBadge: true }
  ];

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors p-4 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Event Admin</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">Profile Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white font-['Syne']">
              Admin Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage your admin profile and event details.
            </p>
          </div>

          <div>
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
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
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

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-emerald-500/20 shadow-xl p-6 sm:p-8 lg:p-10"
        >
          <WaveDots
            rows={8}
            cols={12}
            className="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 z-0"
          />

          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-tr from-emerald-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl shadow-emerald-700/20 border-2 border-emerald-400/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{adminName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-md border-2 border-white dark:border-gray-950">
                  <Crown className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight capitalize">
                    {adminName}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified Admin
                  </span>
                </div>

                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Event Administrator</span>
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-4 pt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-800">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate max-w-[200px]">{currentAdmin.Email}</span>
                  </div>

                  {currentAdmin.Mobile && (
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{currentAdmin.Mobile}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-800">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Assigned Event</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate" title={eventDetails?.EventName || currentAdmin.EventName || 'Hackathon Hub'}>
                {eventDetails?.EventName || currentAdmin.EventName || (currentAdmin.EventId ? `Event #${currentAdmin.EventId}` : 'Main Hackathon')}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Primary Supervision</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/teams"
            className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Registered Teams</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {teamsCount}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
                <span>Manage squads</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            to="/admin/dashboard"
            className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Participants</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <UsersRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {registrationsCount}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium transition-colors">
                <span>Live registrations</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Security Clearance</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                Event Lead
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Elevated Rights</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {showEdit ? (
                <motion.div
                  key="edit-form-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-gray-950 rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Pencil className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-['Syne']">
                          Edit Profile
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Update your personal and contact details
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setShowEdit(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                      title="Cancel editing"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="AdminName"
                            value={formData.AdminName}
                            onChange={(e) => setFormData({ ...formData, AdminName: e.target.value })}
                            required
                            placeholder="e.g. John Doe"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="Email"
                            value={formData.Email}
                            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                            required
                            placeholder="admin@hackhub.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="Mobile"
                            value={formData.Mobile}
                            onChange={(e) => setFormData({ ...formData, Mobile: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Assigned Event (System Assigned)
                        </label>
                        <div className="relative">
                          <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                          <input
                            type="text"
                            disabled
                            value={eventDetails?.EventName || currentAdmin.EventName || (currentAdmin.EventId ? `Event #${currentAdmin.EventId}` : 'Main Hackathon Event')}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setShowEdit(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
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
                  className="relative bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Personal Information
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                        Verified Details
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {credentialItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                          {item.label}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-all">
                            {item.value}
                          </span>
                          {item.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-500/20" />
                          )}
                          {item.isBadge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3 relative z-10">
                <Link
                  to="/admin/teams"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Registered Teams</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">View & inspect cohorts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                </Link>

                <Link
                  to="/admin/core-team"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      <UsersRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Core Team</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Manage organizers</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                </Link>

                <Link
                  to="/admin/dashboard"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin Dashboard</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Live analytics & feeds</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center pt-4 pb-2 text-xs text-gray-400 dark:text-gray-600">
          <p>© 2026 HackHub Event Management System • Authorized Administrator Session</p>
        </div>
      </div>


    </div>
  );
}

export default AdminProfile;
