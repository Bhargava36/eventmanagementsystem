import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Radio, Play, StopCircle, RotateCcw, Link as LinkIcon, ExternalLink, Users, Calendar, Clock, CheckCircle2, AlertCircle, AlertTriangle, Copy, Check, Search, RefreshCw, Plus, Trash2, Edit2, X, Save, FileText, Target, Eye, EyeOff, Hash, Layers, Timer, Shuffle, ChevronDown, ChevronUp, Settings2, Lightbulb, ListChecks, FolderGit2, Globe, ArrowLeftRight, FileSpreadsheet, Download, UploadCloud } from 'lucide-react';
import useToast from '../../../../Hooks/useToast';
import { getEventTypeInfo, formatDate, formatTime } from '../../../../lib/utils';
import { downloadRegistrationsWorkbook, downloadPSTemplateWorkbook, parsePSTemplateFile } from '@/lib/excelExport';

export default function AdminVirtualEvent() {
  const toast = useToast();
  const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
  const [currentEventId, setCurrentEventId] = useState(storedAdmin?.EventId || null);
  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [meetUrlInput, setMeetUrlInput] = useState('');
  const [savingMeetUrl, setSavingMeetUrl] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  // Main Page Folder Tab ('control' | 'themes' | 'statements' | 'selections' | 'settings' | 'teams' | 'schedule')
  const [activeTab, setActiveTab] = useState('control');
  // Themes State
  const [themes, setThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [themeForm, setThemeForm] = useState({
    ThemeName: '',
    Description: '',
    DisplayOrder: 0,
    Track: 'Virtual'
  });
  const [themeSaving, setThemeSaving] = useState(false);
  // Problem Statements State
  const [problemStatements, setProblemStatements] = useState([]);
  const [selections, setSelections] = useState([]);
  const [psLoading, setPsLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState({
    ThemePublished: 0,
    ProblemStatementsPublished: 0,
    PSSelectionDeadline: null,
    PSMaxTeamsPerStatement: 5
  });
  // PS CRUD Form
  const [showPsForm, setShowPsForm] = useState(false);
  const [editingPsId, setEditingPsId] = useState(null);
  const [psForm, setPsForm] = useState({
    ProblemCode: '',
    Title: '',
    Description: '',
    Category: '',
    Theme: '',
    MaxTeams: 5,
    DisplayOrder: 0,
    Track: 'Virtual'
  });
  const [psSaving, setPsSaving] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [reassignModal, setReassignModal] = useState({
    open: false,
    mode: 'reassign',
    selection: null,
    team: null,
    targetPs: null,
    selectedPsId: '',
    targetTeamId: ''
  });
  const [reassigning, setReassigning] = useState(false);
  const [selectionsViewMode, setSelectionsViewMode] = useState('teams');
  const [selectionsTeamFilter, setSelectionsTeamFilter] = useState('selected');
  const [selectionsSearch, setSelectionsSearch] = useState('');
  const [expandedPsSelections, setExpandedPsSelections] = useState({});
  // Grouping / filtering
  const [psThemeFilter, setPsThemeFilter] = useState('ALL');
  const [expandedThemes, setExpandedThemes] = useState({});
  // PS Settings Form - Selection Timer in minutes
  const [deadlineMinutes, setDeadlineMinutes] = useState(15);
  const [adminTimerLeft, setAdminTimerLeft] = useState(null);
  const [maxTeamsInput, setMaxTeamsInput] = useState(5);

  // Excel Bulk Upload State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreview, setExcelPreview] = useState(null);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);
  const [demoPreviewTab, setDemoPreviewTab] = useState('ps');

  // Live countdown for admin
  useEffect(() => {
    const deadlineVal = publishStatus?.PSSelectionDeadline;
    if (!deadlineVal) {
      setAdminTimerLeft(null);
      return;
    }
    let targetDate = NaN;
    if (typeof deadlineVal === 'number') {
      targetDate = deadlineVal;
    } else if (deadlineVal instanceof Date) {
      targetDate = deadlineVal.getTime();
    } else {
      const s = String(deadlineVal).trim();
      const d1 = new Date(s);
      if (!isNaN(d1.getTime())) {
        targetDate = d1.getTime();
      } else {
        const d2 = new Date(s.replace(' ', 'T') + 'Z');
        if (!isNaN(d2.getTime())) targetDate = d2.getTime();
      }
    }
    if (isNaN(targetDate)) {
      setAdminTimerLeft(null);
      return;
    }
    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setAdminTimerLeft({ expired: true, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setAdminTimerLeft({ expired: false, hours, minutes, seconds });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [publishStatus?.PSSelectionDeadline]);
  useEffect(() => {
    const init = async () => {
      let eid = currentEventId;
      if (!eid && (storedAdmin?.Id || storedAdmin?.id)) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/${storedAdmin.Id || storedAdmin.id}`);
          if (res.ok) {
            const data = await res.json();
            const adminData = data.events?.[0] || data.admin;
            if (adminData?.EventId) {
              eid = adminData.EventId;
              setCurrentEventId(eid);
              localStorage.setItem('admin', JSON.stringify({ ...storedAdmin, ...adminData }));
            }
          }
        } catch (e) {
          console.error('Failed to resolve admin event:', e);
        }
      }
      if (eid) {
        loadData(eid);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);
  const loadData = async (eid) => {
    try {
      setLoading(true);
      const [evRes, teamsRes, timeRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/events/${eid}`),
        fetch(`${API_BASE_URL}/api/teams/event/${eid}`),
        fetch(`${API_BASE_URL}/api/event_timelines/event/${eid}`)
      ]);
      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const evData = await evRes.value.json();
        const evObj = Array.isArray(evData) ? evData[0] : (evData.event || evData);
        setEvent(evObj);
        setMeetUrlInput(evObj.VirtualMeetUrl || '');
      }
      if (teamsRes.status === 'fulfilled' && teamsRes.value.ok) {
        const tData = await teamsRes.value.json();
        const list = Array.isArray(tData) ? tData : (tData.teams || []);
        setTeams(list);
      }
      if (timeRes.status === 'fulfilled' && timeRes.value.ok) {
        const tlData = await timeRes.value.json();
        const list = Array.isArray(tlData) ? tlData : (tlData.timelines || []);
        setTimelines(list.filter((t) => t.Track === 'Virtual' || t.Track === 'General'));
      }
    } catch (err) {
      console.error('Failed to load virtual event details', err);
      toast.error('Failed to load virtual event data');
    } finally {
      setLoading(false);
    }
  };
  // Load Problem Statement & Themes Data
  const loadPSData = useCallback(async () => {
    if (!currentEventId) return;
    try {
      setPsLoading(true);
      const [psRes, selRes, statusRes, themesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}?track=Virtual`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selections`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-status`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/themes?track=Virtual`)
      ]);
      if (psRes.status === 'fulfilled' && psRes.value.ok) {
        const data = await psRes.value.json();
        setProblemStatements(data.problemStatements || []);
      }
      if (selRes.status === 'fulfilled' && selRes.value.ok) {
        const data = await selRes.value.json();
        setSelections(data.selections || []);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const data = await statusRes.value.json();
        setPublishStatus(data);
        if (data.PSSelectionDeadline) {
          const diffMs = new Date(data.PSSelectionDeadline).getTime() - Date.now();
          if (diffMs > 0) {
            setDeadlineMinutes(Math.max(1, Math.round(diffMs / 60000)));
          }
        }
        setMaxTeamsInput(data.PSMaxTeamsPerStatement || 5);
      }
      if (themesRes.status === 'fulfilled' && themesRes.value.ok) {
        const data = await themesRes.value.json();
        setThemes(data.themes || []);
      }
    } catch (err) {
      console.error('Failed to load PS data:', err);
    } finally {
      setPsLoading(false);
    }
  }, [currentEventId]);
  useEffect(() => {
    if (currentEventId) {
      loadPSData();
    }
  }, [currentEventId, loadPSData]);
  // Real-time updates via WebSocket (Auto-sync when teams make selections or admin actions take place)
  useEffect(() => {
    if (!currentEventId) return;
    let socket = null;
    let reconnectTimer = null;
    let isMounted = true;
    const connectWS = () => {
      try {
        const wsBase = (API_BASE_URL || 'https://emsapi.aitamsac.in').replace(/^http/, 'ws');
        socket = new WebSocket(wsBase);
        socket.onopen = () => {
          socket.send(JSON.stringify({ type: 'JOIN_EVENT', eventId: currentEventId }));
        };
        socket.onmessage = (msgEvent) => {
          try {
            const data = JSON.parse(msgEvent.data);
            if (!data.eventId || String(data.eventId) === String(currentEventId)) {
              loadPSData();
            }
          } catch (e) {
            // Ignore parse error
          }
        };
        socket.onclose = () => {
          if (isMounted) {
            reconnectTimer = setTimeout(connectWS, 3000);
          }
        };
        socket.onerror = () => {
          socket.close();
        };
      } catch (e) {
        console.warn('WebSocket connection failed:', e);
      }
    };
    connectWS();
    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => socket.close();
        }
      }
    };
  }, [currentEventId, loadPSData]);
  const handleUpdateStatus = async (newStatus) => {
    if (!currentEventId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}/virtual-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ VirtualStatus: newStatus })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Status update failed');
      }
      const data = await res.json();
      setEvent((prev) => ({
        ...prev,
        VirtualStatus: newStatus,
        VirtualStartedAt: data.event?.VirtualStartedAt || (newStatus === 'LIVE' ? new Date().toISOString() : prev?.VirtualStartedAt)
      }));
      if (newStatus === 'LIVE') {
        toast.success('Virtual Event is now LIVE! Participants can join from the event page.');
      } else if (newStatus === 'COMPLETED') {
        toast.info('Virtual Event marked as Completed.');
      } else {
        toast.info('Virtual Event reset to Not Started.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update virtual status');
    } finally {
      setActionLoading(false);
    }
  };
  const handleSaveMeetUrl = async () => {
    if (!currentEventId) return;
    try {
      setSavingMeetUrl(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}/virtual-meet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ VirtualMeetUrl: meetUrlInput.trim() })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save meeting URL');
      }
      setEvent((prev) => ({ ...prev, VirtualMeetUrl: meetUrlInput.trim() }));
      toast.success('Virtual meeting link updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save meeting URL');
    } finally {
      setSavingMeetUrl(false);
    }
  };
  const copyMeetLink = () => {
    if (!meetUrlInput) return;
    navigator.clipboard.writeText(meetUrlInput);
    setCopiedMeet(true);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopiedMeet(false), 2000);
  };
  // =============================================
  // THEME MANAGEMENT HANDLERS
  // =============================================
  const resetThemeForm = () => {
    setThemeForm({ ThemeName: '', Description: '', DisplayOrder: 0, Track: 'Virtual' });
    setEditingThemeId(null);
    setShowThemeForm(false);
  };
  const handleSaveTheme = async () => {
    if (!themeForm.ThemeName.trim()) {
      toast.error('Theme Name is required');
      return;
    }
    try {
      setThemeSaving(true);
      const url = editingThemeId
        ? `${API_BASE_URL}/api/problem-statements/themes/${editingThemeId}`
        : `${API_BASE_URL}/api/problem-statements/event/${currentEventId}/themes`;
      const method = editingThemeId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...themeForm, Track: themeForm.Track || 'Virtual' })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save theme');
      }
      toast.success(editingThemeId ? 'Theme updated successfully!' : 'Theme added successfully!');
      resetThemeForm();
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Failed to save theme');
    } finally {
      setThemeSaving(false);
    }
  };
  const handleEditTheme = (theme) => {
    setThemeForm({
      ThemeName: theme.ThemeName,
      Description: theme.Description || '',
      DisplayOrder: theme.DisplayOrder || 0,
      Track: theme.Track || 'Virtual'
    });
    setEditingThemeId(theme.Id);
    setShowThemeForm(true);
  };
  const handleDeleteTheme = async (themeId, themeName) => {
    if (!confirm(`Are you sure you want to delete theme "${themeName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/themes/${themeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete theme');
      toast.success('Theme deleted successfully');
      loadPSData();
    } catch {
      toast.error('Failed to delete theme');
    }
  };
  // Quick action: Add Problem Statement directly to a specific theme
  const handleAddStatementToTheme = (themeName) => {
    resetPsForm();
    setPsForm(prev => ({ ...prev, Theme: themeName }));
    setShowPsForm(true);
    setActiveTab('statements');
  };
  // =============================================
  // PROBLEM STATEMENT HANDLERS
  // =============================================
  const handlePublishTheme = async (publish) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, ThemePublished: publish ? 1 : 0 }));
      toast.success(`Themes ${publish ? 'published to participants' : 'hidden (draft)'}!`);
    } catch {
      toast.error('Failed to update theme status');
    }
  };
  const handlePublishPS = async (publish) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-statements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, ProblemStatementsPublished: publish ? 1 : 0 }));
      toast.success(`Problem statements ${publish ? 'published and open for selection' : 'hidden (draft)'}!`);
    } catch {
      toast.error('Failed to update problem statement status');
    }
  };
  const handleSetDeadlineByMinutes = async (mins) => {
    if (!currentEventId) return;
    const minutesToUse = Number(mins !== undefined ? mins : deadlineMinutes);
    if (!minutesToUse || minutesToUse <= 0) {
      toast.error('Please enter a valid number of minutes (e.g. 15)');
      return;
    }
    try {
      const targetTimeMs = Date.now() + minutesToUse * 60 * 1000;
      const targetDate = new Date(targetTimeMs);
      const isoDeadline = targetDate.toISOString();

      // Immediately set the active timer state in the UI so there is no flicker or false expiration
      setAdminTimerLeft({
        expired: false,
        hours: Math.floor(minutesToUse / 60),
        minutes: minutesToUse % 60,
        seconds: 0
      });
      setPublishStatus(prev => ({ ...prev, PSSelectionDeadline: isoDeadline }));

      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selection-deadline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: isoDeadline })
      });
      if (!res.ok) throw new Error('Failed to set deadline');
      toast.success(`Selection timer started for ${minutesToUse} minutes!`);
    } catch {
      toast.error('Failed to set deadline timer');
    }
  };
  const handleClearDeadline = async () => {
    if (!currentEventId) return;
    try {
      // Immediately reset timer state
      setAdminTimerLeft(null);
      setPublishStatus(prev => ({ ...prev, PSSelectionDeadline: null }));
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selection-deadline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: null })
      });
      if (!res.ok) throw new Error('Failed to clear timer');
      toast.success('Selection timer cleared');
    } catch {
      toast.error('Failed to clear timer');
    }
  };

  // Excel Bulk Import Actions
  const handleDownloadDemoTemplate = async () => {
    try {
      await downloadPSTemplateWorkbook({ eventName: eventData?.EventName || 'Hackathon' });
      toast.success('Demo Excel Template downloaded successfully!');
    } catch (err) {
      console.error('Download demo template error:', err);
      toast.error('Failed to download demo template');
    }
  };

  const handleExcelFileSelect = async (file) => {
    if (!file) return;
    setExcelFile(file);
    setParsingExcel(true);
    try {
      const parsed = await parsePSTemplateFile(file);
      if (!parsed.valid) {
        toast.error('No themes or problem statements found in the uploaded file.');
        setExcelPreview(null);
      } else {
        setExcelPreview(parsed);
        toast.success(`Found ${parsed.problemStatements.length} problem statements and ${parsed.themes.length} themes!`);
      }
    } catch (err) {
      console.error('Excel parse error:', err);
      toast.error('Could not read the Excel file. Please use the official demo template.');
      setExcelPreview(null);
    } finally {
      setParsingExcel(false);
    }
  };

  const handleConfirmExcelImport = async () => {
    if (!excelPreview || !currentEventId) return;
    setImportingExcel(true);
    let themesCreated = 0;
    let psCreated = 0;
    try {
      // 1. Get existing themes to avoid duplicate creation
      const existingThemesMap = new Map();
      themes.forEach(t => {
        if (t.ThemeName) existingThemesMap.set(t.ThemeName.toLowerCase().trim(), t);
      });

      // 2. Import themes first
      for (const t of excelPreview.themes) {
        const lowerName = String(t.ThemeName || '').toLowerCase().trim();
        if (lowerName && !existingThemesMap.has(lowerName)) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/themes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ThemeName: t.ThemeName.trim(),
                Description: t.Description || '',
                DisplayOrder: t.DisplayOrder || (themes.length + themesCreated + 1),
                Track: 'Virtual'
              })
            });
            if (res.ok) {
              themesCreated++;
              existingThemesMap.set(lowerName, t);
            }
          } catch (e) {
            console.error('Theme import sub-error:', e);
          }
        }
      }

      // 3. Import problem statements
      for (const ps of excelPreview.problemStatements) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ProblemCode: ps.ProblemCode.trim(),
              Title: ps.Title.trim(),
              Theme: ps.Theme ? ps.Theme.trim() : null,
              Category: ps.Category || 'Software',
              Description: ps.Description || '',
              MaxTeams: ps.MaxTeams || 5,
              DisplayOrder: ps.DisplayOrder || (problemStatements.length + psCreated + 1),
              Track: 'Virtual'
            })
          });
          if (res.ok) psCreated++;
        } catch (e) {
          console.error('PS import sub-error:', e);
        }
      }

      toast.success(`Successfully imported ${themesCreated} new themes and ${psCreated} problem statements!`);
      setShowExcelModal(false);
      setExcelFile(null);
      setExcelPreview(null);
      loadPSData();
    } catch (err) {
      console.error('Bulk import error:', err);
      toast.error('Encountered an error while importing some records.');
    } finally {
      setImportingExcel(false);
    }
  };
  const handleSaveMaxTeams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/max-teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxTeams: maxTeamsInput })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, PSMaxTeamsPerStatement: maxTeamsInput }));
      toast.success('Max teams limit updated!');
    } catch {
      toast.error('Failed to set max teams');
    }
  };
  const resetPsForm = () => {
    setPsForm({ ProblemCode: '', Title: '', Description: '', Category: '', Theme: '', MaxTeams: 5, DisplayOrder: 0, Track: 'Virtual' });
    setEditingPsId(null);
    setShowPsForm(false);
  };
  const handleSaveProblemStatement = async () => {
    if (!psForm.ProblemCode.trim() || !psForm.Title.trim()) {
      toast.error('Problem Code and Title are required');
      return;
    }
    try {
      setPsSaving(true);
      const url = editingPsId
        ? `${API_BASE_URL}/api/problem-statements/${editingPsId}`
        : `${API_BASE_URL}/api/problem-statements/event/${currentEventId}`;
      const method = editingPsId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...psForm, Track: psForm.Track || 'Virtual' })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed');
      }
      toast.success(editingPsId ? 'Problem statement updated!' : 'Problem statement created!');
      resetPsForm();
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Failed to save problem statement');
    } finally {
      setPsSaving(false);
    }
  };
  const handleEditPS = (ps) => {
    setPsForm({
      ProblemCode: ps.ProblemCode,
      Title: ps.Title,
      Description: ps.Description || '',
      Category: ps.Category || '',
      Theme: ps.Theme || '',
      MaxTeams: ps.MaxTeams || 5,
      DisplayOrder: ps.DisplayOrder || 0,
      Track: ps.Track || 'Virtual'
    });
    setEditingPsId(ps.Id);
    setShowPsForm(true);
  };
  const handleDeletePS = async (id) => {
    if (!confirm('Delete this problem statement? Associated team selections will also be removed.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Problem statement deleted');
      loadPSData();
    } catch {
      toast.error('Failed to delete');
    }
  };
  const handleAutoAssign = async () => {
    if (!confirm('Auto-assign problem statements to all unselected virtual teams?')) return;
    try {
      setAutoAssigning(true);
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/auto-assign`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success(data.message || `Auto-assigned ${data.assigned} teams`);
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Auto-assignment failed');
    } finally {
      setAutoAssigning(false);
    }
  };
  const handleOpenReassign = (sel) => {
    setReassignModal({
      open: true,
      mode: 'reassign',
      selection: sel,
      team: null,
      targetPs: null,
      selectedPsId: String(sel.ProblemStatementId || ''),
      targetTeamId: ''
    });
  };
  const handleOpenAssignTeam = (team) => {
    setReassignModal({
      open: true,
      mode: 'assign_team',
      selection: null,
      team: team,
      targetPs: null,
      selectedPsId: '',
      targetTeamId: String(team.Id || team.TeamId || '')
    });
  };
  const handleOpenAssignToPs = (ps) => {
    setReassignModal({
      open: true,
      mode: 'assign_to_ps',
      selection: null,
      team: null,
      targetPs: ps,
      selectedPsId: String(ps.Id),
      targetTeamId: ''
    });
  };
  const handleTogglePsAccordion = (psId) => {
    setExpandedPsSelections((prev) => ({
      ...prev,
      [psId]: !prev[psId]
    }));
  };
  const handleToggleAllPsAccordions = () => {
    const allExpanded = problemStatements.length > 0 && problemStatements.every((ps) => expandedPsSelections[ps.Id]);
    const nextState = {};
    problemStatements.forEach((ps) => {
      nextState[ps.Id] = !allExpanded;
    });
    setExpandedPsSelections(nextState);
  };
  const handleConfirmReassign = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (reassignModal.mode === 'reassign') {
      if (!reassignModal.selection || !reassignModal.selectedPsId) return;
      try {
        setReassigning(true);
        const res = await fetch(`${API_BASE_URL}/api/problem-statements/selection/${reassignModal.selection.Id}/reassign`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ problemStatementId: reassignModal.selectedPsId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to reassign problem statement');
        toast.success(`Problem statement reassigned for "${reassignModal.selection.TeamName}"`);
        setReassignModal({ open: false, mode: 'reassign', selection: null, team: null, targetPs: null, selectedPsId: '', targetTeamId: '' });
        loadPSData();
      } catch (err) {
        toast.error(err.message || 'Failed to reassign problem statement');
      } finally {
        setReassigning(false);
      }
    } else {
      const teamId = reassignModal.mode === 'assign_team'
        ? (reassignModal.team?.Id || reassignModal.team?.TeamId)
        : reassignModal.targetTeamId;
      const psId = reassignModal.mode === 'assign_team'
        ? reassignModal.selectedPsId
        : reassignModal.targetPs?.Id;

      if (!teamId || !psId) {
        toast.error('Please choose both a team and a problem statement');
        return;
      }

      try {
        setReassigning(true);
        const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/select`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ teamId, problemStatementId: psId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to assign problem statement');
        const teamName = reassignModal.team?.TeamName || virtualTeams.find(t => String(t.Id || t.TeamId) === String(teamId))?.TeamName || 'Team';
        toast.success(`Problem statement assigned to "${teamName}"`);
        setReassignModal({ open: false, mode: 'reassign', selection: null, team: null, targetPs: null, selectedPsId: '', targetTeamId: '' });
        loadPSData();
      } catch (err) {
        toast.error(err.message || 'Failed to assign problem statement');
      } finally {
        setReassigning(false);
      }
    }
  };
  const handleRemoveSelection = async (selId, teamName) => {
    if (!confirm(`Remove selection for "${teamName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/selection/${selId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Selection removed');
      loadPSData();
    } catch {
      toast.error('Failed to remove selection');
    }
  };
  // Group problem statements by Theme
  const statementsByTheme = useMemo(() => {
    const map = {};
    // Ensure all defined themes exist in the map
    themes.forEach(t => {
      map[t.ThemeName] = [];
    });
    // Populate problem statements
    problemStatements.forEach(ps => {
      const themeKey = ps.Theme?.trim() || 'General / Uncategorized';
      if (!map[themeKey]) map[themeKey] = [];
      map[themeKey].push(ps);
    });
    return map;
  }, [themes, problemStatements]);
  // Derived Values
  const isLive = event?.VirtualStatus === 'LIVE';
  const isCompleted = event?.VirtualStatus === 'COMPLETED';
  const isNotStarted = !isLive && !isCompleted;
  const virtualTeams = teams.filter((t) => {
    const mode = t.ParticipationMode || '';
    return mode.toLowerCase() === 'virtual' || (!mode && event?.HackathonMode === 'Virtual');
  });
  const filteredTeams = virtualTeams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.TeamName && t.TeamName.toLowerCase().includes(q)) ||
      (t.LeaderName && t.LeaderName.toLowerCase().includes(q)) ||
      (t.LeaderEmail && t.LeaderEmail.toLowerCase().includes(q)) ||
      (t.College && t.College.toLowerCase().includes(q))
    );
  });
  const totalVirtualParticipants = virtualTeams.reduce(
    (acc, t) => acc + Number(t.MemberCount || t.TeamSize || 1),
    0
  );
  const typeInfo = getEventTypeInfo(event?.EventType || storedAdmin?.EventType);
  const themePublished = !!publishStatus.ThemePublished;
  const psPublished = !!publishStatus.ProblemStatementsPublished;
  const unselectedTeamCount = Math.max(0, virtualTeams.length - selections.length);

  const selectedTeamIds = useMemo(() => {
    const set = new Set();
    selections.forEach((s) => {
      if (s.TeamId) set.add(Number(s.TeamId));
      if (s.teamId) set.add(Number(s.teamId));
    });
    return set;
  }, [selections]);

  const unselectedTeamsList = useMemo(() => {
    return virtualTeams.filter((t) => !selectedTeamIds.has(Number(t.Id || t.TeamId)));
  }, [virtualTeams, selectedTeamIds]);

  const psSelectionsMap = useMemo(() => {
    const map = {};
    problemStatements.forEach((ps) => {
      map[ps.Id] = [];
    });
    selections.forEach((sel) => {
      const psId = sel.ProblemStatementId;
      if (!map[psId]) map[psId] = [];
      map[psId].push(sel);
    });
    return map;
  }, [problemStatements, selections]);

  const filteredSelections = useMemo(() => {
    const q = selectionsSearch.trim().toLowerCase();
    if (!q) return selections;
    return selections.filter((sel) => {
      return (
        (sel.TeamName && sel.TeamName.toLowerCase().includes(q)) ||
        (sel.College && sel.College.toLowerCase().includes(q)) ||
        (sel.ProblemCode && sel.ProblemCode.toLowerCase().includes(q)) ||
        (sel.ProblemTitle && sel.ProblemTitle.toLowerCase().includes(q)) ||
        (sel.SelectionType && sel.SelectionType.toLowerCase().includes(q))
      );
    });
  }, [selections, selectionsSearch]);

  const filteredUnselectedTeams = useMemo(() => {
    const q = selectionsSearch.trim().toLowerCase();
    if (!q) return unselectedTeamsList;
    return unselectedTeamsList.filter((t) => {
      return (
        (t.TeamName && t.TeamName.toLowerCase().includes(q)) ||
        (t.LeaderName && t.LeaderName.toLowerCase().includes(q)) ||
        (t.LeaderEmail && t.LeaderEmail.toLowerCase().includes(q)) ||
        (t.College && t.College.toLowerCase().includes(q))
      );
    });
  }, [unselectedTeamsList, selectionsSearch]);

  const filteredAllVirtualTeams = useMemo(() => {
    const q = selectionsSearch.trim().toLowerCase();
    if (!q) return virtualTeams;
    return virtualTeams.filter((t) => {
      return (
        (t.TeamName && t.TeamName.toLowerCase().includes(q)) ||
        (t.LeaderName && t.LeaderName.toLowerCase().includes(q)) ||
        (t.LeaderEmail && t.LeaderEmail.toLowerCase().includes(q)) ||
        (t.College && t.College.toLowerCase().includes(q))
      );
    });
  }, [virtualTeams, selectionsSearch]);

  const filteredProblemStatementsForSelections = useMemo(() => {
    const q = selectionsSearch.trim().toLowerCase();
    if (!q) return problemStatements;
    return problemStatements.filter((ps) => {
      const assigned = psSelectionsMap[ps.Id] || [];
      const hasMatchingTeam = assigned.some(
        (sel) =>
          (sel.TeamName && sel.TeamName.toLowerCase().includes(q)) ||
          (sel.College && sel.College.toLowerCase().includes(q))
      );
      return (
        (ps.ProblemCode && ps.ProblemCode.toLowerCase().includes(q)) ||
        (ps.Title && ps.Title.toLowerCase().includes(q)) ||
        (ps.Theme && ps.Theme.toLowerCase().includes(q)) ||
        (ps.Category && ps.Category.toLowerCase().includes(q)) ||
        hasMatchingTeam
      );
    });
  }, [problemStatements, selectionsSearch, psSelectionsMap]);

  const handleExportVirtualExcel = async () => {
    try {
      setIsExportingExcel(true);
      let exportData = null;
      if (currentEventId) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/teams/event/${currentEventId}/export-details`);
          if (res.ok) {
            exportData = await res.json();
          }
        } catch (e) {
          console.warn('Backend export-details fetch failed, fallback to local:', e);
        }
      }

      await downloadRegistrationsWorkbook({
        event: exportData?.event || event || {
          Id: currentEventId,
          EventName: event?.EventName || storedAdmin?.EventName || 'AYOJAN Event',
          EventType: event?.EventType || storedAdmin?.EventType || 'Hackathon',
          HackathonMode: event?.HackathonMode || 'Virtual',
          Location: event?.Location || 'AYOJAN Hub Campus'
        },
        teams: (exportData?.teams && exportData.teams.length > 0) ? exportData.teams : virtualTeams,
        members: exportData?.members || [],
        summary: exportData?.summary || null,
        filterMode: 'virtual'
      });

      toast.success('Virtual Track Excel sheet downloaded successfully!');
    } catch (err) {
      console.error('Failed to export Virtual Track Excel:', err);
      toast.error('Failed to export Virtual Track Excel');
    } finally {
      setIsExportingExcel(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Loading Virtual Event Control...</p>
      </div>
    );
  }
  if (!currentEventId || !event) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Assigned Event Found</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md">
          Your admin account is not currently linked to an active event. Please check your admin profile.
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              {typeInfo.isWorkshop ? 'Online Workshop Control Room' : typeInfo.isSeminar ? 'Virtual Broadcast Room' : 'Virtual Event Control Room'}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeInfo.badgeColor}`}>
              {typeInfo.label}
            </span>
            {(typeInfo.isHackathon || typeInfo.isCodingContest) && (
              <>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  themePublished
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                }`}>
                  {themePublished ? <Eye className="h-3 w-3 text-emerald-500" /> : <EyeOff className="h-3 w-3 text-slate-400" />}
                  <span>Themes: {themePublished ? 'Published' : 'Draft'}</span>
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                  psPublished
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                }`}>
                  {psPublished ? <Eye className="h-3 w-3 text-emerald-500" /> : <EyeOff className="h-3 w-3 text-slate-400" />}
                  <span>Problem Statements: {psPublished ? 'Published' : 'Draft'}</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {event.EventName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Real-time management for virtual hackathon rooms, live Google Meet sessions, themes, and problem statement distribution.
          </p>
        </div>
        {/* Status Pill & Refresh */}
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>LIVE IN PROGRESS</span>
            </div>
          ) : isCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-black border dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
              <span>Event Completed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Not Started Yet</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => { loadData(currentEventId); loadPSData(); }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh details"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Folder Tabs Navigation for Entire Virtual Event Management */}
      <div className="space-y-0">
        <div className="flex items-end gap-1.5 overflow-x-auto scrollbar-none relative z-10 -mb-px">
          {[
            {
              key: 'control',
              label: typeInfo.isSeminar ? 'Broadcast Room & Meet' : (typeInfo.isWorkshop ? 'Workshop Room & Meet' : 'Control Room & Meet'),
              icon: Radio
            },
            ...((typeInfo.isHackathon || typeInfo.isCodingContest) ? [
              { key: 'themes', label: `Themes (${themes.length})`, icon: Layers },
              { key: 'statements', label: `Problem Statements (${problemStatements.length})`, icon: FileText },
              { key: 'selections', label: `Team Selections (${selections.length})`, icon: ListChecks },
            ] : []),
            { key: 'settings', label: 'Publish & Deadlines', icon: Settings2 },
            { key: 'teams', label: `${typeInfo.participantTerm} (${virtualTeams.length})`, icon: Users },
            { key: 'schedule', label: `${typeInfo.agendaTerm} (${timelines.length})`, icon: Clock },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className="relative h-11 px-4 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer whitespace-nowrap"
              >
                {isActive ? (
                  <motion.div
                    layoutId="adminVirtualPageFolderTabActive"
                    className="absolute inset-0 -bottom-[2px] rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    {/* Seamless bottom mask */}
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60 transition" />
                )}
                <span className={`relative z-20 flex items-center gap-2 ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}>
                  <IconComp className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {/* Connected Card Container for the entire page */}
        <div className="rounded-3xl rounded-tl-none bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative z-0 overflow-hidden p-6 sm:p-8">
          {/* ============================================================ */}
          {/* TAB 1: CONTROL ROOM & LIVE MEETING LINK */}
          {/* ============================================================ */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              {/* Main Action Banner: START VIRTUAL EVENT */}
              <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                isLive
                  ? 'bg-white dark:bg-black border-emerald-500/40 shadow-sm'
                  : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 shadow-sm'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isLive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-900 border dark:border-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
                        {isLive ? <Radio className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {isLive ? 'Virtual Event is Currently Running' : 'Ready to Kick Off the Virtual Event?'}
                      </h2>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      {isLive ? (
                        <>
                          Participants can now click <strong className="text-emerald-600 dark:text-emerald-400">"Open Virtual Event Page"</strong> from their event details page to join the Google Meet room and access the live agenda.
                          {event.VirtualStartedAt && (
                            <span className="block mt-1 text-xs text-slate-400">
                              Started on: {formatDate(event.VirtualStartedAt)} at {formatTime(event.VirtualStartedAt)}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          On the virtual event day, click the button below to turn the virtual track <strong className="text-slate-900 dark:text-white">LIVE</strong>.
                          Registered participants will immediately see the interactive <strong className="text-emerald-600 dark:text-emerald-400">"Open Virtual Event Page"</strong> button on their event screen!
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {isNotStarted ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus('LIVE')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5 fill-current" />
                        )}
                        <span>START VIRTUAL EVENT</span>
                      </button>
                    ) : isLive ? (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus('COMPLETED')}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          <StopCircle className="h-4 w-4" />
                          <span>Conclude Event</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus('NOT_STARTED')}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Reset Status</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleUpdateStatus('LIVE')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Reopen Virtual Event</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* Google Meet & Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Google Meet Configuration */}
                <div className="lg:col-span-2 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Video className="h-4 w-4 text-emerald-500" />
                      Live Virtual Meeting Link (Google Meet / Zoom)
                    </h3>
                    {event.VirtualMeetUrl && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <Check className="h-3 w-3" /> Configured
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500 dark:text-zinc-400">
                      Provide the meeting link where mentors, juries, and participants will connect.
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="url"
                          value={meetUrlInput}
                          onChange={(e) => setMeetUrlInput(e.target.value)}
                          placeholder="https://meet.google.com/xyz-abc-def"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={savingMeetUrl}
                        onClick={handleSaveMeetUrl}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-black text-white font-bold text-xs transition cursor-pointer"
                      >
                        {savingMeetUrl ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        <span>Save Link</span>
                      </button>
                      {event.VirtualMeetUrl && (
                        <>
                          <button
                            type="button"
                            onClick={copyMeetLink}
                            className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                            title="Copy Link"
                          >
                            {copiedMeet ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <a
                            href={event.VirtualMeetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
                          >
                            <span>Test</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* Quick Virtual Track Overview */}
                <div className="bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    Virtual Track Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200/80 dark:border-zinc-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Virtual Teams</span>
                      <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{virtualTeams.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200/80 dark:border-zinc-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Participants</span>
                      <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{totalVirtualParticipants}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 border-t border-slate-200/60 dark:border-zinc-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Virtual Start Date:</span>
                      <span className="font-semibold">{formatDate(event.VirtualStartDate || event.StartDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Virtual End Date:</span>
                      <span className="font-semibold">{formatDate(event.VirtualEndDate || event.EndDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Virtual Prize Pool:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{event.VirtualPrizeMoney || event.PrizeMoney || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ============================================================ */}
          {/* TAB 2: THEMES & DOMAINS MANAGEMENT */}
          {/* ============================================================ */}
          {activeTab === 'themes' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Hackathon Innovation Themes
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Define overarching domains (e.g. AI/ML, Web3, FinTech). You can attach multiple problem statements to each theme.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Import from Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => { resetThemeForm(); setShowThemeForm(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Theme</span>
                </button>
              </div>
            </div>
            {/* Theme Form (Modal/Inline) */}
            <AnimatePresence>
              {showThemeForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-emerald-500/30 rounded-2xl p-5 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {editingThemeId ? 'Edit Hackathon Theme' : 'Create Hackathon Theme'}
                    </h4>
                    <button onClick={resetThemeForm} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Theme Name *
                      </label>
                      <input
                        type="text"
                        value={themeForm.ThemeName}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, ThemeName: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence & Machine Learning"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Track
                      </label>
                      <select
                        value={themeForm.Track || 'Virtual'}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, Track: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition font-bold"
                      >
                        <option value="Virtual">Virtual</option>
                        <option value="Physical">Physical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={themeForm.DisplayOrder}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, DisplayOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Theme Description
                    </label>
                    <textarea
                      rows={2}
                      value={themeForm.Description}
                      onChange={(e) => setThemeForm(prev => ({ ...prev, Description: e.target.value }))}
                      placeholder="Brief overview of challenges, technologies, or objectives for this theme..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetThemeForm}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={themeSaving}
                      onClick={handleSaveTheme}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
                    >
                      {themeSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{editingThemeId ? 'Save Changes' : 'Create Theme'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Themes Grid */}
            {themes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const statementsForTheme = problemStatements.filter(
                    (p) => (p.Theme || '').trim().toLowerCase() === theme.ThemeName.trim().toLowerCase()
                  );
                  return (
                    <div
                      key={theme.Id}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-bold">
                              Theme
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                              {theme.Track || 'Virtual'}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {statementsForTheme.length} {statementsForTheme.length === 1 ? 'Statement' : 'Statements'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {theme.ThemeName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                          {theme.Description || 'No description provided.'}
                        </p>
                      </div>
                      {/* Theme Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleAddStatementToTheme(theme.ThemeName)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Problem Statement Here</span>
                        </button>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleEditTheme(theme)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                            title="Edit Theme"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTheme(theme.Id, theme.ThemeName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                            title="Delete Theme"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                <Layers className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Themes Added Yet</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Click the "Add New Theme" button above to create hackathon tracks (e.g. AI/ML, Web3, FinTech).
                </p>
              </div>
            )}
          </div>
        )}
        {/* ============================================================ */}
        {/* TAB 3: PROBLEM STATEMENTS ORGANIZED BY THEME */}
        {/* ============================================================ */}
        {activeTab === 'statements' && (
          <div className="p-6 space-y-6">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {problemStatements.length} Total Problem Statement{problemStatements.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Organized under official event themes.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Import from Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => { resetPsForm(); setShowPsForm(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Problem Statement</span>
                </button>
              </div>
            </div>
            {/* PS Form (Inline) */}
            <AnimatePresence>
              {showPsForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-emerald-500/30 rounded-2xl p-5 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-emerald-500" />
                      {editingPsId ? 'Edit Problem Statement' : 'New Problem Statement'}
                    </h4>
                    <button onClick={resetPsForm} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Problem Code *
                      </label>
                      <input
                        type="text"
                        value={psForm.ProblemCode}
                        onChange={(e) => setPsForm(prev => ({ ...prev, ProblemCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. PS-01 or AI-101"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Theme / Track *
                      </label>
                      <div className="relative">
                        <input
                          list="theme-suggestions"
                          type="text"
                          value={psForm.Theme}
                          onChange={(e) => setPsForm(prev => ({ ...prev, Theme: e.target.value }))}
                          placeholder="Select or enter theme..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                        />
                        <datalist id="theme-suggestions">
                          {themes.map(t => (
                            <option key={t.Id} value={t.ThemeName} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Category / Domain
                      </label>
                      <input
                        type="text"
                        value={psForm.Category}
                        onChange={(e) => setPsForm(prev => ({ ...prev, Category: e.target.value }))}
                        placeholder="e.g. Software, Hardware, Open"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Problem Statement Title *
                    </label>
                    <input
                      type="text"
                      value={psForm.Title}
                      onChange={(e) => setPsForm(prev => ({ ...prev, Title: e.target.value }))}
                      placeholder="e.g. Autonomous AI-Powered Smart Traffic Optimization"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Description & Deliverables
                    </label>
                    <textarea
                      rows={3}
                      value={psForm.Description}
                      onChange={(e) => setPsForm(prev => ({ ...prev, Description: e.target.value }))}
                      placeholder="Explain the background problem, requirements, expected output, and evaluation criteria..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Track
                      </label>
                      <select
                        value={psForm.Track || 'Virtual'}
                        onChange={(e) => setPsForm(prev => ({ ...prev, Track: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition font-bold"
                      >
                        <option value="Virtual">Virtual</option>
                        <option value="Physical">Physical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Max Teams Allowed (Limit)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={psForm.MaxTeams}
                        onChange={(e) => setPsForm(prev => ({ ...prev, MaxTeams: parseInt(e.target.value) || 5 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={psForm.DisplayOrder}
                        onChange={(e) => setPsForm(prev => ({ ...prev, DisplayOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetPsForm}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={psSaving}
                      onClick={handleSaveProblemStatement}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      {psSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{editingPsId ? 'Save Changes' : 'Create Statement'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* STATEMENTS GROUPED UNDER EACH THEME */}
            <div className="space-y-6">
              {Object.keys(statementsByTheme).map((themeName) => {
                const list = statementsByTheme[themeName] || [];
                return (
                  <div
                    key={themeName}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <Layers className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            Theme: {themeName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {list.length} Problem Statement{list.length !== 1 ? 's' : ''} in this theme
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddStatementToTheme(themeName)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Statement under this theme</span>
                      </button>
                    </div>
                    {list.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {list.map((ps) => {
                          const count = ps.SelectedTeams || 0;
                          const max = ps.MaxTeams || 5;
                          const isFull = count >= max;
                          return (
                            <div
                              key={ps.Id}
                              className="p-4 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition space-y-2.5 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-black">
                                      {ps.ProblemCode}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                                      {ps.Track || 'Virtual'}
                                    </span>
                                  </div>
                                  {ps.Category && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[10px] font-medium">
                                      {ps.Category}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                  {ps.Title}
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {ps.Description || 'No description.'}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                                <span className={`font-semibold ${isFull ? 'text-rose-500' : 'text-slate-500 dark:text-zinc-400'}`}>
                                  {count} / {max} teams selected {isFull && '(Full)'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditPS(ps)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
                                    title="Edit Statement"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePS(ps.Id)}
                                    className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                    title="Delete Statement"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400 italic">
                        No problem statements added under this theme yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ============================================================ */}
        {/* TAB 4: TEAM SELECTIONS & PROBLEM STATEMENT DISTRIBUTION */}
        {/* ============================================================ */}
        {activeTab === 'selections' && (
          <div className="p-6 space-y-6">
            {/* Top Header & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Team Selections & Assignments
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {selections.length} Selected • {unselectedTeamsList.length} Pending • {virtualTeams.length} Total Virtual Teams
                    </p>
                  </div>
                </div>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode Switcher Pill */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectionsViewMode('teams')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectionsViewMode === 'teams'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>By Teams</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionsViewMode('statements')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectionsViewMode === 'statements'
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>By Problem Statement</span>
                  </button>
                </div>

                {/* Auto-Assign Remaining Teams */}
                {unselectedTeamsList.length > 0 && (
                  <button
                    type="button"
                    disabled={autoAssigning}
                    onClick={handleAutoAssign}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {autoAssigning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
                    <span>Auto-Assign {unselectedTeamsList.length} Pending Teams</span>
                  </button>
                )}
              </div>
            </div>

            {/* VIEW MODE 1: BY TEAMS */}
            {selectionsViewMode === 'teams' && (
              <div className="space-y-4">
                {/* Secondary Filter Tabs & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectionsTeamFilter('selected')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selectionsTeamFilter === 'selected'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <span>Selected Teams</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        selectionsTeamFilter === 'selected'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}>
                        {selections.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectionsTeamFilter('pending')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selectionsTeamFilter === 'pending'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <span>Pending Teams</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        selectionsTeamFilter === 'pending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}>
                        {unselectedTeamsList.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectionsTeamFilter('all')}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        selectionsTeamFilter === 'all'
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-zinc-800 dark:border-zinc-700'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                      }`}
                    >
                      <span>All Virtual Teams</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        selectionsTeamFilter === 'all'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}>
                        {virtualTeams.length}
                      </span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search teams, lead, college..."
                      value={selectionsSearch}
                      onChange={(e) => setSelectionsSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    {selectionsSearch && (
                      <button
                        type="button"
                        onClick={() => setSelectionsSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-view: Selected Teams */}
                {selectionsTeamFilter === 'selected' && (
                  filteredSelections.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4">College</th>
                            <th className="py-3 px-4">Problem Code</th>
                            <th className="py-3 px-4">Statement Title</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Project Submission</th>
                            <th className="py-3 px-4">Selected At</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                          {filteredSelections.map((sel) => (
                            <tr key={sel.Id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                {sel.TeamName}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                                {sel.College || 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[11px]">
                                  {sel.ProblemCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 max-w-xs truncate text-slate-800 dark:text-zinc-200 font-medium">
                                {sel.ProblemTitle}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  sel.SelectionType === 'auto'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {sel.SelectionType === 'auto' ? 'Auto-Assigned' : 'Manual Pick'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {sel.GithubRepoUrl || sel.LiveDemoUrl || sel.DrivePptUrl ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {sel.GithubRepoUrl && (
                                      <a
                                        href={sel.GithubRepoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-zinc-800 hover:bg-slate-800 text-[10px] font-bold"
                                        title="Open GitHub Repository"
                                      >
                                        <FolderGit2 className="w-3 h-3" />
                                        <span>Repo</span>
                                      </a>
                                    )}
                                    {sel.LiveDemoUrl && (
                                      <a
                                        href={sel.LiveDemoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[10px] font-bold"
                                        title="Open Live Hosted Demo"
                                      >
                                        <Globe className="w-3 h-3" />
                                        <span>Demo</span>
                                      </a>
                                    )}
                                    {sel.DrivePptUrl && (
                                      <a
                                        href={sel.DrivePptUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400 text-[10px] font-bold"
                                        title="Open Presentation Deck"
                                      >
                                        <FileText className="w-3 h-3 text-amber-500" />
                                        <span>Deck</span>
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {formatDate(sel.SelectedAt)} {formatTime(sel.SelectedAt)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReassign(sel)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50 text-[11px] font-bold transition cursor-pointer"
                                    title="Change Problem Statement"
                                  >
                                    <ArrowLeftRight className="h-3 w-3" />
                                    <span>Change PS</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSelection(sel.Id, sel.TeamName)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                    title="Remove Selection"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                      <ListChecks className="h-8 w-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {selectionsSearch ? 'No Selected Teams Match Search' : 'No Team Selections Yet'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {selectionsSearch ? 'Try a different search keyword.' : 'Teams will appear here once they select a problem statement or are assigned.'}
                      </p>
                    </div>
                  )
                )}

                {/* Sub-view: Pending Teams */}
                {selectionsTeamFilter === 'pending' && (
                  filteredUnselectedTeams.length > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            <strong>{unselectedTeamsList.length} teams</strong> have not selected any problem statement yet. You can assign each team manually below or use Auto-Assign above.
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-3 px-4">#</th>
                              <th className="py-3 px-4">Team Details</th>
                              <th className="py-3 px-4">College</th>
                              <th className="py-3 px-4">Team Leader</th>
                              <th className="py-3 px-4">Members</th>
                              <th className="py-3 px-4">Selection Status</th>
                              <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                            {filteredUnselectedTeams.map((team, idx) => (
                              <tr key={team.Id || team.TeamId || idx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {String(idx + 1).padStart(2, '0')}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {team.TeamName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    ID: #{team.Id || team.TeamId}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                                  {team.College || 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 dark:text-zinc-200">
                                    {team.LeaderName || 'Team Leader'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {team.LeaderEmail || team.Email || 'No email provided'}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px]">
                                    <Users className="w-3 h-3 text-slate-400" />
                                    {team.MemberCount || team.TeamSize || 1}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <Clock className="w-3 h-3" />
                                    Awaiting Selection
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAssignTeam(team)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Assign Statement</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-emerald-300/40 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-950/10 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {selectionsSearch ? 'No Pending Teams Match Search' : 'All Virtual Teams Are Assigned'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {selectionsSearch ? 'Try a different search keyword.' : 'Every registered virtual team has successfully selected or been assigned a problem statement.'}
                      </p>
                    </div>
                  )
                )}

                {/* Sub-view: All Virtual Teams */}
                {selectionsTeamFilter === 'all' && (
                  filteredAllVirtualTeams.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Team</th>
                            <th className="py-3 px-4">College</th>
                            <th className="py-3 px-4">Leader</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Assigned Problem Statement</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                          {filteredAllVirtualTeams.map((team, idx) => {
                            const teamIdNum = Number(team.Id || team.TeamId);
                            const sel = selections.find((s) => Number(s.TeamId || s.teamId) === teamIdNum);
                            return (
                              <tr key={teamIdNum || idx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {String(idx + 1).padStart(2, '0')}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                  {team.TeamName}
                                </td>
                                <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                                  {team.College || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                                  {team.LeaderName || 'Team Leader'}
                                </td>
                                <td className="py-3 px-4">
                                  {sel ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Selected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      <Clock className="w-3 h-3" />
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {sel ? (
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[11px]">
                                        {sel.ProblemCode}
                                      </span>
                                      <span className="truncate max-w-xs font-medium text-slate-800 dark:text-zinc-200">
                                        {sel.ProblemTitle}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 dark:text-zinc-500 italic text-[11px]">
                                      Not assigned yet
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {sel ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReassign(sel)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] font-bold transition cursor-pointer"
                                      >
                                        <ArrowLeftRight className="h-3 w-3" />
                                        <span>Change PS</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSelection(sel.Id, sel.TeamName)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                        title="Remove Selection"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssignTeam(team)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Assign Statement</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                      <Users className="h-8 w-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Virtual Teams Found</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        No registered teams have participation mode set to Virtual.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* VIEW MODE 2: BY PROBLEM STATEMENT (ACCORDION VIEW) */}
            {selectionsViewMode === 'statements' && (
              <div className="space-y-4">
                {/* Search & Collapse All Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search statements by code, title, theme..."
                      value={selectionsSearch}
                      onChange={(e) => setSelectionsSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    {selectionsSearch && (
                      <button
                        type="button"
                        onClick={() => setSelectionsSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium hidden md:inline">
                      {filteredProblemStatementsForSelections.length} Problem Statements • {selections.length} Total Assignments
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleAllPsAccordions}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
                    >
                      {problemStatements.length > 0 && problemStatements.every((ps) => expandedPsSelections[ps.Id]) ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse All</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Expand All</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Problem Statement Accordion Cards */}
                {filteredProblemStatementsForSelections.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProblemStatementsForSelections.map((ps) => {
                      const enrolled = psSelectionsMap[ps.Id] || [];
                      const isExpanded = !!expandedPsSelections[ps.Id];
                      const maxTeams = Number(ps.MaxTeams) || 5;
                      const isFull = enrolled.length >= maxTeams;

                      return (
                        <div
                          key={ps.Id}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs transition"
                        >
                          {/* Accordion Header */}
                          <div
                            onClick={() => handleTogglePsAccordion(ps.Id)}
                            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 select-none transition"
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black text-xs shrink-0 mt-0.5">
                                {ps.ProblemCode}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {ps.Title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {ps.Theme && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold">
                                      Theme: {ps.Theme}
                                    </span>
                                  )}
                                  {ps.Category && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                      {ps.Category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Capacity & Trigger */}
                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                              {/* Capacity Badge */}
                              <div className="text-right">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {enrolled.length}
                                  </span>
                                  <span className="text-slate-400">/</span>
                                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                                    {maxTeams} Teams
                                  </span>
                                </div>
                                <div className="text-[10px] mt-0.5 font-bold">
                                  {isFull ? (
                                    <span className="text-rose-500">Capacity Full</span>
                                  ) : (
                                    <span className="text-slate-400">
                                      {maxTeams - enrolled.length} slot{maxTeams - enrolled.length === 1 ? '' : 's'} available
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Assign Team Button */}
                              {!isFull && unselectedTeamsList.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignToPs(ps)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                  title="Assign an unassigned team to this problem statement"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Assign Team</span>
                                </button>
                              )}

                              {/* Expand/Collapse Chevron Button */}
                              <button
                                type="button"
                                onClick={() => handleTogglePsAccordion(ps.Id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                                title={isExpanded ? 'Collapse team list' : 'Expand team list'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Accordion Content: Enrolled Teams List */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/30 p-4 sm:p-5 space-y-3">
                              {ps.Description && (
                                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                                  <strong className="text-slate-800 dark:text-zinc-200 block mb-1">Challenge Brief:</strong>
                                  <p className="line-clamp-2">{ps.Description}</p>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Assigned Teams ({enrolled.length} of {maxTeams})</span>
                                </h5>
                                {!isFull && unselectedTeamsList.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAssignToPs(ps)}
                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Assign another pending team</span>
                                  </button>
                                )}
                              </div>

                              {enrolled.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                                      <tr>
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">Team Name</th>
                                        <th className="py-2.5 px-3">College</th>
                                        <th className="py-2.5 px-3">Selection Mode</th>
                                        <th className="py-2.5 px-3">Submissions</th>
                                        <th className="py-2.5 px-3">Selected At</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                      {enrolled.map((teamSel, idx) => (
                                        <tr key={teamSel.Id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                                            {String(idx + 1).padStart(2, '0')}
                                          </td>
                                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                                            {teamSel.TeamName}
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                                            {teamSel.College || 'N/A'}
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                              teamSel.SelectionType === 'auto'
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                              {teamSel.SelectionType === 'auto' ? 'Auto-Assigned' : 'Manual Pick'}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3">
                                            {teamSel.GithubRepoUrl || teamSel.LiveDemoUrl || teamSel.DrivePptUrl ? (
                                              <div className="flex items-center gap-1 flex-wrap">
                                                {teamSel.GithubRepoUrl && (
                                                  <a
                                                    href={teamSel.GithubRepoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-zinc-800 text-[9px] font-bold"
                                                    title="Open GitHub Repository"
                                                  >
                                                    <FolderGit2 className="w-2.5 h-2.5" />
                                                    Repo
                                                  </a>
                                                )}
                                                {teamSel.LiveDemoUrl && (
                                                  <a
                                                    href={teamSel.LiveDemoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold"
                                                    title="Open Live Hosted Demo"
                                                  >
                                                    <Globe className="w-2.5 h-2.5" />
                                                    Demo
                                                  </a>
                                                )}
                                                {teamSel.DrivePptUrl && (
                                                  <a
                                                    href={teamSel.DrivePptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[9px] font-bold"
                                                    title="Open Presentation Deck"
                                                  >
                                                    <FileText className="w-2.5 h-2.5 text-amber-500" />
                                                    Deck
                                                  </a>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 italic">
                                                Pending
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                            {formatDate(teamSel.SelectedAt)} {formatTime(teamSel.SelectedAt)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => handleOpenReassign(teamSel)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] font-bold transition cursor-pointer"
                                                title="Reassign to another statement"
                                              >
                                                <ArrowLeftRight className="h-3 w-3" />
                                                <span>Change PS</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveSelection(teamSel.Id, teamSel.TeamName)}
                                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                                title="Remove Team from Statement"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 text-center space-y-2">
                                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    No teams have selected this challenge yet (0 of {maxTeams} slots used).
                                  </p>
                                  {unselectedTeamsList.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAssignToPs(ps)}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Assign a Pending Team to this Statement</span>
                                    </button>
                                  ) : (
                                    <p className="text-[11px] text-slate-400">
                                      All registered virtual teams are already assigned to other challenges.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                    <Target className="h-8 w-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {selectionsSearch ? 'No Matching Problem Statements' : 'No Problem Statements Defined'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {selectionsSearch ? 'Try a different search keyword.' : 'Create or publish problem statements in the Problem Statements tab first.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* ============================================================ */}
        {/* TAB 5: PUBLISH WORKFLOW & SELECTION SETTINGS */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="p-6 sm:p-8 space-y-6 w-full">
            {/* Step 1: Themes Publishing */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
              <div className="flex items-center justify-between sm:flex-row flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-xs border border-emerald-500/20 shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Publish Hackathon Themes
                      {themePublished && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/30">
                          Live Active
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      When published, participants can preview the innovation tracks ({themes.length} themes currently defined).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePublishTheme(!themePublished)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 shadow-sm ${
                    themePublished
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20'
                  }`}
                >
                  {themePublished ? 'Unpublish Themes' : 'Publish Themes Now'}
                </button>
              </div>
            </div>
            {/* Step 2: Problem Statements Publishing */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-3">
              <div className="flex items-center justify-between sm:flex-row flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-xs border border-emerald-500/20 shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Publish Problem Statements & Open Selection
                      {psPublished && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/30">
                          Open For Selection
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {themePublished
                        ? `Opening this will allow registered teams to select their problem statement (${problemStatements.length} statements defined).`
                        : 'Hackathon themes must be published first before opening problem statement selection.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!themePublished}
                  onClick={() => handlePublishPS(!psPublished)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 shadow-sm ${
                    !themePublished
                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                      : psPublished
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {psPublished ? 'Close & Unpublish' : 'Publish Statements'}
                </button>
              </div>
            </div>
            {/* Selection Deadline Setting in Minutes */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Timer className="h-4 w-4 text-emerald-500" />
                    Problem Statement Selection Timer
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Set timer duration in minutes. Participants will see a live ticking countdown badge in their dashboard.
                  </p>
                </div>
                {adminTimerLeft && !adminTimerLeft.expired && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black animate-pulse">
                    <Timer className="h-3.5 w-3.5" />
                    <span>
                      {adminTimerLeft.hours > 0 ? `${adminTimerLeft.hours}h ` : ''}
                      {adminTimerLeft.minutes}m {adminTimerLeft.seconds}s remaining
                    </span>
                  </div>
                )}
                {adminTimerLeft && adminTimerLeft.expired && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
                    Timer Expired
                  </div>
                )}
              </div>
              {/* Expired & Unassigned Teams Callout */}
              {adminTimerLeft && adminTimerLeft.expired && unselectedTeamCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">Selection Window Closed</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400/80">
                        {unselectedTeamCount} teams have not selected a problem statement yet.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={autoAssigning}
                    onClick={handleAutoAssign}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-sm"
                  >
                    {autoAssigning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shuffle className="h-3 w-3" />}
                    <span>Auto-Assign Remaining {unselectedTeamCount} Teams</span>
                  </button>
                </div>
              )}
              {/* Quick Minutes Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Quick Presets:</span>
                {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDeadlineMinutes(mins);
                      handleSetDeadlineByMinutes(mins);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      deadlineMinutes === mins
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              {/* Custom Minutes Input & Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={deadlineMinutes}
                    onChange={(e) => setDeadlineMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="15"
                    className="w-24 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Minutes</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetDeadlineByMinutes(deadlineMinutes)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Start Timer ({deadlineMinutes} Min)
                </button>
                {publishStatus?.PSSelectionDeadline && (
                  <button
                    type="button"
                    onClick={handleClearDeadline}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 font-bold text-xs transition cursor-pointer border border-rose-500/20"
                  >
                    Clear Timer
                  </button>
                )}
              </div>
            </div>

            {/* Quick Bulk Import Banner */}
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Need to bulk upload Themes or Problem Statements?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Download our ready-made Excel demo template, fill in your tracks and challenges, and import them in one click.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExcelModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import from Excel</span>
              </button>
            </div>
          </div>
        )}
        {/* ============================================================ */}
        {/* TAB 6: REGISTERED VIRTUAL TEAMS */}
        {/* ============================================================ */}
        {activeTab === 'teams' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  All Virtual Track Registered Teams
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Teams registered with Participation Mode set to Virtual or Both ({filteredTeams.length} of {virtualTeams.length} shown)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team, leader, college..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <button
                  type="button"
                  disabled={isExportingExcel || virtualTeams.length === 0}
                  onClick={handleExportVirtualExcel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 shrink-0"
                  title="Download Virtual Track Registrations with all member details as styled Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isExportingExcel ? 'Exporting...' : 'Export Virtual Excel (.xlsx)'}</span>
                </button>
              </div>
            </div>
            {filteredTeams.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                No virtual teams found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4">Leader</th>
                      <th className="py-3 px-4">College</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Problem Statement</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {filteredTeams.map((team) => {
                      const teamSel = selections.find(s => s.TeamId === (team.Id || team.TeamId));
                      return (
                        <tr key={team.Id || team.TeamId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {team.TeamName}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200">{team.LeaderName || 'Lead'}</div>
                            <div className="text-[11px] text-slate-400">{team.LeaderEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{team.College || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400">{team.State}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Users className="h-3 w-3 text-slate-400" />
                              {team.MemberCount || team.TeamSize || 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {teamSel ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <Hash className="h-2.5 w-2.5" />
                                {teamSel.ProblemCode}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Not selected</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                              Virtual Track
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ============================================================ */}
        {/* TAB 7: SCHEDULE & MILESTONES */}
        {/* ============================================================ */}
        {activeTab === 'schedule' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  Virtual Day Agenda & Milestones
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Schedule of virtual rounds and evaluation phases
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {timelines.length} Milestones
              </span>
            </div>
            {timelines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {timelines.map((tl, index) => (
                  <div
                    key={tl.Id || index}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1.5"
                  >
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Calendar className="h-3 w-3" />
                      <span>{tl.TimelineDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">{tl.Heading}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {tl.Description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                No virtual timelines configured for this event.
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      {/* Admin Reassign / Assign Problem Statement Modal */}
      <AnimatePresence>
        {reassignModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {reassignModal.mode === 'reassign' && 'Change Problem Statement'}
                      {reassignModal.mode === 'assign_team' && 'Assign Problem Statement'}
                      {reassignModal.mode === 'assign_to_ps' && 'Assign Team to Statement'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {reassignModal.mode === 'reassign' && (
                        <>Reassign challenge for team: <strong className="text-slate-800 dark:text-zinc-200">{reassignModal.selection?.TeamName}</strong></>
                      )}
                      {reassignModal.mode === 'assign_team' && (
                        <>Select challenge for team: <strong className="text-slate-800 dark:text-zinc-200">{reassignModal.team?.TeamName}</strong></>
                      )}
                      {reassignModal.mode === 'assign_to_ps' && (
                        <>Enrolling team in challenge: <strong className="text-slate-800 dark:text-zinc-200">{reassignModal.targetPs?.ProblemCode}</strong></>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReassignModal({ open: false, mode: 'reassign', selection: null, team: null, targetPs: null, selectedPsId: '', targetTeamId: '' })}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {/* Currently Assigned Box (for reassign mode) */}
                {reassignModal.mode === 'reassign' && reassignModal.selection && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Currently Assigned:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {reassignModal.selection.ProblemCode}: {reassignModal.selection.ProblemTitle}
                    </p>
                  </div>
                )}

                {/* Target Statement Box (for assign_to_ps mode) */}
                {reassignModal.mode === 'assign_to_ps' && reassignModal.targetPs && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Target Problem Statement:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {reassignModal.targetPs.ProblemCode}: {reassignModal.targetPs.Title}
                    </p>
                    {reassignModal.targetPs.Theme && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                        Theme: {reassignModal.targetPs.Theme}
                      </span>
                    )}
                  </div>
                )}

                {/* Target Team Box (for assign_team mode) */}
                {reassignModal.mode === 'assign_team' && reassignModal.team && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-0.5">Team Details:</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {reassignModal.team.TeamName}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      College: {reassignModal.team.College || 'N/A'} • Lead: {reassignModal.team.LeaderName || 'N/A'}
                    </span>
                  </div>
                )}

                {/* Select Field: Problem Statement (when reassign or assign_team) */}
                {(reassignModal.mode === 'reassign' || reassignModal.mode === 'assign_team') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {reassignModal.mode === 'reassign' ? 'Select New Problem Statement' : 'Select Problem Statement to Assign'}
                    </label>
                    <select
                      value={reassignModal.selectedPsId}
                      onChange={(e) => setReassignModal(prev => ({ ...prev, selectedPsId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Problem Statement --</option>
                      {problemStatements.map((ps) => {
                        const count = (psSelectionsMap[ps.Id] || []).length;
                        const max = Number(ps.MaxTeams) || 5;
                        return (
                          <option key={ps.Id} value={ps.Id}>
                            {ps.ProblemCode}: {ps.Title} ({count} / {max} teams) {ps.Theme ? `[${ps.Theme}]` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Select Field: Team (when assign_to_ps) */}
                {reassignModal.mode === 'assign_to_ps' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Select Pending Team to Assign
                    </label>
                    <select
                      value={reassignModal.targetTeamId}
                      onChange={(e) => setReassignModal(prev => ({ ...prev, targetTeamId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Pending Team ({unselectedTeamsList.length} available) --</option>
                      {unselectedTeamsList.map((t) => (
                        <option key={t.Id || t.TeamId} value={t.Id || t.TeamId}>
                          {t.TeamName} {t.College ? `(${t.College})` : ''} - Lead: {t.LeaderName || t.LeaderEmail || 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setReassignModal({ open: false, mode: 'reassign', selection: null, team: null, targetPs: null, selectedPsId: '', targetTeamId: '' })}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    reassigning ||
                    (reassignModal.mode === 'reassign' && (!reassignModal.selectedPsId || String(reassignModal.selectedPsId) === String(reassignModal.selection?.ProblemStatementId))) ||
                    (reassignModal.mode === 'assign_team' && !reassignModal.selectedPsId) ||
                    (reassignModal.mode === 'assign_to_ps' && !reassignModal.targetTeamId)
                  }
                  onClick={handleConfirmReassign}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {reassigning
                    ? 'Processing...'
                    : reassignModal.mode === 'reassign'
                    ? 'Confirm & Reassign'
                    : 'Confirm & Assign'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* ============================================================ */}
        {/* MODAL: EXCEL BULK IMPORT THEMES & PROBLEM STATEMENTS */}
        {/* ============================================================ */}
        {showExcelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Bulk Upload Themes & Problem Statements
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Import multiple hackathon tracks and challenges at once via an Excel (.xlsx) spreadsheet or CSV.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowExcelModal(false);
                    setExcelFile(null);
                    setExcelPreview(null);
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Template Download Box */}
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Download Official Excel Demo Template
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Get the pre-styled Excel template with separate sheets for <strong>Problem Statements</strong> and <strong>Themes</strong> with sample data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadDemoTemplate}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Demo Template (.xlsx)</span>
                </button>
              </div>

              {/* On-Screen Demo Sheet Format Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-emerald-500" />
                    Excel Sheet Demo Format Guide
                  </h4>
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setDemoPreviewTab('ps')}
                      className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                        demoPreviewTab === 'ps'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Problem Statements Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoPreviewTab('themes')}
                      className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                        demoPreviewTab === 'themes'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Themes Sheet
                    </button>
                  </div>
                </div>

                {demoPreviewTab === 'ps' ? (
                  <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-emerald-900 text-white text-[11px] font-bold">
                            <th className="py-2.5 px-3 text-center border-r border-emerald-800/60">Problem Code *</th>
                            <th className="py-2.5 px-3 text-left border-r border-emerald-800/60">Theme *</th>
                            <th className="py-2.5 px-3 text-left border-r border-emerald-800/60">Problem Statement Title *</th>
                            <th className="py-2.5 px-3 text-center border-r border-emerald-800/60">Category</th>
                            <th className="py-2.5 px-3 text-left border-r border-emerald-800/60">Description</th>
                            <th className="py-2.5 px-3 text-center">Max Teams</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                          <tr className="bg-white dark:bg-zinc-900">
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">AI-01</td>
                            <td className="py-2 px-3 font-semibold">Artificial Intelligence & ML</td>
                            <td className="py-2 px-3 font-semibold">Automated Clinical Diagnostic Assistant</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Software</span></td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">AI assistant extracting EHR clinical notes for triage nurses.</td>
                            <td className="py-2 px-3 text-center font-bold">5</td>
                          </tr>
                          <tr className="bg-emerald-50/20 dark:bg-zinc-900/60">
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">BC-01</td>
                            <td className="py-2 px-3 font-semibold">Web3 & Blockchain</td>
                            <td className="py-2 px-3 font-semibold">Decentralized Academic Credential Verification</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">Software</span></td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">Zero-knowledge verifiable credentials for university diplomas.</td>
                            <td className="py-2 px-3 text-center font-bold">4</td>
                          </tr>
                          <tr className="bg-white dark:bg-zinc-900">
                            <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">IOT-01</td>
                            <td className="py-2 px-3 font-semibold">Smart Cities & IoT</td>
                            <td className="py-2 px-3 font-semibold">Acoustic Pipeline Micro-Leak Detection</td>
                            <td className="py-2 px-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">Hardware</span></td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">Low-power LoRa acoustic mesh sensing for potable water pipelines.</td>
                            <td className="py-2 px-3 text-center font-bold">3</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-emerald-900 text-white text-[11px] font-bold">
                            <th className="py-2.5 px-3 text-center border-r border-emerald-800/60">#</th>
                            <th className="py-2.5 px-3 text-left border-r border-emerald-800/60">Theme Name *</th>
                            <th className="py-2.5 px-3 text-left border-r border-emerald-800/60">Theme Description</th>
                            <th className="py-2.5 px-3 text-center">Display Order</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                          <tr className="bg-white dark:bg-zinc-900">
                            <td className="py-2 px-3 text-center font-bold text-slate-400">1</td>
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Artificial Intelligence & ML</td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">Machine learning, LLMs, computer vision, and autonomous agent systems.</td>
                            <td className="py-2 px-3 text-center font-bold">1</td>
                          </tr>
                          <tr className="bg-emerald-50/20 dark:bg-zinc-900/60">
                            <td className="py-2 px-3 text-center font-bold text-slate-400">2</td>
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Web3 & Blockchain</td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">Decentralized protocols, smart contracts, ZK-proofs, and digital identity.</td>
                            <td className="py-2 px-3 text-center font-bold">2</td>
                          </tr>
                          <tr className="bg-white dark:bg-zinc-900">
                            <td className="py-2 px-3 text-center font-bold text-slate-400">3</td>
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Smart Cities & IoT</td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">Urban automation, IoT sensors, green grid management, and smart mobility.</td>
                            <td className="py-2 px-3 text-center font-bold">3</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                  <strong>Tip:</strong> If a theme referenced in your Problem Statements does not exist yet, AYOJAN will automatically create it for you.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Select Excel or CSV File
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleExcelFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className="relative p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-900/40 text-center transition cursor-pointer group"
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleExcelFileSelect(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {excelFile ? excelFile.name : 'Drag and drop your spreadsheet here, or click to browse'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports .xlsx, .xls, and .csv files
                    </p>
                  </div>
                </div>
              </div>

              {/* Parsing Indicator */}
              {parsingExcel && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Parsing Excel workbook...</span>
                </div>
              )}

              {/* Parsed Preview Section */}
              {excelPreview && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Ready to Import
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {excelPreview.themes.length} Themes
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {excelPreview.problemStatements.length} Problem Statements
                      </span>
                    </div>
                  </div>

                  {/* Quick table of parsed items (first 5) */}
                  <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-xs bg-white dark:bg-zinc-950">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-[10px] font-bold">
                          <tr>
                            <th className="py-2 px-3 text-left">Code</th>
                            <th className="py-2 px-3 text-left">Title</th>
                            <th className="py-2 px-3 text-left">Theme</th>
                            <th className="py-2 px-3 text-center">Limit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                          {excelPreview.problemStatements.map((ps, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                              <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">{ps.ProblemCode}</td>
                              <td className="py-2 px-3 font-medium text-slate-900 dark:text-white truncate max-w-xs">{ps.Title}</td>
                              <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">{ps.Theme}</td>
                              <td className="py-2 px-3 text-center font-bold">{ps.MaxTeams}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setShowExcelModal(false);
                    setExcelFile(null);
                    setExcelPreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importingExcel || !excelPreview || !excelPreview.valid}
                  onClick={handleConfirmExcelImport}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {importingExcel ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Importing to Hackathon...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm & Import Records</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
