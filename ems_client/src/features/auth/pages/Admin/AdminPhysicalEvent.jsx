import React from 'react';
import {
  Tent,
  Play,
  CalendarDays,
  MapPin,
  Users,
  BedDouble,
  Utensils,
  IdCard,
  Settings,
  Eye,
  ArrowRight,
  List,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';

function AdminPhysicalEvent() {
  const teams = [
    {
      initials: 'TB',
      avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      name: 'Tech Blazers',
      leadName: 'Rohit Kumar',
      leadEmail: 'rohit@aitam.edu.in',
      college: 'AITAM',
      state: 'Andhra Pradesh',
      members: 4,
      acc: 'Allocated',
      food: 'Included',
      idCard: 'Generated',
      status: 'Confirmed'
    },
    {
      initials: 'AI',
      avatarBg: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      name: 'Alpha Innovators',
      leadName: 'Sneha Reddy',
      leadEmail: 'sneha@rguktn.edu.in',
      college: 'RGUKT',
      state: 'Andhra Pradesh',
      members: 5,
      acc: 'Allocated',
      food: 'Included',
      idCard: 'Pending',
      status: 'Confirmed'
    },
    {
      initials: 'CS',
      avatarBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
      name: 'Code Spartans',
      leadName: 'Vikram Naidu',
      leadEmail: 'vikram@svp.ac.in',
      college: 'SVPEC',
      state: 'Andhra Pradesh',
      members: 3,
      acc: 'Pending',
      food: 'Included',
      idCard: 'Generated',
      status: 'Pending'
    },
    {
      initials: 'BD',
      avatarBg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      name: 'Byte Dreamers',
      leadName: 'Priya Sree',
      leadEmail: 'priya@aitam.edu.in',
      college: 'AITAM',
      state: 'Andhra Pradesh',
      members: 5,
      acc: 'Allocated',
      food: 'Pending',
      idCard: 'Pending',
      status: 'Confirmed'
    },
    {
      initials: 'ZX',
      avatarBg: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
      name: 'Zero X',
      leadName: 'Sai Charan',
      leadEmail: 'saicharan@jntuk.edu.in',
      college: 'JNTUK',
      state: 'Andhra Pradesh',
      members: 4,
      acc: 'Allocated',
      food: 'Included',
      idCard: 'Generated',
      status: 'Confirmed'
    }
  ];

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Allocated':
      case 'Included':
      case 'Generated':
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500';
      case 'Pending':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-slate-300';
    }
  };

  const StatusIcon = ({ status, className }) => {
    if (status === 'Pending') return <Clock className={className} />;
    return <CheckCircle2 className={className} />;
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-[#070908] dark:text-white sm:p-5 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 sm:space-y-6">
        
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Tent className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                Physical Event Management
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Manage accommodation, food, ID cards and other physical event arrangements for
              <span className="font-semibold text-slate-700 dark:text-slate-300"> Avishkaar 4</span>. Ensure a smooth and seamless experience for all participants.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 sm:p-6 xl:grid-cols-[1.5fr_1.2fr_1fr] xl:items-center xl:gap-6 xl:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
              <CalendarDays className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">Avishkaar 4 – Physical Event</h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">On-Campus Hackathon & Tech Festival</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-500" />
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Event Dates</p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">24 Nov 2026 – 25 Nov 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-500" />
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Venue</p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">AITAM Campus, Tekkali</p>
            </div>
          </div>


        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-4">
          
          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <BedDouble className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Accommodation Management</h2>
            </div>
            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage room allocation, check-in status and accommodation details for teams.
            </p>
            <div className="mb-8 grid grid-cols-3 gap-2">
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Total Rooms</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">50</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Allocated</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">42</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Available</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">8</p>
              </div>
            </div>
            <div className="mt-auto grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                Manage Rooms
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Utensils className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Food Management</h2>
            </div>
            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Handle meal schedules, food preferences and distribution status for all teams.
            </p>
            <div className="mb-8 grid grid-cols-3 gap-2">
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Total Meals</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">1440</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Served</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">1120</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">320</p>
              </div>
            </div>
            <div className="mt-auto grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                <List className="h-4 w-4" />
                View Menu
              </button>
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                Manage Food
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <IdCard className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">ID Card Generation</h2>
            </div>
            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Generate and download participant ID cards for registered teams and individuals.
            </p>
            <div className="mb-8 grid grid-cols-3 gap-2">
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Total IDs</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">156</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Generated</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">142</p>
              </div>
              <div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">14</p>
              </div>
            </div>
            <div className="mt-auto grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                <Eye className="h-4 w-4" />
                Preview IDs
              </button>
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                Generate IDs
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Settings className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Event Controls</h2>
            </div>
            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Quick access to event settings and physical event management tools.
            </p>
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accommodation</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-emerald-700 p-0.5 dark:bg-emerald-500">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Food Distribution</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-emerald-700 p-0.5 dark:bg-emerald-500">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Enabled</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ID Card Gen.</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-9 cursor-pointer items-center rounded-full bg-emerald-700 p-0.5 dark:bg-emerald-500">
                    <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Enabled</span>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10 min-[400px]:w-fit">
                <Settings className="h-4 w-4" />
                View Settings
              </button>
            </div>
          </div>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <div className="mb-6 flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-center sm:mb-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registered Physical Teams</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teams registered for the physical event at Avishkaar 4</p>
              </div>
            </div>
            
            <div className="relative w-full min-w-0 lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team name, lead or college..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800/50 dark:bg-zinc-950 dark:text-slate-500">
                  <th className="whitespace-nowrap px-6 py-4">Team Name</th>
                  <th className="whitespace-nowrap px-6 py-4">Team Lead</th>
                  <th className="whitespace-nowrap px-6 py-4">College / State</th>
                  <th className="whitespace-nowrap px-6 py-4 text-center">Members</th>
                  <th className="whitespace-nowrap px-6 py-4">Accommodation</th>
                  <th className="whitespace-nowrap px-6 py-4">Food</th>
                  <th className="whitespace-nowrap px-6 py-4">ID Card</th>
                  <th className="whitespace-nowrap px-6 py-4">Status</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {teams.map((team, index) => (
                  <tr key={index} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${team.avatarBg}`}>
                          {team.initials}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{team.leadName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{team.leadEmail}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{team.college}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{team.state}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold">{team.members}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(team.acc)}`}>
                        <BedDouble className="h-3 w-3" />
                        {team.acc}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(team.food)}`}>
                        <StatusIcon status={team.food} className="h-3 w-3" />
                        {team.food}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(team.idCard)}`}>
                        <StatusIcon status={team.idCard} className="h-3 w-3" />
                        {team.idCard}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(team.status)}`}>
                        <StatusIcon status={team.status} className="h-3 w-3" />
                        {team.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPhysicalEvent;