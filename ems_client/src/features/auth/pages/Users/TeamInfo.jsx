import {
    Users,
    Trophy,
    CalendarDays,
    MapPin,
    PencilRuler,
    Stamp,
    Lightbulb,
    CalendarCheck,
    Gift,
}
from "lucide-react";


const teamMembers = [
    {
        initial : "J",
        name : "J.Nagalaxmi",
        role : "Team Leader",
        college : "AITAM",
    },
    {
        initial : "K",
        name : "K.Sai Teja",
        role : "Frontend Developer",
        college : "AITAM",
    },
    {
        initial : "P",
        name : "P.Harsha",
        role : "Backend Developer",
        college : "AITAM",
    },
    {
        initial : "S",
        name : "S.Divya",
        role : "UI/UX Designer",
        college : "AITAM",
    },
    {
        initial : "M",
        name : "M.Charan",
        role : "Full Stack Developer",
        college : "AITAM",
    }
];


const eventInfo = [
    {
        label : "Event Name",
        value : "Innovation conclave 2026",
    },
    {
        label : "Organised By",
        value : "AITAM",
    },
    {
        label : "Event Type",
        value : "Hackathon",
    },
    {
        label : "Mode",
        value :"Offline",
    },
    {
        label : "Status",
        value : "Completed",
    },
];


const prizeDetails = [
    {
        label : "Prize Amount",
        value : "₹ 25,000",
    },
    {
        label : "Certificate",
        value : "Yes",
    },
    {
        label : "Additional Benefits",
        value : "Recognition + Internship Opportunity",
    },
]

