import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  Trash2,
  ExternalLink,
  UploadCloud,
  X,
  Edit2,
  Globe,
} from 'lucide-react';
import useToast from '../../Hooks/useToast';

const TIERS = [
  'Title Sponsor',
  'Presenting Sponsor',
  'Platinum Sponsor',
  'Gold Sponsor',
  'Silver Sponsor',
  'Technology Partner',
  'Ecosystem Partner',
  'Media Partner',
];

export default function EventSponsorsManager({ eventId }) {
  const toast = useToast();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);

  const [form, setForm] = useState({
    Name: '',
    Tier: 'Technology Partner',
    LogoUrl: '',
    WebsiteUrl: '',
    DisplayOrder: 0,
  });

  const fetchSponsors = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sponsors/event/${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setSponsors(data.sponsors || []);
      }
    } catch (err) {
      console.error('Failed to load sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [eventId]);

  const handleOpenAdd = () => {
    setEditingSponsor(null);
    setForm({
      Name: '',
      Tier: 'Technology Partner',
      LogoUrl: '',
      WebsiteUrl: '',
      DisplayOrder: sponsors.length,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sp) => {
    setEditingSponsor(sp);
    setForm({
      Name: sp.Name || '',
      Tier: sp.Tier || 'Technology Partner',
      LogoUrl: sp.LogoUrl || '',
      WebsiteUrl: sp.WebsiteUrl || '',
      DisplayOrder: sp.DisplayOrder || 0,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.fileUrl) {
        setForm((prev) => ({ ...prev, LogoUrl: data.fileUrl }));
        toast.success('Logo uploaded successfully');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Name.trim()) {
      toast.error('Sponsor name is required');
      return;
    }

    try {
      const url = editingSponsor
        ? `${API_BASE_URL}/api/sponsors/${editingSponsor.Id}`
        : `${API_BASE_URL}/api/sponsors`;

      const method = editingSponsor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventId: eventId,
          ...form,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingSponsor ? 'Sponsor updated' : 'Sponsor added');
        setShowModal(false);
        fetchSponsors();
      } else {
        throw new Error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save sponsor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sponsors/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Sponsor deleted');
        fetchSponsors();
      } else {
        toast.error('Failed to delete sponsor');
      }
    } catch (err) {
      toast.error('Error deleting sponsor');
    }
  };

  const modalContent = showModal ? (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Sponsor / Company Name *
              </label>
              <input
                type="text"
                required
                value={form.Name}
                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                placeholder="e.g. Google Cloud, GitHub, Devfolio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Sponsorship Tier
              </label>
              <select
                value={form.Tier}
                onChange={(e) => setForm({ ...form, Tier: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Sponsor Logo
              </label>
              <div className="flex items-center gap-3">
                {form.LogoUrl ? (
                  <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-center">
                    <img
                      src={
                        form.LogoUrl.startsWith('/uploads')
                          ? `${API_BASE_URL}${form.LogoUrl}`
                          : form.LogoUrl
                      }
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, LogoUrl: '' })}
                      className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 text-white cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : null}

                <label className="flex-1 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-zinc-950 transition-colors">
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                value={form.LogoUrl}
                onChange={(e) => setForm({ ...form, LogoUrl: e.target.value })}
                placeholder="Or paste direct logo URL (https://...)"
                className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white text-[11px] outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Website / Career Portal URL (Optional)
              </label>
              <input
                type="text"
                value={form.WebsiteUrl}
                onChange={(e) => setForm({ ...form, WebsiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {editingSponsor ? 'Save Changes' : 'Add Sponsor'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Event Sponsors & Partners
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                {sponsors.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Add companies, brand collaborators, and grant partners supporting this event.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Sponsors List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading sponsors...</div>
      ) : sponsors.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center">
          <Award className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
          <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">No sponsors added yet</p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            Click "Add Sponsor" to display sponsor brands on the public page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sponsors.map((sp) => {
            const logo = sp.LogoUrl?.startsWith('/uploads')
              ? `${API_BASE_URL}${sp.LogoUrl}`
              : sp.LogoUrl;
            return (
              <div
                key={sp.Id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {logo ? (
                      <img src={logo} alt={sp.Name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="font-bold text-sm text-slate-600 dark:text-zinc-400">
                        {sp.Name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-0.5">
                      {sp.Tier}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sp.Name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {sp.WebsiteUrl && (
                    <a
                      href={sp.WebsiteUrl.startsWith('http') ? sp.WebsiteUrl : `https://${sp.WebsiteUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sp.Id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render modal directly into document.body to fix tabs overlap bug */}
      {typeof document !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </div>
  );
}
