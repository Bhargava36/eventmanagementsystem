import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  AtSign,
  Globe,
  Shield,
  CheckCircle2,
  Clock,
  Pencil,
  BadgeCheck,
  CircleUserRound
} from 'lucide-react';

const personalInfo = [
  { icon: User, label: 'Full Name', value: 'Swathi Naidu' },
  { icon: AtSign, label: 'Username', value: 'swathi' },
  { icon: Mail, label: 'Email Address', value: 'swathi@gmail.com' },
  { icon: Phone, label: 'Phone Number', value: '+91 98765 43210' },
  { icon: Globe, label: 'Country', value: 'India' },
  { icon: Clock, label: 'Last Login', value: '16 Aug 2026, 10:45 AM' },
];

function UserProfile() {
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

          <button className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-emerald-700/20 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
          <div className="flex flex-col gap-6 border-b border-emerald-700/20 bg-emerald-700 p-5 text-white dark:border-emerald-500/30 dark:bg-emerald-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-white/10 text-white shadow-lg backdrop-blur-sm sm:h-24 sm:w-24">
                <CircleUserRound className="h-11 w-11 sm:h-14 sm:w-14" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/90">
                  Member profile
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Swathi
                  </h2>
                  <BadgeCheck className="h-5 w-5 text-emerald-100" />
                </div>

              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-emerald-50" />
                <span>India</span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-emerald-50" />
                <span>Joined 15 Jan, 2025</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 bg-slate-50 p-5 dark:bg-[#090b0e] sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Mail className="h-4 w-4" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">swathi@gmail.com</p>
            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Phone className="h-4 w-4" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">+91 98765 43210</p>
            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <Shield className="h-4 w-4" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">User</p>
            </div>

            <div className="rounded-2xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-500">Active</p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-700/20 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-emerald-500/30 dark:bg-[#0b0b0b]">
          <div className="border-b border-emerald-700/20 px-5 py-4 dark:border-emerald-500/30">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="divide-y divide-emerald-700/20 dark:divide-emerald-500/30">
            {personalInfo.map((info, index) => {
              const Icon = info.icon;

              return (
                <div
                  key={index}
                    className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#0b0b0b] sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:w-56">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{info.label}</span>
                  </div>

                  <div className="flex-1 sm:pl-2">
                    {info.isStatus ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                        {info.value}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{info.value}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2026 HackHub EMS. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default UserProfile;