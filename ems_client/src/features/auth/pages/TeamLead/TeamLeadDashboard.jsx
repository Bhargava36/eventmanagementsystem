import React from 'react';
import Footer from '../../../../components/Organisms/Footer';
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

const events = [
  { id: 1, title: 'Avishkaar 4', date: '12 Sep 2026', icon: Code, color: 'bg-indigo-600' },
  { id: 2, title: 'Hac', date: '23 Sep 2026', icon: Box, color: 'bg-blue-600' },
  { id: 3, title: 'InnovateX', date: '28 Sep 2026', icon: Lightbulb, color: 'bg-teal-500' },
  { id: 4, title: 'DesignX', date: '30 Sep 2026', icon: Palette, color: 'bg-orange-500' },
  { id: 5, title: 'Tech Dev', date: '12 Oct 2026', icon: Monitor, color: 'bg-purple-600' },
  { id: 6, title: 'Tech Sprint', date: '18 Oct 2026', icon: Users, color: 'bg-teal-600' },
  { id: 7, title: 'Innovators Assemble', date: '25 Oct 2026', icon: Rocket, color: 'bg-pink-500' },
  { id: 8, title: 'Code Crush', date: '31 Oct 2026', icon: Trophy, color: 'bg-blue-600' },
];

function TeamLeadDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
              {logoElement}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-extrabold text-lg tracking-wider leading-none text-slate-900 dark:text-white">
                HACK_HUB
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-500 uppercase mt-1">
                EMS
              </span>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 lg:p-10 border border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 dark:bg-emerald-950/5 flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start md:items-center">
          <div className="max-w-2xl space-y-2.5">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Hello, <span className="text-emerald-600 dark:text-emerald-500">Team Lead</span> 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Lead your team. Keep up the great work and inspire your squad to achieve greatness!
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-4 py-1 shrink-0">
            <p className="italic text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 max-w-[200px] leading-snug">
              "Great teams build great things."
            </p>
            <div className="h-1 w-8 bg-emerald-600 dark:bg-emerald-500 mt-2 rounded-full"></div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Events</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Explore all the upcoming events.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#05080a] border border-slate-200 dark:border-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner ${event.color}`}>
                    <event.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-base leading-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                
                <button className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 rounded-xl border border-emerald-600/20 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-black transition-all duration-200 whitespace-nowrap self-stretch sm:self-center">
                  View Details <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
</section>

      </div>

      <Footer />
    </div>
  );
}
export default TeamLeadDashboard;