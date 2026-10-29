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
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useToast from '../../../../Hooks/useToast';
import useAuth from '../../../../Hooks/useAuth';
import EventSponsorsManager from '../../../../components/Organisms/EventSponsorsManager';
import EventGalleryManager from '../../../../components/Organisms/EventGalleryManager';
import { getTrackVisibility, isSoloTeamSize, validateEventDates } from '../../../../lib/utils';

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

  const adminEventId = storedAdmin?.EventId || user?.EventId;

  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(adminEventId ? Number(adminEventId) : null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAdminQr, setUploadingAdminQr] = useState(false);
  const [uploadingIdBg, setUploadingIdBg] = useState(false);
  const [uploadingTeamBg, setUploadingTeamBg] = useState(false);
  const [activeTab, setActiveTab] = useState('physical'); // 'virtual' | 'physical' | 'general'

  // Editable settings form state
  const [settingsForm, setSettingsForm] = useState({
    Description: '',
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
    if (isPhysicalMode) {
      setActiveTab('physical');
    } else if (isVirtualMode || isBothMode) {
      setActiveTab('virtual');
    }
  }, [isVirtualMode, isPhysicalMode, isBothMode]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        if (adminEventId) {
          const evId = Number(adminEventId);
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
  }, [adminEventId]);

  const loadEventSettings = async (id) => {
    const targetId = adminEventId ? Number(adminEventId) : id;
    if (!targetId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${targetId}`);
      if (!res.ok) throw new Error('Failed to load event details');
      const data = await res.json();
      const ev = Array.isArray(data) ? data[0] : (data.event || data);

      setEventData(ev);
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
        Description: ev.Description || '',
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
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not load event settings');
    } finally {
      setLoading(false);
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
    const targetEventId = adminEventId ? Number(adminEventId) : selectedEventId;
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
    const targetEventId = adminEventId ? Number(adminEventId) : selectedEventId;
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
    const targetEventId = adminEventId ? Number(adminEventId) : selectedEventId;
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
    const targetEventId = adminEventId ? Number(adminEventId) : selectedEventId;
    if (!targetEventId) return;

    // Validate TeamSize
    const ts = String(settingsForm.TeamSize).trim();
    if (!ts) {
      toast.error('Please enter a valid Team Size (e.g. "4" or "2-4")');
      return;
    }

    // Validate Event and Registration dates
    const regStart = settingsForm.PhysicalRegistrationStart || settingsForm.VirtualRegistrationStart || settingsForm.RegistrationStart;
    const regEnd = settingsForm.PhysicalRegistrationEnd || settingsForm.VirtualRegistrationEnd || settingsForm.RegistrationEnd;
    const dateErr = validateEventDates({
      registrationStart: regStart,
      registrationEnd: regEnd,
      eventStart: settingsForm.StartDate,
      eventEnd: settingsForm.EndDate
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
        body: JSON.stringify(settingsForm)
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
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
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
                      ? 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-400 cursor-pointer'
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
              {[
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
              }).map((tab) => {
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
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tab.status === 'Open'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      settingsForm.VirtualRegistrationOpen === 1
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}>
                      {settingsForm.VirtualRegistrationOpen === 1 ? '● Virtual Registrations Open' : '● Virtual Registrations Paused'}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      settingsForm.PhysicalRegistrationOpen === 1
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                    }`}>
                      {settingsForm.PhysicalRegistrationOpen === 1 ? '● Physical Registrations Open' : '● Physical Registrations Paused'}
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
                              <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                enabled
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                              }`}>
                                {enabled ? 'Enabled' : 'Disabled'}
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
