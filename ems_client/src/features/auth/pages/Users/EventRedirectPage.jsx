import React from 'react';
import {useNavigate} from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Lightbulb, 
  Tag, 
  ClipboardCheck, 
  Users, 
  Clock, 
  MapPin, 
  CalendarCheck, 
  User,
  Check
} from 'lucide-react';

const requirements = [
  "Valid college ID card",
  "Laptop and your required development tools",
  "Team of 4 - 6 members",
  "Creative mind and problem solving attitude"
];

const facilities = [
  "Refreshments & Lunch",
  "Wi-Fi Access",
  "Power Backup",
  "Mentorship & Guidance",
  "Workspaces",
  "Accomodation for outstation participants"
];

const themes = [
  "Technology & Innovation",
  "Sustainability",
  "Health & Wellness",
  "Education",
  "Social Impact",
  "Open Theme"
];

function EventDetails() {

const navigate = useNavigate();

  function handleHomeClick() {
    navigate('/user/dashboard');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200 font-sans w-full ">
      <div className="w-full max-w-[1920px] mx-auto space-y-6">
        
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 text-sm font-medium hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black transition-colors cursor-pointer"
        onClick={handleHomeClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <section className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 shadow-md shadow-slate-300/30 dark:shadow-black/50 w-full">
          <div className="w-full lg:w-[40%] h-56 sm:h-64 lg:h-auto min-h-[280px] rounded-2xl bg-white dark:bg-black relative overflow-hidden flex flex-col items-center justify-center border border-emerald-700/20 dark:border-emerald-500/30 group">
            <div className="absolute inset-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-transparent rounded-full"></div>
            <Lightbulb className="h-16 w-16 text-emerald-700 dark:text-emerald-500 mb-2 relative z-10 drop-shadow-[0_0_15px_rgba(4,120,87,0.3)] dark:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-slate-900 dark:text-white relative z-10 mt-2 uppercase">
              Avishkaar
            </h1>
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-emerald-700 dark:text-emerald-500 font-semibold mt-3 relative z-10 uppercase">
              Ideas / Innovate / Impact
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-5 lg:py-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 text-xs font-bold tracking-wide uppercase mb-3">
                Hackathon
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                Avishkaar
              </h2>
              <p className="text-lg font-medium text-emerald-700 dark:text-emerald-500 mb-4">
                Think. Build. Create. Transform.
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                A 24-hour hackathon where ideas meet execution. Gather your team, solve real-world problems and build solutions that matter.
              </p>
            </div>
            
            <div className="pt-2">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-bold text-sm transition-all shadow-lg shadow-emerald-700/20 dark:shadow-emerald-500/20">
                Register Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 w-full">
          
          <div className="lg:col-span-7 flex flex-col gap-5 lg:gap-6">
            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <FileText className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-2 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">About the Event</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Avishkaar is a 24-hour inter-college hackathon that brings together creative minds, problem solvers and innovators. It's your chance to build, learn, and make an impact. Whether you're a coder, designer, thinker or a builder – this is where your ideas turn into real solutions.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <Lightbulb className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-3 mt-1 w-full">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme, index) => (
                    <span 
                      key={index} 
                      className="px-3.5 py-1.5 rounded-full border border-emerald-700/20 dark:border-emerald-500/30 bg-emerald-700/5 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-500 text-xs font-semibold"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <Tag className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-1 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Event Type</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Inter-College Event</p>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <ClipboardCheck className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-3 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Requirements</h3>
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5 lg:gap-7">
            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-1 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Team Size</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">4 - 6 Members</p>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <Clock className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-1 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Duration</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">3 Days</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">(DEC 26, 2026 - DEC 28, 2026)</p>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <MapPin className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-1 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Location</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">AITAM</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Tekkali, Srikakulam</p>
              </div>
            </div>

            <div className="bg-white dark:bg-black border border-emerald-700/20 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md shadow-slate-300/30 dark:shadow-black/50 flex items-start gap-5 w-full">
              <div className="p-3 rounded-2xl bg-emerald-700/10 dark:bg-emerald-500/10 shrink-0">
                <CalendarCheck className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div className="space-y-3 mt-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Facilities</h3>
                <ul className="space-y-2">
                  {facilities.map((facility, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 text-sm">{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;