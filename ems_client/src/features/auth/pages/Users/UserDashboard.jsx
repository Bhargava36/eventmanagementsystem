import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../../../components/Organisms/Footer';
import { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Calendar,
  Code,
  Box,
  Lightbulb,
  Palette,
  Monitor,
  Users,
  Rocket,
  Trophy,
  MapPin,
  ArrowRight,
  Crown,
  Hexagon
} from 'lucide-react';

const logoElement = (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 top-0 left-1/2 -translate-x-1/2 opacity-90"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 left-0 top-1/2 -translate-y-1/2 opacity-90"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 right-0 top-1/2 -translate-y-1/2 opacity-90"></span>
    <span className="absolute w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 bottom-0 left-1/2 -translate-x-1/2 opacity-90"></span>
  </div>
);

function UserDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/events");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch events");
      }

      const upcoming = data.events.filter((event) => event.EventStatus === "upcoming");
      setUpcomingEvents(upcoming);
    }
    catch (error) {
      console.error("Upcoming events error:", error);
    }
    finally {
      setLoadingEvents(false);
    }
  };
  function handleEventClick(event) {
    navigate(`/user/events/${event.Id}`);
    console.log("event:",event);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      <div className="w-full space-y-8">

        <header className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
              {logoElement}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-lg tracking-wider leading-none text-slate-900 dark:text-white">
                HACK_HUB
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-emerald-500 uppercase mt-1">
                EMS
              </span>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 lg:p-10 border border-emerald-700/20 dark:border-emerald-500/30 bg-white dark:bg-emerald-950/10 flex justify-between items-center shadow-sm">
          <div className="max-w-2xl space-y-2.5 relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hello, <span className="text-emerald-700 dark:text-emerald-500">{user?.UserName}</span> 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Welcome to your dashboard. Explore upcoming events, register, and prepare to build the future!
            </p>
          </div>

        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-700/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Upcoming Events</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Discover and participate in our latest challenges.
              </p>
            </div>
          </div>

          {loadingEvents ? (
            <p className='text-gray-500'> Loading events</p>
          ) : upcomingEvents.length === 0 ? (
            <p className='text-gray-500'>No upcoming events available</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.Id}
                  onClick={() => handleEventClick(event)}
                  className="group flex flex-col md:flex-row gap-6 p-4 md:p-5 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 hover:border-emerald-700/50 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <div className={`w-full md:w-56 lg:w-64 aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 border border-white/5`} style = {{ backgroundColor: event.PrimaryColor}}>
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="0.5" />
                        <line x1="20" y1="100" x2="100" y2="20" stroke="white" strokeWidth="0.5" />
                      </svg>
                    </div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-white blur-3xl opacity-20 rounded-full`}></div>
                      <Code className={`h-24 w-24`} style ={ { color: event.PrimaryTextColor }} strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center py-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-700/30 dark:border-emerald-500/30 bg-emerald-700/10 dark:bg-emerald-500/10 w-max mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-emerald-500 uppercase">
                        {event.EventType}
                      </span>
                    </div>

                    <h4 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {event.EventName}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mb-6">
                      {event.Description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-50 dark:bg-[#090b0e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4 flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-slate-500 dark:text-slate-500 text-xs font-medium mb-0.5">Duration</p>
                          <p className="text-slate-900 dark:text-white text-sm font-semibold">{new Date(event.StartDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - {new Date(event.EndDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#090b0e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4 flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-slate-500 dark:text-slate-500 text-xs font-medium mb-0.5">Prize Pool</p>
                          <p className="text-slate-900 dark:text-white text-sm font-semibold">
                            {/* {event.prize} */} {'-'}
                            </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#090b0e] border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4 flex items-center gap-3 w-full">
                      <MapPin className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-slate-500 text-xs font-medium mb-0.5">Event Venue</p>
                        <p className="text-slate-900 dark:text-white text-sm font-semibold">
                          {/* {event.venue} */} {'-'}
                          </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}

export default UserDashboard;