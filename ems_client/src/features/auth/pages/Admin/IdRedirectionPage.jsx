import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IdCard,
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  CalendarDays,
  Info,
  Check,
  Eye,
  Download
} from 'lucide-react';

function IdRedirectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 font-sans text-slate-900 dark:bg-[#070908] dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <button
          type="button"
          onClick={() => navigate('/admin/physical-event')}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <IdCard className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                ID Card Generation
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Generate and manage participant ID cards for registered teams and individuals.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              <span className="font-bold text-slate-700 dark:text-slate-300">Avishkaar 4</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> 24 Nov 2026 – 25 Nov 2026</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> AITAM Campus, Tekkali</span>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto lg:items-end">
            <button className="flex w-full items-center justify-center gap-4 rounded-2xl bg-emerald-700 p-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 dark:bg-emerald-500 dark:shadow-emerald-500/20 dark:hover:bg-emerald-600 sm:w-auto cursor-pointer">
              <IdCard className="h-7 w-7" />
              <div className="text-left">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-white ">
                  GENERATE ID CARDS <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-900">
                <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Registered Teams</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">48</p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <IdCard className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">ID Cards Generated Teams</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">42</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Clock className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Pending Generation Teams</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">6</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-900">
                <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Participants</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">312</p>
            </div>
          </div>

        </div>


        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-zinc-800 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 dark:bg-emerald-500 dark:shadow-emerald-500/20">
                <Users className="h-4 w-4" /> All Teams (48)
              </button>
              <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300 dark:hover:bg-zinc-900">
                <Check className="h-4 w-4" /> Generated (42)
              </button>
              <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300 dark:hover:bg-zinc-900">
                <Clock className="h-4 w-4" /> Pending (6)
              </button>
            </div>
            
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team name, lead or college..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 sm:p-8 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <IdCard className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registered Teams (Physical Event)</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ID generation status for all teams registered in the physical event.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Team Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Team Lead</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">College / State</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Members</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">ID Generation Status</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        TB
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Tech Blazers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Rohit Kumar</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">rohit@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">4</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Generated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                        AI
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Alpha Innovators</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Sneha Reddy</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">sneha@rguktn.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">RGUKT</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">5</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Generated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                        CS
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Code Spartans</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Vikram Naidu</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">vikram@svp.ac.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">SVPEC</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">3</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                     <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        BD
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Byte Dreamers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Priya Sree</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">priya@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">5</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Generated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-400">
                        ZX
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Zero X</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Sai Charan</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">saicharan@jntuk.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">JNTUK</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">4</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Generated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
                        DR
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Dream Runners</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Karthik Varma</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">karthik@svpc.ac.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">SVPEC</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">3</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                     <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                        NT
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">NextGen Techies</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Lavanya</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">lavanya@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">5</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Generated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                        SK
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Skywalkers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Harsha Vardhan</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">harsha@rgukt.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">RGUKT</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">4</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                     <button type="button" aria-label="View ID card" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10">
                        <Eye className="h-4 w-4" /> 
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default IdRedirectionPage;