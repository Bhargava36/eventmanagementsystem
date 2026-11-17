import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FolderGit2, Globe, FileText, Send, X } from 'lucide-react';

export default function VirtualProjectSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  submissionForm,
  setSubmissionForm,
  submitting,
  hasExistingSubmission,
  isIndividual
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="my-auto w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-emerald-500/30 p-6 text-slate-900 dark:text-white shadow-2xl space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {hasExistingSubmission ? 'Update Project Deliverables' : 'Submit Project Deliverables'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                GitHub / Git Repository URL
              </label>
              <div className="relative">
                <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://github.com/organization/project-name"
                  value={submissionForm.githubRepoUrl}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, githubRepoUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Live Demo / Hosted Web URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://my-virtual-hackathon-project.vercel.app"
                  value={submissionForm.liveDemoUrl}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, liveDemoUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Presentation Deck / Google Drive URL
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://docs.google.com/presentation/d/..."
                  value={submissionForm.drivePptUrl}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, drivePptUrl: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Tech Stack &amp; Tools Used
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, Express, TailwindCSS, PostgreSQL"
                value={submissionForm.techStack}
                onChange={(e) => setSubmissionForm({ ...submissionForm, techStack: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Solution Overview / Implementation Notes
              </label>
              <textarea
                rows={3}
                placeholder={isIndividual ? "Briefly describe what you built, key architectural decisions, and how it addresses the challenge..." : "Briefly describe what your team built, key architectural decisions, and how it addresses the challenge..."}
                value={submissionForm.description}
                onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>{hasExistingSubmission ? 'Update Deliverables' : 'Submit Project'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

