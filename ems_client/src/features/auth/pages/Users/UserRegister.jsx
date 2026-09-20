import React from 'react';
import Footer from '../../../../components/Organisms/Footer';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  MapPin,
  Map,
  LogIn,
  Compass,
  Code,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const logoElement = (
  <div className="relative h-6 w-6" aria-hidden="true">
    <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
  </div>
);

function UserRegister() {
  const navigate = useNavigate();
  const initialForm = {
    LeadName: "",
    Email: "",
    Password: "",
    College: "",
    Location: "",
    State: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/teamlead/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      alert("Team Lead Account created Successfully!");
      setFormData(initialForm);
      navigate("/teamlead/login");
    }
    catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden px-5">
        <div className="relative lg:w-1/2 flex flex-col overflow-hidden bg-black p-6 lg:p-8 xl:p-10 border-r border-gray-900">
          <div className="relative z-10 mb-4 flex items-center gap-3 text-lg font-semibold lg:mb-8">
            <div className="flex h-10 w-10 items-center justify-center">
              {logoElement}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-wide text-white">HACK_HUB</span>
              <span className="text-xs font-medium tracking-wide text-gray-500">
                EMS
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-8 shrink-0 lg:mt-10">
    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-3">
      Join the Next <span className="text-emerald-500">Generation of Hackers</span>
    </h2>
    <p className="text-gray-400 text-sm lg:text-base max-w-lg">
      Create your participant account to discover hackathons, collaborate with top talent, and build the future.
    </p>
  </div>

  <div className="relative z-10 flex-1 w-full flex flex-col justify-center gap-8 lg:gap-14 min-h-0">
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900/60 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
        <Compass className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-white mb-0.5">Discover Hackathons</h3>
        <p className="text-gray-400 text-xs lg:text-sm">Find and register for top tech events, workshops, and coding competitions worldwide.</p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900/60 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
        <Users className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-white mb-0.5">Form Your Squad</h3>
        <p className="text-gray-400 text-xs lg:text-sm">Connect with developers, designers, and creators to build your dream team seamlessly.</p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900/60 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
        <Code className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-white mb-0.5">Manage Submissions</h3>
        <p className="text-gray-400 text-xs lg:text-sm">Submit your projects, track your judging status, and organize your event workflows.</p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900/60 rounded-xl flex items-center justify-center shrink-0 border border-gray-800">
        <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-white mb-0.5">Showcase Skills</h3>
        <p className="text-gray-400 text-xs lg:text-sm">Build your digital portfolio, earn badges, and climb the global hacker leaderboard.</p>
      </div>
    </div>  
      </div>

        </div>

        <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-8 bg-[#020303] overflow-y-auto">
          <div className="max-w-2xl w-full mx-auto rounded-2xl border border-emerald-500/80 bg-black/70 p-6 sm:p-8 lg:p-10">
            <div className="mb-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="bg-emerald-500/10 p-3 rounded-full">
                  <UserPlus className="w-7 h-7 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  User <span className="text-emerald-500">Register</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                Fill in your details to create your team lead account
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5 lg:space-y-6 [&_label]:text-gray-300 [&_input]:!border-gray-700 [&_input]:!bg-[#0b1118] [&_input]:!text-white [&_input]:placeholder-gray-500 [&_svg]:text-gray-300">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                  <label className="text-gray-700 dark:text-gray-200 font-medium text-sm">Name</label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.LeadName}
                    onChange={(e) => setFormData({...formData, LeadName: e.target.value }) }
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
                    value={formData.Email}
                    onChange={(e) => setFormData({...formData, Email: e.target.value }) }
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
                    type={showPassword ? "text" : "password"}
                    id='password'
                    name='password'
                    value={formData.Password}
                    onChange={(e) => setFormData({...formData, Password: e.target.value }) }
                    placeholder="Create a password"
                    className="w-full pl-4 pr-10 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label={showPassword ? "Hide password" : "Show password"}>
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword ? (
                        <motion.div
                          key="eye-off"
                          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, scale: 0.6, rotate: 30 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: -30 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="w-5 h-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                    value={formData.College}
                    onChange={(e) => setFormData({...formData, College: e.target.value }) }
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
                    value={formData.Location}
                    onChange={(e) => setFormData({...formData, Location: e.target.value }) }
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
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.State}
                    onChange={(e) => setFormData({...formData, State: e.target.value }) }
                    placeholder="Enter your state"
                    className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 focus:border-emerald-700 dark:focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
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
              </div> */}

              {/* <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
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
              </div> */}

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
    </div>
  );
}
export default UserRegister;