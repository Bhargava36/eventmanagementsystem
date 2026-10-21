import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Laptop
} from 'lucide-react';

function Evaluators() {
  const [activeSection, setActiveSection] = React.useState(0);

  const sectionsData = [
    {
      title: "Physical Event Evaluator Management",
      description: "Create and manage evaluators for physical events. Assign evaluators to teams, track their status and manage their participation details.",
      headerIcon: Users,
      tagIcon: MapPin,
      tagText: "Physical Event",
      totalCount: 24,
      stats: [
        {
          label: "Total Evaluators",
          value: "24",
          icon: Users,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
        },
        {
          label: "Active Evaluators",
          value: "20",
          icon: CheckCircle2,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
        },
        {
          label: "Pending Approval",
          value: "3",
          icon: Clock,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
        },
        {
          label: "Inactive Evaluators",
          value: "1",
          icon: Ban,
          iconBg: "bg-rose-50 dark:bg-rose-500/10",
          iconColor: "text-rose-500 dark:text-rose-400",
      }
      ],
      tableConfig: {
        title: "Physical Event Evaluators",
        subtitle: "Manage evaluators, assign them to events and track their evaluation status.",
        icon: Users,
        searchPlaceholder: "Search by name, email, college or event..."
      },
      evaluators: [
        {
          avatar: "RK",
          avatarBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
          name: "Rohit Kumar",
          email: "rohit@aitam.edu.in",
          college: "AITAM",
          event: "Avishkaar 4 (Physical)",
          role: "Technical Evaluator",
          roleColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
          status: "Active",
          statusIcon: CheckCircle2,
          statusColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
        },
        {
          avatar: "SP",
          avatarBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
          name: "Sneha Patel",
          email: "sneha@aitam.edu.in",
          college: "AITAM",
          event: "Avishkaar 4 (Physical)",
          role: "Domain Expert",
          roleColor: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
          status: "Active",
          statusIcon: CheckCircle2,
          statusColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
        },
      ],
    },
    {
      title: "Virtual Event Evaluator Management",
      description: "Create and manage evaluators for virtual events. Assign evaluators to teams, track their status and manage their participation details.",
      headerIcon: Monitor,
      tagIcon: Laptop,
      tagText: "Virtual Event",
      totalCount: 18,
      stats: [
        {
          label: "Total Evaluators",
          value: "18",
          icon: Users,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
          progress: null,
          barColor: null
        },
        {
          label: "Active Evaluators",
          value: "16",
          icon: CheckCircle2,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
        },
        {
          label: "Pending Approval",
          value: "2",
          icon: Clock,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          iconColor: "text-emerald-700 dark:text-emerald-500",
        },
        {
          label: "Inactive Evaluators",
          value: "0",
          icon: Ban,
          iconBg: "bg-rose-50 dark:bg-rose-500/10",
          iconColor: "text-rose-500 dark:text-rose-400",
        }
      ],
      tableConfig: {
        title: "Virtual Event Evaluators",
        subtitle: "Manage evaluators, assign them to events and track their evaluation status.",
        icon: Users,
        searchPlaceholder: "Search by name, email, college or event..."
      },
      evaluators: [
        {
          avatar: "AD",
          avatarBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
          name: "Ananya Das",
          email: "ananya@aitam.edu.in",
          college: "AITAM",
          event: "HackSprint (Virtual)",
          role: "Technical Evaluator",
          roleColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
          status: "Active",
          statusIcon: CheckCircle2,
          statusColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
        },
        {
          avatar: "VS",
          avatarBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
          name: "Vikram Singh",
          email: "vikram@aitam.edu.in",
          college: "AITAM",
          event: "HackSprint (Virtual)",
          role: "Domain Expert",
          roleColor: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
          status: "Active",
          statusIcon: CheckCircle2,
          statusColor: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
        },
      ],
    }
  ];

  const section = sectionsData[activeSection];

  return (
    <main className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-black dark:text-white sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col items-start justify-between gap-5 border-b border-slate-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                Evaluator Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Create and manage evaluators, assign them to events, and track their participation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <div className="relative z-10 -mb-px flex items-end gap-2 overflow-x-auto">
            {sectionsData.map((tab, index) => {
              const isActive = activeSection === index;
              const Icon = tab.headerIcon;

              return (
                <button
                  key={tab.tagText}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSection(index)}
                  className="relative flex h-11 shrink-0 items-center gap-2 rounded-t-2xl px-5 text-xs font-bold tracking-wide outline-none transition-colors sm:px-7 sm:text-sm"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="evaluatorActiveTab"
                      className="absolute inset-0 -bottom-[2px] z-20 rounded-t-2xl border-x border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.03)] dark:border-zinc-800 dark:bg-black"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="pointer-events-none absolute -bottom-[2px] left-0 right-0 z-30 h-1 bg-white dark:bg-black" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 z-0 rounded-t-2xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-black" />
                  )}
                  <span className={`relative z-20 flex items-center gap-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
                    <Icon className="h-4 w-4" />
                    {tab.tagText}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </span>
                </button>
              );
            })}
          </div>

          <section
            role="tabpanel"
            className="relative z-0 space-y-6 border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-black sm:p-8"
          >
            <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <section.headerIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    {section.description}
                  </p>
                </div>
              </div>
              <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500">
                <Plus className="h-4 w-4" />
                Add Evaluator
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {section.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-zinc-800/80 dark:bg-black">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                    <section.tableConfig.icon className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{section.tableConfig.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{section.tableConfig.subtitle}</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={section.tableConfig.searchPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] text-center text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:bg-black">
                      <th className="whitespace-nowrap px-5 py-4">Name</th>
                      <th className="whitespace-nowrap px-5 py-4">Email</th>
                      <th className="whitespace-nowrap px-5 py-4">College / Institution</th>
                      <th className="whitespace-nowrap px-5 py-4">Event</th>
                      <th className="whitespace-nowrap px-5 py-4">Status</th>
                      <th className="whitespace-nowrap px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {section.evaluators.map((evaluator) => (
                      <tr key={evaluator.email} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                        <td className="whitespace-nowrap px-5 py-4 align-middle">
                          <div className="flex items-center justify-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${evaluator.avatarBg}`}>
                              {evaluator.avatar}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{evaluator.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle text-slate-500 dark:text-slate-400">{evaluator.email}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle text-slate-500 dark:text-slate-400">{evaluator.college}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle text-slate-500 dark:text-slate-400">{evaluator.event}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${evaluator.statusColor}`}>
                            <evaluator.statusIcon className="h-3.5 w-3.5" />
                            {evaluator.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title="Edit evaluator"
                              aria-label={`Edit ${evaluator.name}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-slate-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Evaluators;