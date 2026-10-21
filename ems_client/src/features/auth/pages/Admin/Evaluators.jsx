import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Plus,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Pencil,
  Eye,
  FileQuestion,
  Monitor,
  Laptop,
  Save,
  X,
  Mail,
  LockKeyhole,
  Building2
} from 'lucide-react';

function Evaluators() {
  const [activeSection, setActiveSection] = React.useState(0);
  const [isAddEvaluatorOpen, setIsAddEvaluatorOpen] = React.useState(false);
  const [roundsByTrack, setRoundsByTrack] = React.useState({
    physical: [],
    virtual: []
  });
  const [showRoundForm, setShowRoundForm] = React.useState(false);
  const [roundName, setRoundName] = React.useState('');
  const [roundDescription, setRoundDescription] = React.useState('');
  const [activeQuestionRound, setActiveQuestionRound] = React.useState(null);
  const [questionDraft, setQuestionDraft] = React.useState('');
  const nextRoundId = React.useRef(1);

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

  const section = sectionsData[activeSection % sectionsData.length];
  const isRoundsTab = activeSection >= sectionsData.length;
  const currentTrack = activeSection === 2 ? 'physical' : 'virtual';
  const PanelIcon = isRoundsTab ? ClipboardList : section.headerIcon;
  const rounds = roundsByTrack[currentTrack];

  const handleAddRound = (event) => {
    event.preventDefault();
    const name = roundName.trim();
    if (!name) return;
    const id = nextRoundId.current++;

    setRoundsByTrack((current) => ({
      ...current,
      [currentTrack]: [
        ...current[currentTrack],
        { id, name, description: roundDescription.trim(), questions: [] }
      ]
    }));
    setRoundName('');
    setRoundDescription('');
    setShowRoundForm(false);
  };

  const handleAddQuestion = (event, roundId) => {
    event.preventDefault();
    const question = questionDraft.trim();
    if (!question) return;

    setRoundsByTrack((current) => ({
      ...current,
      [currentTrack]: current[currentTrack].map((round) =>
        round.id === roundId
          ? { ...round, questions: [...round.questions, question] }
          : round
      )
    }));
    setQuestionDraft('');
    setActiveQuestionRound(null);
  };

  const handleAddEvaluatorSubmit = (event) => {
    event.preventDefault();
    setIsAddEvaluatorOpen(false);
  };

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
            {[
              ...sectionsData.map((tab, index) => ({
                id: index,
                label: tab.tagText,
                icon: tab.headerIcon
              })),
              { id: 2, label: 'Physical Rounds', icon: ClipboardList },
              { id: 3, label: 'Virtual Rounds', icon: ClipboardList }
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSection(tab.id)}
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
                    {tab.label}
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
                  <PanelIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isRoundsTab
                      ? `${currentTrack === 'physical' ? 'Physical' : 'Virtual'} Evaluation Rounds`
                      : section.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    {isRoundsTab
                      ? `Create ${currentTrack} evaluation rounds and add questions to each round.`
                      : section.description}
                  </p>
                </div>
              </div>
              {isRoundsTab ? (
                <button
                  type="button"
                  onClick={() => setShowRoundForm((shown) => !shown)}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  {showRoundForm ? 'Cancel' : 'Add Round'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddEvaluatorOpen(true)}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Evaluator
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {!isRoundsTab && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            </div>}

            {isRoundsTab ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {showRoundForm ? (
                <form onSubmit={handleAddRound} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-zinc-800 dark:bg-black sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                      <ClipboardList className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Create a round</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set up a round for the {currentTrack} evaluation.</p>
                    </div>
                  </div>
                  <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Round name
                    <input
                      required
                      value={roundName}
                      onChange={(event) => setRoundName(event.target.value)}
                      placeholder="e.g. Preliminary Round"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description <span className="font-normal text-slate-400">(optional)</span>
                    <textarea
                      rows={3}
                      value={roundDescription}
                      onChange={(event) => setRoundDescription(event.target.value)}
                      placeholder="Describe the purpose of this round"
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                    />
                  </label>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500">
                    <Plus className="h-4 w-4" />
                    Add Round
                  </button>
                </form>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-zinc-700">
                    <ClipboardList className="h-10 w-10 text-slate-400" />
                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                      {rounds.length ? 'Add another round' : 'No rounds added'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Create a round to start adding evaluation questions.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowRoundForm(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500"
                    >
                      <Plus className="h-4 w-4" />
                      Add Round
                    </button>
                  </div>
                )}

                {rounds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-zinc-700">
                    <ClipboardList className="h-10 w-10 text-slate-400" />
                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No rounds added</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create a round to start adding evaluation questions.</p>
                  </div>
                ) : rounds.map((round, roundIndex) => (
                <article key={round.id} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                        <ClipboardList className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-500">Round {roundIndex + 1}</p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{round.name}</h3>
                        {round.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{round.description}</p>}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-slate-300">
                      {round.questions.length} {round.questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
                    {round.questions.length > 0 && (
                      <ol className="space-y-2">
                        {round.questions.map((question, questionIndex) => (
                          <li key={`${round.id}-${questionIndex}`} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-zinc-900 dark:text-slate-300">
                            <span className="font-bold text-emerald-700 dark:text-emerald-500">{questionIndex + 1}.</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {activeQuestionRound === round.id ? (
                    <form onSubmit={(event) => handleAddQuestion(event, round.id)} className="space-y-3">
                    <label className="block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      New question
                      <textarea
                        required
                        rows={3}
                        autoFocus
                        value={questionDraft}
                        onChange={(event) => setQuestionDraft(event.target.value)}
                        placeholder="Enter an evaluation question"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                      />
                    </label>
                    <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setActiveQuestionRound(null); setQuestionDraft(''); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900">
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400">
                      <FileQuestion className="h-4 w-4" />
                      Add Question
                    </button>
                    </div>
                    </form>
                    ) : (
                      <button type="button" onClick={() => { setActiveQuestionRound(round.id); setQuestionDraft(''); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400">
                        <FileQuestion className="h-4 w-4" />
                        Add Question
                      </button>
                    )}
                  </div>
                </article>
                ))}
              </div>
            ) : <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800">
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

            </div>}
          </section>
        </div>
      </div>

      {isAddEvaluatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsAddEvaluatorOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-evaluator-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-black"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 id="add-evaluator-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Evaluator
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Enter the evaluator details below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close add evaluator dialog"
                onClick={() => setIsAddEvaluatorOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvaluatorSubmit} className="space-y-5 p-5 sm:p-6">
              <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Evaluator name
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    name="evaluatorName"
                    autoComplete="name"
                    placeholder="Enter evaluator name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      name="evaluatorEmail"
                      autoComplete="email"
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </label>

                <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="password"
                      name="evaluatorPassword"
                      autoComplete="new-password"
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                College name
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    name="collegeName"
                    autoComplete="organization"
                    placeholder="Enter college or institution"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-normal outline-none transition focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddEvaluatorOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Add Evaluator
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Evaluators;