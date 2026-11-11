import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Settings,
  CheckCircle2,
  AlertCircle,
  Users,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Video,
  Info,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Milestone,
  Layers,
  FileText,
  Award,
  Camera,
  Building2,
  User,
  QrCode,
  CreditCard,
  IndianRupee,
  Upload,
  Loader2,
  BedDouble,
  Utensils,
  Target,
  Check,
  Lightbulb,
  Timer,
  Eye,
  EyeOff,
  Palette,
  Code,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useToast from '../../../../Hooks/useToast';
import useAuth from '../../../../Hooks/useAuth';
import EventSponsorsManager from '../../../../components/Organisms/EventSponsorsManager';
import EventGalleryManager from '../../../../components/Organisms/EventGalleryManager';
import { getTrackVisibility, isSoloTeamSize, validateEventDates, getEventTypeInfo } from '../../../../lib/utils';

const EXPO_LIFECYCLE_STEPS = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'CONFIGURATION', label: 'Configured' },
  { id: 'REGISTRATION_OPEN', label: 'Registration Open' },
  { id: 'PROJECT_REVIEW', label: 'Dossier Review' },
  { id: 'EVENT_READY', label: 'Floor Ready' },
  { id: 'ONGOING', label: 'Live Expo' },
  { id: 'EVALUATION', label: 'Jury Evaluation' },
  { id: 'RESULTS_PUBLISHED', label: 'Results Published' },
  { id: 'COMPLETED', label: 'Valedictory Done' }
];

