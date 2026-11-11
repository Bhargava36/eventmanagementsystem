import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import Pagination from '../../../../components/Molecules/Pagination';
import {
  FileText,
  Search,
  Filter,
  ExternalLink,
  FolderGit2,
  Globe,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Loader2,
  Building2,
  Calendar,
  Layers,
  X,
  MapPin,
  Check,
  Award
} from 'lucide-react';
const STATUS_FILTERS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'FINALIZED'];
export default function ProjectExpoSubmissionsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { eventId: urlEventId } = useParams();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = urlEventId || admin?.EventId || 34;
  const [submissions, setSubmissions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  // Modal state for full project review
  const [viewingProject, setViewingProject] = useState(null);
  // Review action modal state
  const [actionTarget, setActionTarget] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [subRes, domRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/domains`)
      ]);
      const subData = await subRes.json();
      const domData = await domRes.json();
      if (subData.success && Array.isArray(subData.submissions)) {
        setSubmissions(subData.submissions);
      }
      if (domData.success && Array.isArray(domData.domains)) {
        setDomains(domData.domains);
      }
    } catch (err) {
      toast.error('Failed to load project submissions');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDomain, selectedStatus, pageSize]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const approved = submissions.filter((s) => s.Status === 'APPROVED' || s.Status === 'FINALIZED').length;
    const underReview = submissions.filter((s) => s.Status === 'UNDER_REVIEW' || s.Status === 'SUBMITTED').length;
    const changesRequested = submissions.filter((s) => s.Status === 'CHANGES_REQUESTED').length;
    return { total, approved, underReview, changesRequested };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchSearch =
        !search ||
        (sub.ProjectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (sub.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (sub.LeaderName || '').toLowerCase().includes(search.toLowerCase()) ||
        (sub.LeaderEmail || '').toLowerCase().includes(search.toLowerCase());
      const matchDomain =
        selectedDomain === 'ALL' ||
        String(sub.DomainId) === String(selectedDomain) ||
        (sub.DomainName || '') === selectedDomain;
      const matchStatus = selectedStatus === 'ALL' || sub.Status === selectedStatus;
      return matchSearch && matchDomain && matchStatus;
    });
  }, [submissions, search, selectedDomain, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);
  const handleOpenReviewModal = (submission, actionType) => {
    setActionTarget({
      submissionId: submission.Id,
      projectTitle: submission.ProjectTitle,
      teamName: submission.TeamName,
      actionType
    });
    setFeedbackInput(submission.AdminFeedback || '');
  };
  const handleConfirmReview = async () => {
    if (!actionTarget) return;
    try {
      setSubmittingReview(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/submissions/${actionTarget.submissionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionTarget.actionType,
          adminFeedback: feedbackInput
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Review submission failed');
      }
      toast.success(`Project marked as ${actionTarget.actionType}`);
      setActionTarget(null);
      setFeedbackInput('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'FINALIZED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Correction Required
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            Under Review
          </span>
        );
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading project submissions...</span>
        </div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Project Submissions & Abstract Review
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm sm:text-base mt-1">
            Review prototype dossiers, verify technical architecture decks, and grant stall approvals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/admin/expo/booths`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition shadow-sm cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>View Stalls Matrix</span>
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── STATS TILES ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Approved for Exhibition</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.approved}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Under Technical Review</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{stats.underReview}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Corrections Requested</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{stats.changesRequested}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
        {/* ── SEARCH & FILTERS ── */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project title, team name, leader, or technologies..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Domains ({domains.length})</option>
              {domains.map((dom) => (
                <option key={dom.Id || dom.DomainName} value={dom.Id}>
                  {dom.DomainName}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 font-medium"
            >
              {STATUS_FILTERS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* ── SUBMISSIONS LIST ── */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-2xl p-12 sm:p-16 border border-gray-200 dark:border-zinc-800 text-center">
            <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Project Submissions Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
              No project records match the active filter criteria or participants have not submitted their projects yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSubmissions.map((sub) => (
                <div
                  key={sub.Id}
                  className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-gray-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 truncate">
                        {sub.DomainName || 'General Engineering'}
                      </span>
                      {getStatusBadge(sub.Status)}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 font-heading">
                      {sub.ProjectTitle}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                      {sub.Abstract || sub.ProblemStatement || 'No abstract preview provided.'}
                    </p>
                    {/* Team & Booth Metadata Box */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800 space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Team:</span>
                        <strong className="text-gray-900 dark:text-white font-medium truncate max-w-[160px]">
                          {sub.TeamName}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Lead:</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                          {sub.LeaderName}
                        </span>
                      </div>
                      {sub.BoothNumber && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-zinc-800">
                          <span className="text-gray-500 dark:text-gray-400">Allocated Stall:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{sub.BoothNumber}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewingProject(sub)}
                      className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Dossier</span>
                    </button>
                    <div className="flex items-center gap-2">
                      {sub.Status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(sub, 'APPROVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {sub.Status !== 'CHANGES_REQUESTED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(sub, 'CHANGES_REQUESTED')}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-100 transition cursor-pointer"
                        >
                          Correct
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSubmissions.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 9, 12, 24]}
                itemName="submissions"
              />
            </div>
          </div>
        )}
        {/* ── PROJECT DETAILS DRAWER / MODAL ── */}
        <AnimatePresence>
          {viewingProject && (
            <div key="project-details-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingProject(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-2xl bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6"
              >
                <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                      {viewingProject.DomainName || 'General Engineering'}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                      {viewingProject.ProjectTitle}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Submitted by {viewingProject.TeamName} (Leader: {viewingProject.LeaderName})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingProject(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-5 text-sm">
                  {viewingProject.ProblemStatement && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Problem Statement
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/60 dark:bg-zinc-900/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        {viewingProject.ProblemStatement}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Project Abstract
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/60 dark:bg-zinc-900/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                      {viewingProject.Abstract || 'No abstract provided.'}
                    </p>
                  </div>
                  {viewingProject.ProposedSolution && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Proposed Solution & Prototype
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/60 dark:bg-zinc-900/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        {viewingProject.ProposedSolution}
                      </p>
                    </div>
                  )}
                  {viewingProject.TechnologiesUsed && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Technologies & Hardware Stack
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50/60 dark:bg-zinc-900/40 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs font-mono">
                        {viewingProject.TechnologiesUsed}
                      </p>
                    </div>
                  )}
                  {/* Resource URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {viewingProject.GithubRepoUrl && (
                      <a
                        href={viewingProject.GithubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderGit2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-medium">GitHub Repository</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    )}
                    {viewingProject.LiveDemoUrl && (
                      <a
                        href={viewingProject.LiveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-medium">Live Deployed Demo</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setViewingProject(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Close Dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const proj = viewingProject;
                      setViewingProject(null);
                      handleOpenReviewModal(proj, 'APPROVED');
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm cursor-pointer"
                  >
                    Approve for Exhibition
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* ── REVIEW ACTION MODAL ── */}
        <AnimatePresence>
          {actionTarget && (
            <div key="review-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !submittingReview && setActionTarget(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {actionTarget.actionType === 'APPROVED' ? 'Approve Project' : 'Request Corrections'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {actionTarget.teamName} — "{actionTarget.projectTitle}"
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={submittingReview}
                    onClick={() => setActionTarget(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Committee Review Feedback (Delivered to Team Leader)
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="e.g. Verified technical architecture. Make sure to bring an extension power cable on expo day."
                      className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={submittingReview}
                      onClick={() => setActionTarget(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingReview}
                      onClick={handleConfirmReview}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white transition shadow-sm cursor-pointer flex items-center gap-2 ${
                        actionTarget.actionType === 'APPROVED'
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-amber-600 hover:bg-amber-500'
                      }`}
                    >
                      {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Confirm {actionTarget.actionType === 'APPROVED' ? 'Approval' : 'Request'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
