import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  Calendar,
  Compass,
  ArrowRight,
  User,
  HelpCircle
} from 'lucide-react';
import useTheme from '../../Hooks/useTheme';

function ByteChatbot() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showHintBubble, setShowHintBubble] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialGreeting = {
    id: 1,
    sender: 'byte',
    text: "Beep boop! 🤖 I'm Byte, your event guide. Ask me anything about hackathons, team rules, registration, or schedules!",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'How to register?',
      'Explore all events',
      'Team rules',
      'Venue & location'
    ]
  };

  const [messages, setMessages] = useState([initialGreeting]);

  useEffect(() => {
    if (isOpen) {
      setShowHintBubble(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateByteReply = (userInput) => {
    const text = userInput.toLowerCase().trim();

    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('namaste')) {
      return {
        text: "Beep boop! Hello there! (◕‿◕) I'm Byte, your campus event companion. How can I help you build and compete today?",
        action: null
      };
    }

    if (text.includes('event') || text.includes('hackathon') || text.includes('compet') || text.includes('challenge')) {
      return {
        text: "We host competitive hackathons, coding challenges, and innovation competitions! You can filter by Virtual or On-Campus tracks.",
        action: { label: 'Explore Events', path: '/events' }
      };
    }

    if (text.includes('register') || text.includes('participat') || text.includes('join') || text.includes('apply') || text.includes('sign up')) {
      return {
        text: "To participate in an event:\n1. Log into your Student Account.\n2. Navigate to Explore Events and select your challenge.\n3. Form or join a team with your college peers!",
        action: { label: 'Go to Student Login', path: '/user/login' }
      };
    }

    if (text.includes('team') || text.includes('size') || text.includes('member') || text.includes('leader')) {
      return {
        text: "Team rules depend on the specific event. Most hackathons support 2 to 4 members. Team leaders generate an invite code that teammates use to join!",
        action: { label: 'Check Events Schedule', path: '/events' }
      };
    }

    if (text.includes('venue') || text.includes('location') || text.includes('where') || text.includes('campus') || text.includes('address')) {
      return {
        text: "Physical tracks take place at the Main Campus Auditorium and Department Innovation Labs. Virtual tracks happen online via GitHub & Discord!",
        action: { label: 'Browse Events', path: '/events' }
      };
    }

    if (text.includes('prize') || text.includes('cash') || text.includes('reward') || text.includes('winner')) {
      return {
        text: "Top teams win cash prize pools, official winner trophies, and recognized merit certificates! Check individual event pages for prize breakdowns.",
        action: { label: 'View Events & Prizes', path: '/events' }
      };
    }

    if (text.includes('who are you') || text.includes('byte') || text.includes('robot')) {
      return {
        text: "I'm Byte! 🤖 The official mascot and AI navigator of Hack_Hub. I keep an eye on schedules, guide students, and make sure nobody gets lost at the venue!",
        action: null
      };
    }

    return {
      text: "Beep! I'm still learning every detail of the campus, but I can help you find events, understand team formation, or direct you to student login.",
      action: { label: 'Explore Active Hackathons', path: '/events' }
    };
  };

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateByteReply(query);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'byte',
        text: reply.text,
        action: reply.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 h-[500px] max-h-[80vh] flex flex-col rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <div className="w-5 h-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="20" y="25" width="60" height="50" rx="12" fill="#10b981" />
                      <circle cx="38" cy="45" r="5" fill="#ffffff" />
                      <circle cx="62" cy="45" r="5" fill="#ffffff" />
                      <path d="M 42 60 Q 50 65 58 60" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <line x1="50" y1="25" x2="50" y2="12" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="50" cy="10" r="4" fill="#10b981" />
                    </svg>
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Byte</span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      BOT
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Event Navigator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}

                    {msg.action && (
                      <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <button
                          onClick={() => {
                            navigate(msg.action.path);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 mt-1">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 w-16 text-emerald-600 dark:text-emerald-400">
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="h-1.5 w-1.5 rounded-full bg-current"
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask Byte anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <AnimatePresence>
          {showHintBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="mr-3 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 shadow-lg text-xs font-semibold flex items-center gap-2 select-none"
            >
              <span>Ask Byte! 🤖</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHintBubble(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20 flex items-center justify-center p-1.5 group transition-colors duration-200 cursor-pointer overflow-hidden"
          aria-label="Open Byte Chatbot"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-10 h-10 overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="50" y1="28" x2="50" y2="14" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              <motion.circle
                cx="50"
                cy="12"
                r="5"
                fill="#10b981"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <rect x="22" y="28" width="56" height="46" rx="14" fill={theme === 'dark' ? '#27272a' : '#ffffff'} stroke="#10b981" strokeWidth="2.5" />
              <rect x="28" y="34" width="44" height="34" rx="8" fill="#09090b" />
              
              <g>
                <motion.g
                  animate={{ scaleY: [1, 1, 1, 0.1, 1, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.45, 0.48, 0.5, 0.8, 1] }}
                >
                  <circle cx="40" cy="48" r="4.5" fill="#10b981" />
                  <circle cx="39" cy="46.5" r="1.5" fill="#ffffff" />
                  <circle cx="60" cy="48" r="4.5" fill="#10b981" />
                  <circle cx="59" cy="46.5" r="1.5" fill="#ffffff" />
                </motion.g>
                <circle cx="33" cy="56" rx="2.5" ry="1.5" fill="#fb7185" opacity="0.7" />
                <circle cx="67" cy="56" rx="2.5" ry="1.5" fill="#fb7185" opacity="0.7" />
                <path d="M 45 58 Q 50 63 55 58" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            </svg>
          </div>

          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </motion.button>
      </div>

    </div>
  );
}

export default ByteChatbot;
