import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Mail,
  Plus,
  Phone,
  X,
  Users,
  Edit3,
  Trash2,
  Camera,
  Upload,
  ShieldCheck,
  UserCheck,
  Award
} from "lucide-react";
import useToast from '../../../../Hooks/useToast';

const PRESET_ROLES = [
  "Faculty Convener",
  "Faculty Co-Convener",
  "Faculty Coordinator",
  "Student Convener",
  "Student Co-Convener",
  "Student Coordinator",
  "Lead Organizer",
  "Organizing Secretary",
  "Technical Lead",
  "Design & Branding Lead",
  "Operations & Logistics Lead",
  "Public Relations & Media Lead",
  "Sponsorship & Finance Lead",
  "Hospitality & Food Lead",
  "Mentor & Evaluation Coordinator",
  "Custom Role"
];

function CoreTeam() {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const eventId = admin?.EventId;
  const toast = useToast();

  const [coreTeam, setCoreTeam] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    role: "Faculty Convener",
    isCustomRole: false,
    customRole: "",
    name: "",
    phone: "",
    email: "",
    department: "",
    photo: ""
  });

  const [studentCoordinators, setStudentCoordinators] = useState(0);
  const [facultyCoordinators, setFacultyCoordinators] = useState(0);
  const [volunteers, setVolunteers] = useState(0);

  useEffect(() => {
    if (eventId) {
      fetchCoreTeam();
    } else {
      setLoading(false);
      setError("No event assigned to this admin.");
    }
  }, [eventId]);

  const fetchCoreTeam = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/core_team/event/${eventId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch core team");
      }

      const data = await response.json();
      const members = data.members || [];

      setCoreTeam(members);

      if (members.length > 0) {
        setStudentCoordinators(members[0].StudentCoordinators || 0);
        setFacultyCoordinators(members[0].FacultyCoordinators || 0);
        setVolunteers(members[0].Volunteers || 0);
      }
    } catch (err) {
      console.error("CORE TEAM ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "role") {
      const isCustom = value === "Custom Role";
      setFormData((prev) => ({
        ...prev,
        role: value,
        isCustomRole: isCustom,
        customRole: isCustom ? prev.customRole : ""
      }));
    } else {
      setFormData((currentData) => ({
        ...currentData,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size should be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  const openAddModal = () => {
    setEditingMemberId(null);
    setFormData({
      role: "Faculty Convener",
      isCustomRole: false,
      customRole: "",
      name: "",
      phone: "",
      email: "",
      department: "",
      photo: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMemberId(member.Id);
    const isPreset = PRESET_ROLES.slice(0, -1).includes(member.Role);
    setFormData({
      role: isPreset ? member.Role : "Custom Role",
      isCustomRole: !isPreset,
      customRole: isPreset ? "" : (member.Role || ""),
      name: member.Name || "",
      phone: member.Phone || "",
      email: member.Email || "",
      department: member.Department || "",
      photo: member.Photo || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this core team member?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/core_team/${memberId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete member");
      }

      toast.success("Core team member removed successfully");
      fetchCoreTeam();
    } catch (err) {
      console.error("DELETE CORE TEAM ERROR:", err);
      toast.error(err.message || "Failed to delete member");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const finalRole = formData.isCustomRole
        ? (formData.customRole?.trim() || "Core Member")
        : formData.role;

      const type = finalRole.toLowerCase().includes("faculty")
        ? "faculty"
        : "student";

      if (editingMemberId) {
        const response = await fetch(
          `${API_BASE_URL}/api/core_team/${editingMemberId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Role: finalRole,
              Name: formData.name,
              Phone: formData.phone,
              Email: formData.email,
              Department: formData.department,
              Type: type,
              Photo: formData.photo || null
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update member");
        }
        toast.success("Core team member updated successfully");
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/core_team`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              EventId: eventId,
              Role: finalRole,
              Name: formData.name,
              Phone: formData.phone,
              Email: formData.email,
              Department: formData.department,
              Type: type,
              Photo: formData.photo || null,
              StudentCoordinators: studentCoordinators,
              FacultyCoordinators: facultyCoordinators,
              Volunteers: volunteers,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add core team member");
        }
        toast.success("Core team member added successfully");
      }

      setIsModalOpen(false);
      fetchCoreTeam();
    } catch (err) {
      console.error("SUBMIT CORE TEAM ERROR:", err);
      toast.error(err.message || "Failed to save core team member");
    } finally {
      setSubmitting(false);
    }
  };

  const teamStats = [
    {
      label: "Student Coordinators",
      value: studentCoordinators,
      icon: GraduationCap,
    },
    {
      label: "Faculty Coordinators",
      value: facultyCoordinators,
      icon: Building2,
    },
    {
      label: "Volunteers & Crew",
      value: volunteers,
      icon: Users,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-black dark:text-white"
    >
      <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Organizing Committee
              </span>
              <span className="text-xs font-semibold text-slate-400">• {coreTeam.length} Active Members</span>
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-slate-900 dark:text-white">
              Core Team &amp; Committee Leads
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
              Directory and contact management for conveners, faculty advisors, technical leads, and operational coordinators.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Core Member</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs font-semibold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {teamStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md p-5 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Core Team Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40 p-6 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreTeam.map((member, idx) => (
              <motion.article
                key={member.Id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header with Portrait Photo & Info */}
                  <div className="flex items-start gap-4">
                    {/* Portrait Photo */}
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
                        {member.Photo ? (
                          <img
                            src={member.Photo}
                            alt={member.Name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2 text-slate-700 dark:text-zinc-300">
                            <span className="text-2xl sm:text-3xl font-black">
                              {member.Name ? member.Name.charAt(0).toUpperCase() : "U"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                              No Photo
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status indicator */}
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 truncate max-w-[150px]">
                          <span className="truncate">{member.Role}</span>
                        </span>

                        {/* Edit & Delete Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            title="Edit details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-900 dark:hover:text-emerald-400 transition cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member.Id)}
                            title="Remove member"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 dark:text-white truncate" title={member.Name}>
                        {member.Name}
                      </h2>

                      {member.Department && (
                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                          {member.Type === 'faculty' ? (
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{member.Department}</span>
                        </p>
                      )}

                      {member.Type && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-800/60">
                          {member.Type} Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Contact Buttons */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  {member.Phone ? (
                    <a
                      href={`tel:${member.Phone}`}
                      className="w-full sm:flex-1 flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                      title={member.Phone}
                    >
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Phone className="h-3 w-3" />
                      </div>
                      <span className="truncate font-semibold text-[11px]">{member.Phone}</span>
                    </a>
                  ) : (
                    <div className="w-full sm:flex-1 p-2 text-[11px] text-slate-400 italic">No phone</div>
                  )}

                  {member.Email ? (
                    <a
                      href={`mailto:${member.Email}`}
                      className="w-full sm:flex-1 flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate"
                      title={member.Email}
                    >
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Mail className="h-3 w-3" />
                      </div>
                      <span className="truncate font-semibold text-[11px]">{member.Email}</span>
                    </a>
                  ) : (
                    <div className="w-full sm:flex-1 p-2 text-[11px] text-slate-400 italic">No email</div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && coreTeam.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Core Team Members Added
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Add your faculty conveners, student coordinators, and committee leads to display them on the event site.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Core Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Core Team Member */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 px-6 py-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    {editingMemberId ? "Edit Core Member" : "Add Core Team Member"}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    {editingMemberId
                      ? "Update member role, contact information, and portrait photo."
                      : "Add a new convener, coordinator, or operational lead to your event."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                {/* Photo Upload Area with Live Preview */}
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/70 dark:bg-zinc-900/40">
                  {formData.photo ? (
                    <div className="relative">
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="h-28 w-28 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 rounded-full bg-rose-500 p-1.5 text-white shadow hover:bg-rose-600 transition cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer group">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition shadow-sm">
                        <Camera className="h-8 w-8" />
                      </div>
                      <span className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                        Upload Member Photo
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        JPG, PNG or WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Role Selection (Comprehensive Presets + Custom Role) */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Committee Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
                  >
                    {PRESET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Role Input (shown when Custom Role is selected) */}
                {formData.isCustomRole && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="mb-1 block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Specify Custom Role Title
                    </label>
                    <input
                      name="customRole"
                      value={formData.customRole}
                      onChange={handleInputChange}
                      required={formData.isCustomRole}
                      placeholder="e.g. DevRel Coordinator, Stage Manager, Registration Head"
                      className="w-full rounded-xl border border-emerald-500/50 bg-emerald-50/20 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-600 dark:bg-emerald-950/20 dark:text-white"
                    />
                  </motion.div>
                )}

                {/* Name & Phone */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Dr. Ramesh Kumar / Ananya Rao"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email & Department */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="member@university.edu"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Department / Specialization
                    </label>
                    <input
                      name="department"
                      placeholder="e.g. CSE, Information Technology, ECE"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {!editingMemberId && (
                  <div className="grid gap-3 sm:grid-cols-3 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        Total Student Coordinators
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={studentCoordinators}
                        onChange={(e) => setStudentCoordinators(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        Total Faculty Coordinators
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={facultyCoordinators}
                        onChange={(e) => setFacultyCoordinators(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        Total Volunteers
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={volunteers}
                        onChange={(e) => setVolunteers(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingMemberId ? "Update Member" : "Add Core Member"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CoreTeam;