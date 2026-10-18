import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Mars,
  Venus,
  Search,
  Eye,
  Edit2,
  Plus,
  FileText,
  Info,
  MapPin,
  CalendarDays
} from 'lucide-react';

function AccomodationRedirectPage() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Rooms', value: '50', icon: BedDouble },
    { label: 'Allocated Rooms', value: '42', percent: '84%', icon: Users, progress: true },
    { label: 'Available Rooms', value: '8', percent: '16%', icon: Clock, progress: true },
    { label: 'Total Participants', value: '48', subtext: '(Boys: 28 | Girls: 20)', icon: Users },
  ];

  const boysAvailable = [
    { room: 'BH1-76', type: '4 Bed', cap: 4 },
    { room: 'BH2-76', type: '4 Bed', cap: 4 },
    { room: 'BH3-76', type: '4 Bed', cap: 4 },
    { room: 'BH4-76', type: '4 Bed', cap: 4 },
  ];

  const boysAllocated = [
    { room: 'BH2-101', type: '4 Bed', cap: 4, occ: '4/4', students: '1. Rahul Kumar +3', status: 'Fully Occupied' },
    { room: 'BH4-102', type: '4 Bed', cap: 4, occ: '3/4', students: '1. Karthik Reddy +2', status: 'Partially Filled' },
    { room: 'BH1-105', type: '3 Bed', cap: 3, occ: '3/3', students: '1. Sai Teja +2', status: 'Fully Occupied' },
    { room: 'BH4-106', type: '3 Bed', cap: 3, occ: '2/3', students: '1. Naveen +1', status: 'Partially Filled' },
    { room: 'BH3-108', type: '4 Bed', cap: 4, occ: '4/4', students: '1. Charan +3', status: 'Fully Occupied' },
  ];

  const girlsAvailable = [
    { room: 'GH1-76', type: '4 Bed', cap: 4 },
    { room: 'GH2-76', type: '4 Bed', cap: 4 },
    { room: 'GH3-76', type: '3 Bed', cap: 3 },
    { room: 'GH4-76', type: '4 Bed', cap: 4 },
  ];

  const girlsAllocated = [
    { room: 'GH1-101', type: '4 Bed', cap: 4, occ: '4/4', students: '1. Anjali +3', status: 'Fully Occupied' },
    { room: 'GH2-102', type: '4 Bed', cap: 4, occ: '3/4', students: '1. Sneha +2', status: 'Partially Filled' },
    { room: 'GH3-105', type: '3 Bed', cap: 3, occ: '3/3', students: '1. Priya +2', status: 'Fully Occupied' },
    { room: 'GH4-106', type: '3 Bed', cap: 3, occ: '2/3', students: '1. Divya +1', status: 'Partially Filled' },
    { room: 'GH1-108', type: '4 Bed', cap: 4, occ: '4/4', students: '1. Meghana +3', status: 'Fully Occupied' },
  ];

  const getStatusBadge = (status) => {
    if (status === 'Fully Occupied') {
      return 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400';
    }
    return 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400';
  };

  const renderAccommodationSection = (title, icon, total, allocated, available, availableList, allocatedList, genderColor) => (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:p-8">
      
      <div className="mb-5 grid min-w-0 grid-cols-1 items-start gap-5 border-b border-slate-100 pb-5 dark:border-zinc-800 sm:mb-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)] lg:items-center">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{title}</h2>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">Manage room allocation and view room details for {genderColor === 'boys' ? 'male' : 'female'} participants.</p>
          </div>
        </div>
        <div className="grid w-full min-w-0 grid-cols-3 gap-2 sm:gap-3">
          <div className="min-w-0 rounded-xl bg-slate-50 px-2 py-2.5 text-center dark:bg-zinc-900 sm:px-3 sm:text-left">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[10px]">Total Rooms</p>
            <p className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">{total}</p>
          </div>
          <div className="min-w-0 rounded-xl bg-emerald-50/70 px-2 py-2.5 text-center dark:bg-emerald-500/10 sm:px-3 sm:text-left">
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/80 sm:text-[10px]">Allocated</p>
            <p className="mt-0.5 text-lg font-extrabold text-emerald-800 dark:text-emerald-300 sm:text-xl">{allocated}</p>
          </div>
          <div className="min-w-0 rounded-xl bg-slate-50 px-2 py-2.5 text-center dark:bg-zinc-900 sm:px-3 sm:text-left">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[10px]">Available</p>
            <p className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">{available}</p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:gap-5 2xl:grid-cols-12">
        
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 2xl:col-span-4">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <BedDouble className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Available Rooms</h3>
          </div>
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800">
            {availableList.map((room, idx) => (
              <div key={idx} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50 sm:px-5">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{room.room}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{room.type}</span>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>{room.cap}</span>
                  <Users className="h-3 w-3" />
                </div>
                <button className="min-h-9 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                  Add
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-3 dark:border-zinc-800">
            <button className="w-full text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400">
              View All Available Rooms →
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 2xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Allocated Rooms</h3>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by room no. or student name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="hidden flex-1 overflow-x-auto overscroll-x-contain md:block">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:text-slate-500">
                  <th className="px-5 py-3">Room No.</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-center">Capacity</th>
                  <th className="px-5 py-3 text-center">Occupied</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {allocatedList.map((room, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{room.room}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">{room.type}</td>
                    <td className="px-5 py-3.5 text-center text-slate-700 dark:text-slate-300">{room.cap}</td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-900 dark:text-white">{room.occ}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300">{room.students}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded px-2 py-1 text-[10px] font-bold tracking-wide ${getStatusBadge(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-3 md:hidden">
            {allocatedList.map((room, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-3 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{room.room}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{room.type} room · Capacity {room.cap}</p>
                  </div>
                  <span className={`inline-flex max-w-[55%] rounded px-2 py-1 text-right text-[10px] font-bold tracking-wide ${getStatusBadge(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-slate-400">Occupied <strong className="text-slate-800 dark:text-slate-200">{room.occ}</strong></span>
                  <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">{room.students}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:col-span-12 2xl:grid-cols-[auto_minmax(0,1fr)_minmax(220px,0.8fr)] 2xl:items-stretch">
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-2 2xl:col-span-1">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/30">
              <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white">Room Allocation Quick Actions</h3>
            </div>
            <div className="grid gap-2 p-3 min-[500px]:grid-cols-2">
              <button className="flex min-h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-zinc-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                <Users className="h-4 w-4" /> Auto Allocate ({genderColor === 'boys' ? 'Boys' : 'Girls'})
              </button>
              <button className="flex min-h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-zinc-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                <FileText className="h-4 w-4" /> Generate Allocation Report
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );

  return (
    <main className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-[#070908] dark:text-white sm:p-5 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 sm:space-y-6">
        <button
          type="button"
          onClick={() => navigate('/admin/physical-event')}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition-colors  hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        <div className="flex min-w-0 flex-col items-start justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:gap-6 sm:p-6 xl:flex-row xl:items-center xl:p-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex min-w-0 flex-col items-start gap-3 min-[480px]:flex-row min-[480px]:items-center sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <BedDouble className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl xl:text-4xl">
                Accommodation Management
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Manage room allocation, check-in status and accommodation details for the physical event.
            </p>
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:gap-x-4 sm:text-sm">
              <span className="font-bold text-slate-700 dark:text-slate-300">Avishkaar 4</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
              <span className="flex min-w-0 items-center gap-1.5"><CalendarDays className="h-4 w-4 shrink-0" /> 24 Nov 2026 – 25 Nov 2026</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
              <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" /> AITAM Campus, Tekkali</span>
            </div>
          </div>
            <button className="flex min-h-12 w-3/12 m-auto items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 2xl:min-w-[190px]">
                <Plus className="h-5 w-5" /> Add New Room
            </button>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-3xl sm:p-5 xl:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <stat.icon className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[11px]">{stat.label}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  {stat.subtext && <p className="text-xs text-slate-500 dark:text-slate-400">{stat.subtext}</p>}
                </div>
                {stat.progress && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: stat.percent }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{stat.percent}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 space-y-5 sm:space-y-6">
          {renderAccommodationSection(
            "Boys Accommodation",
            <Mars className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />,
            25, 21, 4,
            boysAvailable,
            boysAllocated,
            'boys'
          )}
          
          {renderAccommodationSection(
            "Girls Accommodation",
            <Venus className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />,
            25, 21, 4,
            girlsAvailable,
            girlsAllocated,
            'girls'
          )}
        </div>

      </div>
    </main>
  );
}

export default AccomodationRedirectPage;