export default function AdminEventSettings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const storedAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  })();
  const [currentEventId, setCurrentEventId] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('admin') || '{}');
      return stored.EventId || user?.EventId || null;
    } catch {
      return user?.EventId || null;
    }
  });
  const adminEventId = currentEventId || storedAdmin?.EventId || user?.EventId || null;
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(currentEventId ? Number(currentEventId) : null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAdminQr, setUploadingAdminQr] = useState(false);
  const [uploadingIdBg, setUploadingIdBg] = useState(false);
  const [uploadingTeamBg, setUploadingTeamBg] = useState(false);
  const [activeTab, setActiveTab] = useState('physical'); // 'virtual' | 'physical' | 'general' | 'workshop_config' | 'prerequisites'

  // Project Expo specific config & domains state
  const [expoConfig, setExpoConfig] = useState({
    ParticipationType: 'Both',
    MinTeamSize: 1,
    MaxTeamSize: 4,
    AllowedDepartments: [],
    AllowedBranches: [],
    AllowedYears: [],
    SubmissionDeadline: '',
    MaxSubmissions: 50,
    TotalBooths: 20,
    BoothPrefix: 'STALL-',
    PresentationDurationMinutes: 15,
    Guidelines: '',
    RequiredDocuments: '',
    Status: 'CONFIGURATION'
  });
  const [expoDomains, setExpoDomains] = useState([]);
  const [newDomainName, setNewDomainName] = useState('');
  const [savingExpoStatus, setSavingExpoStatus] = useState(false);
  // Editable settings form state
  const [settingsForm, setSettingsForm] = useState({
    EventName: '',
    Location: '',
    Description: '',
    Requirements: '',
    Facilities: '',
    Highlights: '',
    StartDate: '',
    EndDate: '',
    VirtualRegistrationOpen: 1,
    PhysicalRegistrationOpen: 1,
    RegistrationOpen: 1,
    VirtualRegistrationStart: '',
    VirtualRegistrationEnd: '',
    PhysicalRegistrationStart: '',
    PhysicalRegistrationEnd: '',
    RegistrationStart: '',
    RegistrationEnd: '',
    TeamSize: '4',
    VirtualStatus: 'NOT_STARTED',
    VirtualMeetUrl: '',
    HackathonMode: 'Physical',
    AccommodationEnabled: 0,
    FoodEnabled: 0,
    IDCardEnabled: 0,
    AccommodationFee: 0,
    FoodFee: 0,
    FacilitiesPackageFee: 0,
    AdminUpiId: '',
    AdminPaymentQr: '',
    AdminPaymentInstructions: '',
    IdCardBackground: '',
    TeamCardBackground: '',
    PhysicalPSMode: 'organizer_provided',
    PhysicalPSPublished: 0,
    PhysicalPSSelectionDeadline: null,
    PhysicalPSMaxTeamsPerStatement: 5
  });
  const typeInfo = getEventTypeInfo(eventData?.EventType || storedAdmin?.EventType);
  // Track visibility is controlled strictly by the event's configured HackathonMode.
  const {
    mode: currentMode,
    isBoth: isBothMode,
    isVirtual: isVirtualMode,
    isPhysical: isPhysicalMode,
    showVirtual,
    showPhysical
  } = getTrackVisibility(
    eventData?.HackathonMode || settingsForm.HackathonMode,
    eventData?.Location
  );
  // Track Timelines State
  const [timelines, setTimelines] = useState([]);
  const [loadingTimelines, setLoadingTimelines] = useState(false);
  const [timelineTab, setTimelineTab] = useState('all'); // 'all' | 'Virtual' | 'Physical'
  const [editingTimelineId, setEditingTimelineId] = useState(null);
  const [savingTimeline, setSavingTimeline] = useState(false);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [timelineForm, setTimelineForm] = useState({
    Track: isPhysicalMode ? 'Physical' : 'Virtual',
    TimelineDate: '',
    Heading: '',
    Description: '',
    OrderIndex: 1
  });
  useEffect(() => {
    if (typeInfo.isProjectExpo) {
      setActiveTab('expo_config');
    } else if (typeInfo.isAlumni) {
      setActiveTab('alumni_config');
    } else if (typeInfo.isSeminar) {
      setActiveTab('seminar_config');
    } else if (typeInfo.isWebinar) {
      setActiveTab('webinar_config');
    } else if (typeInfo.isWorkshop) {
      setActiveTab('workshop_config');
    } else if (isPhysicalMode) {
      setActiveTab('physical');
    } else if (isVirtualMode || isBothMode) {
      setActiveTab('virtual');
    }
  }, [typeInfo.isProjectExpo, typeInfo.isAlumni, typeInfo.isSeminar, typeInfo.isWebinar, typeInfo.isWorkshop, isVirtualMode, isPhysicalMode, isBothMode]);
  useEffect(() => {
    const handleEventUpdated = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        const newEvId = e?.detail?.Id || stored.EventId;
        if (newEvId) {
          setCurrentEventId(Number(newEvId));
          setSelectedEventId(Number(newEvId));
          loadEventSettings(Number(newEvId));
        }
      } catch (err) {
        console.error('Error handling admin-event-updated in AdminEventSettings:', err);
      }
    };
    window.addEventListener('admin-event-updated', handleEventUpdated);
    window.addEventListener('storage', handleEventUpdated);
    return () => {
      window.removeEventListener('admin-event-updated', handleEventUpdated);
      window.removeEventListener('storage', handleEventUpdated);
    };
  }, []);
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setLoading(true);
        if (currentEventId) {
          const evId = Number(currentEventId);
          setSelectedEventId(evId);
          await loadEventSettings(evId);
          const res = await fetch(`${API_BASE_URL}/api/events/${evId}`);
          if (res.ok && isMounted) {
            const data = await res.json();
            const target = data.event || data;
            setEventsList([target]);
          }
        } else {
          const res = await fetch(`${API_BASE_URL}/api/events`);
          if (res.ok && isMounted) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.events || []);
            setEventsList(list);
            if (list.length > 0) {
              const activeId = selectedEventId || list[0].Id;
              setSelectedEventId(activeId);
              await loadEventSettings(activeId);
            } else {
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [currentEventId]);
  const loadEventSettings = async (id) => {
    const targetId = id || currentEventId;
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${targetId}`);
      if (!res.ok) throw new Error('Failed to load event details');
      const data = await res.json();
      const ev = Array.isArray(data) ? data[0] : (data.event || data);
      setEventData(ev);
      const evType = getEventTypeInfo(ev.EventType);
      if (evType.isProjectExpo) {
        setActiveTab('expo_config');
      } else if (evType.isAlumni) {
        setActiveTab('alumni_config');
      } else if (evType.isSeminar) {
        setActiveTab('seminar_config');
      } else if (evType.isWebinar) {
        setActiveTab('webinar_config');
      } else if (evType.isWorkshop) {
        setActiveTab('workshop_config');
      } else if (ev.HackathonMode === 'Physical') {
        setActiveTab('physical');
      } else {
        setActiveTab('virtual');
      }
      if (ev.HackathonMode) {
        try {
          const curAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
          if (curAdmin.HackathonMode !== ev.HackathonMode) {
            curAdmin.HackathonMode = ev.HackathonMode;
            localStorage.setItem('admin', JSON.stringify(curAdmin));
            window.dispatchEvent(new Event('admin-event-updated'));
          }
        } catch (e) {}
      }
      loadTimelines(targetId);
      setSettingsForm({
        EventName: ev.EventName || '',
        Location: ev.Location || '',
        Description: ev.Description || '',
        Requirements: ev.Requirements || '',
        Facilities: ev.Facilities || '',
        Highlights: ev.Highlights || '',
        StartDate: ev.StartDate ? ev.StartDate.split('T')[0] : '',
        EndDate: ev.EndDate ? ev.EndDate.split('T')[0] : '',
        VirtualRegistrationOpen: ev.VirtualRegistrationOpen !== undefined ? (ev.VirtualRegistrationOpen ? 1 : 0) : 1,
        PhysicalRegistrationOpen: ev.PhysicalRegistrationOpen !== undefined ? (ev.PhysicalRegistrationOpen ? 1 : 0) : 1,
        RegistrationOpen: ev.RegistrationOpen !== undefined ? (ev.RegistrationOpen ? 1 : 0) : 1,
        VirtualRegistrationStart: ev.VirtualRegistrationStart || '',
        VirtualRegistrationEnd: ev.VirtualRegistrationEnd || '',
        PhysicalRegistrationStart: ev.PhysicalRegistrationStart || '',
        PhysicalRegistrationEnd: ev.PhysicalRegistrationEnd || '',
        RegistrationStart: ev.RegistrationStart || '',
        RegistrationEnd: ev.RegistrationEnd || '',
        TeamSize: ev.TeamSize || '4',
        VirtualStatus: ev.VirtualStatus || 'NOT_STARTED',
        IsMeetActive: ev.VirtualStatus === 'LIVE' ? 1 : 0,
        VirtualMeetUrl: ev.VirtualMeetUrl || '',
        HackathonMode: ev.HackathonMode || 'Physical',
        AccommodationEnabled: ev.AccommodationEnabled === true || Number(ev.AccommodationEnabled) === 1 ? 1 : 0,
        FoodEnabled: ev.FoodEnabled === true || Number(ev.FoodEnabled) === 1 ? 1 : 0,
        IDCardEnabled: ev.IDCardEnabled === true || Number(ev.IDCardEnabled) === 1 ? 1 : 0,
        AccommodationFee: ev.AccommodationFee !== undefined ? ev.AccommodationFee : 0,
        FoodFee: ev.FoodFee !== undefined ? ev.FoodFee : 0,
        FacilitiesPackageFee: ev.FacilitiesPackageFee !== undefined ? ev.FacilitiesPackageFee : 0,
        AdminUpiId: ev.AdminUpiId || '',
        AdminPaymentQr: ev.AdminPaymentQr || '',
        AdminPaymentInstructions: ev.AdminPaymentInstructions || '',
        IdCardBackground: ev.IdCardBackground || '',
        TeamCardBackground: ev.TeamCardBackground || '',
        PhysicalPSMode: ev.PhysicalPSMode || 'organizer_provided',
        PhysicalPSPublished: ev.PhysicalPSPublished !== undefined ? ev.PhysicalPSPublished : 0,
        PhysicalPSSelectionDeadline: ev.PhysicalPSSelectionDeadline || null,
        PhysicalPSMaxTeamsPerStatement: ev.PhysicalPSMaxTeamsPerStatement || 5
      });

      // Load Project Expo specific configuration & domains
      if (evType.isProjectExpo) {
        try {
          const [cfgRes, domRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/project-expo/${targetId}/config`),
            fetch(`${API_BASE_URL}/api/project-expo/${targetId}/domains`)
          ]);
          const cfgData = await cfgRes.json();
          const domData = await domRes.json();
          if (cfgData.success && cfgData.config) {
            const pType = cfgData.config.ParticipationType || 'Both';
            let minSz = parseInt(cfgData.config.MinTeamSize, 10);
            let maxSz = parseInt(cfgData.config.MaxTeamSize, 10);
            if (pType === 'Individual') {
              minSz = 1;
              maxSz = 1;
            } else if (pType === 'Team') {
              minSz = Math.max(2, isNaN(minSz) ? 2 : minSz);
              maxSz = Math.max(minSz, isNaN(maxSz) ? 4 : maxSz);
            } else {
              minSz = Math.max(1, isNaN(minSz) ? 1 : minSz);
              maxSz = Math.max(minSz, isNaN(maxSz) ? 4 : maxSz);
            }
            setExpoConfig({
              ...cfgData.config,
              ParticipationType: pType,
              MinTeamSize: minSz,
              MaxTeamSize: maxSz,
              SubmissionDeadline: cfgData.config.SubmissionDeadline
                ? cfgData.config.SubmissionDeadline.split('T')[0]
                : ''
            });
            setSettingsForm(prev => ({
              ...prev,
              TeamSize: minSz === maxSz ? `${minSz}` : `${minSz}-${maxSz}`
            }));
          }
          if (domData.success && Array.isArray(domData.domains)) {
            setExpoDomains(domData.domains);
          }
        } catch (expoErr) {
          console.warn('Could not load project expo config/domains:', expoErr);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not load event settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpoStatus = async (newStatus) => {
    const targetId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!targetId) return;
    try {
      setSavingExpoStatus(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${targetId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Status transition failed');
      }
      setExpoConfig((prev) => ({ ...prev, Status: newStatus }));
      toast.success(`Expo lifecycle updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSavingExpoStatus(false);
    }
  };

  const handleAddDomain = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!newDomainName.trim() || !targetId) return;
    const updated = [...expoDomains, { DomainName: newDomainName.trim() }];
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${targetId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: updated })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add domain');
      }
      toast.success(`Added "${newDomainName.trim()}"`);
      setNewDomainName('');
      setExpoDomains(data.domains || updated);
    } catch (err) {
      toast.error(err.message || 'Error adding domain');
    }
  };

  const handleRemoveDomain = async (index) => {
    const targetId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!targetId) return;
    const updated = expoDomains.filter((_, idx) => idx !== index);
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${targetId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: updated })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove domain');
      }
      toast.success('Domain removed');
      setExpoDomains(data.domains || updated);
    } catch (err) {
      toast.error(err.message || 'Error removing domain');
    }
  };
  const handleUploadAdminQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAdminQr(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment QR upload failed');
      const qrUrl = data.fileUrl || data.url;
      setSettingsForm((prev) => ({ ...prev, AdminPaymentQr: qrUrl }));
      toast.success('Payment QR code uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload QR code');
    } finally {
      setUploadingAdminQr(false);
    }
  };
  const handleUploadIdBg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingIdBg(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ID card background upload failed');
      const url = data.fileUrl || data.url;
      setSettingsForm((prev) => ({ ...prev, IdCardBackground: url }));
      toast.success('ID Card background uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload ID card background');
    } finally {
      setUploadingIdBg(false);
    }
  };
  const handleUploadTeamBg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingTeamBg(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Team card background upload failed');
      const url = data.fileUrl || data.url;
      setSettingsForm((prev) => ({ ...prev, TeamCardBackground: url }));
      toast.success('Team Card background uploaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload Team card background');
    } finally {
      setUploadingTeamBg(false);
    }
  };
  const loadTimelines = async (eventId) => {
    if (!eventId) return;
    try {
      setLoadingTimelines(true);
      const res = await fetch(`${API_BASE_URL}/api/event_timelines/event/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setTimelines(Array.isArray(data) ? data : (data.timelines || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimelines(false);
    }
  };
  const handleTimelineInputChange = (e) => {
    const { name, value } = e.target;
    setTimelineForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEditTimeline = (item) => {
    setEditingTimelineId(item.Id);
    setTimelineForm({
      Track: item.Track || 'Virtual',
      TimelineDate: item.TimelineDate || '',
      Heading: item.Heading || '',
      Description: item.Description || '',
      OrderIndex: item.OrderIndex !== undefined ? item.OrderIndex : 1
    });
    setShowTimelineForm(true);
  };
  const handleCancelTimelineEdit = () => {
    setEditingTimelineId(null);
    setShowTimelineForm(false);
    setTimelineForm({
      Track: activeTab === 'physical' ? 'Physical' : 'Virtual',
      TimelineDate: '',
      Heading: '',
      Description: '',
      OrderIndex: (timelines.length || 0) + 1
    });
  };
  const handleSaveTimeline = async (e) => {
    if (e) e.preventDefault();
    const targetEventId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!targetEventId) {
      toast.error('Please select an event first');
      return;
    }
    if (!timelineForm.Heading.trim()) {
      toast.error('Please enter a milestone heading/title');
      return;
    }
    try {
      setSavingTimeline(true);
      if (editingTimelineId) {
        const res = await fetch(`${API_BASE_URL}/api/event_timelines/${editingTimelineId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(timelineForm)
        });
        if (!res.ok) throw new Error('Failed to update timeline milestone');
        toast.success('Milestone updated successfully!');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/event_timelines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...timelineForm,
            EventId: targetEventId
          })
        });
        if (!res.ok) throw new Error('Failed to create timeline milestone');
        toast.success('New milestone added successfully!');
      }
      handleCancelTimelineEdit();
      setShowTimelineForm(false);
      await loadTimelines(targetEventId);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error saving timeline milestone');
    } finally {
      setSavingTimeline(false);
    }
  };
  const handleDeleteTimeline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timeline milestone?')) return;
    const targetEventId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/event_timelines/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete milestone');
      toast.success('Timeline milestone removed');
      await loadTimelines(targetEventId);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error deleting milestone');
    }
  };
  const handleToggle = async (key) => {
    const targetEventId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!targetEventId) {
      toast.error('No event selected');
      return;
    }
    const currentVal = settingsForm[key];
    const newVal = currentVal === 1 ? 0 : 1;
    // Immediately update local state
    setSettingsForm((prev) => ({
      ...prev,
      [key]: newVal
    }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${targetEventId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newVal })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update track status');
      }
      const resData = await res.json();
      if (resData.event) {
        setEventData(resData.event);
      }
      const trackName =
        key === 'VirtualRegistrationOpen'
          ? 'Virtual Track'
          : key === 'PhysicalRegistrationOpen'
          ? 'Physical Track'
          : key === 'AccommodationEnabled'
          ? 'Accommodation'
          : key === 'FoodEnabled'
          ? 'Food selection'
          : key === 'IDCardEnabled'
          ? 'ID card generation'
          : key === 'PhysicalPSPublished'
          ? 'Physical Problem Statements'
          : 'All Registrations';
      if (key === 'PhysicalPSPublished') {
        toast.success(newVal === 1 ? 'Physical Problem Statements published to participants!' : 'Physical Problem Statements unpublished (draft).');
      } else if (key.endsWith('Enabled')) {
        toast.success(`${trackName} ${newVal === 1 ? 'enabled' : 'disabled'}.`);
      } else if (newVal === 1) {
        toast.success(`${trackName} registrations resumed & opened!`);
      } else {
        toast.success(`${trackName} registrations paused!`);
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setSettingsForm((prev) => ({
        ...prev,
        [key]: currentVal
      }));
      toast.error(err.message || 'Error updating registration status');
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSave = async () => {
    const targetEventId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
    if (!targetEventId) {
      toast.error('Please select an event first');
      return;
    }
    const payload = { ...settingsForm };
    if (typeInfo.isProjectExpo) {
      if (expoConfig.ParticipationType === 'Individual') {
        payload.TeamSize = '1';
      } else if (expoConfig.ParticipationType === 'Team') {
        const min = Math.max(2, expoConfig.MinTeamSize || 2);
        const max = Math.max(min, expoConfig.MaxTeamSize || 4);
        payload.TeamSize = min === max ? `${min}` : `${min}-${max}`;
      } else {
        const min = Math.max(1, expoConfig.MinTeamSize || 1);
        const max = Math.max(min, expoConfig.MaxTeamSize || 4);
        payload.TeamSize = min === max ? `${min}` : `${min}-${max}`;
      }
      if (!payload.HackathonMode) payload.HackathonMode = 'Physical';
      if (!payload.Location || payload.Location.trim() === '') {
        payload.Location = 'Main University Innovation & Expo Center';
      }
      payload.RegistrationOpen = settingsForm.RegistrationOpen !== undefined ? settingsForm.RegistrationOpen : 1;
      payload.PhysicalRegistrationOpen = payload.RegistrationOpen;
      payload.VirtualRegistrationOpen = payload.RegistrationOpen;
      payload.VirtualRegistrationStart = payload.RegistrationStart;
      payload.PhysicalRegistrationStart = payload.RegistrationStart;
      payload.VirtualRegistrationEnd = payload.RegistrationEnd;
      payload.PhysicalRegistrationEnd = payload.RegistrationEnd;
      payload.VirtualStartDate = payload.StartDate;
      payload.PhysicalStartDate = payload.StartDate;
      payload.VirtualEndDate = payload.EndDate;
      payload.PhysicalEndDate = payload.EndDate;
    } else if (typeInfo.isAlumni || typeInfo.isWebinar || typeInfo.isWorkshop || typeInfo.isSeminar) {
      payload.TeamSize = '1';
      if (typeInfo.isAlumni) {
        payload.HackathonMode = 'Physical';
        if (!payload.Location || payload.Location.trim() === '') {
          payload.Location = 'Main University Convention Center';
        }
        // Accommodation is strictly disabled for alumni events
        payload.AccommodationEnabled = 0;
        payload.AccommodationFee = 0;
      } else if (typeInfo.isWebinar) {
        payload.HackathonMode = 'Virtual';
        if (!payload.Location || payload.Location.trim() === '') {
          payload.Location = 'Virtual Live Broadcast Room';
        }
      } else if (typeInfo.isSeminar) {
        payload.HackathonMode = 'Physical';
        if (!payload.Location || payload.Location.trim() === '') {
          payload.Location = 'Main University Auditorium';
        }
      }
      payload.RegistrationOpen = settingsForm.RegistrationOpen !== undefined ? settingsForm.RegistrationOpen : 1;
      payload.PhysicalRegistrationOpen = payload.RegistrationOpen;
      payload.VirtualRegistrationOpen = payload.RegistrationOpen;
      // Force-sync track fields to match alumni/seminar/webinar/workshop fields so old dates don't linger
      payload.VirtualRegistrationStart = payload.RegistrationStart;
      payload.PhysicalRegistrationStart = payload.RegistrationStart;
      payload.VirtualRegistrationEnd = payload.RegistrationEnd;
      payload.PhysicalRegistrationEnd = payload.RegistrationEnd;
      payload.VirtualStartDate = payload.StartDate;
      payload.PhysicalStartDate = payload.StartDate;
      payload.VirtualEndDate = payload.EndDate;
      payload.PhysicalEndDate = payload.EndDate;
      if (payload.IsMeetActive === 1) {
        payload.VirtualStatus = 'LIVE';
      } else if (payload.IsMeetActive === 0 && payload.VirtualStatus === 'LIVE') {
        payload.VirtualStatus = 'NOT_STARTED';
      }
    } else {
      // Validate TeamSize for hackathons
      const ts = String(settingsForm.TeamSize).trim();
      if (!ts) {
        toast.error('Please enter a valid Team Size (e.g. "4" or "2-4")');
        return;
      }
    }
    // Validate Event and Registration dates accurately based on event type
    let regStart, regEnd, eventStart, eventEnd;
    if (typeInfo.isProjectExpo || typeInfo.isAlumni || typeInfo.isWebinar || typeInfo.isWorkshop || typeInfo.isSeminar) {
      regStart = payload.RegistrationStart || payload.PhysicalRegistrationStart;
      regEnd = payload.RegistrationEnd || payload.PhysicalRegistrationEnd;
      eventStart = payload.StartDate || payload.PhysicalStartDate;
      eventEnd = payload.EndDate || payload.PhysicalEndDate;
    } else if (payload.HackathonMode === 'Virtual') {
      regStart = payload.VirtualRegistrationStart || payload.RegistrationStart;
      regEnd = payload.VirtualRegistrationEnd || payload.RegistrationEnd;
      eventStart = payload.VirtualStartDate || payload.StartDate;
      eventEnd = payload.VirtualEndDate || payload.EndDate;
    } else if (payload.HackathonMode === 'Physical') {
      regStart = payload.PhysicalRegistrationStart || payload.RegistrationStart;
      regEnd = payload.PhysicalRegistrationEnd || payload.RegistrationEnd;
      eventStart = payload.PhysicalStartDate || payload.StartDate;
      eventEnd = payload.PhysicalEndDate || payload.EndDate;
    } else {
      regStart = payload.RegistrationStart || payload.PhysicalRegistrationStart || payload.VirtualRegistrationStart;
      regEnd = payload.RegistrationEnd || payload.PhysicalRegistrationEnd || payload.VirtualRegistrationEnd;
      eventStart = payload.StartDate;
      eventEnd = payload.EndDate;
    }
    const dateErr = validateEventDates({
      registrationStart: regStart,
      registrationEnd: regEnd,
      eventStart: eventStart,
      eventEnd: eventEnd
    });
    if (dateErr) {
      toast.error(dateErr);
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${targetEventId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update settings');
      }
      const resData = await res.json();
      if (resData.event) {
        setEventData(resData.event);
        try {
          const curAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
          if (resData.event.HackathonMode) {
            curAdmin.HackathonMode = resData.event.HackathonMode;
            localStorage.setItem('admin', JSON.stringify(curAdmin));
          }
        } catch (e) {}
      }

      // Also persist Project Expo specific configurations
      if (typeInfo.isProjectExpo) {
        try {
          await fetch(`${API_BASE_URL}/api/project-expo/${targetEventId}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expoConfig)
          });
        } catch (expoSaveErr) {
          console.warn('Failed to save project expo specific config:', expoSaveErr);
        }
      }

      // Invalidate admin dashboard cache and notify views
      try {
        localStorage.removeItem(`admin_dashboard_cache_${targetEventId}`);
      } catch (e) {}
      window.dispatchEvent(new Event('admin-event-updated'));
      toast.success('Event settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save event settings');
    } finally {
      setSaving(false);
    }
  };
  const renderCardBackgroundsSection = () => (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            ID Card &amp; Team Card Custom Backgrounds
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Upload custom background designs for participant A6 ID cards and official desk team display cards.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 pt-2">
        {/* ID Card Background (A6 Portrait) */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Participant ID Card Background
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Standard ISO 216 A6 Portrait (105 × 148 mm or 1240 × 1748 px)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
              A6 Portrait
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-center overflow-hidden shrink-0">
              {settingsForm.IdCardBackground ? (
                <img
                  src={settingsForm.IdCardBackground}
                  alt="ID Card Background"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span className="text-[9px] block leading-tight">Default Cyber Theme</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition shadow-sm">
                  {uploadingIdBg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {uploadingIdBg
                      ? 'Uploading...'
                      : settingsForm.IdCardBackground
                      ? 'Change Background'
                      : 'Upload Background'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadIdBg}
                    disabled={uploadingIdBg}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => navigate(selectedEventId ? `/admin/id-card-designer?eventId=${selectedEventId}` : '/admin/id-card-designer')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 text-xs font-bold transition shadow-sm cursor-pointer"
                  title="Open Visual Drag-and-Drop ID Card Designer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Visual ID Studio</span>
                </button>
              </div>
              {settingsForm.IdCardBackground && (
                <button
                  type="button"
                  onClick={() => setSettingsForm((prev) => ({ ...prev, IdCardBackground: '' }))}
                  className="block text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Reset to Default Theme
                </button>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Replaces the ID pass background with your custom branding or institution artwork.
              </p>
            </div>
          </div>
        </div>
        {/* Team Card Background (Desk Landscape) */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Team Display Card Background
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Landscape Desk Display (~1200 × 750 px or 2400 × 1500 px)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
              Landscape
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-36 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-center overflow-hidden shrink-0">
              {settingsForm.TeamCardBackground ? (
                <img
                  src={settingsForm.TeamCardBackground}
                  alt="Team Card Background"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span className="text-[9px] block leading-tight">Default Cyber Grid</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer transition shadow-sm">
                  {uploadingTeamBg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {uploadingTeamBg
                      ? 'Uploading...'
                      : settingsForm.TeamCardBackground
                      ? 'Change Background'
                      : 'Upload Background'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadTeamBg}
                    disabled={uploadingTeamBg}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSoloTeamSize(settingsForm.TeamSize)) {
                      navigate(selectedEventId ? `/admin/team-card-designer?eventId=${selectedEventId}` : '/admin/team-card-designer');
                    }
                  }}
                  disabled={isSoloTeamSize(settingsForm.TeamSize)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition shadow-sm ${
                    !isSoloTeamSize(settingsForm.TeamSize)
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 cursor-pointer'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-850 text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
                  }`}
                  title={
                    !isSoloTeamSize(settingsForm.TeamSize)
                      ? 'Open Visual Drag-and-Drop Team Card Designer'
                      : 'Team Card Designer is disabled for Individual events'
                  }
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Visual Team Studio</span>
                  {isSoloTeamSize(settingsForm.TeamSize) && (
                    <span className="text-[10px] text-zinc-500">(Team Only)</span>
                  )}
                </button>
              </div>
              {settingsForm.TeamCardBackground && (
                <button
                  type="button"
                  onClick={() => setSettingsForm((prev) => ({ ...prev, TeamCardBackground: '' }))}
                  className="block text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Reset to Default Theme
                </button>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Custom graphic template for desk team cards during presentations and table placement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderTimelineSection = (trackName) => {
    const trackTimelines = timelines
      .filter((t) => t.Track === trackName)
      .sort((a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0));
    const isPhysical = trackName === 'Physical';
    return (
      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Milestone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {trackName} Track Timelines &amp; Roadmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Milestones and round schedules designated exclusively for the {trackName} track.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showTimelineForm && timelineForm.Track === trackName) {
                handleCancelTimelineEdit();
              } else {
                setEditingTimelineId(null);
                setTimelineForm({
                  Track: trackName,
                  TimelineDate: '',
                  Heading: '',
                  Description: '',
                  OrderIndex: (trackTimelines.length || 0) + 1
                });
                setShowTimelineForm(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
          >
            {showTimelineForm && timelineForm.Track === trackName ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{showTimelineForm && timelineForm.Track === trackName ? 'Close Form' : `Add ${trackName} Milestone`}</span>
          </button>
        </div>
        {/* Collapsible Milestone Editor Form */}
        <AnimatePresence>
          {showTimelineForm && timelineForm.Track === trackName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSaveTimeline}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-zinc-950 border border-emerald-500/30 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingTimelineId ? `Edit ${trackName} Milestone` : `Create New ${trackName} Milestone`}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelTimelineEdit}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Milestone Date / Day</label>
                    <input
                      type="text"
                      name="TimelineDate"
                      value={timelineForm.TimelineDate}
                      onChange={handleTimelineInputChange}
                      placeholder="e.g. 2026-10-20 or Day 1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Milestone Title / Heading *</label>
                    <input
                      type="text"
                      name="Heading"
                      value={timelineForm.Heading}
                      onChange={handleTimelineInputChange}
                      placeholder="e.g. Project Idea Submissions"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Order / Sequence Index</label>
                    <input
                      type="number"
                      name="OrderIndex"
                      value={timelineForm.OrderIndex}
                      onChange={handleTimelineInputChange}
                      min="1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Description / Details</label>
                  <textarea
                    name="Description"
                    value={timelineForm.Description}
                    onChange={handleTimelineInputChange}
                    rows="2"
                    placeholder={`Detailed explanation of what participants in the ${trackName} track must complete...`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelTimelineEdit}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTimeline}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {savingTimeline ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingTimelineId ? 'Update Milestone' : 'Save Milestone'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Milestones List */}
        {loadingTimelines ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-emerald-500" />
            <span>Loading {trackName} milestones...</span>
          </div>
        ) : trackTimelines.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
            <Milestone className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No milestones configured for {trackName} Track yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Add {trackName} Milestone" above to schedule track stages.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {trackTimelines.map((item, idx) => (
              <div
                key={item.Id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-black border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/30 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    #{item.OrderIndex || idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.Heading}
                      </h5>
                      {item.TimelineDate && (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                          • {item.TimelineDate}
                        </span>
                      )}
                    </div>
                    {item.Description && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                        {item.Description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditTimeline(item)}
                    className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-emerald-600 hover:border-emerald-500/50 transition cursor-pointer"
                    title="Edit milestone"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTimeline(item.Id)}
                    className="p-1.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition cursor-pointer"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-zinc-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Event Settings & Registration Controls
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage track registrations, pause/resume controls, and team size formation policies.
              </p>
            </div>
          </div>
        </div>
      </div>
      {loading || (!eventData && (adminEventId || selectedEventId)) ? (
        <div className="p-12 text-center text-slate-400 dark:text-zinc-500 text-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <span>Loading event settings...</span>
        </div>
      ) : !eventData ? (
        <div className="p-8 text-center rounded-3xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800">
          <AlertCircle className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Event Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Please select an event to configure settings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Event Banner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Event Target
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {eventData.EventName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Mode: <strong className="text-slate-700 dark:text-zinc-300">{eventData.HackathonMode || settingsForm.HackathonMode || 'Not specified'}</strong> • Status: <strong className="text-slate-700 dark:text-zinc-300">{eventData.EventStatus || 'Active'}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadEventSettings(selectedEventId)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-bold text-slate-600 dark:text-zinc-300 transition"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save All Settings</span>
              </button>
            </div>
          </div>
          {/* Seamless Navigation Tabs */}
          <div className="relative pt-2">
            <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
              {(typeInfo.isProjectExpo
                ? [
                    {
                      id: 'expo_config',
                      label: 'Project Expo & Stall Controls',
                      icon: Sliders,
                      status: (settingsForm.RegistrationOpen === 1 || settingsForm.PhysicalRegistrationOpen === 1) ? 'Open' : 'Paused',
                    },
                    {
                      id: 'expo_domains',
                      label: 'Technical Domains & Tracks',
                      icon: Layers,
                      status: expoDomains.length > 0 ? `${expoDomains.length} Tracks` : null,
                    },
                    {
                      id: 'expo_guidelines',
                      label: 'Exhibition Rules & Stall Policies',
                      icon: FileText,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Expo Sponsors & Benefactors',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Exhibition Photo Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ]
                : typeInfo.isAlumni
                ? [
                    {
                      id: 'alumni_config',
                      label: 'Alumni Meet & Venue Controls',
                      icon: Sliders,
                      status: (settingsForm.RegistrationOpen === 1 || settingsForm.PhysicalRegistrationOpen === 1) ? 'RSVPs Open' : 'RSVPs Paused',
                    },
                    {
                      id: 'reunion_policies',
                      label: 'Reunion Policy & Welcome Guide',
                      icon: FileText,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Partners & Benefactors',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Homecoming Memories Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ]
                : typeInfo.isSeminar
                ? [
                    {
                      id: 'seminar_config',
                      label: 'Seminar & Hall Settings',
                      icon: Sliders,
                      status: (settingsForm.RegistrationOpen === 1 || settingsForm.PhysicalRegistrationOpen === 1) ? 'Open' : 'Paused',
                    },
                    {
                      id: 'conference_guidelines',
                      label: 'Conference Guidelines & Themes',
                      icon: FileText,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Sponsors & Partners',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Seminar Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ]
                : typeInfo.isWebinar
                ? [
                    {
                      id: 'webinar_config',
                      label: 'Webinar & Live Broadcast',
                      icon: Radio,
                      status: settingsForm.VirtualStatus === 'LIVE' ? 'LIVE NOW' : (settingsForm.RegistrationOpen === 1 || settingsForm.VirtualRegistrationOpen === 1) ? 'Open' : 'Paused',
                    },
                    {
                      id: 'keynote_settings',
                      label: 'Keynotes & Delegate Guidelines',
                      icon: FileText,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Sponsors & Partners',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Webinar Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ]
                : typeInfo.isWorkshop
                ? [
                    {
                      id: 'workshop_config',
                      label: 'Workshop & Registration',
                      icon: Sliders,
                      status: (settingsForm.RegistrationOpen === 1 || settingsForm.PhysicalRegistrationOpen === 1) ? 'Open' : 'Paused',
                    },
                    {
                      id: 'prerequisites',
                      label: 'Prerequisites & Software',
                      icon: FileText,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Sponsors & Partners',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Workshop Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ]
                : [
                    {
                      id: 'virtual',
                      label: 'Virtual Track Settings',
                      icon: Globe,
                      status: settingsForm.VirtualRegistrationOpen === 1 ? 'Open' : 'Paused',
                    },
                    {
                      id: 'physical',
                      label: 'Physical Track Settings',
                      icon: MapPin,
                      status: settingsForm.PhysicalRegistrationOpen === 1 ? 'Open' : 'Paused',
                    },
                    {
                      id: 'general',
                      label: 'General & Policy Rules',
                      icon: Sliders,
                      status: null,
                    },
                    {
                      id: 'sponsors',
                      label: 'Sponsors & Partners',
                      icon: Award,
                      status: null,
                    },
                    {
                      id: 'gallery',
                      label: 'Event Gallery',
                      icon: Camera,
                      status: null,
                    },
                  ].filter((tab) => {
                    if (tab.id === 'virtual') return showVirtual;
                    if (tab.id === 'physical') return showPhysical;
                    return true;
                  })
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="settingsFolderTabActivePill"
                        className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      >
                        <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0" />
                    )}
                    <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'text-slate-900 dark:text-white font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}>
                      <TabIcon className={`w-4 h-4 ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-zinc-500'
                      }`} />
                      <span>{tab.label}</span>
                      {tab.status && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                          tab.status === 'Open'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-200/60 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-300/40 dark:border-zinc-700'
                        }`}>
                          {tab.status}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Main Content Area */}
            <div className="bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-6 relative z-0">
              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ── PROJECT EXPO CONFIG TAB ──────────────────────────────── */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'expo_config' && (
                <div className="space-y-6">
                  {/* Expo Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sliders className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Project Expo Controls &amp; Exhibition Venue
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Manage exhibition lifecycle status, floor stalls, exhibitor eligibility, submission deadlines, and venue rules.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.RegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.RegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.RegistrationOpen === 1 ? 'Registration Open' : 'Registration Paused'}
                    </span>
                  </div>

                  {/* ── EVENT LIFECYCLE PROGRESS PIPELINE ── */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Milestone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Event Lifecycle Pipeline</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Click any stage to transition the operational status for this exhibition
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20">
                        Current Status: {expoConfig.Status || 'CONFIGURATION'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {EXPO_LIFECYCLE_STEPS.map((step, idx) => {
                        const isCurrent = (expoConfig.Status || 'CONFIGURATION') === step.id;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            disabled={savingExpoStatus}
                            onClick={() => handleUpdateExpoStatus(step.id)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                              isCurrent
                                ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/40'
                            }`}
                          >
                            <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mb-0.5">Stage 0{idx + 1}</p>
                            <p className="text-xs font-semibold">{step.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Shortcuts to Expo Management Lifecycle */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/expo/booths')}
                      className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Stalls Matrix
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Floor plan &amp; stall assignments
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/expo/projects')}
                      className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Submissions
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Review abstracts &amp; repos
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/expo/schedules')}
                      className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Jury Demo Slots
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Presentation timetable &amp; juries
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/expo/results')}
                      className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Results &amp; Awards
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Declare winners &amp; cash prizes
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Registration Availability & Deadlines Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Exhibitor Registration &amp; Submission Deadlines</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new project teams and solo exhibitors cannot register or edit project abstracts.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = settingsForm.RegistrationOpen === 1 ? 0 : 1;
                          setSettingsForm((prev) => ({
                            ...prev,
                            RegistrationOpen: nextVal,
                            PhysicalRegistrationOpen: nextVal,
                            VirtualRegistrationOpen: nextVal
                          }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.RegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.RegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Open Registrations</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Registration Opening Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationStart"
                          value={settingsForm.RegistrationStart ? settingsForm.RegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Registration Closing Deadline</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationEnd"
                          value={settingsForm.RegistrationEnd ? settingsForm.RegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>

                    {/* Project Submission Deadline & Cap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Dossier Submission Deadline</span>
                        </label>
                        <input
                          type="date"
                          value={expoConfig.SubmissionDeadline || ''}
                          onChange={(e) => setExpoConfig(prev => ({ ...prev, SubmissionDeadline: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Max Project Submissions Cap</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={expoConfig.MaxSubmissions || 50}
                          onChange={(e) => setExpoConfig(prev => ({ ...prev, MaxSubmissions: parseInt(e.target.value, 10) || 50 }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exhibition Venue & Schedule Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Exhibition Schedule &amp; Venue</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Expo Start Date</label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Expo End Date</label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Exhibition Venue / Location Hall
                        </label>
                        <input
                          type="text"
                          name="Location"
                          placeholder="e.g. University Tech Innovation Pavilion, Hall A &amp; Courtyard"
                          value={settingsForm.Location || ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Participation Type
                        </label>
                        <select
                          value={expoConfig.ParticipationType || 'Both'}
                          onChange={(e) => {
                            const pType = e.target.value;
                            if (pType === 'Individual') {
                              setExpoConfig(prev => ({
                                ...prev,
                                ParticipationType: pType,
                                MinTeamSize: 1,
                                MaxTeamSize: 1
                              }));
                              setSettingsForm(prev => ({ ...prev, TeamSize: '1' }));
                            } else if (pType === 'Team') {
                              // Team Exhibition Only: Min must be at least 2
                              const currentMax = Math.max(2, expoConfig.MaxTeamSize || 4);
                              const currentMin = 2;
                              setExpoConfig(prev => ({
                                ...prev,
                                ParticipationType: pType,
                                MinTeamSize: currentMin,
                                MaxTeamSize: currentMax
                              }));
                              setSettingsForm(prev => ({
                                ...prev,
                                TeamSize: currentMin === currentMax ? `${currentMin}` : `${currentMin}-${currentMax}`
                              }));
                            } else {
                              // Both (Individual Solo & Teams): Min resets to 1 so solo can participate
                              const currentMax = Math.max(1, expoConfig.MaxTeamSize || 4);
                              const currentMin = 1;
                              setExpoConfig(prev => ({
                                ...prev,
                                ParticipationType: pType,
                                MinTeamSize: currentMin,
                                MaxTeamSize: currentMax
                              }));
                              setSettingsForm(prev => ({
                                ...prev,
                                TeamSize: currentMin === currentMax ? `${currentMin}` : `${currentMin}-${currentMax}`
                              }));
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-medium cursor-pointer"
                        >
                          <option value="Both">Both (Individual Solo &amp; Teams)</option>
                          <option value="Team">Team Exhibition Only (Min 2 Members)</option>
                          <option value="Individual">Individual Solo Only (1 Member)</option>
                        </select>
                      </div>
                    </div>

                    {expoConfig.ParticipationType !== 'Individual' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                            <span>Min Team Members</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {expoConfig.ParticipationType === 'Team' ? 'Min 2 for Team Only' : 'Starts from 1 (Solo allowed)'}
                            </span>
                          </label>
                          <input
                            type="number"
                            min={expoConfig.ParticipationType === 'Team' ? 2 : 1}
                            max="10"
                            value={expoConfig.MinTeamSize ?? (expoConfig.ParticipationType === 'Team' ? 2 : 1)}
                            onChange={(e) => {
                              const floor = expoConfig.ParticipationType === 'Team' ? 2 : 1;
                              const minVal = Math.max(floor, parseInt(e.target.value, 10) || floor);
                              const maxVal = Math.max(minVal, expoConfig.MaxTeamSize || minVal);
                              setExpoConfig(prev => ({ ...prev, MinTeamSize: minVal, MaxTeamSize: maxVal }));
                              setSettingsForm(prev => ({ ...prev, TeamSize: minVal === maxVal ? `${minVal}` : `${minVal}-${maxVal}` }));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                            <span>Max Team Members</span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Effective Range: {(expoConfig.MinTeamSize || (expoConfig.ParticipationType === 'Team' ? 2 : 1)) === (expoConfig.MaxTeamSize || 4)
                                ? `${expoConfig.MinTeamSize || (expoConfig.ParticipationType === 'Team' ? 2 : 1)} Members`
                                : expoConfig.ParticipationType === 'Team'
                                  ? `${expoConfig.MinTeamSize || 2} to ${expoConfig.MaxTeamSize || 4} Members (Team Only)`
                                  : `${expoConfig.MinTeamSize || 1} to ${expoConfig.MaxTeamSize || 4} Members`}
                            </span>
                          </label>
                          <input
                            type="number"
                            min={expoConfig.ParticipationType === 'Team' ? 2 : 1}
                            max="10"
                            value={expoConfig.MaxTeamSize || (expoConfig.ParticipationType === 'Team' ? 4 : 4)}
                            onChange={(e) => {
                              const floor = expoConfig.ParticipationType === 'Team' ? 2 : 1;
                              const maxVal = Math.max(floor, parseInt(e.target.value, 10) || floor);
                              const minVal = Math.min(Math.max(floor, expoConfig.MinTeamSize || floor), maxVal);
                              setExpoConfig(prev => ({ ...prev, MinTeamSize: minVal, MaxTeamSize: maxVal }));
                              setSettingsForm(prev => ({ ...prev, TeamSize: minVal === maxVal ? `${minVal}` : `${minVal}-${maxVal}` }));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Solo Exhibition selected — Team size is locked to <strong>1 Member (Solo)</strong> per project.</span>
                      </div>
                    )}
                  </div>

                  {/* Stall Parameters, Hardware Amenities & Requirements Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Stall Capacity, Presentation Pitch &amp; Hardware Support</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Total Exhibition Stalls
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={expoConfig.TotalBooths || 25}
                          onChange={(e) => setExpoConfig(prev => ({ ...prev, TotalBooths: parseInt(e.target.value, 10) || 25 }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Stall Code Prefix
                        </label>
                        <input
                          type="text"
                          value={expoConfig.BoothPrefix || 'STALL-'}
                          onChange={(e) => setExpoConfig(prev => ({ ...prev, BoothPrefix: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Pitch Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={expoConfig.PresentationDurationMinutes || 15}
                          onChange={(e) => setExpoConfig(prev => ({ ...prev, PresentationDurationMinutes: parseInt(e.target.value, 10) || 15 }))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Required Documents Checklist (CSV)
                      </label>
                      <input
                        type="text"
                        value={expoConfig.RequiredDocuments || ''}
                        onChange={(e) => setExpoConfig(prev => ({ ...prev, RequiredDocuments: e.target.value }))}
                        placeholder="e.g. Project Abstract (PDF), Final Presentation (PPT), Working Demo Video"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Facilities Provided at Each Stall
                        </label>
                        <textarea
                          name="Facilities"
                          rows={4}
                          value={settingsForm.Facilities || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. 1x Standard 230V Power Socket, 6x3 ft Exhibition Table, 2 Chairs, High-Speed Wi-Fi, A1 Poster Display Stand."
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Exhibitor Requirements (What to Bring)
                        </label>
                        <textarea
                          name="Requirements"
                          rows={4}
                          value={settingsForm.Requirements || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. Working hardware prototype, extension power cord, laptop for presentation, printed project summary posters."
                          className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Settings Action Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save All Project Expo Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ── PROJECT EXPO DOMAINS TAB ─────────────────────────────── */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'expo_domains' && (
                <div className="space-y-6">
                  {/* Domains Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Technical Domains &amp; Innovation Tracks
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Define exhibition tracks for categorization, project submissions, and jury scoring specialization.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20">
                      {expoDomains.length} Active Tracks
                    </span>
                  </div>

                  {/* Add New Domain Form */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Create New Innovation Domain</span>
                    </h3>
                    <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="e.g. Biomedical Devices, Quantum Computing, Agritech &amp; Sustainability"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition w-full"
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Domain</span>
                      </button>
                    </form>
                  </div>

                  {/* Existing Domains Grid */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Current Exhibition Tracks ({expoDomains.length})
                    </h3>
                    {expoDomains.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs">
                        No domains created yet. Add your first exhibition track above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {expoDomains.map((dom, idx) => (
                          <div
                            key={dom.Id || idx}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/40 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                {dom.DomainName}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDomain(idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer shrink-0"
                              title={`Delete ${dom.DomainName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ── PROJECT EXPO GUIDELINES TAB ──────────────────────────── */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {activeTab === 'expo_guidelines' && (
                <div className="space-y-6">
                  {/* Guidelines Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Exhibition Rules &amp; Stall Policies
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Publish exhibition timelines, prototype safety precautions, poster presentation guidelines, and jury review rules.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Day-of Expo Schedule & Highlights */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Expo Timeline &amp; Key Event Highlights</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      These highlights appear on the participant event pass and public exhibition page.
                    </p>
                    <textarea
                      name="Highlights"
                      rows={5}
                      value={settingsForm.Highlights || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. 08:30 AM: Stall Setup &amp; Verification | 10:00 AM: Inaugural Exhibition Showcase | 11:30 AM - 03:00 PM: Jury Evaluation Demo Slots | 03:30 PM: Public &amp; Industry Walkthrough | 05:00 PM: Grand Valedictory &amp; Awards"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-none"
                    />
                  </div>
                  {/* Complete Expo Guidelines & Prototype Safety Rules */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Exhibition Guidelines &amp; Prototype Safety Regulations</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Provide detailed information on acceptable prototype equipment, safety measures, poster sizing, and exhibition etiquette.
                    </p>
                    <textarea
                      name="Description"
                      rows={8}
                      value={settingsForm.Description || ''}
                      onChange={handleInputChange}
                      placeholder="Enter detailed guidelines: e.g.
1. All working prototypes must be tested prior to expo day.
2. High-voltage hardware (>24V) must be properly insulated and enclosed.
3. Drone or mobile robotics demonstrations must occur strictly within designated testing safety nets.
4. Each team must keep at least one team member at the stall throughout public showcase hours.
5. Code repositories and presentation decks must be uploaded before the submission window closes."
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs leading-relaxed text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y font-sans"
                    />
                  </div>
                  {/* Save Guidelines Action Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save Exhibition Guidelines</span>
                    </button>
                  </div>
                </div>
              )}
              {/* WEBINAR CONFIG TAB */}
              {activeTab === 'webinar_config' && (
                <div className="space-y-6">
                  {/* Webinar Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Radio className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Webinar Controls &amp; Live Broadcast Settings
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Manage live streaming room URL, broadcast readiness, delegate registrations, and official pass generation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${
                        settingsForm.RegistrationOpen === 1
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.RegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {settingsForm.RegistrationOpen === 1 ? 'Registrations Open' : 'Registrations Paused'}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${
                        settingsForm.IsMeetActive === 1
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500 dark:text-zinc-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.IsMeetActive === 1 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                        {settingsForm.IsMeetActive === 1 ? 'Broadcast Live' : 'Standby'}
                      </span>
                    </div>
                  </div>
                  {/* Webinar Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Webinar Delegate Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new delegates cannot register for this webinar keynote on the public portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = settingsForm.RegistrationOpen === 1 ? 0 : 1;
                          setSettingsForm((prev) => ({
                            ...prev,
                            RegistrationOpen: nextVal,
                            PhysicalRegistrationOpen: nextVal,
                            VirtualRegistrationOpen: nextVal
                          }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.RegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.RegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Webinar Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open Registrations</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Delegate Registration Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationStart"
                          value={settingsForm.RegistrationStart ? settingsForm.RegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Delegate Registration Deadline Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationEnd"
                          value={settingsForm.RegistrationEnd ? settingsForm.RegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Webinar Schedule Dates Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Webinar Broadcast Schedule</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Webinar Start Date *
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Webinar End Date *
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Live Stream Room Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-zinc-800">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Live Broadcast Room &amp; Streaming URL</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          Broadcast channel link for confirmed delegates. Accepts YouTube Live, Zoom Webinar, Google Meet, or Microsoft Teams.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = settingsForm.IsMeetActive === 1 ? 0 : 1;
                          const nextStatus = nextVal === 1 ? 'LIVE' : 'NOT_STARTED';
                          if (nextVal === 1 && (!settingsForm.VirtualMeetUrl || !settingsForm.VirtualMeetUrl.trim())) {
                            toast.error('Please enter a valid Live Stream / Meeting URL before going live.');
                            return;
                          }
                          setSettingsForm((prev) => ({
                            ...prev,
                            IsMeetActive: nextVal,
                            VirtualStatus: nextStatus
                          }));
                          const targetEventId = selectedEventId ? Number(selectedEventId) : (adminEventId ? Number(adminEventId) : null);
                          if (targetEventId) {
                            try {
                              await Promise.all([
                                fetch(`${API_BASE_URL}/api/events/${targetEventId}/virtual-status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ VirtualStatus: nextStatus })
                                }),
                                fetch(`${API_BASE_URL}/api/events/${targetEventId}/virtual-meet`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ VirtualMeetUrl: (settingsForm.VirtualMeetUrl || '').trim() })
                                })
                              ]);
                              if (nextVal === 1) {
                                toast.success('Webinar is now LIVE! Meeting link is active for delegates.');
                              } else {
                                toast.info('Webinar live broadcast set to Standby.');
                              }
                            } catch (err) {
                              console.error('Error toggling live broadcast:', err);
                            }
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.IsMeetActive === 1
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        <Radio className="h-4 w-4" />
                        <span>{settingsForm.IsMeetActive === 1 ? 'End Live Broadcast (Set Standby)' : 'Go Live / Broadcast On-Air'}</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                        <span>Live Stream / Meeting URL</span>
                        {settingsForm.VirtualMeetUrl && (
                          <a
                            href={settingsForm.VirtualMeetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>Test Live Broadcast Stream</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </label>
                      <input
                        type="url"
                        name="VirtualMeetUrl"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx or https://youtube.com/live/..."
                        value={settingsForm.VirtualMeetUrl || ''}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-mono"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        This URL will be accessible to registered delegates in their dashboard and verified digital pass when the broadcast goes live.
                      </p>
                    </div>
                  </div>
                  {/* ID Card Pass Toggle */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Digital Delegate Pass &amp; Certificate Eligibility</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Allow registered delegates to generate their verified digital webinar pass with security QR code.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('IDCardEnabled')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          settingsForm.IDCardEnabled === 1
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-black text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {settingsForm.IDCardEnabled === 1 ? '• Delegate Pass Enabled' : 'Delegate Pass Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* KEYNOTE SETTINGS TAB */}
              {activeTab === 'keynote_settings' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Keynote Overview, Syllabus &amp; Speaker Synopsis
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Set the webinar topic description, speaker highlights, agenda chapters, and technical joining guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Webinar Title & Overview */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Webinar / Keynote Session Title *
                      </label>
                      <input
                        type="text"
                        name="EventName"
                        placeholder="e.g. Next-Gen Generative AI in Production: Architecture, Scalability & Safety"
                        value={settingsForm.EventName || ''}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Webinar Overview &amp; Abstract *
                      </label>
                      <textarea
                        name="Description"
                        rows={4}
                        placeholder="Provide an engaging overview of the keynote, featured insights, and who will benefit most from attending..."
                        value={settingsForm.Description || ''}
                        onChange={handleInputChange}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                      />
                    </div>
                  </div>
                  {/* Keynote Highlights & Agenda */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Keynote Highlights, Agenda &amp; Speaker Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Break down keynote topics, featured industry speakers, agenda timeline, and delegate takeaways.
                    </p>
                    <textarea
                      name="Highlights"
                      rows={5}
                      placeholder="e.g.&#10;• Keynote Address by Leading Industry Experts&#10;• Live Demonstrations &amp; Real-World Case Studies&#10;• Framework Comparison &amp; Production Best Practices&#10;• Moderated Audience Q&amp;A Session"
                      value={settingsForm.Highlights || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Joining Guidelines & Technical Requirements */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Delegate Joining Guidelines &amp; Technical Requirements</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Specify browser compatibility, audio recommendations, live interaction rules, and certificate criteria.
                    </p>
                    <textarea
                      name="Facilities"
                      rows={4}
                      placeholder="e.g.&#10;• High-speed internet connection (minimum 5 Mbps recommended)&#10;• Supported browsers: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari&#10;• Use headphones/earphones for optimal keynote audio clarity&#10;• Questions can be submitted live in the Q&amp;A stream panel"
                      value={settingsForm.Facilities || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                </div>
              )}
              {/* WORKSHOP CONFIG TAB */}
              {activeTab === 'workshop_config' && (
                <div className="space-y-6">
                  {/* Workshop Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sliders className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Workshop Controls &amp; Delivery Settings
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Configure attendee registration availability, schedule dates, online meet links, campus venue/lab, and passes.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.RegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.RegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.RegistrationOpen === 1 ? 'Registrations Open' : 'Registrations Paused'}
                    </span>
                  </div>
                  {/* Workshop Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Workshop Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new participants cannot register for this workshop on the public event portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = settingsForm.RegistrationOpen === 1 ? 0 : 1;
                          setSettingsForm((prev) => ({
                            ...prev,
                            RegistrationOpen: nextVal,
                            PhysicalRegistrationOpen: nextVal,
                            VirtualRegistrationOpen: nextVal
                          }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.RegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.RegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Workshop Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open Registrations</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Registration Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationStart"
                          value={settingsForm.RegistrationStart ? settingsForm.RegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Registration Deadline Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationEnd"
                          value={settingsForm.RegistrationEnd ? settingsForm.RegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Workshop Schedule & Delivery Mode Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Workshop Dates &amp; Delivery Mode</span>
                    </h3>
                    {/* Schedule Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Workshop Start Date *
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Workshop End Date *
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                    {/* Mode Selector */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Workshop Delivery Format
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'Physical', label: 'In-Person Lab', desc: 'Conducted on campus in computer lab / hall' },
                          { id: 'Virtual', label: 'Online Live Stream', desc: 'Conducted over Google Meet, Zoom or Teams' },
                          { id: 'Both', label: 'Hybrid Mode', desc: 'On-campus lab attendees + Live virtual stream' }
                        ].map((m) => {
                          const isSel = (settingsForm.HackathonMode || 'Physical').toLowerCase() === m.id.toLowerCase();
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSettingsForm((prev) => ({ ...prev, HackathonMode: m.id }))}
                              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                                isSel
                                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">{m.label}</span>
                                {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{m.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Venue & Meet Link Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Campus Venue / Lab Room Name</span>
                        </label>
                        <input
                          type="text"
                          name="Location"
                          placeholder="e.g. CSE Dept - Lab 3, Ground Floor"
                          value={settingsForm.Location || ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Live Meeting URL (Google Meet / Zoom)</span>
                        </label>
                        <input
                          type="url"
                          name="VirtualMeetUrl"
                          placeholder="https://meet.google.com/abc-defg-hij"
                          value={settingsForm.VirtualMeetUrl || ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Workshop Description Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Workshop Overview &amp; Curriculum Description</span>
                    </h3>
                    <textarea
                      name="Description"
                      rows={4}
                      placeholder="Describe what attendees will learn in this workshop, topics covered, practical hands-on exercises, etc..."
                      value={settingsForm.Description || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* ID Card Pass Toggle */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Digital Attendee Pass &amp; ID Card Generation
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Allow registered attendees to download their official workshop entry pass with QR code verification.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('IDCardEnabled')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          settingsForm.IDCardEnabled === 1
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-black text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {settingsForm.IDCardEnabled === 1 ? '● ID Card Enabled' : 'ID Card Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* WORKSHOP PREREQUISITES TAB */}
              {activeTab === 'prerequisites' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Workshop Prerequisites &amp; Software Guidelines
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Set the required software packages, developer tools, hardware recommendations, and learning outcomes.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Required Software & Tools */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Required Software &amp; Tools to Pre-Install</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      List software packages, compilers, IDEs, and dependencies attendees must have ready before attending.
                    </p>
                    <textarea
                      name="Requirements"
                      rows={5}
                      placeholder="e.g.&#10;• Python 3.11+ installed from python.org&#10;• Visual Studio Code with Python and Jupyter extensions&#10;• Git CLI configured&#10;• Google Chrome browser"
                      value={settingsForm.Requirements || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition font-mono resize-y"
                    />
                  </div>
                  {/* Hardware & Laptop Guidelines */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Laptop &amp; Equipment Guidelines</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Specify hardware requirements, chargers, or lab facilities provided by the organizers.
                    </p>
                    <textarea
                      name="Facilities"
                      rows={4}
                      placeholder="e.g.&#10;• Bring personal laptop with charger (min 8GB RAM recommended)&#10;• High-speed Wi-Fi network credentials will be provided at the entry desk&#10;• Backup systems available in Lab 3 if required"
                      value={settingsForm.Facilities || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Key Learning Outcomes & Takeaways */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Key Learning Outcomes &amp; Takeaways</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Highlight the skills, projects, and certifications attendees will take away.
                    </p>
                    <textarea
                      name="Highlights"
                      rows={4}
                      placeholder="e.g.&#10;• Build and deploy 2 production-ready projects&#10;• Official Workshop Certificate of Completion&#10;• Access to downloadable code repositories & slides"
                      value={settingsForm.Highlights || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                </div>
              )}
              {/* ALUMNI CONFIG TAB */}
              {activeTab === 'alumni_config' && (
                <div className="space-y-6">
                  {/* Alumni Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sliders className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Alumni Meet Controls &amp; Banquet Venue
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Configure alumni RSVP availability, homecoming dates, convention banquet hall, and digital gate passes.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.RegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.RegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.RegistrationOpen === 1 ? 'RSVPs Open' : 'RSVPs Paused'}
                    </span>
                  </div>
                  {/* Alumni RSVP Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Alumni RSVP Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, alumni cannot register new RSVPs or download gate entry passes from the portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = settingsForm.RegistrationOpen === 1 ? 0 : 1;
                          setSettingsForm((prev) => ({
                            ...prev,
                            RegistrationOpen: nextVal,
                            PhysicalRegistrationOpen: nextVal,
                            VirtualRegistrationOpen: nextVal
                          }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.RegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.RegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Alumni RSVPs</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open RSVPs</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: RSVP Opening Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationStart"
                          value={settingsForm.RegistrationStart ? settingsForm.RegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: RSVP Closing Deadline</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationEnd"
                          value={settingsForm.RegistrationEnd ? settingsForm.RegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Reunion Schedule & Banquet Venue Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Reunion Schedule &amp; Banquet Venue</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Alumni Meet Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Alumni Meet End Date</span>
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Banquet Hall Venue &amp; Campus Location</span>
                      </label>
                      <input
                        type="text"
                        name="Location"
                        placeholder="e.g. Main Convention Center, Platinum Banquet Hall, Campus East"
                        value={settingsForm.Location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  {/* Alumni Hospitality, Banquet Lunch & Digital Gate Passes */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Reunion Hospitality &amp; Digital Passes</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Configure reunion banquet dinner service and QR digital entry badges. (Accommodation requests are strictly disabled for this alumni event).
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Gala Banquet & Lunch Service */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Gala Banquet / Lunch Included</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.FoodEnabled === 1}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                FoodEnabled: e.target.checked ? 1 : 0
                              }))
                            }
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Includes access to high tea, homecoming buffet lunch, and reunion dinner.
                        </p>
                        {settingsForm.FoodEnabled === 1 && (
                          <div className="pt-2">
                            <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Banquet Contribution Fee (INR - 0 for Complimentary)</label>
                            <input
                              type="number"
                              name="FoodFee"
                              value={settingsForm.FoodFee || 0}
                              onChange={handleInputChange}
                              className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                      {/* ID Pass & Badge Generation */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Digital Alumni Pass &amp; Badge</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.IDCardEnabled === 1}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                IDCardEnabled: e.target.checked ? 1 : 0
                              }))
                            }
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Enables printable homecoming entry passes and QR scanner verification at entrance desks.
                        </p>
                      </div>
                    </div>
                    {/* Alumni Giving / UPI ID */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Alumni Association / Voluntary Giving UPI ID</span>
                        </label>
                        <input
                          type="text"
                          name="AdminUpiId"
                          placeholder="e.g. alumni.giving@oksbi or reunion@upi"
                          value={settingsForm.AdminUpiId || ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* REUNION POLICIES TAB */}
              {activeTab === 'reunion_policies' && (
                <div className="space-y-6">
                  {/* Reunion Overview */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>About the Reunion &amp; Welcome Message</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Provide a warm welcome note from the Alumni Association and an overview of this year's homecoming themes.
                    </p>
                    <textarea
                      name="Description"
                      rows={5}
                      placeholder="e.g. Welcome back to campus! The Grand Alumni Meet 2026 brings together alumni across all batches to reconnect with professors, batchmates, and campus traditions. Join us for a memorable weekend of nostalgia, camaraderie, and celebration..."
                      value={settingsForm.Description || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Eligible Batches & Eligibility Guidelines */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Target Graduating Batches &amp; Cohort Eligibility</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Specify graduating year cohorts, milestone jubilee anniversary batches, and RSVP eligibility criteria.
                    </p>
                    <textarea
                      name="Requirements"
                      rows={4}
                      placeholder="e.g.&#10;• Open to all graduates from Class of 2012 through Class of 2025.&#10;• Silver Jubilee special felicitation for the Class of 2001.&#10;• Prior RSVP registration is mandatory to ensure banquet catering arrangements."
                      value={settingsForm.Requirements || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Family & Guest Policies (+1 Rules) */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Family &amp; Guest Policies (+1 Hospitality)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Guidelines for spouse/children accompaniment, seating, campus parking, and check-in assistance.
                    </p>
                    <textarea
                      name="Facilities"
                      rows={4}
                      placeholder="e.g.&#10;• Alumni are welcome to bring spouse and children (+1/family entry allowed).&#10;• Dedicated family lounge, photo booth, and child-friendly zone available at the venue.&#10;• Free valet and dedicated alumni parking available at South Gate plaza."
                      value={settingsForm.Facilities || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Highlights & Reunion Souvenirs */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Reunion Highlights, Mementos &amp; Felicitations</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Highlight anniversary souvenirs, lapel pins, awards, and networking sessions.
                    </p>
                    <textarea
                      name="Highlights"
                      rows={4}
                      placeholder="e.g.&#10;• Exclusive Homecoming Souvenir &amp; Silver Jubilee lapel pins for all attendees&#10;• Distinguished Alumni Achievement Awards ceremony&#10;• Networking gala banquet with university leadership and emeritus faculty"
                      value={settingsForm.Highlights || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                </div>
              )}
              {/* SEMINAR CONFIG TAB */}
              {activeTab === 'seminar_config' && (
                <div className="space-y-6">
                  {/* Seminar Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sliders className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Seminar Controls &amp; Auditorium Settings
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Configure delegate registration availability, conference dates, auditorium hall venue, and campus delegate facilities.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.RegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.RegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.RegistrationOpen === 1 ? 'Registrations Open' : 'Registrations Paused'}
                    </span>
                  </div>
                  {/* Seminar Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Delegate Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new delegates cannot sign up or acquire tickets for this conference on the public portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = settingsForm.RegistrationOpen === 1 ? 0 : 1;
                          setSettingsForm((prev) => ({
                            ...prev,
                            RegistrationOpen: nextVal,
                            PhysicalRegistrationOpen: nextVal,
                            VirtualRegistrationOpen: nextVal
                          }));
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.RegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.RegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Delegate Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open Registrations</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Delegate Registration Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationStart"
                          value={settingsForm.RegistrationStart ? settingsForm.RegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Registration Deadline Date</span>
                        </label>
                        <input
                          type="date"
                          name="RegistrationEnd"
                          value={settingsForm.RegistrationEnd ? settingsForm.RegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Seminar Schedule & Auditorium Venue Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Conference Schedule &amp; Auditorium Venue</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Seminar Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Seminar End Date</span>
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Auditorium Hall Venue &amp; Campus Location</span>
                      </label>
                      <input
                        type="text"
                        name="Location"
                        placeholder="e.g. Main Convention Center, APJ Abdul Kalam Auditorium, Block 3"
                        value={settingsForm.Location || ''}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  {/* Delegate Campus Services & ID Badge Generation */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Delegate Campus Services &amp; ID Badge Passes</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Configure guest room accommodation, conference lunch/high tea tokens, and digital delegate badge passes.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Accommodation */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Guest Accommodation</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.AccommodationEnabled === 1}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                AccommodationEnabled: e.target.checked ? 1 : 0
                              }))
                            }
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </div>
                        {settingsForm.AccommodationEnabled === 1 && (
                          <div>
                            <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Lodging Fee (INR)</label>
                            <input
                              type="number"
                              name="AccommodationFee"
                              value={settingsForm.AccommodationFee || 0}
                              onChange={handleInputChange}
                              className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-slate-900 dark:text-white"
                            />
                          </div>
                        )}
                      </div>
                      {/* Food & Meals */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Conference Lunch</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.FoodEnabled === 1}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                FoodEnabled: e.target.checked ? 1 : 0
                              }))
                            }
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </div>
                        {settingsForm.FoodEnabled === 1 && (
                          <div>
                            <label className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Meal Token Fee (INR)</label>
                            <input
                              type="number"
                              name="FoodFee"
                              value={settingsForm.FoodFee || 0}
                              onChange={handleInputChange}
                              className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-slate-900 dark:text-white"
                            />
                          </div>
                        )}
                      </div>
                      {/* ID Card Generation */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Delegate Gate Pass</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsForm.IDCardEnabled === 1}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({
                                ...prev,
                                IDCardEnabled: e.target.checked ? 1 : 0
                              }))
                            }
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          Enables printable gate passes and auditorium entrance badges with QR verification.
                        </p>
                      </div>
                    </div>
                    {/* On-Spot UPI Payments */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Admin UPI ID (for On-Spot Delegate Registration Fees)</span>
                        </label>
                        <input
                          type="text"
                          name="AdminUpiId"
                          placeholder="e.g. conference@oksbi or admin@upi"
                          value={settingsForm.AdminUpiId || ''}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* CONFERENCE GUIDELINES TAB */}
              {activeTab === 'conference_guidelines' && (
                <div className="space-y-6">
                  {/* Conference Overview */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>About the Conference &amp; Theme Overview</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Provide a comprehensive overview of the seminar theme, keynote objectives, and conference scope for prospective delegates.
                    </p>
                    <textarea
                      name="Description"
                      rows={5}
                      placeholder="e.g. National AI &amp; Cloud Computing Seminar 2026 brings together leading researchers, cloud architects, and industry pioneers to deliberate on the future of scalable intelligence and multi-cloud architectures..."
                      value={settingsForm.Description || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Conference Subject Tracks & Keynote Themes */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Keynote Tracks &amp; Conference Domains</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Highlight the discussion tracks, topics, and domains covered during the keynote presentations.
                    </p>
                    <textarea
                      name="Requirements"
                      rows={4}
                      placeholder="e.g.&#10;• Track 1: Next-Gen Generative Models and Safety Alignment&#10;• Track 2: Enterprise Cloud Topology &amp; Zero-Trust Security&#10;• Track 3: High-Performance GPU Clusters &amp; Distributed Training"
                      value={settingsForm.Requirements || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Delegate Guidelines & Auditorium Etiquette */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Delegate Guidelines &amp; Hall Entry Policies</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Auditorium gate pass verification requirements, reporting time, and seating guidelines.
                    </p>
                    <textarea
                      name="Facilities"
                      rows={4}
                      placeholder="e.g.&#10;• Delegates are requested to carry their digital or printed gate pass with QR code.&#10;• Seating in the main auditorium is on a first-come, first-served basis.&#10;• Questions for keynote speakers can be submitted directly through the conference portal."
                      value={settingsForm.Facilities || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                  {/* Highlights & Delegate Takeaways */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Keynote Highlights &amp; Delegate Benefits</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Certificates of participation, speaker interaction sessions, and conference proceedings booklet.
                    </p>
                    <textarea
                      name="Highlights"
                      rows={4}
                      placeholder="e.g.&#10;• Verified National Seminar Certificate of Participation&#10;• Digital access to all presentation decks and research abstracts&#10;• Dedicated networking tea with distinguished keynote speakers"
                      value={settingsForm.Highlights || ''}
                      onChange={handleInputChange}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition resize-y"
                    />
                  </div>
                </div>
              )}
              {/* TAB 1: VIRTUAL TRACK SETTINGS */}
              {activeTab === 'virtual' && (
                <div className="space-y-6">
                  {/* Virtual Track Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Virtual Track Controls &amp; Stage
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Configure online registrations, live video conference links, event status, and virtual milestones.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.VirtualRegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.VirtualRegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.VirtualRegistrationOpen === 1 ? 'Virtual Registrations Open' : 'Virtual Registrations Paused'}
                    </span>
                  </div>
                  {/* Virtual Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Virtual Track Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new participants cannot sign up or submit team registrations for the Virtual Track on the public portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('VirtualRegistrationOpen')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.VirtualRegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.VirtualRegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Virtual Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open Virtual Registrations</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Virtual Registration and Event Dates (From & To) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>From: Virtual Registration Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="VirtualRegistrationStart"
                          value={settingsForm.VirtualRegistrationStart ? settingsForm.VirtualRegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>To: Virtual Registration Closing Date</span>
                        </label>
                        <input
                          type="date"
                          name="VirtualRegistrationEnd"
                          value={settingsForm.VirtualRegistrationEnd ? settingsForm.VirtualRegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>From: Event Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>To: Event End Date</span>
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Virtual Hackathon Meeting & Live Status */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Virtual Stage &amp; Video Conference Link
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Configure meeting links and control live broadcast status for virtual participants.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Google Meet / Video Conference Link
                        </label>
                        <input
                          type="url"
                          name="VirtualMeetUrl"
                          value={settingsForm.VirtualMeetUrl}
                          onChange={handleInputChange}
                          placeholder="https://meet.google.com/xxx-yyyy-zzz"
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                        <p className="text-[11px] text-slate-400">
                          Participants with approved virtual registrations can join via this link when live.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Virtual Stage Status
                        </label>
                        <select
                          name="VirtualStatus"
                          value={settingsForm.VirtualStatus}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        >
                          <option value="NOT_STARTED">NOT STARTED (Scheduled)</option>
                          <option value="LIVE">LIVE (Participants Can Join)</option>
                          <option value="COMPLETED">COMPLETED (Concluded)</option>
                        </select>
                        <p className="text-[11px] text-slate-400">
                          Controls the live indicator and join button on the Virtual Event dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Virtual Track Timelines Section */}
                  {renderTimelineSection('Virtual')}
                </div>
              )}
              {/* TAB 2: PHYSICAL TRACK SETTINGS */}
              {activeTab === 'physical' && (
                <div className="space-y-6">
                  {/* Physical Track Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          Physical Track Controls &amp; Campus Services
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Manage campus registrations, food &amp; accommodation services, and physical track milestones.
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      settingsForm.PhysicalRegistrationOpen === 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settingsForm.PhysicalRegistrationOpen === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settingsForm.PhysicalRegistrationOpen === 1 ? 'Physical Registrations Open' : 'Physical Registrations Paused'}
                    </span>
                  </div>
                  {/* Physical Registration Controls Card */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Physical / On-Campus Registration Availability</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                          When paused, new participants cannot sign up for the physical on-campus hackathon track.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle('PhysicalRegistrationOpen')}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                          settingsForm.PhysicalRegistrationOpen === 1
                            ? 'bg-white dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {settingsForm.PhysicalRegistrationOpen === 1 ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Pause Physical Registrations</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-4 w-4" />
                            <span>Resume / Open Physical Registrations</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Physical Registration and Event Dates (From & To) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>From: Physical Registration Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="PhysicalRegistrationStart"
                          value={settingsForm.PhysicalRegistrationStart ? settingsForm.PhysicalRegistrationStart.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>To: Physical Registration Closing Date</span>
                        </label>
                        <input
                          type="date"
                          name="PhysicalRegistrationEnd"
                          value={settingsForm.PhysicalRegistrationEnd ? settingsForm.PhysicalRegistrationEnd.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>From: Event Start Date</span>
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={settingsForm.StartDate ? settingsForm.StartDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>To: Event End Date</span>
                        </label>
                        <input
                          type="date"
                          name="EndDate"
                          value={settingsForm.EndDate ? settingsForm.EndDate.split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                    </div>
                    {/* Problem Statement Mode for Physical Hackathons */}
                    {(eventData?.EventType || '').toLowerCase() === 'hackathon' && (
                      <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <label className="text-xs font-bold text-slate-800 dark:text-white">
                            Problem Statement Submission Format (Physical Track)
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Configure whether physical hackathon teams choose from organizer-provided problem statements or submit their own open innovation statements under the event themes.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSettingsForm((prev) => ({ ...prev, PhysicalPSMode: 'organizer_provided' }))}
                            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                              settingsForm.PhysicalPSMode === 'organizer_provided'
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-bold'
                                : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Organizer-Provided Challenges</span>
                              </span>
                              {settingsForm.PhysicalPSMode === 'organizer_provided' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                            </div>
                            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400 block mt-1 leading-relaxed">
                              Organizers define problem statements; teams select from the official list.
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettingsForm((prev) => ({ ...prev, PhysicalPSMode: 'participant_defined' }))}
                            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                              settingsForm.PhysicalPSMode === 'participant_defined'
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 font-bold'
                                : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-blue-600" />
                                <span>Participant-Submitted (Open Innovation)</span>
                              </span>
                              {settingsForm.PhysicalPSMode === 'participant_defined' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                            </div>
                            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400 block mt-1 leading-relaxed">
                              Teams choose an innovation theme and submit their custom problem statement.
                            </span>
                          </button>
                        </div>
                        {/* When Organizer-Provided is selected: Problem Statement Publishing, Live Release & Timer */}
                        {settingsForm.PhysicalPSMode === 'organizer_provided' && (
                          <div className="mt-4 p-5 rounded-2xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {settingsForm.PhysicalPSPublished === 1 ? (
                                    <Eye className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                  )}
                                  <span>Problem Statements Event Release Status</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                  {settingsForm.PhysicalPSPublished === 1
                                    ? 'Statements are currently PUBLISHED and OPEN for physical teams to select.'
                                    : 'Statements are in DRAFT. Physical participants only see Themes in advance; problem statements remain hidden until you publish them at the event kickoff.'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggle('PhysicalPSPublished')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm ${
                                  settingsForm.PhysicalPSPublished === 1
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/40 hover:bg-rose-100'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                                }`}
                              >
                                {settingsForm.PhysicalPSPublished === 1 ? 'Close & Unpublish Statements' : '🚀 Publish Statements Now at Event'}
                              </button>
                            </div>
                            {/* Selection Deadline & Max Teams Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                                  <Timer className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Selection Deadline (Countdown Timer)</span>
                                </label>
                                <input
                                  type="datetime-local"
                                  name="PhysicalPSSelectionDeadline"
                                  value={
                                    settingsForm.PhysicalPSSelectionDeadline
                                      ? new Date(settingsForm.PhysicalPSSelectionDeadline).toISOString().slice(0, 16)
                                      : ''
                                  }
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                                <div className="flex items-center gap-1.5 pt-1">
                                  <span className="text-[10px] text-slate-400">Quick timers:</span>
                                  {[15, 30, 45, 60].map((mins) => (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => {
                                        const dt = new Date(Date.now() + mins * 60 * 1000);
                                        setSettingsForm((prev) => ({
                                          ...prev,
                                          PhysicalPSSelectionDeadline: dt.toISOString()
                                        }));
                                        toast.success(`Set timer to ${mins} minutes from now`);
                                      }}
                                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold hover:bg-slate-50 cursor-pointer"
                                    >
                                      +{mins}m
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5 text-blue-600" />
                                  <span>Max Teams Per Problem Statement</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  name="PhysicalPSMaxTeamsPerStatement"
                                  value={settingsForm.PhysicalPSMaxTeamsPerStatement || 5}
                                  onChange={handleInputChange}
                                  placeholder="5"
                                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                                />
                                <span className="text-[10px] text-slate-400 block">
                                  Cap the maximum number of physical teams that can select the same problem statement.
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Physical Campus Services Toggles */}
                  <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Physical Event Campus Services
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                        Enable or disable hostel accommodation requests, meal token distribution, and ID card generation for on-campus participants.
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 pt-1">
                      {[
                        ['AccommodationEnabled', 'Accommodation & Stay', 'Enables lodging requests and room allocations'],
                        ['FoodEnabled', 'Food & Meal Selection', 'Enables meal token requests (Tiffin, Lunch, Dinner)'],
                        ['IDCardEnabled', 'ID Card Generation', 'Allows approved participants to generate badges']
                      ].map(([key, label, desc]) => {
                        const enabled = settingsForm[key] === 1;
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-4"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                              <span className={`inline-block mt-2 text-[11px] font-bold ${
                                enabled
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400 dark:text-zinc-500'
                              }`}>
                                • {enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={enabled}
                              aria-label={`Toggle ${label}`}
                              onClick={() => handleToggle(key)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-800'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Facility Pricing & Payment Configuration (Shown when Food or Accommodation is enabled) */}
                    {(settingsForm.AccommodationEnabled === 1 || settingsForm.FoodEnabled === 1) && (
                      <div className="mt-4 pt-5 border-t border-slate-200/80 dark:border-zinc-800 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                              <IndianRupee className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Food &amp; Accommodation Pricing &amp; Admin Payment Setup
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                Configure rates per person (per night / food included) and your payment collection details.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Pricing Inputs */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          {settingsForm.AccommodationEnabled === 1 && (
                            <div className="space-y-1.5 p-3.5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                                Accommodation Fee (₹ / person / night)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  name="AccommodationFee"
                                  value={settingsForm.AccommodationFee}
                                  onChange={handleInputChange}
                                  placeholder="0.00"
                                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                              </div>
                              <p className="text-[10px] text-slate-400">Hostel room fee per night per attendee</p>
                            </div>
                          )}
                          {settingsForm.FoodEnabled === 1 && (
                            <div className="space-y-1.5 p-3.5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                                Food &amp; Meals Fee (₹ / person / day)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  name="FoodFee"
                                  value={settingsForm.FoodFee}
                                  onChange={handleInputChange}
                                  placeholder="0.00"
                                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                              </div>
                              <p className="text-[10px] text-slate-400">Daily food tokens package fee</p>
                            </div>
                          )}
                          <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                            <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              Total Package Fee (₹ / person)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                name="FacilitiesPackageFee"
                                value={
                                  settingsForm.FacilitiesPackageFee !== undefined && settingsForm.FacilitiesPackageFee !== null && settingsForm.FacilitiesPackageFee !== 0
                                    ? settingsForm.FacilitiesPackageFee
                                    : ((Number(settingsForm.AccommodationFee) || 0) + (Number(settingsForm.FoodFee) || 0))
                                }
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/30 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                              />
                            </div>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Total payable per member for full stay &amp; food</p>
                          </div>
                        </div>
                        {/* Admin Payment Collection Info */}
                        <div className="grid gap-4 md:grid-cols-2 pt-1">
                          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">Admin UPI / Payment ID</span>
                            </div>
                            <input
                              type="text"
                              name="AdminUpiId"
                              value={settingsForm.AdminUpiId}
                              onChange={handleInputChange}
                              placeholder="e.g. organizer@upi or 9876543210@paytm"
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-400">Teams will see this UPI ID to transfer payment directly</p>
                            <div className="pt-2">
                              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                                Payment Instructions &amp; Bank Details
                              </label>
                              <textarea
                                name="AdminPaymentInstructions"
                                value={settingsForm.AdminPaymentInstructions}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="e.g. Bank: SBI, A/C: 123456789, IFSC: SBIN0001234. Please mention Team Name in remarks and upload transaction receipt."
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
                              />
                            </div>
                          </div>
                          {/* Admin Payment QR Code */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <QrCode className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">Admin Payment QR Code</span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Upload your UPI or bank QR code screenshot so teams can scan and pay seamlessly.
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                                {settingsForm.AdminPaymentQr ? (
                                  <img
                                    src={settingsForm.AdminPaymentQr}
                                    alt="Payment QR"
                                    className="w-full h-full object-contain p-1"
                                  />
                                ) : (
                                  <QrCode className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
                                )}
                                {uploadingAdminQr && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2 flex-1">
                                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm transition">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{uploadingAdminQr ? 'Uploading...' : settingsForm.AdminPaymentQr ? 'Replace QR Code' : 'Upload QR Code'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadAdminQr}
                                    disabled={uploadingAdminQr}
                                    className="hidden"
                                  />
                                </label>
                                {settingsForm.AdminPaymentQr && (
                                  <button
                                    type="button"
                                    onClick={() => setSettingsForm((prev) => ({ ...prev, AdminPaymentQr: '' }))}
                                    className="block text-[11px] text-rose-500 hover:underline"
                                  >
                                    Remove QR Code
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* ID Card & Team Card Custom Backgrounds */}
                  {renderCardBackgroundsSection()}
                  {/* Physical Track Timelines Section */}
                  {renderTimelineSection('Physical')}
                </div>
              )}
              {/* TAB 3: GENERAL & POLICY RULES */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* General Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Sliders className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          General Event Configuration &amp; Policy Rules
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          Configure public event story, strict team formation rules, and general challenge policies.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>Save Settings</span>
                    </button>
                  </div>
                  {/* Event Story & About the Challenge */}
                  <div className="bg-slate-50/50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Event Story &amp; About the Challenge
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Overview and problem statement displayed to participants on the public details page.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <textarea
                        name="Description"
                        value={settingsForm.Description}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Enter the complete overview of the hackathon, problem statement tracks, challenge goals, eligibility, and what participants will build..."
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Supports multi-line descriptions and paragraph formatting.</span>
                        <span>{settingsForm.Description?.length || 0} characters</span>
                      </div>
                    </div>
                  </div>
                  {/* Team Formation Rules & Size Policy */}
                  <div className="bg-slate-50/50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Team Formation Rules &amp; Size Policy
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Enforces strict participant count per squad. Registrations cannot proceed unless rules are satisfied.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">
                          Participation Format
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-w-md">
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsForm((prev) => ({ ...prev, TeamSize: '1' }));
                            }}
                            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isSoloTeamSize(settingsForm.TeamSize)
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <User className="w-4 h-4" />
                            <span>Individual (Solo)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (isSoloTeamSize(settingsForm.TeamSize)) {
                                setSettingsForm((prev) => ({ ...prev, TeamSize: '2-4' }));
                              }
                            }}
                            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              !isSoloTeamSize(settingsForm.TeamSize)
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <span>Team Format</span>
                          </button>
                        </div>
                      </div>
                      {/* Team Configuration Block */}
                      {!isSoloTeamSize(settingsForm.TeamSize) ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                              Team Size Rule (Minimum 2 Members)
                            </label>
                            {/* Preset Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSettingsForm((prev) => ({ ...prev, TeamSize: '2-4' }))}
                                className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  settingsForm.TeamSize === '2-4' || settingsForm.TeamSize === '2 - 4'
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                                }`}
                              >
                                Range: 2 - 4
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettingsForm((prev) => ({ ...prev, TeamSize: '2-3' }))}
                                className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  settingsForm.TeamSize === '2-3' || settingsForm.TeamSize === '2 - 3'
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                                }`}
                              >
                                Range: 2 - 3
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettingsForm((prev) => ({ ...prev, TeamSize: '4' }))}
                                className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  settingsForm.TeamSize === '4'
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                                }`}
                              >
                                Fixed: 4 Members
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettingsForm((prev) => ({ ...prev, TeamSize: '2' }))}
                                className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  settingsForm.TeamSize === '2'
                                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:border-slate-400'
                                }`}
                              >
                                Fixed: 2 Members
                              </button>
                            </div>
                            <div>
                              <input
                                type="text"
                                name="TeamSize"
                                value={settingsForm.TeamSize}
                                onChange={handleInputChange}
                                placeholder="e.g. 4 or 2-4"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                              />
                              <p className="text-[11px] text-slate-400 mt-1">
                                {String(settingsForm.TeamSize || '').includes('-')
                                  ? 'Flexible Range: Students can form a squad with any number of members in this range.'
                                  : `Strict Fixed Size: Every team must have exactly ${settingsForm.TeamSize || 4} members (no more, no less).`}
                              </p>
                            </div>
                          </div>
                          <div className="md:col-span-2 p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                              <span>Enforcement Policy Guarantees:</span>
                            </div>
                            <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                              <li>Teams must designate 1 Team Lead and satisfy the allowed member count.</li>
                              <li>Incomplete squads with fewer members than required will be blocked at registration.</li>
                              <li>Strict fixed rules (e.g. 4) prevent teams of 1, 2, 3, or more than 4 from registering.</li>
                              <li>Duplicate registrations across different teams in the same track are strictly prevented.</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                              Direct 1-Click Individual Registration Enabled
                            </p>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                              Attendees register directly with their profile in 1 click. No team names or extra member details required.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* ID Card & Team Card Custom Backgrounds */}
                  {renderCardBackgroundsSection()}
                </div>
              )}
              {activeTab === 'sponsors' && (
                <div className="p-6 sm:p-8">
                  <EventSponsorsManager eventId={selectedEventId} />
                </div>
              )}
              {activeTab === 'gallery' && (
                <div className="p-6 sm:p-8">
                  <EventGalleryManager eventId={selectedEventId} />
                </div>
              )}
            </div>
          </div>
          {/* Bottom Save Bar */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Ensure you click <strong>Save All Settings</strong> after modifying registration toggles or team sizes.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save All Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
