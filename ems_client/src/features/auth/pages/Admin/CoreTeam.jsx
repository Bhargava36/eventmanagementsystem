import React, { useEffect, useState } from "react";
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
  Upload
} from "lucide-react";

function CoreTeam() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const eventId = admin?.EventId;

  const [coreTeam, setCoreTeam] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    role: "Faculty Convener",
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
        `http://localhost:3000/api/core_team/event/${eventId}`
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
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setFormData({
      role: member.Role || "Faculty Convener",
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
        `http://localhost:3000/api/core_team/${memberId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete member");
      }

      setCoreTeam((prev) => prev.filter((m) => m.Id !== memberId));
    } catch (err) {
      console.error("DELETE CORE TEAM ERROR:", err);
      alert(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const type = formData.role.toLowerCase().includes("faculty")
        ? "faculty"
        : "student";

      if (editingMemberId) {
        const response = await fetch(
          `http://localhost:3000/api/core_team/${editingMemberId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Role: formData.role,
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
      } else {
        const response = await fetch(
          "http://localhost:3000/api/core_team",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              EventId: eventId,
              Role: formData.role,
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
      }

      setIsModalOpen(false);
      fetchCoreTeam();
    } catch (err) {
      console.error("SUBMIT CORE TEAM ERROR:", err);
      alert(err.message);
    }
  };

  const teamStats = [
    {
      label: "No. of Student Coordinators",
      value: studentCoordinators,
      icon: GraduationCap,
    },
    {
      label: "No. of Faculty Coordinators",
      value: facultyCoordinators,
      icon: Building2,
    },
    {
      label: "No. of Volunteers",
      value: volunteers,
      icon: Users,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-black dark:text-white"
    >
      <div className="px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-500">
              Event Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Core Team
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              Contact details, photos and management of the faculty and student conveners.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Add Convener
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {teamStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2].map((n) => (
              <motion.div
                key={n}
                animate={{ opacity: [0.35, 0.8, 0.35] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="h-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/60 p-6"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {coreTeam.map((member, idx) => (
              <motion.article
                key={member.Id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm transition hover:border-emerald-500/40 dark:border-emerald-500/30 dark:bg-gray-950 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
                  <div className="flex items-center gap-3.5">
                    {member.Photo ? (
                      <img
                        src={member.Photo}
                        alt={member.Name}
                        className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-emerald-500/40 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-lg border border-emerald-500/30">
                        {member.Name ? member.Name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {member.Role}
                      </p>

                      <h2 className="mt-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {member.Name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      title="Edit member"
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(member.Id)}
                      title="Delete member"
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                    <span>{member.Phone}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                    <span className="break-all">{member.Email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    {member.Type === "faculty" ? (
                      <Building2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                    ) : (
                      <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                    )}
                    <span>Department: {member.Department}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {!loading && coreTeam.length === 0 && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-950">
            <Users className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No core team members added yet.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 transition"
            >
              <Plus className="h-4 w-4" />
              Add First Convener
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-700/20 bg-white shadow-xl dark:border-emerald-500/30 dark:bg-gray-950"
            >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingMemberId ? "Edit Convener" : "Add Convener"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingMemberId
                    ? "Update contact details and photo."
                    : "Enter the convener's contact details and photo."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/30">
                {formData.photo ? (
                  <div className="relative">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600 transition"
                      title="Remove Photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center cursor-pointer group">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition">
                      <Camera className="h-8 w-8" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                      Upload Member Photo
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG or WEBP
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                >
                  <option>Faculty Convener</option>
                  <option>Faculty Co-Convener</option>
                  <option>Student Convener</option>
                  <option>Student Co-Convener</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Dr. John Doe"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 9876543210"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="convener@college.edu"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <input
                  name="department"
                  placeholder="CSE, IT, ECE"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                />
              </div>

              {!editingMemberId && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Student Coordinators
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={studentCoordinators}
                      onChange={(e) => setStudentCoordinators(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Faculty Coordinators
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={facultyCoordinators}
                      onChange={(e) => setFacultyCoordinators(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Volunteers
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={volunteers}
                      onChange={(e) => setVolunteers(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600"
                >
                  {editingMemberId ? "Update Member" : "Add Convener"}
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