import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Send,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Users,
  Eye,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AlumniInvitesPage() {
  const toast = useToast();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = admin?.EventId;

  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'whatsapp'
  const [eventData, setEventData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email form state
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [emailSubject, setEmailSubject] = useState('You Are Invited Home! Grand Alumni Reunion 2026');
  const [customMessage, setCustomMessage] = useState(
    'It is time to walk the familiar hallways, catch up with old classmates and beloved professors, and celebrate the incredible journeys of our alumni. We have planned a full day of nostalgic campus tours, distinguished keynote talks, and a gala dinner banquet.'
  );

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [evRes, cfgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/${eventId}`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/config`)
      ]);

      if (evRes.ok) {
        const ev = await evRes.json();
        const cur = Array.isArray(ev) ? ev[0] : (ev.event || ev);
        setEventData(cur);
      }
      if (cfgRes.ok) {
        const c = await cfgRes.json();
        setConfig(c);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load invitation configuration');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived batches from config
  const targetedBatches = useMemo(() => {
    if (!config?.TargetBatches) return [];
    return config.TargetBatches.split(',').map((b) => b.trim()).filter(Boolean);
  }, [config]);

  // WhatsApp Message Text
  const whatsappText = useMemo(() => {
    const eventName = eventData?.EventName || 'Grand Alumni Reunion';
    const date = eventData?.StartDate ? new Date(eventData.StartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Upcoming';
    const venue = config?.VenueHall || eventData?.Location || 'Main Campus Auditorium & Lawns';
    const rsvpLink = window.location.origin ? `${window.location.origin}/event/${eventId}` : 'https://college.edu/alumni';

    return `🎓 *Official Invitation: ${eventName}* 🎓\n\nDear Alumnus,\n\nWe cordially invite you to return to your alma mater for the Grand Alumni Homecoming & Gala Reunion!\n\n📅 *Date:* ${date}\n📍 *Venue:* ${venue}\n👔 *Dress Code:* ${config?.DressCode || 'Smart Casual / Festive'}\n\n${customMessage}\n\n👉 *RSVP & Digital Pass:* ${rsvpLink}\n\nWe cannot wait to welcome you back home! 🥂`;
  }, [eventData, config, eventId, customMessage]);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    toast.success('WhatsApp invitation copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmailInvites = async () => {
    if (!eventId) return;
    try {
      setDispatching(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/send-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchYear: selectedBatch === 'ALL' ? null : selectedBatch,
          customSubject: emailSubject,
          customMessage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch email invitations');

      toast.success(data.message || 'Email invitations dispatched successfully!');
    } catch (err) {
      toast.error(err.message || 'Error dispatching invitations');
    } finally {
      setDispatching(false);
    }
  };

  const inviteTabs = [
    { id: 'email', label: 'Email Dispatcher', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Broadcast', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Send className="w-4 h-4" />
            <span>Outreach &amp; Invitations Dispatcher</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
            Email &amp; WhatsApp Reunion Invites
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Broadcast personalized digital invitations to past graduating batches via email and WhatsApp groups.
          </p>
        </div>
      </div>

      {/* Application Signature Folder Tabs */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
          {inviteTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="alumniInvitesTabFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-white/10 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 z-0" />
                )}

                <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
                }`}>
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box with matching border */}
        <div className="rounded-3xl rounded-tl-none border border-slate-200 dark:border-white/10 bg-white dark:bg-black p-6 shadow-sm">
          {/* EMAIL DISPATCHER TAB */}
          {activeTab === 'email' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Composer Form */}
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">Compose Email Broadcast</h2>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Batch Filter */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-gray-300">Target Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 font-semibold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    >
                      <option value="ALL">All Targeted Batches ({targetedBatches.join(', ') || 'All'})</option>
                      {targetedBatches.map((b) => (
                        <option key={b} value={b}>
                          Class of {b} only
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-gray-300">Email Subject Line</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Custom Message */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-gray-300">Personalized Message Body</label>
                    <textarea
                      rows={6}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      The recipient's personal name, graduating batch, RSVP button, and venue logistics are automatically injected into each invitation.
                    </span>
                  </div>

                  <button
                    onClick={handleSendEmailInvites}
                    disabled={dispatching}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {dispatching ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Sending Invitations...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Dispatch Email Invitations to Batch
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Preview Card */}
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                  <Eye className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">Recipient Inbox Preview</h2>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-inner bg-white dark:bg-black">
                  {/* Fake Email Header */}
                  <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 space-y-1 text-xs">
                    <p>
                      <strong className="text-slate-400">Subject:</strong> {emailSubject}
                    </p>
                    <p>
                      <strong className="text-slate-400">From:</strong> Alumni Relations &lt;alumni@college.edu&gt;
                    </p>
                    <p>
                      <strong className="text-slate-400">To:</strong> Priya Sharma &lt;priya.class2018@alumni.org&gt;
                    </p>
                  </div>

                  {/* Email Content */}
                  <div className="p-6 space-y-4 text-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      • Alma Mater Homecoming
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Dear Priya Sharma,
                    </h3>

                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                      {customMessage}
                    </p>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-semibold">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>
                          {eventData?.StartDate ? new Date(eventData.StartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Reunion Date'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{config?.VenueHall || 'Main Campus Auditorium & Lawns'}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow">
                        Confirm Attendance &amp; RSVP Now →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WHATSAPP TAB */}
          {activeTab === 'whatsapp' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">WhatsApp Broadcast Template</h2>
                </div>

                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Copy this pre-formatted message to post in batch WhatsApp groups, or trigger a direct WhatsApp share.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 font-mono text-emerald-400 text-xs whitespace-pre-wrap leading-relaxed border border-emerald-500/20">
                  {whatsappText}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Template Text'}
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Share on WhatsApp Web
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">WhatsApp Distribution Tips</h2>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-gray-400">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Batch Representatives &amp; Class Groups</h4>
                    <p>Send the template directly to designated Batch Coordinators or Class CRs to broadcast in their respective graduation batch groups.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Direct RSVP Generation</h4>
                    <p>When clicked on mobile, the link takes alumni straight to the event details page where they can claim their pass in 30 seconds.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">Spouse &amp; Guest Attendance</h4>
                    <p>Mention whether +1 guest tickets or banquet dinner passes are authorized for this reunion.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
