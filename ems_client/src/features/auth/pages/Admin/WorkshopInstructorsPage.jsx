import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  GraduationCap,
  Plus,
  Mail,
  Phone,
  Building,
  UserCheck,
  Edit3,
  Trash2,
  X,
  Upload,
  Camera,
  Search,
  RefreshCw,
  Users,
  Award,
  BookOpen,
  Briefcase
} from 'lucide-react';
const WORKSHOP_ROLES = [
  'Lead Instructor',
  'Co-Instructor',
  'Guest Speaker / Industry Expert',
  'Hands-on Lab Facilitator',
  'Teaching Assistant (TA)',
  'Workshop Coordinator',
  'Technical Support / Lab Admin',
  'Student Volunteer',
  'Custom Role'
];
export default function WorkshopInstructorsPage() {
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
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Lead Instructor',
    isCustomRole: false,
    customRole: '',
    department: '', // Organization / Company / College
    email: '',
    phone: '',
    photo: ''
  });
  const fetchInstructors = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/core_team/event/${eventId}`);
      if (!res.ok) throw new Error('Failed to load instructors');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load workshop instructors');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInstructors();
  }, [eventId]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      const isCustom = value === 'Custom Role';
      setFormData((prev) => ({
        ...prev,
        role: value,
        isCustomRole: isCustom,
        customRole: isCustom ? prev.customRole : ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Lead Instructor',
      isCustomRole: false,
      customRole: '',
      department: '',
      email: '',
      phone: '',
      photo: ''
    });
    setIsModalOpen(true);
  };
  const openEditModal = (member) => {
    setEditingId(member.Id);
    const isPreset = WORKSHOP_ROLES.slice(0, -1).includes(member.Role);
    setFormData({
      name: member.Name || '',
      role: isPreset ? member.Role : 'Custom Role',
      isCustomRole: !isPreset,
      customRole: isPreset ? '' : (member.Role || ''),
      department: member.Department || '',
      email: member.Email || '',
      phone: member.Phone || '',
      photo: member.Photo || ''
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this instructor/team member from the workshop?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/core_team/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete member');
      toast.success('Instructor removed successfully');
      fetchInstructors();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not delete');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter the instructor or staff name');
      return;
    }
    const finalRole = formData.isCustomRole
      ? (formData.customRole?.trim() || 'Instructor')
      : formData.role;
    const payload = {
      EventId: eventId,
      Role: finalRole,
      Name: formData.name.trim(),
      Phone: formData.phone.trim(),
      Email: formData.email.trim(),
      Department: formData.department.trim(),
      Type: finalRole.toLowerCase().includes('volunteer') || finalRole.toLowerCase().includes('assistant') ? 'student' : 'faculty',
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
        toast.success('Instructor details updated');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/core_team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Instructor added to workshop');
      }
      setIsModalOpen(false);
      fetchInstructors();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };
  // Filtered list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const roleLower = (m.Role || '').toLowerCase();
      const matchesFilter =
        roleFilter === 'all' ||
        (roleFilter === 'instructors' && (roleLower.includes('instructor') || roleLower.includes('speaker') || roleLower.includes('trainer'))) ||
        (roleFilter === 'assistants' && (roleLower.includes('assistant') || roleLower.includes('ta') || roleLower.includes('facilitator'))) ||
        (roleFilter === 'coordinators' && (roleLower.includes('coordinator') || roleLower.includes('admin') || roleLower.includes('support') || roleLower.includes('volunteer')));
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (m.Name || '').toLowerCase().includes(q) ||
        (m.Role || '').toLowerCase().includes(q) ||
        (m.Department || '').toLowerCase().includes(q) ||
        (m.Email || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [members, roleFilter, searchQuery]);
  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const trainers = members.filter((m) => {
      const r = (m.Role || '').toLowerCase();
      return r.includes('instructor') || r.includes('speaker') || r.includes('trainer');
    }).length;
    const assistants = members.filter((m) => {
      const r = (m.Role || '').toLowerCase();
      return r.includes('assistant') || r.includes('ta') || r.includes('facilitator');
    }).length;
    const coordinators = total - trainers - assistants;
    return { total, trainers, assistants, coordinators: Math.max(0, coordinators) };
  }, [members]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Faculty, Trainers & Lab Mentors
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Instructors & Workshop Team
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Add lead trainers, industry experts, lab assistants, and coordinators delivering this workshop.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInstructors}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Instructor / Staff</span>
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Total Team</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Lead Trainers</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.trainers}</p>
        </div>
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider">Lab TAs / Facilitators</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.assistants}</p>
        </div>
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Coordinators & Staff</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.coordinators}</p>
        </div>
      </div>
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: `All Members (${members.length})` },
            { id: 'instructors', label: `Instructors & Speakers (${stats.trainers})` },
            { id: 'assistants', label: `Lab Facilitators & TAs (${stats.assistants})` },
            { id: 'coordinators', label: `Coordinators (${stats.coordinators})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      {/* Instructors Grid */}
      {loading ? (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading workshop instructors...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 sm:p-16 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No instructors added yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Add lead trainers, teaching assistants, or industry experts conducting hands-on sessions for your workshop.
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Instructor</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.Id}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:border-emerald-500/40 transition group relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    {member.Photo ? (
                      <img
                        src={member.Photo}
                        alt={member.Name}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/20">
                        {member.Name?.charAt(0) || 'I'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {member.Name}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {member.Role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                      title="Edit details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.Id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-zinc-800/80 pt-3">
                  {member.Department && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{member.Department}</span>
                    </div>
                  )}
                  {member.Email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${member.Email}`} className="hover:text-emerald-600 truncate transition">
                        {member.Email}
                      </a>
                    </div>
                  )}
                  {member.Phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`tel:${member.Phone}`} className="hover:text-emerald-600 truncate transition">
                        {member.Phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingId ? 'Edit Instructor Details' : 'Add Workshop Instructor'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Specify the trainer's role, company/institution, and contact info.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-2 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.photo ? 'Change Photo' : 'Upload Headshot'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, photo: '' }))}
                        className="block mt-1 text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Instructor / Trainer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar or Sarah Jenkins"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Workshop Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    {WORKSHOP_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Custom Role Input */}
                {formData.isCustomRole && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Specify Custom Role Title *
                    </label>
                    <input
                      type="text"
                      name="customRole"
                      required
                      placeholder="e.g. Senior Cloud Architect & Lead Mentor"
                      value={formData.customRole}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
                {/* Organization / Company / University */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Organization / Company / University
                  </label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Google Cloud, Microsoft, or Dept. of CSE"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="trainer@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update Instructor' : 'Add Instructor'}
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
