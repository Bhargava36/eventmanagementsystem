import { Link, useNavigate } from "react-router-dom";
import {
  ChartNoAxesCombined,
  ShieldCheck,
  Settings,
  Lock,
  UserRound,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import WaveBackground from "../../../components/Molecules/WaveBackgorund";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    </div>
  );

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if(!email || !password) {
      setError("Required to fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/super_admin/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });

      const data = await res.json();

      if(!res.ok) {
        throw new Error(data.message || data.error || "Login failed"); 
      }

      if(data.token) {
        localStorage.setItem("token", data.token);
      }

      if(data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      alert("Logging Successfully!");
      navigate("/sidebar");
    }
    catch(err) {
      setError(err.message || "Login failed, try again later");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="relative w-full  min-h-screen overflow-y-auto bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300"
      animate={{
              y: [-100,0],
            }}
            transition={{
              duration: 0.5,repeat: 0,ease: "easeInOut",
            }}
    >
        
          <WaveBackground />
      <div className="flex gap-3 m-4 sm:m-8 text-lg font-semibold items-center">
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

      <div className="flex flex-col lg:flex-row mx-4 sm:mx-8 lg:mx-30 gap-6 lg:gap-0">
        <div className="hidden lg:flex flex-col w-full lg:w-7/12 p-0 lg:p-10">
          <motion.p className="text-sm font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 mb-4"
            initial={{opacity:0,x:-100}}
            animate={{opacity:1,x:0}}
            exit={{opacity:0, x:100}}
            transition={{duration: 0.5,delay:0.1,repeat: 0,ease: "easeInOut"}}
          >
            ONE PLATFORM. ALL EVENTS.
          </motion.p>

          <motion.h1 className="text-3xl lg:text-5xl font-bold"
            initial={{opacity:0,y:50}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0, y:50}}
            transition={{duration: 0.5,delay:0.1,repeat: 0,ease: "easeInOut"}}
          >
            Super Admin Control
          </motion.h1>
          <motion.h1 className="text-3xl lg:text-5xl font-bold "
          initial={{opacity:0,y:50}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0, y:50}}
            transition={{duration: 0.5,delay:0.1,repeat: 0,ease: "easeInOut"}}
          >
            <span className="text-emerald-700 dark:text-emerald-400">
              Center
            </span>
          </motion.h1>

          <motion.p className="text-gray-700 dark:text-gray-300 mt-4 lg:mt-6 text-base lg:text-lg"
            initial={{opacity:0,y:100}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0, y:-100}}
            transition={{duration: 0.5,delay:0.1,repeat: 0,ease: "easeInOut"}}
          >
            Secure. Monitor. Manage. Take complete control of your event 
          </motion.p>
          <motion.p className="text-gray-700 dark:text-gray-300 text-base lg:text-lg"
          initial={{opacity:0,y:100}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0, y:-100}}
            transition={{duration: 0.5,delay:0.1,repeat: 0,ease: "easeInOut"}}
          >
            management platform.
          </motion.p>

          <div className="flex flex-col gap-4 lg:gap-6 mt-6 lg:mt-10 ">
            <motion.div
            initial={{opacity:0, y: 100}}
            animate={{opacity:1, y: 0}}
            exit={{opacity:0,  y: 100}}
            transition={{duration: 0.5,delay:0.3,repeat: 0,ease: "easeInOut"}}
            className="flex items-center gap-3 lg:gap-5">
              <ChartNoAxesCombined className="w-12 lg:w-16 h-12 lg:h-16 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0" />
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-xl font-semibold">Real-time Insights</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Track registration, engagement & performance.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{opacity:0, y: 100}}
            animate={{opacity:1, y: 0}}
            exit={{opacity:0,  y: 100}}
            transition={{duration: 0.5,delay:0.5,repeat: 0,ease: "easeInOut"}}
            className="flex items-center gap-3 lg:gap-5">
              <ShieldCheck className="w-12 lg:w-16 h-12 lg:h-16 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0\" />
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-xl font-semibold">Role Based Access</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Secure access for every role in the system.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{opacity:0, y: 100}}
            animate={{opacity:1, y: 0}}
            exit={{opacity:0,  y: 100}}
            transition={{duration: 0.5,delay:0.7,repeat: 0,ease: "easeInOut"}}
            className="flex items-center gap-3 lg:gap-5">
              <Settings className="w-12 lg:w-16 h-12 lg:h-16 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0" />
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-xl font-semibold">System Configuration</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Customize and manage everything with ease.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{opacity:0, y: 100}}
            animate={{opacity:1, y: 0}}
            exit={{opacity:0,  y: 100}}
            transition={{duration: 0.5,delay:0.9,repeat: 0,ease: "easeInOut"}}
            className="flex items-center gap-3 lg:gap-5">
              <Lock className="w-12 lg:w-16 h-12 lg:h-16 bg-gray-100 dark:bg-white/10 text-emerald-700 dark:text-emerald-500 p-3 rounded-xl shrink-0" />
              <div className="flex flex-col min-w-0">
                <h3 className="text-base lg:text-xl font-semibold">Security & Logs</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Monitor activities and ensure platform security.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

<motion.div 
          initial={{opacity:0, y: 100}}
          animate={{opacity:1, y: 0}}
          exit={{opacity:0,  y: 100}}
          transition={{duration: 0.5,delay:1.1,repeat: 0,ease: "easeInOut"}}
          className="flex flex-col w-full lg:w-5/12 px-4 sm:px-6  lg:px-10">
          <form  onSubmit={handleLogin} className="bg-gray-50 dark:bg-white/5 border-2 backdrop-blur-sm border-emerald-700 dark:border-emerald-500 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
            <div className="mb-6 sm:mb-8">
            <div className="border-2 border-emerald-500 w-13 p-3.5 mb-4 rounded-full ml-auto mr-auto flex items-center justify-center">
              {logoElement}
            </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Welcome <span className="text-emerald-700 dark:text-emerald-500">Back.</span></h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm text-center">
                Sign in to access your admin dashboard
              </p>
            </div>

            <div className="mb-5">
                {error && (
            <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium">
              {error}
            </div>
          )}
               <div className="relative w-full mb-6">
                <Mail className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type="text"
                  id="email"
                  placeholder=" "
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent pl-8 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
                />

                <label
                  htmlFor="email"
                  className="absolute left-8 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200
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
            </div>

            <div className="mb-2">
              <div className="relative w-full mb-6">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-emerald-700 dark:text-emerald-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full border-0 border-b-2 border-gray-700 bg-transparent pl-8 pr-10 py-2 text-black dark:text-white focus:outline-none focus:border-emerald-500 transition duration-200"
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

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 p-1 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.div
                        key="eye-off-login"
                        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye-login"
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

            <div className="text-right mb-6 text-sm text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                Forgot Password?
            </div>

            <button 
            type="submit"
            disabled = {loading}
            className="w-full bg-emerald-700 hover:bg-[#b58e4e] dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition duration-300">
              {loading ? "signing in..." : "sign in"}
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
              <span className="mx-4 text-gray-500 dark:text-gray-400 text-sm">
                or
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
            </div>

            <button className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition duration-300 flex items-center justify-center gap-2">
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>

            <div className="border-t border-gray-200 dark:border-white/10 mt-6 pt-6">
              <div className="flex items-start justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Secure access for authorized administrators only</p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Login;