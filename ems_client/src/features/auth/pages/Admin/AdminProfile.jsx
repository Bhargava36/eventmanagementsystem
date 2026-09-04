import {
  Pencil,
  Crown,
  Shield,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Quote,
  User,
  AtSign,
  Globe,
  ShieldCheck,
  CircleCheck,
  Clock,
  CheckCircle2,
  Users,
  CircleUserRound,
  UsersRound ,
  Lock,
  ChevronRight,
  ToggleLeft,
} from "lucide-react";

{/*objects*/}

const personalInfo = [
      { 
        icon: User, 
        label: 'Full Name', 
        value: 'Admin' 
      },
      { 
        icon: AtSign, 
        label: 'Username', 
        value: 'admin' 
      },
      { 
        icon: Mail, 
        label: 'Email Address', 
        value: 'admin@hackhub.com' 
      },
      { 
        icon: Phone, 
        label: 'Phone Number', 
        value: '+91 98765 43210' 
      },
      { 
        icon: Globe, 
        label: 'Country', 
        value: 'India' 
      },
      { 
        icon: Shield, 
        label: 'Account Type', 
        value: 'Admin' 
      },
      { 
        icon: CheckCircle2, 
        label: 'Status', 
        value: 'Active', 
        isStatus: true 
      },
      { 
        icon: Clock, 
        label: 'Last Login', 
        value: '16 Aug 2026, 10:45 AM' 
      },
];

function AdminProfile() {
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors overflow-x-hidden">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4">
        <div>
          <h1 className="text-black font-bold dark:text-white text-2xl sm:text-3xl">
            Admin Profile
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 pt-1 text-sm sm:text-base">
            View and manage your personal information
          </p>
        </div>

        <div>
          <button className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg w-fit font-medium text-sm cursor-pointer">
            <Pencil className="w-5 h-5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* next - part (admin card) */}

      {/** crown part */}
      <div className="border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl bg-white mx-4 sm:mx-6 md:mx-8 lg:m-10 mt-6 sm:mt-8 lg:mt-10 dark:bg-black shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-around p-5 sm:p-7 md:p-8 lg:p-10 gap-6 lg:gap-8">

          {/* crown part */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 bg-emerald-100 rounded-full dark:bg-emerald-500/20 flex items-center justify-center border-3 border-emerald-700 dark:border-emerald-500">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 text-emerald-700 fill-emerald-700" />
            </div>

            <h2 className="mt-2 flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 font-medium border border-emerald-300 w-24">
              <Shield className="w-4 h-4" />
              Admin
            </h2>
          </div>

          {/* admin - part */}
          <div className="pl-0 w-full lg:w-auto">
            <div className="flex gap-2 items-center justify-center lg:justify-start">
              <h2 className="text-black font-bold dark:text-white text-xl sm:text-2xl">
                Admin
              </h2>

              <BadgeCheck className="text-emerald-700 dark:text-emerald-500 fill-emerald-100 dark:fill-emerald-500/20" />
            </div>

            <div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-1">
                <Mail className="text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span className="break-all">admin@hackhub.com</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-1">
                <Phone className="text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-1">
                <MapPin className="text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>India</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-1">
                <Calendar className="text-emerald-700 dark:text-emerald-500 shrink-0" />
                <span>Joined on 15 Jan, 2025</span>
              </div>
            </div>
          </div>

          {/* divider  part*/}
          <div className="h-px w-full lg:h-32 lg:w-px bg-gray-200 dark:bg-gray-800"></div>

          {/* quote part */}
          <div className="text-gray-500 dark:text-gray-400 text-center lg:text-left w-full lg:w-auto">
            <Quote className="mb-2 mx-auto lg:mx-0 text-emerald-500 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-500/50" />

            <p className="italic">Managing events, empowering</p>
            <p className="italic">teams, creating impact.</p>
          </div>
        </div>
      </div>

        {/**next - part  */}

        {/**Personal information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
       <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 mx-4 sm:mx-6 md:mx-8 lg:m-10 mt-6 lg:mt-10 dark:border-gray-800 shadow-sm overflow-hidden">

          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {personalInfo.map((info, i) => {
              const Icon = info.icon;
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

                  <div className="flex-1 pl-9 sm:pl-0 min-w-0">
                    {info.isStatus ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                        {info.value}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">
                        {info.value}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*right side part*/}

        {/*Activity Overview*/}

        <div className="flex flex-col mt-0 lg:mt-5.5">
            <div className="card p-4 sm:p-5 md:p-6 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 mx-4 sm:mx-6 md:mx-8 lg:m-5 mt-5 lg:mt-0 dark:border-gray-800 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold mb-4">
                Activity Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="rounded-xl flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-500/30">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-semibold">
                      245
                    </div>

                    <div className="text-lg-400 text-xs text-gray-500 dark:text-gray-400">
                      Total Users
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="rounded-xl flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-500/30">
                      <CircleUserRound className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-semibold">
                      18
                    </div>

                    <div className="text-lg-400 text-xs text-gray-500 dark:text-gray-400">
                      Total Admins
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="rounded-xl flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-lime-200 dark:bg-lime-500/30">
                      <UsersRound className="w-6 h-6 sm:w-7 sm:h-7 text-lime-500" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-semibold">
                      56
                    </div>

                    <div className="text-lg-400 text-xs text-gray-500 dark:text-gray-400">
                      Total Teams
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="rounded-xl flex items-center justify-center">
                    <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-500/30">
                      <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-semibold">
                      12
                    </div>

                    <div className="text-lg-400 text-xs text-gray-500 dark:text-gray-400">
                      Total Events
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/*security*/}

            <div className="card p-4 sm:p-5 md:p-6 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 mx-4 sm:mx-6 md:mx-8 lg:m-5 mt-4 lg:mt-0 dark:border-gray-800 shadow-sm overflow-hidden">

              <h2 className="text-lg font-semibold mb-4">
                Security
              </h2>

              <div className="flex gap-3 sm:gap-5 items-center">
                <Lock className="shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base">
                    Change Password
                  </div>

                  <div className="dark:text-gray-400 text-xs text-gray-500 sm:text-sm">
                    Update your account password
                  </div>
                </div>

                <ChevronRight className="shrink-0" />
              </div>

              <div className="flex gap-3 sm:gap-5 pt-5 items-center">
                <ShieldCheck className="shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base">
                    Two Factor Authentication
                  </div>

                  <div className="dark:text-gray-400 text-xs text-gray-500 sm:text-sm">
                    Add extra security to your account
                  </div>
                </div>
                <ToggleLeft className="w-9 h-8 sm:w-10 sm:h-9 shrink-0" />
              </div>
            </div>
        </div>
      </div>


       {/*footer*/}
      <div className="text-center pt-2 pb-4 px-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2026 HackHub EMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AdminProfile;
