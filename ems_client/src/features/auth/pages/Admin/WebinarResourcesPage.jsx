import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  FileText,
  Video,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Radio,
  Tv,
  Presentation,
  X
} from 'lucide-react';
const WEBINAR_RESOURCE_TYPES = [
  'Keynote Slide Deck (PDF / PPTX)',
  'Full Session Video Recording',
  'Whitepaper / Research Brief',
  'Code Snippet / Starter Notebook',
  'Delegate Resource Pack',
  'External Reference Link'
];
export default function WebinarResourcesPage() {
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
    ResourceType: 'Keynote Slide Deck (PDF / PPTX)',
    ResourceUrl: '',
    Description: ''
  });
  const fetchResources = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/resources`);
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load webinar resources');
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
      const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create resource');
      }
      toast.success('Resource added to webinar portal');
      setIsModalOpen(false);
      setFormData({
        Title: '',
        ResourceType: 'Keynote Slide Deck (PDF / PPTX)',
        ResourceUrl: '',
        Description: ''
      });
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource from the webinar?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Resource deleted');
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete resource');
    }
  };
  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const getResourceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('video') || t.includes('recording')) return <Video className="w-5 h-5 text-rose-500" />;
    if (t.includes('slide') || t.includes('deck') || t.includes('presentation')) return <Presentation className="w-5 h-5 text-emerald-500" />;
    if (t.includes('whitepaper') || t.includes('pdf') || t.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
    return <LinkIcon className="w-5 h-5 text-amber-500" />;
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Presentation className="w-3.5 h-3.5" />
            Delegate Takeaways & Recordings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Webinar Decks & Session Recordings
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Publish speaker presentation slides, video recordings, whitepapers, and delegate resource packages for your webinar participants.
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
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Resource</span>
          </button>
        </div>
      </div>
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search decks, recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 self-stretch sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: `All (${resources.length})` },
            { id: 'Keynote Slide Deck (PDF / PPTX)', label: 'Slide Decks' },
            { id: 'Full Session Video Recording', label: 'Video Recordings' },
            { id: 'Whitepaper / Research Brief', label: 'Whitepapers' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeType === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">Loading webinar resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
            <Presentation className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Webinar Materials Published Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Share slide decks, recording links, or reference articles for your webinar delegates.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Material</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res, idx) => (
            <motion.div
              key={res.Id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 group-hover:scale-105 transition-transform">
                    {getResourceIcon(res.ResourceType)}
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    {res.ResourceType}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {res.Title}
                  </h3>
                  {res.Description && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 line-clamp-3">
                      {res.Description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <a
                    href={res.ResourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopyLink(res.ResourceUrl, res.Id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 transition cursor-pointer"
                    title="Copy resource URL"
                  >
                    {copiedId === res.Id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(res.Id)}
                  className="p-1.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                  title="Delete resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Publish Webinar Material
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Keynote Presentation Slides (PDF)"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Material Type *
                  </label>
                  <select
                    value={formData.ResourceType}
                    onChange={(e) => setFormData({ ...formData, ResourceType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {WEBINAR_RESOURCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Direct Resource URL / Link *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or youtube.com/watch?v=..."
                    value={formData.ResourceUrl}
                    onChange={(e) => setFormData({ ...formData, ResourceUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Summary / Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of what delegates will learn or reference from this resource..."
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {saving ? 'Publishing...' : 'Publish Material'}
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
