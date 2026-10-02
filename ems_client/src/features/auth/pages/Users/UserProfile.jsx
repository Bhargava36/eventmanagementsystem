import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Globe,
  Shield,
  CheckCircle2,
  Pencil,
  BadgeCheck,
  CircleUserRound,
  VenusAndMars,
  Building2,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  X,
  Save,
  Check,
  Code
} from 'lucide-react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useToast from '../../../../Hooks/useToast';
import { parseJwt } from '../../../../Contexts/AuthContext';
import WaveDots from '../../../../components/Atoms/WaveDots';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [teamsCount, setTeamsCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    College: '',
    Location: '',
    State: '',
    Mobile: '',
    Gender: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = parseJwt(token);

      if (!token || !decoded || (decoded.role && decoded.role !== 'user')) {
        toast.error("Unauthorized session. Please login as participant.");
        navigate("/user/login");
        return;
      }

      const storedUser = localStorage.getItem("user");
      const loggedInUser = storedUser ? JSON.parse(storedUser) : {};
      const targetId = decoded?.Id || decoded?.id || id || loggedInUser.Id || loggedInUser.id;

      if (!targetId) throw new Error("User ID not found in session token");

      const res = await fetch(`http://localhost:3000/api/users/${targetId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      const user = data.user;
      if (!user) throw new Error('User not found');

      setProfile(user);
      setFormData({
        UserName: user.UserName || '',
        Email: user.Email || '',
        College: user.College || '',
        Location: user.Location || '',
        State: user.State || '',
        Mobile: user.Mobile || '',
        Gender: user.Gender || 'Male'
      });

      try {
        const teamsRes = await fetch(`http://localhost:3000/api/teams/my-teams/${targetId}`);
        const teamsData = await teamsRes.json();
        if (teamsRes.ok && teamsData.teams) {
          setTeamsCount(teamsData.teams.length);
        }
      } catch (err) {
        console.log("Teams count fetch note:", err.message);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(error.message || "Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const targetId = id || storedUser.Id;

      const res = await fetch(`http://localhost:3000/api/users/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      const updatedUser = { ...storedUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      await fetchUserProfile();
      toast.success("Profile updated successfully!");
      setShowEdit(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-600 dark:text-slate-400 gap-3">
        <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  const userInitial = profile.UserName ? profile.UserName.charAt(0).toUpperCase() : 'U';
  const joinedDate = profile.CreatedAt
    ? new Date(profile.CreatedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Active Member';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen w-full bg-slate-50/80 dark:bg-[#060709] text-slate-900 dark:text-white transition-colors duration-200 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-400">
                Account Overview
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              User Profile
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/user/dashboard"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:border-emerald-600 transition-colors shadow-sm"
            >
              Dashboard
            </Link>

            <button
              onClick={() => setShowEdit(!showEdit)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              {showEdit ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 dark:from-emerald-950 dark:via-zinc-900 dark:to-teal-950 border border-emerald-500/20 text-white shadow-xl p-6 sm:p-8"
        >
          <WaveDots
            dotColor="rgba(167, 243, 208, 0.7)"
            glowColor="bg-emerald-400/25"
            className="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 z-0"
          />

          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-inner">
                  {userInitial}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-950 rounded-full p-1 shadow-md border-2 border-emerald-900">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                    {profile.UserName || 'Participant'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/20 text-emerald-100 backdrop-blur-sm border border-white/20">
                    Verified Builder
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-medium">
                  {profile.College || 'HackHub EMS Member'}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    {profile.Location || profile.State || 'India'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    Joined {joinedDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                    <VenusAndMars className="w-3.5 h-3.5 text-emerald-300" />
                    {profile.Gender || 'Male'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0 lg:max-w-md w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {teamsCount}
                </p>
                <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">
                  Squads Joined
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-emerald-300 tracking-tight">
                  Active
                </p>
                <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">
                  Account Status
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  100%
                </p>
                <p className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider mt-0.5">
                  Profile Status
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {showEdit ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-zinc-950 border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Update Profile Details
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Keep your contact and collegiate credentials up to date
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="text"
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="tel"
                        name="Mobile"
                        value={formData.Mobile}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      College / Institution
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="text"
                        name="College"
                        value={formData.College}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      State
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="text"
                        name="State"
                        value={formData.State}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      City / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <input
                        type="text"
                        name="Location"
                        value={formData.Location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Gender
                    </label>
                    <div className="relative">
                      <VenusAndMars className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="view-bento"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative overflow-hidden lg:col-span-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Contact & Identity
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      Primary
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          Email Address
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {profile.Email || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          Mobile Phone
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {profile.Mobile || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        <VenusAndMars className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          Gender
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {profile.Gender || 'Male'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                          Location / State
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {[profile.Location, profile.State].filter(Boolean).join(', ') || 'India'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs text-slate-500">
                  <span>Participant ID</span>
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    HH-USR-{profile.Id}
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative overflow-hidden lg:col-span-7 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Academic Credentials
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      Institutional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        College / University
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {profile.College || 'Not Provided'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        Region & State
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {profile.State || 'India'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Access Privilege
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                        Event Participant
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verification State
                      </div>
                      <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 leading-snug">
                        Active & Verified
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Educational Profile</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified Enrollment</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Link
                  to="/user/teams"
                  className="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 shadow-sm transition-all hover:shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        My Squads & Teams
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Track submissions and status
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/user/dashboard"
                  className="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 shadow-sm transition-all hover:shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Browse Hackathons
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Discover open events & prizes
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/user/problem-statements"
                  className="group p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500/50 shadow-sm transition-all hover:shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Problem Statements
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Curated hackathon challenges
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

export default UserProfile;