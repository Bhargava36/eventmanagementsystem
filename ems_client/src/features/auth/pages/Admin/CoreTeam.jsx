import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Mail,
  Plus,
  Phone,
  X,
  Users,
} from 'lucide-react';

const teamStats = [
  { label: 'No. of Student Coordinators', value: '12', icon: GraduationCap },
  { label: 'No. of Faculty Coordinators', value: '8', icon: Building2 },
  { label: 'No. of Volunteers', value: '45', icon: Users },
];

const initialCoreTeam = [
  {
    role: 'Faculty Convener',
    name: 'Dr. Doctor',
    phone: '+91 98765 43210',
    email: 'faculty.convener@hackhub.com',
    department: 'CSE',
    type: 'faculty',
  },
  {
    role: 'Faculty Co-Convener',
    name: 'Dr. Doctor',
    phone: '+91 98765 43211',
    email: 'faculty.coconvener@hackhub.com',
    department: 'IT',
    type: 'faculty',
  },
  {
    role: 'Student Convener',
    name: 'Dr. Doctor',
    phone: '+91 98765 43212',
    email: 'student.convener@hackhub.com',
    department: 'CSE',
    type: 'student',
  },
  {
    role: 'Student Co-Convener',
    name: 'Dr. Doctor',
    phone: '+91 98765 43213',
    email: 'student.coconvener@hackhub.com',
    department: 'IT',
    type: 'student',
  },
];

function CoreTeam() {
  const coreTeam = initialCoreTeam;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: 'Faculty Convener',
    name: '',
    phone: '',
    email: '',
    department: '',
  });

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormData({
      role: 'Faculty Convener',
      name: '',
      phone: '',
      email: '',
      department: '',
    });
    setIsModalOpen(false);
  }

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
              key={member.role}
              className="rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-500">
                    {member.role}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h2>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                  {member.type === 'faculty' ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <GraduationCap className="h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  <span className="break-all">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  {member.type === 'faculty' ? (
                    <Building2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  ) : (
                    <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-500" />
                  )}
                  <span>
                    {member.year
                      ? `Year: ${member.year}`
                      : `Department: ${member.department}`}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
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
                aria-label="Close modal"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  id="role"
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
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    id="phone"
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
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  placeholder="CSE, IT, ECE"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                />
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
