import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  Download,
  Video,
  BookOpen,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function SeminarResourcesPage() {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [formData, setFormData] = useState({
    Title: '',
    ResourceType: 'Slides',
    ResourceUrl: '',
    Description: ''
  });

  const fetchResources = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/seminars/${eventId}/resources`);
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load seminar resources');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setFormData({ Title: '', ResourceType: 'Slides', ResourceUrl: '', Description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setFormData({
      Title: res.Title || '',
      ResourceType: res.ResourceType || 'Slides',
      ResourceUrl: res.ResourceUrl || '',
      Description: res.Description || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();
    if (!eventId) return;
    if (!formData.Title.trim() || !formData.ResourceUrl.trim()) {
      toast.error('Title and Resource URL are required');
      return;
    }

    try {
      setSaving(true);
      const url = editingResource
        ? `${API_BASE_URL}/api/seminars/resources/${editingResource.Id}`
        : `${API_BASE_URL}/api/seminars/${eventId}/resources`;
      const method = editingResource ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Failed to ${editingResource ? 'update' : 'upload'} resource`);
      toast.success(editingResource ? 'Resource updated successfully' : 'Resource published to delegates');
      setIsModalOpen(false);
      setEditingResource(null);
      setFormData({ Title: '', ResourceType: 'Slides', ResourceUrl: '', Description: '' });
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error(`Could not ${editingResource ? 'update' : 'save'} resource`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource link?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/seminars/resources/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete resource');
      toast.success('Resource deleted');
      fetchResources();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete resource');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Seminar Materials Archive &bull; {resources.length} Files Published
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Conference Proceedings & Presentation Decks
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Upload and distribute speaker presentation slides, proceedings booklets, and recording links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchResources}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh resources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        </div>
      </div>

      {/* Grid of Resources */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 dark:text-zinc-500 text-sm gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Loading proceedings and slides...</span>
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Seminar Materials Uploaded</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Share slide decks, reading materials, or proceedings with your registered delegates.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Material</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.Id}
              className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 transition shadow-sm flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    {res.ResourceType || 'Slides'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                    {new Date(res.CreatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {res.Title}
                </h3>

                {res.Description && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {res.Description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <a
                  href={res.ResourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Open Resource</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(res)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
                    title="Edit Material"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.Id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Upload or Edit Resource */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingResource ? 'Edit Seminar Material' : 'Upload Seminar Material'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {editingResource
                      ? 'Update presentation slides, proceedings URL or description'
                      : 'Share slides, PDF proceedings or recording links with delegates'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveResource} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Resource Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    placeholder="e.g. Keynote Presentation Slides - Generative AI & Ethics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Material Type
                  </label>
                  <select
                    value={formData.ResourceType}
                    onChange={(e) => setFormData({ ...formData, ResourceType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  >
                    <option value="Slides">Presentation Slides (PPT/PDF)</option>
                    <option value="Proceedings">Conference Proceedings / Book</option>
                    <option value="Paper">Research Paper Abstract</option>
                    <option value="Recording">Session Video Recording</option>
                    <option value="Notes">Speaker Notes & Handouts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Resource File / URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.ResourceUrl}
                    onChange={(e) => setFormData({ ...formData, ResourceUrl: e.target.value })}
                    placeholder="https://drive.google.com/... or https://example.com/slides.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    placeholder="Brief description of the material..."
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
                    {saving ? 'Saving...' : editingResource ? 'Save Changes' : 'Publish Material'}
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
