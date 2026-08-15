import { Link } from "react-router-dom";
import { ShieldCheck, Users, BarChart3, Settings, Shield, UserPlus, UserRound, Mail, Lock, Eye, ArrowRight,Phone } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import BackgroundEffect from "../../../components/Molecules/WaveBackgorund";

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
  </div>
);

function Register() {

  return (
      <div className="relative w-full min-h-screen overflow-y-auto border-2 border-gray-800 rounded-2xl">
        <div className="flex gap-3 m-8 text-lg font-semibold items-center">
        <div className="w-10 h-10 flex items-center justify-center">
          {logoElement}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-wide">HACK_HUB</span>
          <span className="text-xs font-medium tracking-widest text-gray-500 dark:text-gray-400">
            EMS
          </span>
        </div>
      </div>
        <div className="flex mx-30">
          <div className="flex flex-col w-7/12">
            <div>
              <UserPlus className="w-14 h-14 text-black dark:text-white p-4 rounded-2xl" />
              <Shield className="w-24 h-24 text-emerald-700 dark:text-emerald-500 p-4 rounded-2xl -ml-5 -mt-19" />
            </div>
            <h1 className="text-6xl font-bold">Create Your</h1>
            <h1 className="text-4xl font-bold text-emerald-700 dark:text-emerald-500">Super Admin Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-xl">
              Join the event management platform and
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              take full control of your events.
            </p>
            <div className="flex flex-col gap-10 mt-10">
              <div className="flex items-center gap-10">
                <ShieldCheck className="w-15 h-15 bg-gray-100 dark:bg-white/15 text-emerald-700 dark:text-emerald-500 p-3 rounded-2xl" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Secure & Protected</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your data is encrypted and protected with industry-standard security.</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <Users className="w-15 h-15 bg-gray-100 dark:bg-white/15 text-emerald-700 dark:text-emerald-500 p-3 rounded-2xl" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Role-Based Access</h3>
                  <p className="text-gray-600 dark:text-gray-400">Manage users and permissions with granular role controls.</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <BarChart3 className="w-15 h-15 bg-gray-100 dark:bg-white/15 text-emerald-700 dark:text-emerald-500 p-3 rounded-2xl" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Real-time Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400">Get real-time analytics and reports to make smarter decisions.</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <Settings className="w-15 h-15 bg-gray-100 dark:bg-white/15 text-emerald-700 dark:text-emerald-500 p-3 rounded-2xl" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold">Easy Configuration</h3>
                  <p className="text-gray-600 dark:text-gray-400">Set up your system quickly and customize it to your needs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-5/12 border-2 border-emerald-700 dark:bg-black/40 rounded-2xl bg-white/40">
            <div className="border-2 border-emerald-500 w-13 p-3.5 mt-5 rounded-full ml-auto mr-auto flex items-center justify-center">
              {logoElement}
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-0.5">Create Account</h1>
              <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">Super Admin</h1>
              <p className="text-gray-600 dark:text-gray-400">Fill in your details to create your admin account</p>
            </div>
            <div className="px-10 pb-10 pt-4">
            <div className="relative w-full mb-6 mt-2">
                <UserRound className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="text"
                  id="username"
                  placeholder=" "
                  required
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="username"
                  className="absolute left-8 top-2 text-gray-500 transition-all duration-200
                             peer-placeholder-shown:top-2
                             peer-placeholder-shown:text-base
                             peer-focus:-top-4
                             peer-focus:text-sm
                             peer-focus:text-emerald-500
                             peer-valid:-top-4
                             peer-valid:text-sm"
                >
                  Username
                </label>
            </div>

            <div className="relative w-full mb-6">
                <Phone className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="text"
                  id="phone"
                  placeholder=" "
                  required
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="phone"
                  className="absolute left-8 top-2 text-gray-500 transition-all duration-200
                             peer-placeholder-shown:top-2
                             peer-placeholder-shown:text-base
                             peer-focus:-top-4
                             peer-focus:text-sm
                             peer-focus:text-emerald-500
                             peer-valid:-top-4
                             peer-valid:text-sm"
                >
                  Phone Number
                </label>
            </div>

             <div className="relative w-full mb-6">
                <Mail className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="text"
                  id="email"
                  placeholder=" "
                  required
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="email"
                  className="absolute left-8 top-2 text-gray-500 transition-all duration-200
                             peer-placeholder-shown:top-2
                             peer-placeholder-shown:text-base
                             peer-focus:-top-4
                             peer-focus:text-sm
                             peer-focus:text-emerald-500
                             peer-valid:-top-4
                             peer-valid:text-sm"
                >
                  Email Address
                </label>
            </div>
            <div className="relative w-full mb-6">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="password"
                  id="password"
                  placeholder=" "
                  required
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="password"
                  className="absolute left-8 top-2 text-gray-500 transition-all duration-200
                             peer-placeholder-shown:top-2
                             peer-placeholder-shown:text-base
                             peer-focus:-top-4
                             peer-focus:text-sm
                             peer-focus:text-emerald-500
                             peer-valid:-top-4
                             peer-valid:text-sm"
                >
                  Password
                </label>
            </div>
            <div className="relative w-full mb-6">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="password"
                  id="confirmPassword"
                  placeholder=" "
                  required
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="confirmPassword"
                  className="absolute left-8 top-2 text-gray-500 transition-all duration-200
                             peer-placeholder-shown:top-2
                             peer-placeholder-shown:text-base
                             peer-focus:-top-4
                             peer-focus:text-sm
                             peer-focus:text-emerald-500
                             peer-valid:-top-4
                             peer-valid:text-sm"
                >
                  Confirm Password
                </label>
            </div> 
              <button className="w-full bg-emerald-700 dark:bg-emerald- text-white p-2 rounded-lg hover:bg-emerald-700 transition duration-300 flex items-center justify-center gap-2 font-medium">
                Create Account <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center mt-6">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <button className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition duration-300 flex items-center justify-center gap-2">
                    <FcGoogle className="w-5 h-5" />
                        Sign in with Google
                </button>

              <div className="flex flex-row items-center mt-6 ml-15 text-gray-400 text-sm gap-3 m-auto">
                <p>
                    <Lock className="w-4 h-4 text-gray-500"/>
                </p>
                <p>
                    Secure access for authorized Super Admins only.
                </p>
            </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Register;