import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar,
  Users
    } from 'lucide-react';

const teamsList = [
  {
    id: 1,
    eventName: 'Avishkaar',
    date: 'Apr 26, 2026',
    teamName: 'Team CodeMasters',
    teamSize: '4 Members',
    role: 'Team Lead',
  },
  {
    id: 2,
    eventName: 'HackSprint',
    date: 'Mar 15, 2026',
    teamName: 'Team Innovators',
    teamSize: '5 Members',
    role: 'Team Lead',
  },
  {
    id: 3,
    eventName: 'TechSprint',
    date: 'Feb 8, 2026',
    teamName: 'Team PixelPerfect',
    teamSize: '3 Members',
    role: 'Team Lead',
  },
  {
    id: 4,
    eventName: 'Build & Scale',
    date: 'Jan 20, 2026',
    teamName: 'Team NextGen',
    teamSize: '6 Members',
    role: 'Team Lead',
  },
];

function MyTeams() {
  const navigate = useNavigate();

  const getCardImage = (eventName) => {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-center shadow-[0_0_0_1px_rgba(16,185,129,0.18)] dark:border-slate-700 dark:bg-black">
        <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
          {eventName}
        </span>
      </div>
    );
  };
  function handleCardClick(){
    navigate('/user/teamInfo');
  }
  return (
    <div className="flex min-h-screen w-full justify-center bg-white p-4 text-slate-900 transition-colors duration-200 dark:bg-black dark:text-white sm:p-6 md:p-8 lg:p-12">
      <div className="flex w-full max-w-5xl flex-col">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Teams
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Events you have participated in as a team lead
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {teamsList.map((team) => {
            return (
              <button
                key={team.id}
                onClick={handleCardClick}
                className="group w-full rounded-2xl border border-slate-300 bg-white p-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[#0b0b0b] dark:shadow-[0_8px_24px_rgba(0,0,0,0.32)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                    {getCardImage(team.eventName)}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-400">
                          Participated Event
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                          {team.eventName}
                        </h3>
                      </div>

                      <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {team.role}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80">
                        <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{team.date}</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80">
                        <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{team.teamName}</span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/80 sm:col-span-2">
                        <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{team.teamSize}</span>
                      </div>
                    </div>
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