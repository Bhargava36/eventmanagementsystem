"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Send, RotateCcw, ArrowUpRight } from "lucide-react";
import ScrollToTopButton from "../ui/ScrollToTopButton";

function getFormattedTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createInitialMessage() {
  return {
    id: 1,
    sender: "concierge",
    text: "Hi, I'm Byte — your AYOJAN event guide. Ask about open events, solo or squad registration, digital QR passes, or hosting.",
    timestamp: getFormattedTime(),
    suggestions: [
      "How to register?",
      "Explore open events",
      "Verify ID pass",
      "Host an event",
    ],
  };
}

function generateConciergeReply(userInput) {
  const text = userInput.toLowerCase().trim();

  if (
    text.includes("hi") ||
    text.includes("hello") ||
    text.includes("hey") ||
    text.includes("namaste")
  ) {
    return {
      text: "Hello! How can I direct you across events, registrations, digital ID passes, or organizer portals?",
      action: null,
    };
  }

  if (
    text.includes("verify") ||
    text.includes("qr") ||
    text.includes("pass") ||
    text.includes("badge") ||
    text.includes("meal") ||
    text.includes("hostel") ||
    text.includes("room") ||
    text.includes("stay")
  ) {
    return {
      text: "Registered attendees receive a custom digital ID pass with a QR verification code for gate check-ins, meal scanning, and organizer-assigned room allocations.",
      action: { label: "Verify an ID Pass", path: "/verify-id" },
    };
  }

  if (
    text.includes("host") ||
    text.includes("organ") ||
    text.includes("college") ||
    text.includes("club") ||
    text.includes("broadcast")
  ) {
    return {
      text: "Colleges and student chapters can open an Organizer Workspace to publish events, design QR passes, assign hostel rooms or expo booths, and send targeted email broadcasts.",
      action: { label: "Register Organizer Account", path: "/admin/register" },
    };
  }

  if (
    text.includes("jury") ||
    text.includes("eval") ||
    text.includes("score") ||
    text.includes("rubric") ||
    text.includes("judge")
  ) {
    return {
      text: "Evaluators sign in through the Jury Portal to review assigned teams or project booths against structured round criteria and submit scores cleanly.",
      action: { label: "Open Jury Portal", path: "/evaluator/login" },
    };
  }

  if (
    text.includes("register") ||
    text.includes("participat") ||
    text.includes("join") ||
    text.includes("apply") ||
    text.includes("sign")
  ) {
    return {
      text: "Create a Student Account once, browse open listings, and register solo for talks or create a team with an invite code for teammates.",
      action: { label: "Create Student Account", path: "/user/register" },
    };
  }

  if (
    text.includes("team") ||
    text.includes("squad") ||
    text.includes("member") ||
    text.includes("leader") ||
    text.includes("invite")
  ) {
    return {
      text: "Team size limits depend on the event organizer's settings. Squad creators get a shareable invite code so teammates can link directly during registration.",
      action: { label: "Browse Open Events", path: "/events" },
    };
  }

  if (
    text.includes("event") ||
    text.includes("hackathon") ||
    text.includes("expo") ||
    text.includes("workshop") ||
    text.includes("seminar")
  ) {
    return {
      text: "AYOJAN hosts hackathons, project expos, workshops, seminars, webinars, and alumni meets across on-campus, virtual, and hybrid formats.",
      action: { label: "Explore Open Events", path: "/events" },
    };
  }

  return {
    text: "I can help you browse open events, check registration flows, verify a QR pass, or reach the organizer and jury portals.",
    action: { label: "Explore Open Events", path: "/events" },
  };
}

function OrbitalMark({ spinning = false }) {
  return (
    <span
      className={`relative w-5 h-5 flex items-center justify-center shrink-0 ${
        spinning ? "animate-spin" : ""
      }`}
      style={spinning ? { animationDuration: "2.4s" } : undefined}
      aria-hidden="true"
    >
      <span className="absolute w-1.5 h-1.5 rounded-full bg-current top-0 left-1/2 -translate-x-1/2" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 left-0 top-1/2 -translate-y-1/2" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 right-0 top-1/2 -translate-y-1/2" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-current bottom-0 left-1/2 -translate-x-1/2" />
    </span>
  );
}

function ByteChatbot() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const messagesEndRef = useRef(null);
  const replyTimerRef = useRef(null);
  const nextIdRef = useRef(2);

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(() => [createInitialMessage()]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [isOpen, messages, reduceMotion]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  const handleSendMessage = (textToSend = null) => {
    const query = (textToSend ?? inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: nextIdRef.current++,
      sender: "user",
      text: query,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      const reply = generateConciergeReply(query);
      const botMsg = {
        id: nextIdRef.current++,
        sender: "concierge",
        text: reply.text,
        action: reply.action,
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 420);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    setIsTyping(false);
    setMessages([createInitialMessage()]);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={
              reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }
            }
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "bottom right" }}
            className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] h-[510px] max-h-[78vh] flex flex-col rounded-[28px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-lg dark:shadow-none overflow-hidden"
          >
            {/* Header with Optical Viewfinder Frame */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0 text-slate-900 dark:text-white">
                  <OrbitalMark spinning={isTyping && !reduceMotion} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Byte
                  </h4>
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                    {isTyping ? "PREPARING GUIDE..." : "EVENT GUIDE READY"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  aria-label="Reset conversation"
                  title="Reset conversation"
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Byte"
                  title="Close"
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:border-emerald-500/60 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto sidebar-scrollbar space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {msg.sender === "concierge" ? (
                    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-500">
                        <span>Byte</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <p className="text-xs sm:text-[13px] text-slate-700 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>

                      {msg.action && (
                        <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => {
                              navigate(msg.action.path);
                              setIsOpen(false);
                            }}
                            className="group/act inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            <span>{msg.action.label}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/act:translate-x-0.5 motion-safe:group-hover/act:-translate-y-0.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[85%] space-y-1 flex flex-col items-end">
                      <div className="rounded-2xl bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed">
                        {msg.text}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-1.5 pt-2.5">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-emerald-500/60 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer truncate"
                        >
                          <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 mr-1.5">
                            0{idx + 1}
                          </span>
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Looking up workflow...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Recessed Input Bar */}
            <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
              <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 focus-within:border-emerald-500 transition-colors">
                <input
                  type="text"
                  placeholder="Ask Byte about events, passes, or hosting..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-0 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  aria-label="Send message"
                  className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll To Top harmonized above Trigger */}
      {!isOpen && <ScrollToTopButton />}

      {/* Orbital Trigger Button */}
      <div className="group relative flex items-center">
        {!isOpen && (
          <span className="pointer-events-none absolute right-full mr-3 hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-black text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 shadow-sm text-[11px] font-mono uppercase tracking-[0.12em] opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Ask Byte</span>
          </span>
        )}

        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black border border-slate-800 dark:border-zinc-200 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md transition-colors duration-200 cursor-pointer"
          aria-label={isOpen ? "Close Byte" : "Open Byte"}
          title={isOpen ? "Close" : "Ask Byte"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={
                  reduceMotion ? { opacity: 1 } : { rotate: -90, opacity: 0 }
                }
                animate={{ rotate: 0, opacity: 1 }}
                exit={
                  reduceMotion ? { opacity: 0 } : { rotate: 90, opacity: 0 }
                }
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={
                  reduceMotion ? { opacity: 1 } : { scale: 0.85, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1 }}
                exit={
                  reduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }
                }
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:rotate-90"
              >
                <OrbitalMark />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

export default ByteChatbot;
