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
  CircleUserRound
} from 'lucide-react';
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    College: '',
    Location: '',
    State: '',
    CreatedAt: '',
    Mobile: ''
  });

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/users/${id}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to fetch profile'
        );
      }

      const user = data.events[0];

      if (!user) {
        throw new Error('User not found');
      }

      setProfile(user);

      setFormData({
        UserName: user.UserName || '',
        Email: user.Email || '',
        College: user.College || '',
        Location: user.Location || '',
        State: user.State || '',
        CreatedAt: user.CreatedAt || '',
        Mobile: user.Mobile || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleEdit = () => {
    setFormData({
      UserName: profile.UserName || '',
      Email: profile.Email || '',
      College: profile.College || '',
      Location: profile.Location || '',
      State: profile.State || '',
      CreatedAt: profile.CreatedAt || '',
      Mobile: profile.Mobile || ''
    });

    setShowEdit(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/users/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Profile update failed'
        );
      }

      await fetchUserProfile();

      setShowEdit(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  if (!profile) {
    return (
      <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-[#050505] dark:text-white">

      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-500">
              Account
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              User Profile
            </h1>
          </div>

          {!showEdit && (
            <button
              onClick={handleEdit}
              className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          )}

        </div>

        <div className="overflow-hidden rounded-[28px] border border-emerald-700/20 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

          <div className="flex flex-col gap-6 border-b border-emerald-700/20 bg-emerald-700 p-5 text-white dark:border-emerald-500/30 dark:bg-emerald-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-white/10 text-white shadow-lg sm:h-24 sm:w-24">
                <CircleUserRound className="h-11 w-11 sm:h-14 sm:w-14" />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
                  Member Profile
                </p>

                <div className="mt-2 flex items-center gap-2">

                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {profile.UserName || '-'}
                  </h2>

                  <BadgeCheck className="h-5 w-5 text-emerald-100" />

                </div>

                <p className="mt-1 text-sm text-emerald-100">
                  HackHub EMS User
                </p>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm">
                <MapPin className="h-4 w-4 text-emerald-50" />

                <span>
                  {profile.Location || 'India'}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm">

                <Calendar className="h-4 w-4 text-emerald-50" />

                <span>
                  Joined{' '}
                  {profile.CreatedAt
                    ? new Date(
                        profile.CreatedAt
                      ).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }
                      )
                    : '-'}
                </span>

              </div>

            </div>

          </div>

          <div className="grid gap-4 bg-slate-50 p-5 dark:bg-[#090b0e] sm:grid-cols-2 lg:grid-cols-4 sm:p-6">

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Mail className="h-4 w-4" />
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-slate-900 dark:text-white">
                {profile.Email || '-'}
              </p>

            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Phone className="h-4 w-4" />
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Phone
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {profile.Mobile || '-'}
              </p>

            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Shield className="h-4 w-4" />
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Role
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                User
              </p>

            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Status
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-500">
                Active
              </p>

            </div>

          </div>

        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-700/20 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-emerald-500/30 dark:bg-[#0b0b0b]">

          <div className="border-b border-emerald-700/20 px-5 py-4 dark:border-emerald-500/30">

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Personal Information
            </h2>

          </div>

          {showEdit ? (

            <div className="grid gap-5 p-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  User Name
                </label>

                <input
                  type="text"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Mobile
                </label>

                <input
                  type="text"
                  name="Mobile"
                  value={formData.Mobile}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  College
                </label>

                <input
                  type="text"
                  name="College"
                  value={formData.College}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  Location
                </label>

                <input
                  type="text"
                  name="Location"
                  value={formData.Location}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
                  State
                </label>

                <input
                  type="text"
                  name="State"
                  value={formData.State}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-[#090b0e] dark:text-white"
                />

              </div>

              <div className="flex gap-3 sm:col-span-2">

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

              </div>

            </div>

          ) : (

            <div className="divide-y divide-emerald-700/20 dark:divide-emerald-500/30">

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <User className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    User Name
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.UserName || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <Mail className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Email
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.Email || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <Phone className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Mobile
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.Mobile || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <GraduationCap className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    College
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.College || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Location
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.Location || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <Globe className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    State
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile.State || '-'}
                </span>

              </div>

              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3 sm:w-56">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                    <Calendar className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Joined Date
                  </span>

                </div>

                <span className="text-sm font-medium text-slate-900 dark:text-white">

                  {profile.CreatedAt
                    ? new Date(
                        profile.CreatedAt
                      ).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }
                      )
                    : '-'}

                </span>

              </div>

            </div>

          )}

        </div>

        <div className="pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2026 HackHub EMS. All rights reserved.
        </div>

      </div>

    </div>
  );
}

export default UserProfile;