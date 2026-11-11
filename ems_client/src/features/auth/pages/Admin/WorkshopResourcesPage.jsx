import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  FileText,
  FolderGit2,
  Video,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  BookOpen,
  X
} from 'lucide-react';
export default function WorkshopResourcesPage() {
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    Title: '',
    ResourceType: 'Document / PDF',
    ResourceUrl: '',
    Description: ''
  });
  const fetchResources = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/workshops/${eventId}/resources`);
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load workshop resources');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchResources();
  }, [eventId]);
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesType = activeType === 'all' || r.ResourceType === activeType;
      const matchesSearch =
        (r.Title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.Description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [resources, activeType, searchQuery]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Title.trim() || !formData.ResourceUrl.trim()) {
      toast.error('Title and Resource URL are required');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/workshops/${eventId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create resource');
      }
      toast.success('Resource added successfully');
      setIsModalOpen(false);
      setFormData({ Title: '', ResourceType: 'Document / PDF', ResourceUrl: '', Description: '' });
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/workshops/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Resource removed');
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete resource');
    }
  };
  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };
  const getResourceIcon = (type) => {
    if (type?.includes('Code') || type?.includes('Repo')) return FolderGit2;
    if (type?.includes('Video') || type?.includes('Recording')) return Video;
    if (type?.includes('Slides') || type?.includes('PPT')) return BookOpen;
    return FileText;
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Learning Materials & Files
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Workshop Resource Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Distribute presentation slides, starter codebases, GitHub repositories, lecture recordings, and reference cheat sheets directly to registered attendees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchResources}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh resources"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {['all', 'Document / PDF', 'Slides / PPT', 'Code / GitHub Repo', 'Video Recording', 'Reference Link'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeType === type
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
              }`}
            >
              {type === 'all' ? 'All Materials' : type}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-black border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No learning materials added yet</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
            Share GitHub repositories, lab templates, PDFs, or lecture slides with your participants.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res, idx) => {
            const Icon = getResourceIcon(res.ResourceType);
            const isCopied = copiedId === res.Id;
            return (
              <motion.div
                key={res.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Icon className="w-3 h-3" />
                      {res.ResourceType}
                    </span>
                    <button
                      onClick={() => handleDelete(res.Id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                    {res.Title}
                  </h3>
                  {res.Description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                      {res.Description}
                    </p>
                  )}
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopy(res.ResourceUrl, res.Id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    title="Copy Link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={res.ResourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span>Open Material</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Add Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Learning Resource</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    placeholder="e.g. Day 1 Lecture Slides & Code Repo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={formData.ResourceType}
                    onChange={(e) => setFormData({ ...formData, ResourceType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Document / PDF">Document / PDF</option>
                    <option value="Slides / PPT">Slides / PPT</option>
                    <option value="Code / GitHub Repo">Code / GitHub Repo</option>
                    <option value="Video Recording">Video Recording</option>
                    <option value="Reference Link">Reference Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Resource URL / File Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.ResourceUrl}
                    onChange={(e) => setFormData({ ...formData, ResourceUrl: e.target.value })}
                    placeholder="https://github.com/... or https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Notes / Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    placeholder="Instructions on how attendees should use this file..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Add Material'}
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
