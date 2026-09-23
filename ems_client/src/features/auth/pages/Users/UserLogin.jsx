import React from 'react';
import {
    UserPlus,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Users,
    LogIn,
    ShieldCheck,
    CalendarDays,
    BarChart3
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../../Hooks/useAuth';
import useToast from '../../../../Hooks/useToast';

const logoElement = (
    <div className="relative h-6 w-6" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
        <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gray-600 opacity-80 dark:bg-gray-200"></span>
    </div>
);

function UserLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = () => {
        toast.info("Google sign-in is not configured yet.");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            const msg = "Required to fill all fields";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/users/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Email: email, Password: password}),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            console.log("Login successful:", data);
            const teamleadUser = data.users || data.user || {};
            login(data.token, teamleadUser, "user");

            toast.success("Logged in successfully!");
            const from = location.state?.from?.pathname || "/user/dashboard";
            navigate(from, { replace: true });
        }
        catch (err) {
            const errMsg = err.message || "Login failed, try again later";
            setError(errMsg);
            toast.error(errMsg);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#edf3f0] text-slate-900 dark:bg-black dark:text-white">
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden px-10 py-6 lg:px-12 xl:px-16">
                <div className="relative lg:w-1/2 flex flex-col overflow-hidden bg-[#edf3f0] p-6 lg:p-8 xl:p-10 border-r border-slate-200 dark:bg-black dark:border-gray-900">

                    <div className="mb-4 flex  items-center gap-3 text-lg font-semibold lg:mb-8">
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
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight mb-3 dark:text-white">
                            Welcome Back User<br />
                            <span className="text-emerald-700 dark:text-emerald-500">Make It Happen!</span>
                        </h2>
                        <p className="text-slate-600 text-sm lg:text-base max-w-lg dark:text-gray-400">
                            Sign in to continue for participating in events and submit your ideas.
                        </p>
                    </div>

                    <div className="relative z-10 flex-1 w-full flex flex-col justify-center gap-10 lg:gap-14 min-h-0">
                        {[
                            [ShieldCheck, "Secure Access", "Your account and event data stay protected."],
                            [Users, "Team Collaboration", "Keep your team aligned from one workspace."],
                            [CalendarDays, "Event Management", "Stay on top of schedules, registrations, and tasks."],
                            [BarChart3, "Track Progress", "See how your events and submissions are moving forward."],
                        ].map(([Icon, title, description]) => (
                            <div key={title} className="flex gap-4 items-start">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm dark:bg-gray-900/60 dark:border-gray-800">
                                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-700 dark:text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-base lg:text-lg font-semibold text-slate-900 mb-0.5 dark:text-white">{title}</h3>
                                    <p className="text-slate-600 text-xs lg:text-sm dark:text-gray-400">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-10 lg:py-8 bg-[#edf3f0] dark:bg-[#020303] overflow-y-auto">

                    <div className="max-w-2xl w-full mx-auto rounded-2xl border border-emerald-700/30 bg-white/90 p-6 shadow-[0_10px_30px_rgba(16,185,129,0.08)] dark:border-emerald-500/80 dark:bg-black/70 dark:shadow-none sm:p-8 lg:p-10">
                        <div className="mb-8 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                                <div className="bg-emerald-100 p-3 rounded-full border border-emerald-200 dark:border-emerald-800/60 dark:bg-emerald-500/10">
                                    <UserPlus className="w-7 h-7 text-emerald-700 dark:text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    User <span className="text-emerald-700 dark:text-emerald-500">Login</span>
                                </h2>
                            </div>
                            <p className="text-slate-600 text-sm dark:text-gray-400">
                                Sign in to access your account
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5 lg:space-y-6 [&_label]:text-slate-700 [&_input]:!border-slate-200 [&_input]:!bg-white [&_input]:!text-slate-900 [&_input]:placeholder-slate-400 [&_svg]:text-slate-600 dark:[&_label]:text-gray-300 dark:[&_input]:!border-gray-700 dark:[&_input]:!bg-[#0b1118] dark:[&_input]:!text-white dark:[&_input]:placeholder-gray-500 dark:[&_svg]:text-gray-300">
                            {error && (
                                <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-medium">
                                    {error}
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                                    <label className="text-slate-700 font-medium text-sm dark:text-gray-300">Email</label>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail( e.target.value )}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all text-sm dark:border-gray-700 dark:bg-[#0b1118] dark:text-white dark:placeholder-gray-500 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-3 sm:w-36 shrink-0 pl-1">
                                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
                                    <label className="text-slate-700 font-medium text-sm dark:text-gray-300">Password</label>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id='password'
                                        name='password'
                                        value={password}
                                        onChange={(e) => setPassword( e.target.value )}
                                        placeholder="Create a password"
                                        className="w-full pl-4 pr-10 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all text-sm dark:border-gray-700 dark:bg-[#0b1118] dark:text-white dark:placeholder-gray-500 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:shadow-emerald-500/20"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>{loading ? "Signing in..." : "Login"}</span>
                                </button>
                            </div>

                            <div className="relative flex items-center gap-3 py-1 text-xs text-slate-500 dark:text-gray-500">
                                <span className="h-px flex-1 bg-slate-200 dark:bg-gray-800" />
                                <span>or</span>
                                <span className="h-px flex-1 bg-slate-200 dark:bg-gray-800" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                className="w-full border border-emerald-700/30 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 dark:border-emerald-500/40 dark:bg-[#0b1118] dark:hover:bg-gray-900 dark:text-gray-200"
                            >
                                <FcGoogle className="w-5 h-5" />
                                <span>Sign in with Google</span>
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                Need an account? <button type="button" onClick={() => navigate('/user/register')} className="text-emerald-700 font-semibold hover:underline dark:text-emerald-500">Register</button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UserLogin;