function TeamInfo() {
    return(
        <div className="min-h-screen w-full bg-slate-100 p-3 sm:p-4 md:p-6 dark:bg-black">
             <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2 min-w-0">
                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-5 sm:p-7 rounded-lg shrink-0">
                                    <Users className="text-emerald-600 w-10 h-10 sm:w-15 sm:h-15"/>
                                </div>
                                <div className="min-w-0">
                                    <h1 className="font-bold text-xl break-words">Code Crusaders</h1>
                                    <div className="flex flex-wrap justify-start items-center gap-x-2">
                                        <p className="text-slate-400">Build</p>
                                        <span className="text-slate-400 text-3xl pb-5">.</span>
                                        <p className="text-slate-400">Solve</p>
                                        <span className="text-slate-400 text-3xl pb-5">.</span>
                                        <p className="text-slate-400">Create</p>
                                    </div>
                                    <div className="bg-emerald-100 dark:bg-emerald-500/20 rounded-full inline-flex gap-3 py-2 px-3">
                                        <Trophy className="text-emerald-600" />
                                        <span className="text-emerald-600 font-medium">Winner</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center bg-emerald-100 dark:bg-emerald-500/20 rounded-xl py-5 px-5 sm:py-6 sm:px-7 gap-3 w-full md:w-auto">
                                <div>
                                    <Trophy className="text-yellow-500 w-10 h-10" />
                                </div>
                                <div>
                                    <p>Prize won</p>
                                    <p className="font-bold text-2xl text-emerald-600">₹ 25,000</p>
                                    <p>First Prize</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            <div className="flex gap-2 min-w-0">
                                <div className="shrink-0">
                                    <CalendarDays className="text-slate-400"/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-400">Event Name</p>
                                    <h2 className="font-semibold ">Innovation Conclave 2026</h2>
                                </div>
                            </div>

                            <div className="flex gap-2 min-w-0">
                                <div className="shrink-0">
                                    <CalendarDays className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-400">Date</p>
                                    <h2 className="font-semibold ">Apr 15 - Apr 16, 2026</h2>
                                </div>
                            </div>

                            <div className="flex gap-2 min-w-0">
                                <div className="shrink-0">
                                    <MapPin className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-400">Location</p>
                                    <h2 className="font-semibold ">
                                        Aitam, Tekkali
                                    </h2>
                                </div>
                            </div>

                            <div className="flex gap-2 min-w-0">
                                <div className="shrink-0">
                                    <PencilRuler className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-slate-400">Team Size</p>
                                    <h2 className="font-semibold">5 Members</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 mt-5">
                        <div className="flex gap-3">
                            <Stamp className="w-7 h-7 shrink-0"/>
                            <h1 className="font-bold text-lg">Problem Statement</h1>
                        </div>

                        <div className="border border-blue-100 rounded-xl bg-blue-50 p-4 sm:p-5 dark:bg-black dark:border-blue-100/20 shadow-sm dark:bg-blue-500/10 mt-3">
                            <h3 className="text-blue-400 font-medium">Problem Statement Title</h3>
                            <h1 className="font-bold text-lg ">
                                Smart Waste Management System for Smart Cities
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 pt-2 ">
                                Design a technology-driven solution to efficiently manage
                                and monitor waste collection in urban areas using IoT, GPS
                                and data analytics. The system should help in real-time
                                tracking of garbage bins, optimize collection routes, and
                                reduce overflow and operational costs, contributing to a
                                cleaner and greener environment.
                            </p>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl bg-slate-50 p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 mt-5">
                        <div className="flex gap-3">
                            <Users className="w-7 h-7 shrink-0"/>
                            <h1 className="font-bold text-lg">Team Members</h1>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mt-3">
                            {teamMembers.map((member,i) =>(
                                <div
                                    key={i}
                                    className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full font-semibold bg-violet-200 text-violet-400 p-2 mx-auto dark:bg-violet-500/20">
                                        {member.initial}
                                    </div>

                                    <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-white ">
                                        {member.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500 ">
                                        {member.role}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {member.college}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/*right side part*/}
                <div className="min-w-0">
                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 h-fit">
                        <div className="flex justify-between items-center bg-blue-950 rounded-xl gap-3">
                            <div className="p-3 min-w-0">
                                <h1 className="text-white font-bold text-lg break-words">
                                    Innovation Conclave <span className="text-lime-400">2026</span>
                                </h1>

                                <div className="flex flex-wrap justify-start items-center gap-x-2">
                                    <p className="text-slate-400">Ideas</p>
                                    <span className="text-slate-400 text-3xl pb-5">.</span>
                                    <p className="text-slate-400">Innovation</p>
                                    <span className="text-slate-400 text-3xl pb-5">.</span>
                                    <p className="text-slate-400">Impact</p>
                                </div>
                            </div>

                            <div className="flex items-center shrink-0 pr-3">
                                <Lightbulb className="text-lime-400 w-8 h-8 sm:w-10 sm:h-10"/>
                            </div>
                        </div>

                        <div>
                            <div className="flex gap-2 mt-2">
                                <CalendarCheck className="w-7 h-7 shrink-0"/>
                                <span className="text-lg font-semibold">Event Overview</span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800/50 p-2">
                                {eventInfo.map((info,index) =>(
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 px-3 py-2"
                                    >
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {info.label}
                                        </p>

                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:text-right ">
                                            {info.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 mt-3">
                        <div className="flex gap-2">
                            <span>
                                <Trophy className="text-yellow-500 w-6 h-6 fill-yellow-300" />
                            </span>
                            <h2 className="font-semibold text-lg">Your Achievement</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-5 pb-5">
                            <div className="bg-yellow-100 rounded-full p-5 dark:bg-yellow-500/20 shrink-0">
                                <Trophy className="text-yellow-500 w-10 h-10" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="text-xl font-bold">1st Prize</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-base ">
                                    Congratulations! Your team secured 1st place in
                                    Innovation Conclave 2026.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5 dark:bg-black dark:border-gray-800 shadow-sm dark:bg-gray-950 mt-3">
                        <div className="flex gap-2">
                            <Gift className="shrink-0"/>
                            <span className="font-semibold text-lg">Prize Details</span>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50 p-2">
                            {prizeDetails.map((inf,val) =>(
                                <div
                                    key={val}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 px-3 py-2"
                                >
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        {inf.label}
                                    </p>

                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:text-right ">
                                        {inf.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeamInfo;
