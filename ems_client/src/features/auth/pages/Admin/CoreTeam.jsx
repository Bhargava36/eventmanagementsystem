import React, { useEffect, useState } from "react";
import {
  Building2,
  GraduationCap,
  Mail,
  Plus,
  Phone,
  X,
  Users,
} from "lucide-react";

function CoreTeam() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const eventId = admin?.EventId;

  const [coreTeam, setCoreTeam] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    role: "Faculty Convener",
    name: "",
    phone: "",
    email: "",
    department: "",
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
      setLoading(true);
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
    } catch (error) {
      console.error("CORE TEAM ERROR:", error);
      setError(error.message);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const type = formData.role.toLowerCase().includes("faculty")
        ? "faculty"
        : "student";

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
            StudentCoordinators: studentCoordinators,
            FacultyCoordinators: facultyCoordinators,
            Volunteers: volunteers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add core team member"
        );
      }

      setFormData({
        role: "Faculty Convener",
        name: "",
        phone: "",
        email: "",
        department: "",
      });

      setIsModalOpen(false);

      fetchCoreTeam();
    } catch (error) {
      console.error("ADD CORE TEAM ERROR:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading core team...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-5">
        <div className="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center max-w-md w-full">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Unable to load core team
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error}
          </p>

          <button
            onClick={fetchCoreTeam}
            className="mt-5 px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-black dark:text-white">

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
              Contact details of the faculty and student convener.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Add Convener
          </button>

        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {teamStats.map((stat) => {

            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950"
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

              </div>
            );
          })}

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {coreTeam.map((member) => (

            <article
              key={member.Id}
              className="rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950 sm:p-6"
            >

              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-500">
                    {member.Role}
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {member.Name}
                  </h2>

                </div>

                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">

                  {member.Type === "faculty" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <GraduationCap className="h-5 w-5" />
                  )}

                </div>

              </div>

              <div className="mt-5 space-y-3 text-sm">

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">

                  <Phone className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />

                  <span>
                    {member.Phone}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">

                  <Mail className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />

                  <span className="break-all">
                    {member.Email}
                  </span>

                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">

                  {member.Type === "faculty" ? (
                    <Building2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  ) : (
                    <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  )}

                  <span>
                    Department: {member.Department}
                  </span>

                </div>

              </div>

            </article>

          ))}

        </div>

        {coreTeam.length === 0 && (
          <div className="mt-5 rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-950">

            <Users className="mx-auto h-10 w-10 text-gray-400" />

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No core team members added yet.
            </p>

          </div>
        )}

      </div>

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-emerald-700/20 bg-white shadow-xl dark:border-emerald-500/30 dark:bg-gray-950">

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">

              <div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Convener
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the convener&apos;s contact details.
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

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >

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

              <div className="grid gap-4 sm:grid-cols-3">

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student Coordinators
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={studentCoordinators}
                    onChange={(e) =>
                      setStudentCoordinators(e.target.value)
                    }
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
                    onChange={(e) =>
                      setFacultyCoordinators(e.target.value)
                    }
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
                    onChange={(e) =>
                      setVolunteers(e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />

                </div>

              </div>

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
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Add Convener
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default CoreTeam;