import React, { useState } from 'react';
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
  Crown,
  X,
} from 'lucide-react';

const personalInfo = [
  { icon: User, label: 'Full Name', value: 'Super Admin' },
  { icon: AtSign, label: 'Username', value: 'superadmin' },
  { icon: Mail, label: 'Email Address', value: 'superadmin@hackhub.com' },
  { icon: Phone, label: 'Phone Number', value: '+91 98765 43210' },
  { icon: Globe, label: 'Country', value: 'India' },
  { icon: Shield, label: 'Account Type', value: 'Super Admin' },
  { icon: CheckCircle2, label: 'Status', value: 'Active', isStatus: true },
  { icon: Clock, label: 'Last Login', value: '16 Aug 2026, 10:45 AM' },
];

function SuperAdminProfile() {
  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    fullName: 'Super Admin',
    username: 'superadmin',
    email: 'superadmin@hackhub.com',
    phone: '+91 98765 43210',
    country: 'India',
  });

  const [profileData, setProfileData] = useState(formData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setFormData(profileData);
    setShowEdit(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData(formData);
    setShowEdit(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Super Admin Profile
          </h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            View and manage your profile information.
          </p>
        </div>

        <button
          onClick={handleEdit}
          className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="bg-white dark:bg-gray-950 rounded-xl p-5 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-100/50 to-transparent dark:from-emerald-500/10 dark:to-transparent"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border-4 border-emerald-700 dark:border-emerald-500">
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-black dark:text-white" />
              </div>

              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Super Admin
              </span>
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.fullName}
                </h2>

                <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 dark:text-emerald-500 fill-emerald-100 dark:fill-emerald-500/20 shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span className="truncate">{profileData.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>{profileData.phone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>{profileData.country}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                  <span>Joined on 15 Jan, 2025</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block border-l border-gray-200 dark:border-gray-800 pl-6 max-w-xs">
              <p className="text-4xl text-emerald-700 dark:text-emerald-500 font-serif leading-none mb-2">
                "
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                Managing events, empowering teams, creating impact.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {personalInfo.map((info, i) => {
              const Icon = info.icon;

              let value = info.value;

              if (info.label === 'Full Name') value = profileData.fullName;
              if (info.label === 'Username') value = profileData.username;
              if (info.label === 'Email Address') value = profileData.email;
              if (info.label === 'Phone Number') value = profileData.phone;
              if (info.label === 'Country') value = profileData.country;

              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:min-w-[200px]">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                    </div>

                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {info.label}
                    </span>
                  </div>

                  <div className="flex-1 pl-9 sm:pl-0">
                    {info.isStatus ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                        {value}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {value}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2026 HackHub EMS. All rights reserved.
          </p>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Update your profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminProfile;