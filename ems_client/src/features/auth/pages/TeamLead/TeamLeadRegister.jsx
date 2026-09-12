import React from 'react';
import Footer from '../../../../components/Organisms/Footer';
import { 
  Calendar, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  Image as ImageIcon, 
  CloudUpload, 
  GraduationCap, 
  Users, 
  MapPin, 
  Map, 
  LogIn, 
  ChevronDown 
} from 'lucide-react';

import teamLeadRegisterBg from '../../../../assets/teamlead_register_bg.png';

const logoElement = (
  <div className="relative h-6 w-6" aria-hidden="true">
    <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
  </div>
);

function TeamLeadRegister() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <div className="relative lg:w-1/2 flex flex-col bg-emerald-50/50 dark:bg-emerald-950/20 p-6 lg:p-8 xl:p-10 border-r border-gray-100 dark:border-gray-900">

          <div className="mb-4 flex  items-center gap-3 text-lg font-semibold lg:mb-8">
            <div className="flex h-10 w-10 items-center justify-center bg-white/60 dark:border-gray-800 dark:bg-gray-900/40">
              {logoElement}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-wide text-gray-900 dark:text-white">HACK_HUB</span>
              <span className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">
                EMS
              </span>
            </div>
          </div>

          <div className="relative z-10 mb-8 lg:mb-12">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              Create Your Team, <br/>
              Make It <span className="text-emerald-700 dark:text-emerald-500">Happen!</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base max-w-md">
              Register as a team lead and get started with managing events seamlessly.
            </p>
          </div>

          <div className="relative z-10 flex-1 w-full mt-auto flex items-end justify-center min-h-[300px]">
            <img 
              src={teamLeadRegisterBg} 
              alt="Team management workspace" 
              className="w-full h-full max-h-[500px] object-cover rounded-2xl shadow-2xl border border-white/50 dark:border-gray-800/50"
            />
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 lg:py-8 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="max-w-2xl w-full mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-full">
                  <UserPlus className="w-7 h-7 text-emerald-700 dark:text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Team Lead <span className="text-emerald-700 dark:text-emerald-500">Register</span>
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Fill in your details to create your team lead account
              </p>
            </div>

            <form className="space-y-5 lg:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Name</label>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Email</label>
                </div>
                <div className="flex-1">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Password</label>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="password" 
                    placeholder="Create a password" 
                    className="w-full pl-4 pr-10 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">College</label>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter your college name" 
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Location</label>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter your location" 
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <Map className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">State</label>
                </div>
                <div className="flex-1 relative">
                  <select 
                    defaultValue=""
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-400">Select your state</option>
                    <option value="Ap">Andhra Pradesh</option>
                    <option value="Tg">Telangana</option>
                    <option value="Ka">Karnataka</option>
                    <option value="Tn">Tamil Nadu</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1 sm:pt-4">
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Photo</label>
                </div>
                <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm group-hover:scale-105 transition-transform border border-gray-100 dark:border-gray-700">
                     <CloudUpload className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Upload your photo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1 sm:pt-4">
                  <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">College ID</label>
                </div>
                <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm group-hover:scale-105 transition-transform border border-gray-100 dark:border-gray-700">
                     <CloudUpload className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Upload your College ID photo</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 dark:shadow-emerald-500/20"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Register</span>
                </button>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account? <a href="#" className="text-emerald-700 dark:text-emerald-500 font-semibold hover:underline">Login</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default TeamLeadRegister;