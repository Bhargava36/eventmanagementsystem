import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Calendar, 
  ChevronDown, 
  FileText, 
  ArrowRight,
  BookOpen,
  Mic,
  Terminal,
  Trophy,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2
} from 'lucide-react';
import { getEventTypeInfo } from '../../../../lib/utils';

export default function ProblemStatementsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/events');
      if (res.ok) {
        const data = await res.json();
        const evList = data.events || [];
        setEvents(evList);
        if (evList.length > 0) {
          setSelectedEventId(evList[0].Id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch events:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.Id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  const typeInfo = useMemo(() => {
    return getEventTypeInfo(selectedEvent?.EventType);
  }, [selectedEvent]);

  // Dynamic agenda/challenge generation based on EventType
  const items = useMemo(() => {
    if (!selectedEvent) return [];

    if (typeInfo.isWorkshop) {
      return [
        {
          id: 1,
          title: "Module 1: Architecture & Development Toolchain",
          description: "Introduction to core architectural primitives, modern setup, prerequisite tooling, and project workspace bootstrapping for hands-on labs.",
          badge: "Hands-on Lab",
          duration: "45 mins",
          difficulty: "Beginner",
        },
        {
          id: 2,
          title: "Module 2: Live Code Walkthrough & State Management",
          description: "Step-by-step guided build session covering component lifecycles, API layer integration, reactive data flow, and error boundary handling.",
          badge: "Live Coding",
          duration: "90 mins",
          difficulty: "Intermediate",
        },
        {
          id: 3,
          title: "Module 3: Advanced Optimization & Production Patterns",
          description: "Deep dive into performance profiling, caching strategies, test-driven validation, and deploying containerized microservices to cloud runners.",
          badge: "Deep Dive",
          duration: "60 mins",
          difficulty: "Advanced",
        },
        {
          id: 4,
          title: "Module 4: Practical Exercise & Certification Assessment",
          description: "Individual coursework milestone: implement the capstone exercise, submit code repository for mentor review, and verify learning objectives.",
          badge: "Assessment",
          duration: "45 mins",
          difficulty: "Evaluation",
        }
      ];
    }

    if (typeInfo.isSeminar) {
      return [
        {
          id: 1,
          title: "Keynote 1: Future Horizons in Cloud Native & Edge Intelligence",
          description: "Opening keynote addressing next-generation distributed systems, edge processing breakthroughs, and architectural shifts in scalable platforms.",
          badge: "Opening Keynote",
          duration: "50 mins",
          difficulty: "Keynote",
        },
        {
          id: 2,
          title: "Session 2: Industry Panel on Enterprise Scalability & Security",
          description: "Interactive panel debate with engineering leaders exploring real-world migration challenges, latency reduction, and zero-trust authentication.",
          badge: "Panel Debate",
          duration: "60 mins",
          difficulty: "Discussion",
        },
        {
          id: 3,
          title: "Session 3: Academic Research & Technical Paper Spotlight",
          description: "Selected researcher presentations detailing empirical findings, benchmarks, and cutting-edge innovations in machine perception and data modeling.",
          badge: "Research Talk",
          duration: "45 mins",
          difficulty: "Symposium",
        },
        {
          id: 4,
          title: "Session 4: Open Q&A & Collaborative Networking Lounge",
          description: "Moderated delegate open-floor conversation, networking breakout tracks, and closing remarks by conference chairs.",
          badge: "Open Lounge",
          duration: "30 mins",
          difficulty: "Networking",
        }
      ];
    }

    if (typeInfo.isCodingContest) {
      return [
        {
          id: 1,
          title: "Problem A: Optimal Resource Pathfinding",
          description: "Given a weighted dynamic graph with variable latency nodes, compute the lowest-cost path under constrained vertex capacity in sub-quadratic time.",
          badge: "Graph Theory",
          duration: "45 mins",
          difficulty: "Medium",
        },
        {
          id: 2,
          title: "Problem B: Memory-Constrained Cache Architecture",
          description: "Design an in-memory LRU-K cache eviction simulator that maintains logarithmic operations under aggressive multi-threaded concurrent mutations.",
          badge: "Data Structures",
          duration: "60 mins",
          difficulty: "Hard",
        },
        {
          id: 3,
          title: "Problem C: Distributed Consensus Simulator",
          description: "Implement a fault-tolerant message quorum algorithm that resolves split-brain partitions with minimum round-trip acknowledgements.",
          badge: "Systems & Concurrency",
          duration: "90 mins",
          difficulty: "Hard",
        },
        {
          id: 4,
          title: "Problem D: Subarray XOR Frequency Matrix",
          description: "Solve high-performance bitwise frequency queries across sliding segment trees with strict memory boundaries and 1-second CPU limit.",
          badge: "Math & Bitwise",
          duration: "45 mins",
          difficulty: "Expert",
        }
      ];
    }

    // Default / Hackathon problem statements
    return [
      {
        id: 1,
        title: "Smart Campus Waste Management & Resource Routing",
        description: "Design an intelligent sensor-driven platform to monitor waste collection across campus facilities, predict surge overflows, and generate dynamic vehicle dispatch routes.",
        badge: "IoT & Smart Cities",
        duration: "Hackathon Track",
        difficulty: "Open Challenge",
      },
      {
        id: 2,
        title: "AI-Powered Adaptive Learning & Personalized Doubts Engine",
        description: "Build a conversational agent and multimodal assessment tool that personalizes study curricula, identifies knowledge gaps, and provides step-by-step interactive derivations.",
        badge: "AI & EdTech",
        duration: "Hackathon Track",
        difficulty: "Open Challenge",
      },
      {
        id: 3,
        title: "Decentralized Verified Marketplace for Local Artisans",
        description: "Develop a transparent supply-chain registry connecting local rural craftsmen directly to global markets with authenticated providence, automated escrows, and fair pricing.",
        badge: "Web3 & Fintech",
        duration: "Hackathon Track",
        difficulty: "Open Challenge",
      },
      {
        id: 4,
        title: "Real-time Disaster Alert & Community Resource Mapping",
        description: "Create an offline-first emergency coordination portal using peer-to-peer mesh networking, localized SOS beacon broadcasting, and relief distribution dashboard.",
        badge: "Civic Tech & Safety",
        duration: "Hackathon Track",
        difficulty: "Open Challenge",
      },
      {
        id: 5,
        title: "Automated Vision-based Attendance & Academic Analytics",
        description: "Develop a privacy-preserving computer vision attendance logger with real-time audit logs, anti-spoofing validation, and institutional analytics exporting.",
        badge: "Computer Vision",
        duration: "Hackathon Track",
        difficulty: "Open Challenge",
      }
    ];
  }, [selectedEvent, typeInfo]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    return events.filter((e) => 
      (e.EventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.EventType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-10 font-sans transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              {typeInfo.isWorkshop ? (
                <BookOpen className="h-8 w-8" strokeWidth={2} />
              ) : typeInfo.isSeminar ? (
                <Mic className="h-8 w-8" strokeWidth={2} />
              ) : typeInfo.isCodingContest ? (
                <Terminal className="h-8 w-8" strokeWidth={2} />
              ) : (
                <Code className="h-8 w-8" strokeWidth={2} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {typeInfo.isWorkshop 
                    ? 'Workshop Agendas & Modules' 
                    : typeInfo.isSeminar 
                    ? 'Keynote Speakers & Topics' 
                    : typeInfo.isCodingContest 
                    ? 'Contest Challenges & Problem Sets' 
                    : 'Problem Statements & Challenges'}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${typeInfo.badgeColor}`}>
                  {typeInfo.label}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                {typeInfo.isWorkshop
                  ? 'Review hands-on lab modules, practical exercises, and syllabus milestones for this event.'
                  : typeInfo.isSeminar
                  ? 'Explore the curated speaker lineup, talk topics, and panel discussion itineraries.'
                  : typeInfo.isCodingContest
                  ? 'Explore competitive algorithmic challenges, problem domains, and benchmark criteria.'
                  : 'Explore official problem statements, technical domains, and build innovative solutions.'}
              </p>
            </div>
          </div>

          {selectedEvent && (
            <button
              type="button"
              onClick={() => navigate(`/user/events/${selectedEvent.Id}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              <span>View Full Event</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:border-emerald-500/50 transition-colors text-left shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Active Event</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {selectedEvent?.EventName || (loading ? 'Loading events...' : 'Select Event')}
                  </span>
                  {selectedEvent && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                      {selectedEvent.EventType || 'Event'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-2 space-y-1">
              <div className="relative px-2 pt-1 pb-2">
                <Search className="absolute left-4 top-3.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredEvents.map((ev) => {
                  const evType = getEventTypeInfo(ev.EventType);
                  const isSelected = selectedEvent?.Id === ev.Id;
                  return (
                    <button
                      key={ev.Id}
                      type="button"
                      onClick={() => {
                        setSelectedEventId(ev.Id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span className="truncate pr-2">{ev.EventName}</span>
                      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${evType.badgeColor}`}>
                        {evType.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Event Context Card */}
        {selectedEvent && (
          <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${typeInfo.badgeColor}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Format: {selectedEvent.HackathonMode || 'Standard Track'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedEvent.EventName}
                </h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 max-w-3xl leading-relaxed">
                  {selectedEvent.Description || (typeInfo.isWorkshop 
                    ? 'Join specialized hands-on modules conducted by experienced mentors.' 
                    : 'Collaborate with teams to solve high-impact technological challenges.')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/user/events/${selectedEvent.Id}`)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                >
                  Registration Page
                </button>
              </div>
            </div>

            {/* List of Challenges / Agendas / Topics */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 hover:bg-emerald-50/20 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                    {item.id}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                        <Tag className="w-2.5 h-2.5 text-emerald-500" />
                        {item.badge}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                        <Clock className="w-2.5 h-2.5" />
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/user/events/${selectedEvent.Id}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}