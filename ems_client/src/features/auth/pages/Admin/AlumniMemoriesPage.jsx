import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Camera,
  Plus,
  Trash2,
  GraduationCap,
  Image as ImageIcon,
  X,
  ExternalLink,
  Heart,
  Eye
} from 'lucide-react';

export default function AlumniMemoriesPage() {
  const toast = useToast();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = admin?.EventId;

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');

  // Form State
  const [form, setForm] = useState({
    Title: '',
    MediaUrl: '',
    BatchYear: '2018',
    UploadedBy: 'Alumni Association'
  });
  const [submitting, setSubmitting] = useState(false);

  const loadMemories = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/memories`);
      if (!res.ok) throw new Error('Failed to load memories');
      const data = await res.json();
      setMemories(data.memories || []);
    } catch (err) {
      console.error(err);
      toast.error('Error loading nostalgia memories');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!form.Title.trim() || !form.MediaUrl.trim()) {
      toast.error('Please enter title and media image URL');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to post memory');

      toast.success('Memory posted to nostalgia wall!');
      setModalOpen(false);
      setForm({
        Title: '',
        MediaUrl: '',
        BatchYear: '2018',
        UploadedBy: 'Alumni Association'
      });
      loadMemories();
    } catch (err) {
      toast.error(err.message || 'Error posting memory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Delete this nostalgia memory photo?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/memories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete memory');
      toast.success('Memory removed');
      loadMemories();
    } catch (err) {
      toast.error(err.message || 'Error deleting memory');
    }
  };

  // Batches for filtering
  const batchesList = useMemo(() => {
    const s = new Set();
    memories.forEach((m) => {
      if (m.BatchYear) s.add(String(m.BatchYear));
    });
    return Array.from(s).sort().reverse();
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      return selectedBatchFilter === 'ALL' || String(m.BatchYear) === selectedBatchFilter;
    });
  }, [memories, selectedBatchFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Camera className="w-4 h-4" />
            <span>Nostalgia Gallery &amp; Flashback Wall</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
            Reunion Memories &amp; Campus Archive
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Curate vintage campus snapshots, graduation day pictures, and current reunion moments for all attending batches.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Memory / Photo
        </button>
      </div>

      {/* Filter Toolbar */}
      {batchesList.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 border-b border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-400">Filter Batch:</span>
          <button
            onClick={() => setSelectedBatchFilter('ALL')}
            className={`text-xs font-semibold px-2 py-1.5 transition-colors cursor-pointer ${
              selectedBatchFilter === 'ALL'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-gray-200'
            }`}
          >
            All Years ({memories.length})
          </button>
          {batchesList.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBatchFilter(b)}
              className={`text-xs font-semibold px-2 py-1.5 transition-colors cursor-pointer ${
                selectedBatchFilter === b
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              Class of {b}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {filteredMemories.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-black border border-dashed border-slate-300 dark:border-white/10 space-y-3">
          <Camera className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base">Nostalgia Wall is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
            Upload vintage batch pictures, cafeteria hangout moments, or graduation memories to celebrate the journey.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
          >
            <Plus className="w-4 h-4" />
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMemories.map((m) => (
            <div
              key={m.Id}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black shadow-sm flex flex-col justify-between"
            >
              <div
                onClick={() => setLightboxItem(m)}
                className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-100 dark:bg-white/5 cursor-pointer"
              >
                <img
                  src={m.MediaUrl}
                  alt={m.Title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    • Class of {m.BatchYear || 'Alumni'}
                  </span>
                  <button
                    onClick={() => handleDeleteMemory(m.Id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {m.Title}
                </h4>
                {m.UploadedBy && (
                  <p className="text-[10px] text-slate-400 truncate">
                    Shared by {m.UploadedBy}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h3 className="font-bold text-base">Add Nostalgia Photo</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-gray-300">Memory Title / Caption</label>
                  <input
                    type="text"
                    required
                    value={form.Title}
                    onChange={(e) => setForm({ ...form, Title: e.target.value })}
                    placeholder="e.g. 2018 Convocation Day or Canteen Fun"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-gray-300">Image URL</label>
                  <input
                    type="url"
                    required
                    value={form.MediaUrl}
                    onChange={(e) => setForm({ ...form, MediaUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-gray-300">Batch Year</label>
                    <input
                      type="text"
                      value={form.BatchYear}
                      onChange={(e) => setForm({ ...form, BatchYear: e.target.value })}
                      placeholder="e.g. 2018"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-gray-300">Uploaded By / Credited To</label>
                    <input
                      type="text"
                      value={form.UploadedBy}
                      onChange={(e) => setForm({ ...form, UploadedBy: e.target.value })}
                      placeholder="e.g. CSE 2018 Alumni"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    {submitting ? 'Posting...' : 'Post Photo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxItem && (
          <div
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="max-w-3xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-bold text-base">{lightboxItem.Title}</h3>
                  <p className="text-xs text-emerald-400">Class of {lightboxItem.BatchYear}</p>
                </div>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center bg-black">
                <img
                  src={lightboxItem.MediaUrl}
                  alt={lightboxItem.Title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
