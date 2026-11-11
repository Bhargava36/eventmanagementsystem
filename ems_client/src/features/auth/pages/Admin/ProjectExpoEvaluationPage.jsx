import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import Pagination from '../../../../components/Molecules/Pagination';
import {
  Layers,
  Users,
  Award,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  Check,
  Building2,
  Mail,
  HelpCircle,
  Download,
  RefreshCw,
  Sparkles,
  Trophy,
  Medal,
  Star,
  FileText,
  Sliders,
  AlertCircle,
  Eye,
  ShieldCheck,
  UserCheck,
  X,
  ExternalLink
} from 'lucide-react';

export default function ProjectExpoEvaluationPage() {
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

  // Active Main Tab: 'ROUNDS' | 'JUDGES' | 'SCORES'
  const [activeTab, setActiveTab] = useState('ROUNDS');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── DATA STATES ──
  const [rounds, setRounds] = useState([]);
  const [judges, setJudges] = useState([]);
  const [resultsData, setResultsData] = useState(null);

  // Expanded rounds accordion
  const [expandedRoundIds, setExpandedRoundIds] = useState({});

  // ── SCORES & LEADERBOARD STATES ──
  // Sub-tabs inside SCORES: 'overall' | `round_${id}`
  const [scoreTab, setScoreTab] = useState('overall');
  const [scoreSearch, setScoreSearch] = useState('');
  const [scoreStatusFilter, setScoreStatusFilter] = useState('all'); // 'all' | 'fully' | 'partially' | 'none'
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [scorePage, setScorePage] = useState(1);
  const [scorePageSize, setScorePageSize] = useState(10);

  // ── JUDGES TAB STATES ──
  const [judgeSearch, setJudgeSearch] = useState('');
  const [judgePage, setJudgePage] = useState(1);
  const [judgePageSize, setJudgePageSize] = useState(9);
  const [copiedJudgeId, setCopiedJudgeId] = useState(null);

  // ── MODALS STATE ──
  // Round Modal
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [roundForm, setRoundForm] = useState({
    RoundName: '',
    Description: '',
    RoundOrder: 1,
    IsOpen: 1,
    AllowScoreEdit: 1
  });
  const [submittingRound, setSubmittingRound] = useState(false);

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeRoundForQuestion, setActiveRoundForQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    QuestionText: '',
    MaxMarks: 10,
    Description: '',
    QuestionOrder: 1
  });
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Judge Modal
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [judgeForm, setJudgeForm] = useState({
    Name: '',
    Email: '',
    Username: '',
    Password: '',
    Role: 'Technical Evaluator & Jury',
    College: '',
    Track: 'Physical'
  });
  const [submittingJudge, setSubmittingJudge] = useState(false);

  // Confirm Delete Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false
  });

  // Seeding Default Rounds state
  const [seedingRounds, setSeedingRounds] = useState(false);

  // ── LOAD ALL DATA ──
  const loadData = useCallback(async (isSilent = false) => {
    if (!eventId) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [roundsRes, judgesRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/rounds?track=Physical`),
        fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}?track=Physical`),
        fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/results?track=Physical`)
      ]);

      if (roundsRes.ok) {
        const rData = await roundsRes.json();
        const roundList = Array.isArray(rData) ? rData : (rData.rounds || rData.data || []);
        setRounds(roundList);
        // Expand all rounds by default initially
        if (Object.keys(expandedRoundIds).length === 0 && roundList.length > 0) {
          const initialExpanded = {};
          roundList.forEach(r => { initialExpanded[r.Id] = true; });
          setExpandedRoundIds(initialExpanded);
        }
      }

      if (judgesRes.ok) {
        const jData = await judgesRes.json();
        const jList = Array.isArray(jData) ? jData : (jData.data?.evaluators || jData.evaluators || []);
        setJudges(jList);
      }

      if (resultsRes.ok) {
        const resData = await resultsRes.json();
        setResultsData(resData.data || resData.results || resData);
      }
    } catch (err) {
      console.error('Failed to load project expo evaluation data:', err);
      toast.error('Failed to load evaluation information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, toast, expandedRoundIds]);

  useEffect(() => {
    loadData();
  }, [eventId]);

  // Compute total possible marks across all rounds
  const totalRoundsMarks = useMemo(() => {
    return (rounds || []).reduce((sum, r) => sum + (Number(r.totalMaxMarks) || 0), 0);
  }, [rounds]);

  // Toggle expanded round
  const toggleRoundExpanded = (roundId) => {
    setExpandedRoundIds(prev => ({
      ...prev,
      [roundId]: !prev[roundId]
    }));
  };

  // ── ROUND MANAGEMENT HANDLERS ──
  const handleOpenAddRound = () => {
    setEditingRound(null);
    setRoundForm({
      RoundName: '',
      Description: '',
      RoundOrder: (rounds?.length || 0) + 1,
      IsOpen: 1,
      AllowScoreEdit: 1
    });
    setIsRoundModalOpen(true);
  };

  const handleOpenEditRound = (round) => {
    setEditingRound(round);
    setRoundForm({
      RoundName: round.RoundName || '',
      Description: round.Description || '',
      RoundOrder: round.RoundOrder || 1,
      IsOpen: round.IsOpen !== undefined ? round.IsOpen : 1,
      AllowScoreEdit: round.AllowScoreEdit !== undefined ? round.AllowScoreEdit : 1
    });
    setIsRoundModalOpen(true);
  };

  const handleSubmitRound = async (e) => {
    e.preventDefault();
    if (!roundForm.RoundName.trim()) {
      toast.error('Round Name is required');
      return;
    }
    try {
      setSubmittingRound(true);
      if (editingRound) {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${editingRound.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            RoundName: roundForm.RoundName.trim(),
            Description: roundForm.Description.trim(),
            RoundOrder: Number(roundForm.RoundOrder),
            IsOpen: roundForm.IsOpen,
            AllowScoreEdit: roundForm.AllowScoreEdit
          })
        });
        if (!res.ok) throw new Error('Failed to update evaluation round');
        toast.success(`Round "${roundForm.RoundName}" updated!`);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            EventId: eventId,
            Track: 'Physical',
            RoundName: roundForm.RoundName.trim(),
            Description: roundForm.Description.trim(),
            RoundOrder: Number(roundForm.RoundOrder)
          })
        });
        if (!res.ok) throw new Error('Failed to create evaluation round');
        toast.success(`Round "${roundForm.RoundName}" created successfully!`);
      }
      setIsRoundModalOpen(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error saving round');
    } finally {
      setSubmittingRound(false);
    }
  };

  const handleToggleRoundPermission = async (round, field) => {
    try {
      const currentVal = round[field] === 1 || round[field] === true;
      const nextVal = currentVal ? 0 : 1;
      const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${round.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: nextVal
        })
      });
      if (!res.ok) throw new Error('Failed to update round permission');
      toast.success(
        field === 'IsOpen'
          ? (nextVal ? `Round opened for evaluation` : `Round closed for scoring`)
          : (nextVal ? `Score editing enabled` : `Score editing locked`)
      );
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error updating round settings');
    }
  };

  const handleDeleteRound = (round) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Evaluation Round?',
      message: `Are you sure you want to delete "${round.RoundName}"? All rubric questions and evaluator scores recorded for this round will be permanently deleted.`,
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${round.Id}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete round');
          toast.success(`Round "${round.RoundName}" deleted`);
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
          loadData(true);
        } catch (err) {
          toast.error(err.message || 'Error deleting round');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // ── SEED RECOMMENDED EXPO ROUNDS ──
  const handleSeedDefaultRounds = async () => {
    try {
      setSeedingRounds(true);
      const defaultRoundsConfig = [
        {
          name: 'Round 1: Stall Showcase & Concept Pitch',
          desc: 'Initial stall presentation, problem definition, novelty, and booth pitch',
          order: 1,
          questions: [
            { text: 'Problem Relevance & Innovation Uniqueness', marks: 10, desc: 'How well does the project address a real problem with original creativity?' },
            { text: 'Stall Presentation & Poster Clarity', marks: 10, desc: 'Visual clarity of diagrams, poster, standee, and stall appeal' },
            { text: 'Elevator Pitch & Technical Explanation', marks: 10, desc: 'Clarity of the team in explaining the architecture and mechanics' }
          ]
        },
        {
          name: 'Round 2: Working Prototype & Technical Rigor',
          desc: 'Live functional hardware / software demonstration, code quality, and engineering reliability',
          order: 2,
          questions: [
            { text: 'Live Working Prototype / Demo Execution', marks: 15, desc: 'Degree of prototype completeness, live response, and stability under testing' },
            { text: 'Architecture, Schematics & Engineering Rigor', marks: 15, desc: 'Quality of circuit diagrams, software design patterns, and hardware design' },
            { text: 'Technology Stack & Code / Build Quality', marks: 10, desc: 'Appropriateness of frameworks, sensor calibration, and code maintainability' }
          ]
        },
        {
          name: 'Round 3: Grand Jury Q&A & Commercial Viability',
          desc: 'Final panel review, market readiness, scalability, and defense against jury questions',
          order: 3,
          questions: [
            { text: 'Business Model, Cost & Commercial Feasibility', marks: 10, desc: 'Manufacturing cost estimation, target demographic, and go-to-market plan' },
            { text: 'Scalability & Real-World Societal Impact', marks: 10, desc: 'Potential for real deployment and positive industrial or social impact' },
            { text: 'Defense Against Jury Technical Q&A', marks: 10, desc: 'Accuracy and depth of answers during rapid technical questions by the jury' }
          ]
        }
      ];

      for (const rCfg of defaultRoundsConfig) {
        const rRes = await fetch(`${API_BASE_URL}/api/evaluators/rounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            EventId: eventId,
            Track: 'Physical',
            RoundName: rCfg.name,
            Description: rCfg.desc,
            RoundOrder: rCfg.order
          })
        });
        const rJson = await rRes.json();
        const roundId = rJson.data?.Id || rJson.Id;

        if (roundId && rCfg.questions) {
          for (let i = 0; i < rCfg.questions.length; i++) {
            const q = rCfg.questions[i];
            await fetch(`${API_BASE_URL}/api/evaluators/rounds/${roundId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                QuestionText: q.text,
                MaxMarks: q.marks,
                Description: q.desc,
                QuestionOrder: i + 1
              })
            });
          }
        }
      }
      toast.success('3 Recommended Expo evaluation rounds and rubrics seeded successfully!');
      loadData(true);
    } catch (err) {
      toast.error('Error seeding recommended rounds');
    } finally {
      setSeedingRounds(false);
    }
  };

  // ── QUESTION MANAGEMENT HANDLERS ──
  const handleOpenAddQuestion = (round) => {
    setActiveRoundForQuestion(round);
    setEditingQuestion(null);
    setQuestionForm({
      QuestionText: '',
      MaxMarks: 10,
      Description: '',
      QuestionOrder: (round.questions?.length || 0) + 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (round, question) => {
    setActiveRoundForQuestion(round);
    setEditingQuestion(question);
    setQuestionForm({
      QuestionText: question.QuestionText || '',
      MaxMarks: question.MaxMarks || 10,
      Description: question.Description || '',
      QuestionOrder: question.QuestionOrder || 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.QuestionText.trim()) {
      toast.error('Question rubric text is required');
      return;
    }
    try {
      setSubmittingQuestion(true);
      if (editingQuestion) {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/questions/${editingQuestion.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            QuestionText: questionForm.QuestionText.trim(),
            MaxMarks: Number(questionForm.MaxMarks),
            Description: questionForm.Description.trim(),
            QuestionOrder: Number(questionForm.QuestionOrder)
          })
        });
        if (!res.ok) throw new Error('Failed to update question');
        toast.success('Evaluation rubric question updated!');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${activeRoundForQuestion.Id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            QuestionText: questionForm.QuestionText.trim(),
            MaxMarks: Number(questionForm.MaxMarks),
            Description: questionForm.Description.trim(),
            QuestionOrder: Number(questionForm.QuestionOrder)
          })
        });
        if (!res.ok) throw new Error('Failed to add question');
        toast.success('Rubric question added to round!');
      }
      setIsQuestionModalOpen(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error saving question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = (question) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Evaluation Question?',
      message: `Are you sure you want to delete "${question.QuestionText}" (${question.MaxMarks} Marks)?`,
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await fetch(`${API_BASE_URL}/api/evaluators/questions/${question.Id}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete question');
          toast.success('Question deleted from round');
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
          loadData(true);
        } catch (err) {
          toast.error(err.message || 'Error deleting question');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  // ── JUDGES MANAGEMENT HANDLERS ──
  const handleOpenAddJudge = () => {
    const randomPwd = 'Jury@' + Math.floor(1000 + Math.random() * 9000);
    setEditingJudge(null);
    setJudgeForm({
      Name: '',
      Email: '',
      Username: '',
      Password: randomPwd,
      Role: 'Technical Evaluator & Jury',
      College: admin?.College || 'Innovation Jury Panel',
      Track: 'Physical'
    });
    setIsJudgeModalOpen(true);
  };

  const handleOpenEditJudge = (judge) => {
    setEditingJudge(judge);
    setJudgeForm({
      Name: judge.Name || '',
      Email: judge.Email || '',
      Username: judge.Username || '',
      Password: '',
      Role: judge.Role || judge.EventRole || 'Technical Evaluator & Jury',
      College: judge.College || '',
      Track: judge.Track || 'Physical'
    });
    setIsJudgeModalOpen(true);
  };

  const handleSubmitJudge = async (e) => {
    e.preventDefault();
    if (!judgeForm.Name.trim() || !judgeForm.Email.trim()) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      setSubmittingJudge(true);
      if (editingJudge) {
        const payload = {
          Name: judgeForm.Name.trim(),
          Email: judgeForm.Email.trim(),
          Username: judgeForm.Username.trim() || judgeForm.Email.trim(),
          Role: judgeForm.Role,
          EventRole: judgeForm.Role,
          College: judgeForm.College.trim(),
          Track: 'Physical'
        };
        if (judgeForm.Password) {
          payload.Password = judgeForm.Password;
        }
        const res = await fetch(`${API_BASE_URL}/api/evaluators/${editingJudge.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update jury profile');
        toast.success(`Jury member "${judgeForm.Name}" updated!`);
      } else {
        const generatedUser = judgeForm.Username.trim() || judgeForm.Email.split('@')[0] + `_jury`;
        const res = await fetch(`${API_BASE_URL}/api/evaluators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            EventId: eventId,
            Name: judgeForm.Name.trim(),
            Email: judgeForm.Email.trim(),
            Username: generatedUser,
            Password: judgeForm.Password || 'Jury@2026',
            PlainTextPassword: judgeForm.Password || 'Jury@2026',
            Track: 'Physical',
            College: judgeForm.College.trim() || 'Innovation Panel',
            Role: judgeForm.Role,
            EventRole: judgeForm.Role
          })
        });
        if (!res.ok) throw new Error('Failed to onboard jury member');
        toast.success(`Jury member "${judgeForm.Name}" onboarded!`);
      }
      setIsJudgeModalOpen(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error saving jury member');
    } finally {
      setSubmittingJudge(false);
    }
  };

  const handleDeleteJudge = (judge) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Jury Member?',
      message: `Are you sure you want to remove ${judge.Name}? Their account and scoring permissions will be revoked.`,
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await fetch(`${API_BASE_URL}/api/evaluators/${judge.Id}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to remove judge');
          toast.success(`Jury member ${judge.Name} removed`);
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false });
          loadData(true);
        } catch (err) {
          toast.error(err.message || 'Error removing judge');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleCopyCredentials = (judge) => {
    const credText = `Project Expo Evaluator Credentials:
Login Portal: ${window.location.origin}/evaluator/login
Username: ${judge.Username}
Password: ${judge.PlainTextPassword || 'Password set during creation'}
Track: Physical Expo Jury`;
    navigator.clipboard.writeText(credText);
    setCopiedJudgeId(judge.Id);
    toast.success(`Credentials copied for ${judge.Name}!`);
    setTimeout(() => setCopiedJudgeId(null), 2500);
  };

  // Filtered & Paginated Judges
  const filteredJudges = useMemo(() => {
    return (judges || []).filter(j => {
      if (!judgeSearch.trim()) return true;
      const q = judgeSearch.toLowerCase();
      return (
        (j.Name || '').toLowerCase().includes(q) ||
        (j.Email || '').toLowerCase().includes(q) ||
        (j.Role || '').toLowerCase().includes(q) ||
        (j.College || '').toLowerCase().includes(q)
      );
    });
  }, [judges, judgeSearch]);

  const totalJudgePages = Math.max(1, Math.ceil(filteredJudges.length / judgePageSize));
  const paginatedJudges = useMemo(() => {
    const start = (judgePage - 1) * judgePageSize;
    return filteredJudges.slice(start, start + judgePageSize);
  }, [filteredJudges, judgePage, judgePageSize]);

  // ── SCORES & LEADERBOARD LOGIC ──
  const allTeams = resultsData?.teams || resultsData?.leaderboard || [];
  const selectedRoundObj = useMemo(() => {
    if (scoreTab === 'overall') return null;
    const rId = scoreTab.replace('round_', '');
    return rounds.find(r => String(r.Id) === String(rId)) || rounds[0] || null;
  }, [rounds, scoreTab]);

  // Filter teams by search & status
  const filteredTeams = useMemo(() => {
    return (allTeams || []).filter(t => {
      // 1. Text Search
      if (scoreSearch.trim()) {
        const q = scoreSearch.toLowerCase();
        const tName = (t.TeamName || '').toLowerCase();
        const pTitle = (t.ExpoProjectTitle || t.ProblemStatementTitle || '').toLowerCase();
        const booth = (t.BoothNumber || '').toLowerCase();
        const dom = (t.ExpoDomainName || '').toLowerCase();
        const lead = (t.TeamLeadName || '').toLowerCase();
        if (!tName.includes(q) && !pTitle.includes(q) && !booth.includes(q) && !dom.includes(q) && !lead.includes(q)) {
          return false;
        }
      }

      // 2. Status Filter
      if (scoreStatusFilter === 'all') return true;
      if (scoreTab === 'overall') {
        if (scoreStatusFilter === 'fully') return t.isFullyEvaluated;
        if (scoreStatusFilter === 'partially') return t.isPartiallyEvaluated;
        if (scoreStatusFilter === 'none') return t.isNotEvaluated;
      } else if (selectedRoundObj) {
        const rb = (t.roundBreakdown || []).find(b => b.roundId === selectedRoundObj.Id);
        const hasEval = rb && rb.hasEvaluated;
        if (scoreStatusFilter === 'fully') return Boolean(hasEval);
        if (scoreStatusFilter === 'none') return !hasEval;
      }
      return true;
    });
  }, [allTeams, scoreSearch, scoreStatusFilter, scoreTab, selectedRoundObj]);

  // Sorted teams based on subtab
  const sortedDisplayTeams = useMemo(() => {
    const list = [...filteredTeams];
    if (selectedRoundObj) {
      // Sort by this round's average score descending
      return list.sort((a, b) => {
        const scoreA = (a.roundBreakdown || []).find(r => r.roundId === selectedRoundObj.Id)?.roundAverageScore || 0;
        const scoreB = (b.roundBreakdown || []).find(r => r.roundId === selectedRoundObj.Id)?.roundAverageScore || 0;
        return scoreB - scoreA;
      });
    }
    // Overall tab: Sort by totalScore descending
    return list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }, [filteredTeams, selectedRoundObj]);

  const totalScorePages = Math.max(1, Math.ceil(sortedDisplayTeams.length / scorePageSize));
  const paginatedScoreTeams = useMemo(() => {
    const start = (scorePage - 1) * scorePageSize;
    return sortedDisplayTeams.slice(start, start + scorePageSize);
  }, [sortedDisplayTeams, scorePage, scorePageSize]);

  // Overall Leaderboard Metrics
  const metrics = useMemo(() => {
    const totalTeamsCount = allTeams.length;
    const fullyEvalCount = allTeams.filter(t => t.isFullyEvaluated).length;
    const evaluatedTeams = allTeams.filter(t => (t.roundsEvaluatedCount || 0) > 0);
    const avgScore = evaluatedTeams.length > 0
      ? Math.round((evaluatedTeams.reduce((sum, t) => sum + (t.totalScore || 0), 0) / evaluatedTeams.length) * 10) / 10
      : 0;
    const topScore = evaluatedTeams.length > 0
      ? Math.max(...evaluatedTeams.map(t => t.totalScore || 0))
      : 0;

    return { totalTeamsCount, fullyEvalCount, avgScore, topScore };
  }, [allTeams]);

  // Export Leaderboard CSV
  const handleExportCSV = () => {
    if (sortedDisplayTeams.length === 0) {
      toast.error('No teams data to export');
      return;
    }
    let csvHeader = 'Rank,Team Name,Stall Number,Domain,Project Title,Team Lead,College';
    if (scoreTab === 'overall') {
      (rounds || []).forEach(r => {
        csvHeader += `,"${r.RoundName} (Max ${r.totalMaxMarks})"`;
      });
      csvHeader += `,Cumulative Score,Max Possible Marks,Completed Rounds\n`;
    } else {
      csvHeader += `,Round Score,Max Marks,Submissions Count\n`;
    }

    let csvRows = '';
    sortedDisplayTeams.forEach((t, idx) => {
      const rank = idx + 1;
      const tName = `"${(t.TeamName || '').replace(/"/g, '""')}"`;
      const stall = `"${(t.BoothNumber || 'Unassigned').replace(/"/g, '""')}"`;
      const domain = `"${(t.ExpoDomainName || 'General').replace(/"/g, '""')}"`;
      const pTitle = `"${(t.ExpoProjectTitle || t.ProblemStatementTitle || '').replace(/"/g, '""')}"`;
      const lead = `"${(t.TeamLeadName || '').replace(/"/g, '""')}"`;
      const college = `"${(t.College || '').replace(/"/g, '""')}"`;

      let row = `${rank},${tName},${stall},${domain},${pTitle},${lead},${college}`;
      if (scoreTab === 'overall') {
        (rounds || []).forEach(r => {
          const rb = (t.roundBreakdown || []).find(b => b.roundId === r.Id);
          row += `,${rb && rb.hasEvaluated ? rb.roundAverageScore : 0}`;
        });
        row += `,${t.totalScore || 0},${totalRoundsMarks},"${t.roundsEvaluatedCount || 0}/${rounds.length}"\n`;
      } else {
        const rb = (t.roundBreakdown || []).find(b => b.roundId === selectedRoundObj?.Id);
        row += `,${rb && rb.hasEvaluated ? rb.roundAverageScore : 0},${selectedRoundObj?.totalMaxMarks || 0},${rb?.submissionCount || 0}\n`;
      }
      csvRows += row;
    });

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Project_Expo_${scoreTab}_Leaderboard.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Leaderboard CSV exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
          Loading Project Expo evaluation system...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"
    >
      {/* ── TOP HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Project Expo Jury & Scoring Portal
              </span>
              <span className="text-gray-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Physical Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
              Evaluation & Rounds Management
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
              Configure round rubrics, onboard jury panels, and monitor cumulative leaderboard rankings
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {activeTab === 'ROUNDS' && (
              <button
                type="button"
                onClick={handleOpenAddRound}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Evaluation Round</span>
              </button>
            )}

            {activeTab === 'JUDGES' && (
              <button
                type="button"
                onClick={handleOpenAddJudge}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Jury Member</span>
              </button>
            )}

            {activeTab === 'SCORES' && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Leaderboard</span>
              </button>
            )}
          </div>
        </div>

        {/* ── MAIN TABS ── */}
        <div className="relative pt-6">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 pointer-events-none z-0" />
          <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none z-10 -mb-px">
            {[
              {
                id: 'ROUNDS',
                label: 'Evaluation Rounds & Rubrics',
                icon: Layers,
                count: `${rounds.length} Rounds`
              },
              {
                id: 'JUDGES',
                label: 'Jury & Evaluator Panel',
                icon: Users,
                count: `${judges.length} Active`
              },
              {
                id: 'SCORES',
                label: 'Live Scorecards & Overall Leaderboard',
                icon: Award,
                count: `${allTeams.length} Teams`
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {isSelected ? (
                    <motion.div
                      layoutId="projectExpoEvalTabActive"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      {/* Top emerald accent line */}
                      <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                      {/* Bottom line mask */}
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                  )}
                  <span
                    className={`relative z-30 flex items-center gap-2.5 ${
                      isSelected
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300/40 dark:border-zinc-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

        {/* ============================================================== */}
        {/* TAB 1: ROUNDS & QUESTIONS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'ROUNDS' && (
          <div className="space-y-6">
            {/* Header info & Seeding banner if 0 rounds */}
            {rounds.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
                    No Evaluation Rounds Configured
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                    Project Expo evaluation is round-based. You can either auto-populate the 3 standard industry Expo rounds or build custom rounds from scratch.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSeedDefaultRounds}
                    disabled={seedingRounds}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <span>{seedingRounds ? 'Seeding Rounds...' : 'Quick Setup: Seed Recommended Expo Rounds'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddRound}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Round</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Rounds Summary Bar */}
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {rounds.length} Evaluation Round{rounds.length > 1 ? 's' : ''} Configured
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Evaluators score teams round-by-round against questions. Overall leaderboard aggregates all rounds.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      Total Max: <strong className="text-emerald-500 font-mono text-sm">{totalRoundsMarks}</strong> Marks
                    </div>
                  </div>
                </div>

                {/* List of Round Cards */}
                {rounds.map((round, rIdx) => {
                  const isExpanded = Boolean(expandedRoundIds[round.Id]);
                  const qList = round.questions || [];
                  const isOpen = round.IsOpen === 1 || round.IsOpen === true;
                  const allowEdit = round.AllowScoreEdit === 1 || round.AllowScoreEdit === true;

                  return (
                    <div
                      key={round.Id}
                      className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden transition"
                    >
                      {/* Round Header Bar */}
                      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800">
                        <div className="flex items-start gap-4">
                          <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-500 text-sm shrink-0">
                            #{round.RoundOrder || rIdx + 1}
                          </span>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {round.RoundName}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                {round.totalMaxMarks || 0} Marks
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                {qList.length} Rubric Question{qList.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {round.Description && (
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                                {round.Description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Controls & Quick Action Toggles */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
                          {/* Segmented Permission Capsule */}
                          <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100/90 dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-xs">
                            {/* 1. Round Scoring Access Segmented Control */}
                            <div className="flex items-center gap-1.5">
                              <span className="pl-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 select-none">
                                Round
                              </span>
                              <div className="flex items-center p-0.5 rounded-xl bg-gray-200/60 dark:bg-zinc-900 border border-gray-300/40 dark:border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => !isOpen && handleToggleRoundPermission(round, 'IsOpen')}
                                  className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none ${
                                    isOpen
                                      ? 'text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                  title="Open round for scoring"
                                >
                                  {isOpen && (
                                    <motion.div
                                      layoutId={`round_status_${round.Id}`}
                                      className="absolute inset-0 rounded-lg bg-emerald-600 dark:bg-emerald-500 shadow-sm"
                                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                  )}
                                  <span className="relative z-10 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Open</span>
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => isOpen && handleToggleRoundPermission(round, 'IsOpen')}
                                  className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none ${
                                    !isOpen
                                      ? 'text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                  title="Close round scoring"
                                >
                                  {!isOpen && (
                                    <motion.div
                                      layoutId={`round_status_${round.Id}`}
                                      className="absolute inset-0 rounded-lg bg-rose-600 dark:bg-rose-500 shadow-sm"
                                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                  )}
                                  <span className="relative z-10 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>Closed</span>
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-800" />

                            {/* 2. Score Editing Locker Segmented Control */}
                            <div className="flex items-center gap-1.5">
                              <span className="pl-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 select-none">
                                Scores
                              </span>
                              <div className="flex items-center p-0.5 rounded-xl bg-gray-200/60 dark:bg-zinc-900 border border-gray-300/40 dark:border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => !allowEdit && handleToggleRoundPermission(round, 'AllowScoreEdit')}
                                  className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none ${
                                    allowEdit
                                      ? 'text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                  title="Allow evaluators to edit submitted scores"
                                >
                                  {allowEdit && (
                                    <motion.div
                                      layoutId={`score_status_${round.Id}`}
                                      className="absolute inset-0 rounded-lg bg-sky-600 dark:bg-sky-500 shadow-sm"
                                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                  )}
                                  <span className="relative z-10 flex items-center gap-1">
                                    <Unlock className="w-3 h-3" />
                                    <span>Editable</span>
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => allowEdit && handleToggleRoundPermission(round, 'AllowScoreEdit')}
                                  className={`relative px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none ${
                                    !allowEdit
                                      ? 'text-white'
                                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                  title="Lock scores from being modified"
                                >
                                  {!allowEdit && (
                                    <motion.div
                                      layoutId={`score_status_${round.Id}`}
                                      className="absolute inset-0 rounded-lg bg-amber-600 dark:bg-amber-500 shadow-sm"
                                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                  )}
                                  <span className="relative z-10 flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>Locked</span>
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Add Question Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddQuestion(round)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Add Question</span>
                          </button>

                          {/* Edit Round */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditRound(round)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                            title="Edit Round Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Round */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRound(round)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 transition cursor-pointer"
                            title="Delete Round"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Expand/Collapse Accordion */}
                          <button
                            type="button"
                            onClick={() => toggleRoundExpanded(round.Id)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Questions Section inside Round */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 bg-gray-50/50 dark:bg-zinc-900/30 space-y-3">
                          <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                              Round Rubric Questions ({qList.length})
                            </span>
                            <span className="text-xs text-gray-400 dark:text-zinc-500">
                              Evaluators will score teams on these exact parameters
                            </span>
                          </div>

                          {qList.length === 0 ? (
                            <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center space-y-2">
                              <p className="text-xs text-gray-500 dark:text-zinc-400">
                                No questions added to this round yet. Add parameters like prototype feasibility, design, or pitch.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenAddQuestion(round)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add First Question</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {qList.map((q, qIdx) => (
                                <div
                                  key={q.Id}
                                  className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-zinc-700 transition"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                      {q.QuestionOrder || qIdx + 1}
                                    </span>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                          {q.QuestionText}
                                        </h4>
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                          {q.MaxMarks} Marks
                                        </span>
                                      </div>
                                      {q.Description && (
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                                          {q.Description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditQuestion(round, q)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                                      title="Edit Question"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuestion(q)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition cursor-pointer"
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: JURY & EVALUATORS PANEL */}
        {/* ============================================================== */}
        {activeTab === 'JUDGES' && (
          <div className="space-y-6">
            {/* Search & Actions Bar */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={judgeSearch}
                  onChange={(e) => setJudgeSearch(e.target.value)}
                  placeholder="Filter judges by name, email, role, or institution..."
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                  Showing {filteredJudges.length} of {judges.length} jury members
                </span>
              </div>
            </div>

            {/* Judges Grid */}
            {filteredJudges.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Jury Members Found
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                  {judgeSearch ? 'No evaluators matched your search filters.' : 'Onboard expert jury members to evaluate project stalls.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddJudge}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard First Jury Member</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {paginatedJudges.map((j) => (
                    <div
                      key={j.Id}
                      className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-5 shadow-sm hover:border-gray-300 dark:hover:border-zinc-700 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                            {j.Role || j.EventRole || 'Technical Jury'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {j.Status || 'Active'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">
                            {j.Name ? j.Name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'JU'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {j.Name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                              {j.College || 'Innovation Jury Panel'}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1 pt-1">
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{j.Email}</span>
                          </p>
                        </div>
                      </div>

                      {/* Credentials & Footer Actions */}
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2.5">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Login ID:</span>
                            <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{j.Username}</span>
                          </div>
                          {j.PlainTextPassword && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Password:</span>
                              <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{j.PlainTextPassword}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(j)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            {copiedJudgeId === j.Id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedJudgeId === j.Id ? 'Copied' : 'Copy Credentials'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditJudge(j)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                              title="Edit Judge"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteJudge(j)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 transition cursor-pointer"
                              title="Delete Judge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredJudges.length > 0 && (
                  <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <Pagination
                      currentPage={judgePage}
                      totalPages={totalJudgePages}
                      totalItems={filteredJudges.length}
                      pageSize={judgePageSize}
                      onPageChange={setJudgePage}
                      onPageSizeChange={setJudgePageSize}
                      pageSizeOptions={[6, 9, 18, 36]}
                      itemName="jury members"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: LIVE SCORECARDS & LEADERBOARD (ROUND-WISE + OVERALL) */}
        {/* ============================================================== */}
        {activeTab === 'SCORES' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Exhibiting Teams</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{metrics.totalTeamsCount}</p>
                <span className="text-xs text-gray-500 dark:text-zinc-400">Registered stalls</span>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Fully Evaluated</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{metrics.fullyEvalCount}</p>
                <span className="text-xs text-gray-500 dark:text-zinc-400">All rounds scored</span>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Platform Average</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{metrics.avgScore} <span className="text-xs text-gray-400 font-normal">/ {totalRoundsMarks}</span></p>
                <span className="text-xs text-gray-500 dark:text-zinc-400">Across evaluated teams</span>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Top Overall Score</span>
                <p className="text-2xl font-bold text-amber-500 font-mono">{metrics.topScore} <span className="text-xs text-gray-400 font-normal">/ {totalRoundsMarks}</span></p>
                <span className="text-xs text-gray-500 dark:text-zinc-400">Leaderboard peak</span>
              </div>
            </div>

            {/* Sub-tabs: Overall Leaderboard + Round 1, Round 2, ... */}
            <div className="relative pt-2">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 pointer-events-none z-0" />
              <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none z-10 -mb-px">
                <button
                  type="button"
                  onClick={() => { setScoreTab('overall'); setScorePage(1); }}
                  className="relative h-11 px-4 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {scoreTab === 'overall' ? (
                    <motion.div
                      layoutId="projectExpoEvalScoreSubTabActive"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute top-0 left-4 right-4 h-[2px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                  )}
                  <span
                    className={`relative z-30 flex items-center gap-2 ${
                      scoreTab === 'overall'
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Trophy className={`w-3.5 h-3.5 ${scoreTab === 'overall' ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <span>Overall Cumulative Leaderboard</span>
                  </span>
                </button>

                {rounds.map((r, idx) => {
                  const isSelected = scoreTab === `round_${r.Id}`;
                  return (
                    <button
                      key={r.Id}
                      type="button"
                      onClick={() => { setScoreTab(`round_${r.Id}`); setScorePage(1); }}
                      className="relative h-11 px-4 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                    >
                      {isSelected ? (
                        <motion.div
                          layoutId="projectExpoEvalScoreSubTabActive"
                          className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        >
                          <div className="absolute top-0 left-4 right-4 h-[2px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                          <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                        </motion.div>
                      ) : (
                        <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                      )}
                      <span
                        className={`relative z-30 flex items-center gap-2 ${
                          isSelected
                            ? 'text-gray-900 dark:text-white font-bold'
                            : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span>Round #{r.RoundOrder || idx + 1}: {r.RoundName}</span>
                        <span className="font-mono text-[11px] text-gray-400">({r.totalMaxMarks}M)</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scoreSearch}
                  onChange={(e) => { setScoreSearch(e.target.value); setScorePage(1); }}
                  placeholder="Filter scorecards by team name, stall number (STALL-XX), domain, project..."
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={scoreStatusFilter}
                  onChange={(e) => { setScoreStatusFilter(e.target.value); setScorePage(1); }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-gray-700 dark:text-zinc-300 outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="all">All Teams Status</option>
                  <option value="fully">Fully Evaluated</option>
                  <option value="partially">Partially Evaluated</option>
                  <option value="none">Pending / Not Evaluated</option>
                </select>

                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                  Showing {sortedDisplayTeams.length} teams
                </span>
              </div>
            </div>

            {/* Leaderboard Table */}
            {sortedDisplayTeams.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-12 text-center space-y-2">
                <Award className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Teams Match Filter Criteria
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Try adjusting your search query or evaluation status dropdown.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                      <tr>
                        <th className="py-4 px-6 text-center w-16">Rank</th>
                        <th className="py-4 px-6">Exhibitor Team & Stall</th>
                        <th className="py-4 px-6">Project Title & Domain</th>
                        {scoreTab === 'overall' ? (
                          <>
                            <th className="py-4 px-6 text-center">Rounds Progress</th>
                            <th className="py-4 px-6 text-center">Cumulative Score</th>
                          </>
                        ) : (
                          <>
                            <th className="py-4 px-6 text-center">Round Score</th>
                            <th className="py-4 px-6 text-center">Jury Evaluations</th>
                          </>
                        )}
                        <th className="py-4 px-6 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                      {paginatedScoreTeams.map((team, idx) => {
                        const rankNumber = (scorePage - 1) * scorePageSize + idx + 1;
                        const isExpanded = expandedTeamId === team.Id;
                        const rbList = team.roundBreakdown || [];

                        return (
                          <React.Fragment key={team.Id || idx}>
                            <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition">
                              {/* Rank */}
                              <td className="py-4 px-6 text-center">
                                {rankNumber === 1 ? (
                                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs mx-auto">
                                    <Trophy className="w-4 h-4" />
                                  </span>
                                ) : rankNumber === 2 ? (
                                  <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-400 border border-slate-300/30 flex items-center justify-center font-bold text-xs mx-auto">
                                    <Medal className="w-4 h-4" />
                                  </span>
                                ) : rankNumber === 3 ? (
                                  <span className="w-8 h-8 rounded-full bg-amber-700/15 text-amber-600 border border-amber-700/30 flex items-center justify-center font-bold text-xs mx-auto">
                                    <Medal className="w-4 h-4" />
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                    #{rankNumber}
                                  </span>
                                )}
                              </td>

                              {/* Exhibitor Team & Stall */}
                              <td className="py-4 px-6">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {team.TeamName}
                                    </span>
                                    {team.BoothNumber && (
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        {team.BoothNumber}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                                    <span>Lead: {team.TeamLeadName || 'N/A'}</span>
                                    {team.College && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate max-w-[180px]">{team.College}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Project Title & Domain */}
                              <td className="py-4 px-6">
                                <div className="space-y-1 max-w-sm">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {team.ExpoProjectTitle || team.ProblemStatementTitle || team.TeamName}
                                  </p>
                                  {team.ExpoDomainName && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                      {team.ExpoDomainName}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Overall Tab Scores */}
                              {scoreTab === 'overall' ? (
                                <>
                                  <td className="py-4 px-6 text-center">
                                    <div className="inline-flex flex-col items-center gap-1">
                                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {team.roundsEvaluatedCount || 0} / {rounds.length} Rounds
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {rounds.map((r, rIdx) => {
                                          const rb = rbList.find(b => b.roundId === r.Id);
                                          const hasEv = rb && rb.hasEvaluated;
                                          return (
                                            <span
                                              key={r.Id}
                                              className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center font-mono ${
                                                hasEv
                                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700'
                                              }`}
                                              title={`Round ${r.RoundOrder || rIdx + 1}: ${hasEv ? `${rb.roundAverageScore}/${r.totalMaxMarks} pts` : 'Not evaluated'}`}
                                            >
                                              R{r.RoundOrder || rIdx + 1}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-4 px-6 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                        {team.totalScore || 0}
                                      </span>
                                      <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                        / {totalRoundsMarks} Marks
                                      </span>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  {/* Individual Round View */}
                                  <td className="py-4 px-6 text-center">
                                    {(() => {
                                      const rb = rbList.find(b => b.roundId === selectedRoundObj?.Id);
                                      if (!rb || !rb.hasEvaluated) {
                                        return (
                                          <span className="text-xs text-gray-400 italic">
                                            Not evaluated yet
                                          </span>
                                        );
                                      }
                                      return (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                            {rb.roundAverageScore}
                                          </span>
                                          <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                            / {selectedRoundObj?.totalMaxMarks || 0} Marks
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </td>

                                  <td className="py-4 px-6 text-center">
                                    {(() => {
                                      const rb = rbList.find(b => b.roundId === selectedRoundObj?.Id);
                                      const count = rb?.submissionCount || 0;
                                      return (
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                          count > 0
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                                        }`}>
                                          {count} Jury Review{count !== 1 ? 's' : ''}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                </>
                              )}

                              {/* Accordion Toggle */}
                              <td className="py-4 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => setExpandedTeamId(isExpanded ? null : team.Id)}
                                  className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
                                  title="View Rubric Breakdown"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Breakdown Accordion Row */}
                            {isExpanded && (
                              <tr className="bg-gray-50/70 dark:bg-black border-t border-b border-gray-200 dark:border-zinc-800">
                                <td colSpan={scoreTab === 'overall' ? 6 : 5} className="p-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300">
                                        Evaluation Breakdown for {team.TeamName}
                                      </h4>
                                      <span className="text-xs text-gray-400 font-mono">
                                        Stall: {team.BoothNumber || 'Unassigned'}
                                      </span>
                                    </div>

                                    {/* Round Cards Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {rounds.map((round) => {
                                        const rb = rbList.find(b => b.roundId === round.Id);
                                        const hasEval = rb && rb.hasEvaluated;
                                        const submissions = rb?.submissions || [];

                                        return (
                                          <div
                                            key={round.Id}
                                            className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                {round.RoundName}
                                              </span>
                                              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                {hasEval ? `${rb.roundAverageScore} / ${round.totalMaxMarks}` : 'Pending'}
                                              </span>
                                            </div>

                                            {submissions.length === 0 ? (
                                              <p className="text-xs text-gray-400 italic">No score submitted for this round yet.</p>
                                            ) : (
                                              <div className="space-y-2.5">
                                                {submissions.map((sub, sIdx) => (
                                                  <div key={sub.scoreId || sIdx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200/60 dark:border-zinc-800 text-xs space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                      <span className="font-semibold text-gray-800 dark:text-zinc-200">
                                                        {sub.evaluatorName}
                                                      </span>
                                                      <span className="font-mono font-bold text-emerald-500">
                                                        {sub.totalScore} pts
                                                      </span>
                                                    </div>
                                                    {sub.evaluatorRole && (
                                                      <p className="text-[10px] text-gray-400">{sub.evaluatorRole}</p>
                                                    )}
                                                    {sub.feedback && (
                                                      <p className="text-[11px] text-gray-600 dark:text-zinc-300 italic pt-1 border-t border-gray-200/50 dark:border-zinc-800">
                                                        "{sub.feedback}"
                                                      </p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Score Pagination */}
                <div className="border-t border-gray-200 dark:border-zinc-800">
                  <Pagination
                    currentPage={scorePage}
                    totalPages={totalScorePages}
                    totalItems={sortedDisplayTeams.length}
                    pageSize={scorePageSize}
                    onPageChange={setScorePage}
                    onPageSizeChange={setScorePageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                    itemName="exhibitor scorecards"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT ROUND MODAL ── */}
      <AnimatePresence>
        {isRoundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoundModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                    {editingRound ? 'Edit Evaluation Round' : 'Add New Evaluation Round'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoundModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitRound} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Round Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Round 1: Stall Showcase & Poster"
                    value={roundForm.RoundName}
                    onChange={(e) => setRoundForm({ ...roundForm, RoundName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Description & Evaluation Focus
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief explanation of what the judges should inspect in this round"
                    value={roundForm.Description}
                    onChange={(e) => setRoundForm({ ...roundForm, Description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Round Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={roundForm.RoundOrder}
                      onChange={(e) => setRoundForm({ ...roundForm, RoundOrder: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Evaluation Track
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Physical (Project Expo)"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsRoundModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRound}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submittingRound ? 'Saving...' : (editingRound ? 'Update Round' : 'Create Round')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT QUESTION MODAL ── */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuestionModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                    {editingQuestion ? 'Edit Rubric Question' : `Add Question to ${activeRoundForQuestion?.RoundName}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Question / Rubric Parameter *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Working Prototype & Hardware Demo Execution"
                    value={questionForm.QuestionText}
                    onChange={(e) => setQuestionForm({ ...questionForm, QuestionText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Max Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={questionForm.MaxMarks}
                      onChange={(e) => setQuestionForm({ ...questionForm, MaxMarks: parseInt(e.target.value, 10) || 10 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm font-bold font-mono text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={questionForm.QuestionOrder}
                      onChange={(e) => setQuestionForm({ ...questionForm, QuestionOrder: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Guidance / Description for Jury
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instructions on what to look for when awarding full marks"
                    value={questionForm.Description}
                    onChange={(e) => setQuestionForm({ ...questionForm, Description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuestion}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submittingQuestion ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD / EDIT JUDGE MODAL ── */}
      <AnimatePresence>
        {isJudgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJudgeModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                    {editingJudge ? 'Edit Jury Member' : 'Onboard New Jury Member'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJudgeModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitJudge} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={judgeForm.Name}
                    onChange={(e) => setJudgeForm({ ...judgeForm, Name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jury@example.com"
                      value={judgeForm.Email}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Industry Architect / Jury"
                      value={judgeForm.Role}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Organization / College
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Madras / Tech Corp"
                      value={judgeForm.College}
                      onChange={(e) => setJudgeForm({ ...judgeForm, College: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                      Custom Password
                    </label>
                    <input
                      type="text"
                      placeholder={editingJudge ? 'Leave blank to keep current' : 'Default password'}
                      value={judgeForm.Password}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsJudgeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingJudge}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submittingJudge ? 'Saving...' : (editingJudge ? 'Update Jury' : 'Onboard Jury')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── APP CONFIRM MODAL ── */}
      <AppConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {}, loading: false })}
        loading={confirmModal.loading}
        variant="danger"
      />
    </motion.div>
  );
}
