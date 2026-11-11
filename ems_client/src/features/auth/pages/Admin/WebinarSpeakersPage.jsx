import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Mic,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Building,
  RefreshCw,
  Search,
  X,
  UserCheck,
  Video,
  Presentation,
  ShieldCheck,
  Award,
  Globe
} from 'lucide-react';
const WEBINAR_ROLES = [
  'Keynote Speaker',
  'Guest Speaker / Industry Leader',
  'Panel Discussion Member',
  'Webinar Moderator / Host',
  'Technical Co-Host / Broadcaster',
  'Q&A Coordinator',
  'Distinguished Dignitary',
  'Custom Role'
];
export default function WebinarSpeakersPage() {
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Keynote Speaker',
    isCustomRole: false,
    customRole: '',
    department: '', // Organization / Company
    email: '',
    phone: '',
    photo: ''
  });
  const fetchSpeakers = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/core_team/event/${eventId}`);
      if (!res.ok) throw new Error('Failed to load webinar speakers');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load keynote speakers');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSpeakers();
  }, [eventId]);
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Keynote Speaker',
      isCustomRole: false,
      customRole: '',
      department: '',
      email: '',
      phone: '',
      photo: ''
    });
    setIsModalOpen(true);
  };
  const handleOpenEdit = (member) => {
    setEditingId(member.Id);
    const isPreset = WEBINAR_ROLES.slice(0, -1).includes(member.Role);
    setFormData({
      name: member.Name || '',
      role: isPreset ? member.Role : 'Custom Role',
      isCustomRole: !isPreset,
      customRole: !isPreset ? member.Role : '',
      department: member.Department || '',
      email: member.Email || '',
      phone: member.Phone || '',
      photo: member.Photo || ''
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this speaker from the webinar panel?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/core_team/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Speaker removed');
      fetchSpeakers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove speaker');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Speaker name is required');
      return;
    }
    const finalRole = formData.isCustomRole
      ? (formData.customRole.trim() || 'Keynote Speaker')
      : formData.role;
    const payload = {
      EventId: eventId,
      Name: formData.name.trim(),
      Role: finalRole,
      Phone: formData.phone.trim(),
      Email: formData.email.trim(),
      Department: formData.department.trim(),
      Type: 'faculty',
      Photo: formData.photo || null
    };
    try {
      setSubmitting(true);
      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/api/core_team/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Speaker profile updated');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/core_team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Speaker added to webinar panel');
      }
      setIsModalOpen(false);
      fetchSpeakers();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const roleLower = (m.Role || '').toLowerCase();
      const matchesFilter =
        roleFilter === 'all' ||
        (roleFilter === 'speakers' && (roleLower.includes('speaker') || roleLower.includes('keynote'))) ||
        (roleFilter === 'panel' && roleLower.includes('panel')) ||
        (roleFilter === 'hosts' && (roleLower.includes('host') || roleLower.includes('moderator') || roleLower.includes('coordinator')));
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (m.Name || '').toLowerCase().includes(q) ||
        (m.Role || '').toLowerCase().includes(q) ||
        (m.Department || '').toLowerCase().includes(q) ||
        (m.Email || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [members, roleFilter, searchQuery]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5" />
            Distinguished Panel & Keynotes
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Keynote Speakers & Panelists
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Highlight distinguished thought leaders, guest dignitaries, panel discussion members, and session moderators delivering this webinar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSpeakers}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh speakers"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keynote Speaker</span>
          </button>
        </div>
      </div>
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search speakers or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 self-stretch sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: `All (${members.length})` },
            { id: 'speakers', label: 'Keynote Speakers' },
            { id: 'panel', label: 'Panelists' },
            { id: 'hosts', label: 'Hosts & Moderators' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
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
          <p className="text-sm">Loading webinar speakers...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
            <Mic className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Speakers Added Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Add your keynote speakers, panel discussion members, or guest dignitaries to feature them on the webinar public page.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Speaker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.Id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0">
                    {member.Photo ? (
                      <img src={member.Photo} alt={member.Name} className="w-full h-full object-cover" />
                    ) : (
                      <Mic className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    {member.Role}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {member.Name}
                  </h3>
                  {member.Department && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.Department}</span>
                    </p>
                  )}
                  {member.Email && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.Email}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Edit speaker"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(member.Id)}
                  className="p-2 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                  title="Remove speaker"
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
                    <Mic className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingId ? 'Edit Speaker Profile' : 'Add Keynote Speaker'}
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
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Webinar Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        role: val,
                        isCustomRole: val === 'Custom Role'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {WEBINAR_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {formData.isCustomRole && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Specify Custom Role *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Guest / Industry Expert"
                      value={formData.customRole}
                      onChange={(e) => setFormData({ ...formData, customRole: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Organization / Company / Affiliation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OpenAI / Google Research"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="speaker@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Profile Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... avatar image"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
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
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update Speaker' : 'Add to Panel'}
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
