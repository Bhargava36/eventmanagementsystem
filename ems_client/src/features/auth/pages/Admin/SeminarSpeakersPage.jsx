import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Mic,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Building,
  Globe,
  X,
  UserCheck,
  Award,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function SeminarSpeakersPage() {
  const toast = useToast();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = admin?.EventId;

  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    Name: '',
    Designation: '',
    Organization: '',
    Topic: '',
    Bio: '',
    PhotoUrl: '',
    LinkedinUrl: '',
    OrderIndex: 0
  });

  const fetchSpeakers = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/seminars/${eventId}/speakers`);
      if (!res.ok) throw new Error('Failed to load speakers');
      const data = await res.json();
      setSpeakers(data.speakers || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load keynote speakers');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]);

  const handleOpenModal = (speaker = null) => {
    if (speaker) {
      setEditingSpeaker(speaker);
      setFormData({
        Name: speaker.Name || '',
        Designation: speaker.Designation || '',
        Organization: speaker.Organization || '',
        Topic: speaker.Topic || '',
        Bio: speaker.Bio || '',
        PhotoUrl: speaker.PhotoUrl || '',
        LinkedinUrl: speaker.LinkedinUrl || '',
        OrderIndex: speaker.OrderIndex || 0
      });
    } else {
      setEditingSpeaker(null);
      setFormData({
        Name: '',
        Designation: '',
        Organization: '',
        Topic: '',
        Bio: '',
        PhotoUrl: '',
        LinkedinUrl: '',
        OrderIndex: speakers.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveSpeaker = async (e) => {
    e.preventDefault();
    if (!eventId) return;
    if (!formData.Name.trim()) {
      toast.error('Speaker Name is required');
      return;
    }

    try {
      setSaving(true);
      const url = editingSpeaker
        ? `${API_BASE_URL}/api/seminars/speakers/${editingSpeaker.Id}`
        : `${API_BASE_URL}/api/seminars/${eventId}/speakers`;
      const method = editingSpeaker ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save speaker');

      toast.success(editingSpeaker ? 'Speaker details updated!' : 'Speaker added successfully!');
      setIsModalOpen(false);
      fetchSpeakers();
    } catch (err) {
      console.error(err);
      toast.error('Could not save speaker');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpeaker = async (id) => {
    if (!window.confirm('Are you sure you want to remove this keynote speaker?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/seminars/speakers/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete speaker');
      toast.success('Speaker removed');
      fetchSpeakers();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete speaker');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5" />
            Seminar Keynote Roster &bull; {speakers.length} Speakers Listed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Keynote Speakers & Dignitaries
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Manage keynote addresses, guest lecturers, panel chairs, and invited dignitaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSpeakers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh speakers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keynote Speaker</span>
          </button>
        </div>
      </div>

      {/* Speakers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 dark:text-zinc-500 text-sm gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Loading keynote speakers...</span>
        </div>
      ) : speakers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Keynote Speakers Added Yet</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Add chief guests, keynote speakers, and session chairs to showcase their profiles to registered delegates.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Speaker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <div
              key={speaker.Id}
              className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 transition shadow-sm flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {speaker.PhotoUrl ? (
                      <img
                        src={speaker.PhotoUrl}
                        alt={speaker.Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
                        }}
                      />
                    ) : (
                      <Mic className="w-7 h-7 text-slate-400 dark:text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">{speaker.Name}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">{speaker.Designation || 'Keynote Dignitary'}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                      <span>{speaker.Organization || 'Invited Organization'}</span>
                    </p>
                  </div>
                </div>

                {speaker.Topic && (
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Keynote Topic</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mt-1 line-clamp-2">{speaker.Topic}</p>
                  </div>
                )}

                {speaker.Bio && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {speaker.Bio}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  {speaker.LinkedinUrl ? (
                    <a
                      href={speaker.LinkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition inline-flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Profile</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-zinc-600">No profile link</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(speaker)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Speaker"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSpeaker(speaker.Id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition cursor-pointer"
                    title="Delete Speaker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Speaker */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSpeaker ? 'Edit Keynote Speaker' : 'Add Keynote Speaker'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Speaker identity, topic, and affiliation details
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSpeaker} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Speaker Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Sundaram"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.Designation}
                      onChange={(e) => setFormData({ ...formData, Designation: e.target.value })}
                      placeholder="e.g. Principal Scientist / Professor"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      value={formData.Organization}
                      onChange={(e) => setFormData({ ...formData, Organization: e.target.value })}
                      placeholder="e.g. IIT Madras / ISRO / Google"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Keynote Talk Topic
                  </label>
                  <input
                    type="text"
                    value={formData.Topic}
                    onChange={(e) => setFormData({ ...formData, Topic: e.target.value })}
                    placeholder="e.g. AI-Driven Automation in Mission-Critical Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.PhotoUrl}
                    onChange={(e) => setFormData({ ...formData, PhotoUrl: e.target.value })}
                    placeholder="https://example.com/speaker-photo.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    LinkedIn / Website Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.LinkedinUrl}
                    onChange={(e) => setFormData({ ...formData, LinkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Speaker Bio / Achievements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.Bio}
                    onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                    placeholder="Brief background, research areas, and awards..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    {saving ? 'Saving...' : editingSpeaker ? 'Update Speaker' : 'Save Speaker'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
