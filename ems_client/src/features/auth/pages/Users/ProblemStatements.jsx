import React, { useState } from 'react';
import { 
  Code, 
  Calendar, 
  ChevronDown, 
  FileText, 
  ArrowRight 
} from 'lucide-react';


const events = [
  'Avishkaar Hackathon',
  'HackSprint',
  'TechSprint',
  'Build & Scale',
  'InnovateX'
];

const problemStatements = [
  {
    id: 1,
    title: "Smart Campus Waste Management",
    description: "Design a system to monitor and manage waste collection in a smart campus using IoT and data analytics. The system should track bin levels, notify authorities, and suggest optimal collection routes.",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "AI-Powered Study Buddy",
    description: "Build an AI assistant that helps students with personalized learning, doubt resolution, and study planning. The assistant should adapt to the user's learning style and progress.",
    difficulty: "Medium",
  },
  {
    id: 3,
    title: "Marketplace for Local Artisans",
    description: "Develop a platform to connect local artisans with customers, enabling product listing, order management, and fair pricing. Focus on simplicity, trust, and community growth.",
    difficulty: "Medium",
  },
  {
    id: 4,
    title: "Disaster Alert & Resource Mapping",
    description: "Create a real-time disaster management system that uses location data, SOS alerts, and resource mapping to help affected people and authorities respond faster.",
    difficulty: "Hard",
  },
  {
    id: 5,
    title: "Automated Attendance System",
    description: "Build a facial recognition or QR-based attendance system with real-time updates and reports for educational institutions.",
    difficulty: "Easy",
  }
];


function ProblemStatementsPage() {
  const [selectedEvent, setSelectedEvent] = useState('Avishkaar Hackathon');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-10 font-sans transition-colors duration-200">
      

      <div className="w-full max-w-none space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50">
            <Code className="h-8 w-8" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Problem Statements
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Explore the problem statements for different events and start building your ideas.
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#050505] cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-700/80 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Select Event</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedEvent}</span>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg dark:border-emerald-900/50 dark:bg-[#0a0a0a]">
              {events.map((event) => (
                <button
                  key={event}
                  type="button"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selectedEvent === event
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#050505] overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-4 bg-slate-50/50 dark:bg-[#0a0a0a]">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-500 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEvent}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Innovation <span className="mx-2 text-emerald-300 dark:text-emerald-800">|</span> 
                Collaboration <span className="mx-2 text-emerald-300 dark:text-emerald-800">|</span> 
                Impact
              </p>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-emerald-100 dark:divide-emerald-900/30">
            {problemStatements.map((item) => (
              <div 
                key={item.id} 
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-500 flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-200 dark:border-emerald-800/50">
                  {item.id}
                </div>

                <div className="flex-1 space-y-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 mt-2 sm:mt-0">
                 
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProblemStatementsPage;