import { Link } from "react-router-dom";
import {
    ShieldCheck,
    Users,
    Calendar,
    BarChart3,
    UserPlus,
    UserRound,
    Mail,
    Lock,
    Phone,
    Eye,
    ArrowRight,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
        <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
    </div>
);

function AdminLogin() {
    return (
        <div className="relative w-full min-h-screen overflow-y-auto bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 px-6">

            <div className="flex flex-col lg:flex-row min-h-screen">
                <div className="w-full lg:w-5/12 xl:w-1/2 bg-gray-50 dark:bg-black/60 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col relative overflow-hidden">
                    <div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                {logoElement}
                            </div>
                            <div className="flex flex-col leading-tight min-w-0">
                                <span className="text-base sm:text-lg md:text-xl font-bold truncate">
                                    Admin{" "}
                                    <span className="text-emerald-700 dark:text-emerald-500">
                                        Portal
                                    </span>
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 truncate">
                                    Hack_Hub EMS
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-10 md:mt-12 lg:mt-10">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                                Welcome to Admin{" "}
                            </h1>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-1">
                                <span className="text-emerald-700 dark:text-emerald-500">
                                    Portal
                                </span>
                            </h1>
                            <div className="w-12 sm:w-16 h-1 bg-emerald-700 dark:bg-emerald-500 rounded-full mt-3 sm:mt-4"></div>

                            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-4 sm:mt-5 md:mt-6 leading-relaxed max-w-md">
                                Login to access your dashboard and manage events,teams and users
                                effeciently.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-10 lg:mt-16 space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm md:text-base font-semibold">
                                    Secure & Reliable
                                </h3>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Your data is always safe and protected.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm md:text-base font-semibold">
                                    Role Management
                                </h3>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Manage admins,users and permissions easily.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm md:text-base font-semibold">
                                    Event Management
                                </h3>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Create, Organanize and monitor events seamlessly.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm md:text-base font-semibold">
                                    Real-time Insights
                                </h3>
                                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Get real-time insights and make better decisions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-7/12 xl:w-1/2 bg-white dark:bg-black p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="flex flex-col items-center mb-5 sm:mb-6 md:mb-8">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-3 sm:mb-4">
                                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-emerald-700 dark:text-emerald-500" />
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center">
                                Login{" "}
                                <span className="text-emerald-700 dark:text-emerald-500">
                                    to your Account
                                </span>{" "}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mt-1.5 sm:mt-2">
                                Fill the details to access your dashboard
                            </p>
                        </div>

                        <form className="space-y-4 sm:space-y-5">

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2"
                                    >
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="Enter your email address"
                                            className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Enter your password"
                                        className="w-full pl-10 sm:pl-11 pr-11 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-700/20 dark:focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors"
                                    >
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end justify-end pt-1">
                                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-600 hover:underline">Forgot password</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white font-semibold py-2.5 sm:py-3 md:py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 dark:shadow-emerald-500/20 text-sm sm:text-base"
                            >
                                Log In
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    or login with
                                </span>
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-semibold py-2.5 sm:py-3 md:py-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5" />
                                Continue with Google
                            </button>

                            <div className="text-center pt-1 sm:pt-2">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/admin/register"
                                        className="text-emerald-700 dark:text-emerald-500 hover:underline font-semibold"
                                    >
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;