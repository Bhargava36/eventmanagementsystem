import React from 'react';
import { 
    Calendar,
    Users, 
    ChevronRight
    } from 'lucide-react';

const teamsList = [
  {
    id: 1,
    eventName: 'Avishkaar',
    date: 'Apr 26, 2026',
    teamName: 'Team CodeMasters',
    role: 'Team Lead',
    theme: 'avishkaar',
  },
  {
    id: 2,
    eventName: 'HackSprint',
    date: 'Mar 15, 2026',
    teamName: 'Team Innovators',
    role: 'Team Lead',
    theme: 'code',
  },
  {
    id: 3,
    eventName: 'TechSprint',
    date: 'Feb 8, 2026',
    teamName: 'Team PixelPerfect',
    role: 'Team Lead',
    theme: 'brain',
  },
  {
    id: 4,
    eventName: 'Build & Scale',
    date: 'Jan 20, 20256',
    teamName: 'Team NextGen',
    role: 'Team Lead',
    theme: 'mountain',
  },
];

function MyTeams() {
  const getCardImage = (eventName) => {
    return (
      <div className="w-full h-full bg-white dark:bg-black flex flex-col items-center justify-center relative overflow-hidden border border-emerald-700 dark:border-emerald-500 rounded-xl">
        <span className="text-black dark:text-slate-300 text-[10px] font-bold tracking-widest uppercase relative z-10 text-center px-3">
          {eventName}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 md:p-8 lg:p-12 w-full font-sans transition-colors duration-200 flex justify-center ">
      <div className="w-full max-w-5xl flex flex-col">
        
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
            My Teams
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Events you have participated in as a team lead
          </p>
        </div>

        <div className="flex flex-col gap-4 ">
          {teamsList.map((team) => {
            return (
              <button
                key={team.id}
                className="w-full group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0a0f12] text-left hover:border-emerald-700 dark:hover:border-emerald-500"
              >
                
                <div className="w-full sm:w-40 h-32 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-inner">
                  {getCardImage(team.eventName)}
                </div>

                <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                    {team.eventName}
                  </h3>
                  
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium truncate">{team.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium truncate">{team.teamName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-200 dark:border-slate-800 sm:border-0">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {team.role}
                  </span>
                  
                  <div className="p-1.5 rounded-full text-slate-400">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>

              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default MyTeams