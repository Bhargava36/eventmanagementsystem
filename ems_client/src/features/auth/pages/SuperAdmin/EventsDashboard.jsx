import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Radio,
  Clock,
  Plus,
  Eye,
  ChevronDown,
  X,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Globe,
  MapPin,
  Layers,
  Users,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import useToast from '../../../../Hooks/useToast';

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'upcoming':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500';

    case 'ongoing':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500';

    case 'completed':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getCategoryStyles = () => {
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500';
};

function EventsDashboard() {
  const toast = useToast();

  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState('Latest First');

  const initialForm = {
    EventName: '',
    Description: '',
    Facilities: '',
    Requirements: '',
    TeamSize: '',
    StartDate: '',
    EndDate: '',
    VirtualStartDate: '',
    VirtualEndDate: '',
    PhysicalStartDate: '',
    PhysicalEndDate: '',
    VirtualRegistrationStart: '',
    VirtualRegistrationEnd: '',
    PhysicalRegistrationStart: '',
    PhysicalRegistrationEnd: '',
    VirtualFacilities: '',
    VirtualRequirements: '',
    PhysicalFacilities: '',
    PhysicalRequirements: '',
    RegistrationStart: '',
    RegistrationEnd: '',
    Location: '',
    EventType: '',
    EventStatus: '',
    HackathonMode: 'Physical',
    PrizeMoney: '',
    VirtualPrizeMoney: '',
    PhysicalPrizeMoney: '',
    PrimaryColor: '#10B981',
    SecondaryColor: '#FFFFFF',
    TertiaryColor: '#000000',
    PrimaryTextColor: '#FFFFFF',
    SecondaryTextColor: '#000000',
    TertiaryTextColor: '#FFFFFF',
    Posters: []
  };

  const [formData, setFormData] = useState(initialForm);

  const sortOptions = [
    'Latest First',
    'Oldest First',
    'Name (A-Z)',
    'Name (Z-A)',
    'Upcoming',
    'Ongoing',
    'Completed'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        'http://localhost:3000/api/events/'
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to fetch events'
        );
      }

      setEventData(data.events || []);
    } catch (error) {
      console.error('Fetch events error:', error);
      toast.error(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'EventType') {
      setFormData((previousData) => ({
        ...previousData,
        EventType: value,
        HackathonMode: value === 'Hackathon'? previousData.HackathonMode : ''
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => resolve(loadEvt.target.result);
        img.src = loadEvt.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const resolvePosterUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return url?.url || '';
    if (url.startsWith('/uploads')) return `http://localhost:3000${url}`;
    return url;
  };

  const handlePosterUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`);
        continue;
      }
      try {
        const uploadData = new FormData();
        uploadData.append('file', file);

        const uploadRes = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: uploadData
        });

        if (uploadRes.ok) {
          const result = await uploadRes.json();
          const fileUrl = result.fileUrl || result.url;
          setFormData((prev) => ({
            ...prev,
            Posters: [...(prev.Posters || []), fileUrl]
          }));
        } else {
          // Fallback to compressed base64 if direct upload fails
          const compressedBase64 = await compressImage(file);
          if (compressedBase64) {
            setFormData((prev) => ({
              ...prev,
              Posters: [...(prev.Posters || []), compressedBase64]
            }));
          }
        }
      } catch (err) {
        console.error('Image upload error:', err);
        const compressedBase64 = await compressImage(file);
        if (compressedBase64) {
          setFormData((prev) => ({
            ...prev,
            Posters: [...(prev.Posters || []), compressedBase64]
          }));
        }
      }
    }
    e.target.value = '';
  };

  const handleRemovePoster = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      Posters: (prev.Posters || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSetPrimaryPoster = (indexToPrimary) => {
    setFormData((prev) => {
      const posters = [...(prev.Posters || [])];
      if (indexToPrimary === 0 || !posters[indexToPrimary]) return prev;
      const [selected] = posters.splice(indexToPrimary, 1);
      posters.unshift(selected);
      return {
        ...prev,
        Posters: posters
      };
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };

      if (formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical') {
        payload.StartDate = formData.VirtualStartDate || formData.StartDate;
        payload.EndDate = formData.PhysicalEndDate || formData.EndDate;
        payload.Facilities = [formData.VirtualFacilities, formData.PhysicalFacilities].filter(Boolean).join('\n\n') || formData.Facilities || '-';
        payload.Requirements = [formData.VirtualRequirements, formData.PhysicalRequirements].filter(Boolean).join('\n\n') || formData.Requirements || '-';
        payload.VirtualPrizeMoney = formData.VirtualPrizeMoney;
        payload.PhysicalPrizeMoney = formData.PhysicalPrizeMoney;
      } else if (formData.HackathonMode === 'Hybrid') {
        payload.StartDate = formData.StartDate || formData.VirtualStartDate || formData.PhysicalStartDate;
        payload.EndDate = formData.EndDate || formData.PhysicalEndDate || formData.VirtualEndDate;
        payload.Facilities = formData.Facilities || [formData.VirtualFacilities, formData.PhysicalFacilities].filter(Boolean).join('\n\n') || '-';
        payload.Requirements = formData.Requirements || [formData.VirtualRequirements, formData.PhysicalRequirements].filter(Boolean).join('\n\n') || '-';
        payload.PrizeMoney = formData.PrizeMoney || formData.PhysicalPrizeMoney || formData.VirtualPrizeMoney;
      } else if (formData.HackathonMode === 'Virtual') {
        payload.StartDate = formData.VirtualStartDate || formData.StartDate;
        payload.EndDate = formData.VirtualEndDate || formData.EndDate;
        payload.Facilities = formData.VirtualFacilities || formData.Facilities;
        payload.Requirements = formData.VirtualRequirements || formData.Requirements;
        payload.VirtualFacilities = payload.Facilities;
        payload.VirtualRequirements = payload.Requirements;
        payload.VirtualPrizeMoney = formData.VirtualPrizeMoney || formData.PrizeMoney;
        if (!payload.Location) payload.Location = 'Virtual / Online';
      } else if (formData.HackathonMode === 'Physical') {
        payload.StartDate = formData.PhysicalStartDate || formData.StartDate;
        payload.EndDate = formData.PhysicalEndDate || formData.EndDate;
        payload.Facilities = formData.PhysicalFacilities || formData.Facilities;
        payload.Requirements = formData.PhysicalRequirements || formData.Requirements;
        payload.PhysicalFacilities = payload.Facilities;
        payload.PhysicalRequirements = payload.Requirements;
        payload.PhysicalPrizeMoney = formData.PhysicalPrizeMoney || formData.PrizeMoney;
      }

      const res = await fetch(
        'http://localhost:3000/api/events/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Event creation failed'
        );
      }

      toast.success('Event created successfully!');

      setFormData(initialForm);
      setCurrentStep(1);
      setShowCreateForm(false);

      fetchEvents();
    } catch (error) {
      console.error('Create event error:', error);
      toast.error(
        error.message || 'Failed to create event'
      );
    }
  };

  const getSortedEvents = () => {
    const sortedEvents = [...eventData];

    switch (sortValue) {
      case 'Name (A-Z)':
        return sortedEvents.sort((a, b) => (a.EventName || '').localeCompare(b.EventName || ''));

      case 'Name (Z-A)':
        return sortedEvents.sort((a, b) =>(b.EventName || '').localeCompare(a.EventName || '' ));

      case 'Upcoming':
        return sortedEvents.filter((event) => event.EventStatus?.toLowerCase() === 'upcoming');

      case 'Ongoing':
        return sortedEvents.filter((event) => event.EventStatus?.toLowerCase() ==='ongoing');

      case 'Completed':
        return sortedEvents.filter((event) => event.EventStatus?.toLowerCase() === 'completed');

      case 'Oldest First':
        return sortedEvents.sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime());

      case 'Latest First':
      default:
        return sortedEvents.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
    }
  };

  const sortedEvents = getSortedEvents();
  const totalEvents = eventData.length;
  const upcomingEvents = eventData.filter((event) => event.EventStatus?.toLowerCase() === 'upcoming').length;
  const ongoingEvents = eventData.filter((event) => event.EventStatus?.toLowerCase() === 'ongoing').length;
  const completedEvents = eventData.filter((event) => event.EventStatus?.toLowerCase() === 'completed').length;

  const closeCreateForm = () => {
    setFormData(initialForm);
    setCurrentStep(1);
    setShowCreateForm(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: 'easeOut'
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Events
          </h1>

          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Create, manage and monitor all events organized in the system.
          </p>
        </div>

        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15
              }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create Event
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Create and configure your event
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-7 pt-6">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${currentStep >= step
                            ? 'bg-emerald-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                            }`}
                        >
                          {step}
                        </div>
                      </div>

                      {step < 4 && (
                        <div
                          className={`h-1 flex-1 mx-2 rounded ${currentStep > step
                            ? 'bg-emerald-700'
                            : 'bg-gray-200 dark:bg-gray-800'
                            }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentStep === 1 && 'Basic Information & Posters'}
                    {currentStep === 2 && 'Participation Mode & Schedule'}
                    {currentStep === 3 && 'Type, Team & Location'}
                    {currentStep === 4 && 'Event Colors'}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Step {currentStep} of 4
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateEvent}>
                <div className="px-7 py-6">

                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Event Name
                        </label>

                        <input
                          type="text"
                          name="EventName"
                          value={formData.EventName}
                          onChange={handleChange}
                          placeholder="Enter event name"
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Event Posters
                          </label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.Posters || []).length} uploaded
                          </span>
                        </div>

                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/50">
                          <UploadCloud className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Click or drag images to upload event posters
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WEBP (Up to 8MB each, multiple allowed)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePosterUpload}
                            className="hidden"
                          />
                        </label>

                        {(formData.Posters || []).length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {formData.Posters.map((poster, index) => (
                              <div
                                key={index}
                                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 aspect-[4/3]"
                              >
                                <img
                                  src={resolvePosterUrl(poster)}
                                  alt={`Poster ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                <div className="absolute top-1.5 left-1.5">
                                  {index === 0 ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow">
                                      Primary
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryPoster(index)}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 hover:bg-emerald-600 text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemovePoster(index)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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

                  {currentStep === 2 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Participation / Event Mode
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { id: 'Virtual', label: 'Virtual', desc: '100% Online', icon: Globe },
                            { id: 'Physical', label: 'Physical', desc: 'In-person / Campus', icon: MapPin },
                            { id: 'Virtual and Physical', label: 'Virtual and Physical', desc: 'Multi-stage / Both', icon: Layers },
                            { id: 'Hybrid', label: 'Hybrid', desc: 'Simultaneous Live & Online', icon: Radio }
                          ].map((modeOption) => {
                            const IconComponent = modeOption.icon;
                            const isSelected = (formData.HackathonMode || 'Physical').toLowerCase() === modeOption.id.toLowerCase() ||
                              (modeOption.id === 'Virtual and Physical' && formData.HackathonMode === 'Both');
                            return (
                              <button
                                key={modeOption.id}
                                type="button"
                                onClick={() => {
                                  const newMode = modeOption.id;
                                  setFormData((prev) => ({
                                    ...prev,
                                    HackathonMode: newMode,
                                    Location: newMode === 'Virtual' ? (prev.Location || 'Virtual / Online') : (prev.Location === 'Virtual / Online' ? '' : prev.Location)
                                  }));
                                }}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-2 ring-emerald-500/30'
                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                                  <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {modeOption.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {modeOption.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical' ? (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                              <Globe className="w-3.5 h-3.5" />
                              <span>Virtual Phase Schedule</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Virtual Registration Start
                                </label>
                                <input
                                  type="date"
                                  name="VirtualRegistrationStart"
                                  value={formData.VirtualRegistrationStart}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Virtual Registration End
                                </label>
                                <input
                                  type="date"
                                  name="VirtualRegistrationEnd"
                                  value={formData.VirtualRegistrationEnd}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Virtual Event Start Date
                                </label>
                                <input
                                  type="date"
                                  name="VirtualStartDate"
                                  value={formData.VirtualStartDate}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Virtual Event End Date
                                </label>
                                <input
                                  type="date"
                                  name="VirtualEndDate"
                                  value={formData.VirtualEndDate}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Physical / On-Campus Phase Schedule</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Physical Registration Start
                                </label>
                                <input
                                  type="date"
                                  name="PhysicalRegistrationStart"
                                  value={formData.PhysicalRegistrationStart}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Physical Registration End
                                </label>
                                <input
                                  type="date"
                                  name="PhysicalRegistrationEnd"
                                  value={formData.PhysicalRegistrationEnd}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Physical Event Start Date
                                </label>
                                <input
                                  type="date"
                                  name="PhysicalStartDate"
                                  value={formData.PhysicalStartDate}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Physical Event End Date
                                </label>
                                <input
                                  type="date"
                                  name="PhysicalEndDate"
                                  value={formData.PhysicalEndDate}
                                  onChange={handleChange}
                                  required
                                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {formData.HackathonMode === 'Virtual' ? 'Virtual Start Date' : 'Event Start Date'}
                              </label>
                              <input
                                type="date"
                                name="StartDate"
                                value={formData.StartDate}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (formData.HackathonMode === 'Virtual') {
                                    setFormData((prev) => ({ ...prev, StartDate: e.target.value, VirtualStartDate: e.target.value }));
                                  } else {
                                    setFormData((prev) => ({ ...prev, StartDate: e.target.value, PhysicalStartDate: e.target.value }));
                                  }
                                }}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {formData.HackathonMode === 'Virtual' ? 'Virtual End Date' : 'Event End Date'}
                              </label>
                              <input
                                type="date"
                                name="EndDate"
                                value={formData.EndDate}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (formData.HackathonMode === 'Virtual') {
                                    setFormData((prev) => ({ ...prev, EndDate: e.target.value, VirtualEndDate: e.target.value }));
                                  } else {
                                    setFormData((prev) => ({ ...prev, EndDate: e.target.value, PhysicalEndDate: e.target.value }));
                                  }
                                }}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Registration Start
                              </label>
                              <input
                                type="date"
                                name="RegistrationStart"
                                value={formData.RegistrationStart}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Registration End
                              </label>
                              <input
                                type="date"
                                name="RegistrationEnd"
                                value={formData.RegistrationEnd}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Type
                          </label>

                          <select
                            name="EventType"
                            value={formData.EventType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                          >
                            <option value="">
                              Select Event Type
                            </option>
                            <option value="Hackathon">
                              Hackathon
                            </option>
                            <option value="Workshop">
                              Workshop
                            </option>
                            <option value="Conference">
                              Conference
                            </option>
                            <option value="Tech Fest">
                              Tech Fest
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Team Size
                          </label>

                          <input
                            type="text"
                            name="TeamSize"
                            value={formData.TeamSize}
                            onChange={handleChange}
                            placeholder="Example: 2 - 4 members"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location / Venue
                        </label>

                        <input
                          type="text"
                          name="Location"
                          value={formData.Location}
                          onChange={handleChange}
                          placeholder={formData.HackathonMode === 'Virtual' ? 'Online / Meeting Platform (e.g. Google Meet, Zoom)' : 'Enter venue location (e.g. Campus Auditorium / Hall A)'}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>

                      {(formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical') ? (
                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Track-Wise Prize Pools</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Specify separate prize money for the Physical and Virtual tracks of this event.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Physical Track Prize Money
                              </label>
                              <input
                                type="text"
                                name="PhysicalPrizeMoney"
                                value={formData.PhysicalPrizeMoney}
                                onChange={handleChange}
                                placeholder="e.g. ₹50,000"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Virtual Track Prize Money
                              </label>
                              <input
                                type="text"
                                name="VirtualPrizeMoney"
                                value={formData.VirtualPrizeMoney}
                                onChange={handleChange}
                                placeholder="e.g. ₹25,000"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-xs">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Combined Pool Note</span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">
                              {formData.PhysicalPrizeMoney && formData.VirtualPrizeMoney
                                ? `Physical: ${formData.PhysicalPrizeMoney} | Virtual: ${formData.VirtualPrizeMoney}`
                                : formData.PhysicalPrizeMoney || formData.VirtualPrizeMoney || 'Set track prize amounts above'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prize Money / Prize Pool
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="PrizeMoney"
                              value={formData.PrizeMoney}
                              onChange={handleChange}
                              placeholder="e.g. ₹50,000 or $1,000"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                            Admin-Curated Content Notice
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                            Event Description, Facilities, and Participant Requirements are managed directly by the assigned Event Admin in the Admin Dashboard Studio after creation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="grid grid-cols-2 gap-5">
                      {[
                        ['PrimaryColor', 'Primary Color'],
                        ['PrimaryTextColor', 'Primary Text Color'],
                        ['SecondaryColor', 'Secondary Color'],
                        ['SecondaryTextColor', 'Secondary Text Color'],
                        ['TertiaryColor', 'Tertiary Color'],
                        ['TertiaryTextColor', 'Tertiary Text Color']
                      ].map(([name, label]) => (
                        <div key={name}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {label}
                          </label>

                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={formData[name]}
                              onChange={(e) =>
                                setFormData((previousData) => ({
                                  ...previousData,
                                  [name]: e.target.value
                                }))
                              }
                              className="w-12 h-11 rounded-lg cursor-pointer border-0 p-0"
                            />

                            <input
                              type="text"
                              name={name}
                              value={formData[name]}
                              onChange={handleChange}
                              required
                              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-7 py-5 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep(
                            currentStep - 1
                          )
                        }
                        className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        Back
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeCreateForm}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                      Cancel
                    </button>

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep(
                            currentStep + 1
                          )
                        }
                        className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      >
                        Create Event
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Calendar className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Total Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Upcoming Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {upcomingEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Radio className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Ongoing Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {ongoingEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Completed Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {completedEvents}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.2
          }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                All Events
              </h2>

              <div className="relative">
                <button
                  onClick={() =>
                    setSortOpen(!sortOpen)
                  }
                  className="flex items-center gap-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {sortValue}

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${sortOpen
                      ? 'rotate-180'
                      : ''
                      }`}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
                    {sortOptions.map(
                      (option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortValue(
                              option
                            );
                            setSortOpen(
                              false
                            );
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortValue ===
                            option
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 sm:px-6 py-3 font-medium">
                    Event
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">
                    Category
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">
                    Start Date
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 sm:px-6 py-3 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10 text-gray-500"
                    >
                      Loading events...
                    </td>
                  </tr>
                )}

                {!loading &&
                  sortedEvents.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-500"
                      >
                        No events found.
                      </td>
                    </tr>
                  )}

                {!loading &&
                  sortedEvents.map(
                    (event, index) => (
                      <motion.tr
                        key={event.Id}
                        initial={{
                          opacity: 0,
                          x: -8
                        }}
                        animate={{
                          opacity: 1,
                          x: 0
                        }}
                        transition={{
                          duration: 0.25,
                          delay: Math.min(
                            index * 0.04,
                            0.4
                          )
                        }}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {event.Posters && event.Posters.length > 0 ? (
                              <img
                                src={resolvePosterUrl(Array.isArray(event.Posters) ? event.Posters[0] : (typeof event.Posters === 'string' && event.Posters.startsWith('[') ? JSON.parse(event.Posters)[0] : event.Posters))}
                                alt={event.EventName}
                                className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg object-cover border border-emerald-500/20 shrink-0"
                              />
                            ) : (
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                                {
                                  event.EventName
                                }
                              </p>

                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block line-clamp-1">
                                {
                                  event.Description
                                }
                              </p>

                              {(event.VirtualPrizeMoney || event.PhysicalPrizeMoney || event.PrizeMoney) && (
                                <div className="flex items-center gap-2 mt-1">
                                  {event.PhysicalPrizeMoney && (
                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                      Physical: {event.PhysicalPrizeMoney}
                                    </span>
                                  )}
                                  {event.VirtualPrizeMoney && (
                                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                      Virtual: {event.VirtualPrizeMoney}
                                    </span>
                                  )}
                                  {!event.PhysicalPrizeMoney && !event.VirtualPrizeMoney && event.PrizeMoney && (
                                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                      Pool: {event.PrizeMoney}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyles()}`}
                          >
                            {
                              event.EventType
                            }
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                          <p className="text-xs sm:text-sm whitespace-nowrap">
                            {new Date(
                              event.StartDate
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </p>
                        </td>

                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles(
                              event.EventStatus
                            )}`}
                          >
                            {
                              event.EventStatus
                            }
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <Link
                            to={`/sidebar/eventinfo/${event.Id}`}
                            state={{ initialEvent: event }}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 font-medium transition-colors whitespace-nowrap cursor-pointer w-fit"
                          >
                            <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />

                            <span className="hidden sm:inline">
                              View Info
                            </span>
                          </Link>
                        </td>
                      </motion.tr>
                    )
                  )}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <button className="text-sm text-emerald-700 dark:text-emerald-500 hover:underline font-medium cursor-pointer">
              View All Events →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EventsDashboard;