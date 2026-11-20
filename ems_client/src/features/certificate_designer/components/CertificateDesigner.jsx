import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import {
  Award,
  Save,
  Undo2,
  Redo2,
  Type,
  Square,
  Circle,
  Minus,
  QrCode,
  Download,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Check,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Move,
  Users,
  Calendar,
  Building2,
  Tag,
  FileText,
  ShieldCheck,
  RefreshCw,
  Plus,
  Layers,
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  Scaling,
  RotateCcw,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Sliders,
  AlignCenter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '@/Hooks/useToast';
import useTheme from '@/Hooks/useTheme';
import {
  CERTIFICATE_PRESETS,
  CERTIFICATE_DYNAMIC_TAGS,
  CERTIFICATE_FONTS,
  SAMPLE_TEAM_MEMBERS
} from '../constants/certificatePresets';
import { downloadCertificatePdf } from '../services/certificatePdfGenerator';

// Curated 1-click quick color palette swatches
const COLOR_SWATCHES = [
  { label: 'Emerald', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Gold', value: '#d4af37' },
  { label: 'White', value: '#ffffff' },
  { label: 'Mint', value: '#34d399' },
  { label: 'Sky Blue', value: '#38bdf8' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Slate', value: '#94a3b8' },
  { label: 'Deep Emerald', value: '#021814' },
  { label: 'Midnight Black', value: '#030712' },
  { label: 'Deep Navy', value: '#0f172a' },
  { label: 'Transparent', value: 'transparent' }
];

export default function CertificateDesigner({
  eventId,
  initialTemplateId = null,
  onBack = null
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();
  const certRef = useRef(null);
  const imageInputRef = useRef(null);
  const replaceImageInputRef = useRef(null);

  // Panels collapse state for spacious workspace
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Canvas zoom & pan
  const [zoom, setZoom] = useState(0.85);
  const [previewMode, setPreviewMode] = useState(false);

  // Real Event & Real Teams/Members State
  const [eventData, setEventData] = useState(null);
  const [previewTeams, setPreviewTeams] = useState([]);
  const [previewMembers, setPreviewMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedPreviewMemberIdx, setSelectedPreviewMemberIdx] = useState(0);

  // Template State
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [templateName, setTemplateName] = useState('Official AITAM Certificate');
  const [orientation, setOrientation] = useState('landscape');
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(707);
  const [backgroundColor, setBackgroundColor] = useState('#021814');
  const [borderColor, setBorderColor] = useState('#10b981');
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // History for Undo / Redo
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Loading & Saving states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('elements'); // 'elements' | 'layers' | 'presets'

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });

  // Interactive Resizing State
  const [resizingDirection, setResizingDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ clientX: 0, clientY: 0, width: 0, height: 0, x: 0, y: 0, aspectRatio: 1 });

  // 1. Fetch template(s) and real event preview data on mount
  useEffect(() => {
    if (!eventId) return;
    fetchTemplates();
    fetchEventPreviewData();
  }, [eventId]);

  const fetchEventPreviewData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/certificates/events/${eventId}/preview-data`);
      const json = await res.json();
      if (json.success && json.data) {
        setEventData(json.data.event);
        const teams = json.data.teams || [];
        setPreviewTeams(teams);
        if (teams.length > 0) {
          setSelectedTeamId(teams[0].teamId);
        }
        if (json.data.previewMembers?.length > 0) {
          setPreviewMembers(json.data.previewMembers);
        }
      }
    } catch (err) {
      console.warn('Could not load event preview data:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/certificates/events/${eventId}/templates`);
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setAllTemplates(json.data);
        const target = templateId
          ? json.data.find(t => String(t.id) === String(templateId)) || json.data[0]
          : json.data.find(t => t.isDefault) || json.data[0];
        loadTemplateData(target);
      }
    } catch (err) {
      console.error('Error loading certificate templates:', err);
      toast.error('Failed to load certificate template');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateData = (tmpl) => {
    if (!tmpl) return;
    setTemplateId(tmpl.id);
    setTemplateName(tmpl.templateName || 'Official Certificate');
    setOrientation(tmpl.orientation || 'landscape');
    const cfg = tmpl.config || {};
    setCanvasWidth(cfg.CanvasWidth || (tmpl.orientation === 'landscape' ? 1000 : 707));
    setCanvasHeight(cfg.CanvasHeight || (tmpl.orientation === 'landscape' ? 707 : 1000));
    const bg = cfg.BackgroundColor || '#021814';
    const border = cfg.BorderColor || '#10b981';
    setBackgroundColor(bg);
    setBorderColor(border);
    let els = cfg.Elements || [];
    // Ensure all 4 corner accents harmonize with the border color
    els = els.map(el => {
      if (el.id && el.id.startsWith('corner-') && el.fill !== border && border) {
        return { ...el, fill: border };
      }
      return el;
    });
    setElements(els);
    setSelectedElementId(null);
    setHistory([els]);
    setHistoryIdx(0);
  };

  // Push to history
  const recordHistory = useCallback((newElements) => {
    setHistory(prev => {
      const slice = prev.slice(0, historyIdx + 1);
      return [...slice, newElements];
    });
    setHistoryIdx(prev => prev + 1);
  }, [historyIdx]);

  const updateElementsWithHistory = (newElements) => {
    setElements(newElements);
    recordHistory(newElements);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setElements(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setElements(history[nextIdx]);
    }
  };

  // Selected Element
  const selectedElement = elements.find(e => e.id === selectedElementId) || null;

  const updateSelectedElement = (updates) => {
    if (!selectedElementId) return;
    const updated = elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, ...updates };
      }
      return el;
    });
    setElements(updated);
  };

  const commitSelectedElementChange = (updates) => {
    if (!selectedElementId) return;
    const updated = elements.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, ...updates };
      }
      return el;
    });
    updateElementsWithHistory(updated);
  };

  // Delete Element
  const handleDeleteElement = (id = selectedElementId) => {
    if (!id) return;
    const filtered = elements.filter(el => el.id !== id);
    setSelectedElementId(null);
    updateElementsWithHistory(filtered);
    toast.success('Element removed');
  };

  // Duplicate Element
  const handleDuplicateElement = (id = selectedElementId) => {
    const target = elements.find(el => el.id === id);
    if (!target) return;
    const clone = {
      ...target,
      id: `${target.type}-${Date.now().toString(36)}`,
      x: (target.x || 0) + 20,
      y: (target.y || 0) + 20,
      zIndex: (target.zIndex || 2) + 1
    };
    const next = [...elements, clone];
    setSelectedElementId(clone.id);
    updateElementsWithHistory(next);
    toast.success('Element duplicated');
  };

  // Center Element Horizontally or Vertically
  const handleCenterElement = (axis = 'horizontal') => {
    if (!selectedElement) return;
    if (axis === 'horizontal') {
      const newX = Math.round((canvasWidth - (selectedElement.width || 100)) / 2);
      commitSelectedElementChange({ x: newX });
      toast.success('Centered horizontally');
    } else if (axis === 'vertical') {
      const newY = Math.round((canvasHeight - (selectedElement.height || 40)) / 2);
      commitSelectedElementChange({ y: newY });
      toast.success('Centered vertically');
    }
  };

  // Add Text Elements
  const handleAddText = (customText = 'Double click to edit text', dynamicField = null, fontSize = 16, fontWeight = '600') => {
    const newEl = {
      id: `text-${Date.now().toString(36)}`,
      type: 'text',
      text: customText,
      dynamicField: dynamicField,
      x: 200,
      y: 200,
      width: 400,
      height: Math.round(fontSize * 1.8),
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      color: '#ffffff',
      letterSpacing: 1,
      zIndex: elements.length + 2,
      locked: false,
      hidden: false
    };
    const next = [...elements, newEl];
    setSelectedElementId(newEl.id);
    updateElementsWithHistory(next);
    toast.success('Text element added');
  };

  // Add Shape Elements
  const handleAddShape = (shapeType = 'rectangle') => {
    const newEl = {
      id: `shape-${Date.now().toString(36)}`,
      type: 'shape',
      shapeType: shapeType,
      x: 250,
      y: 200,
      width: shapeType === 'circle' ? 80 : 300,
      height: shapeType === 'circle' ? 80 : shapeType === 'line' ? 2 : 120,
      fill: shapeType === 'line' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
      stroke: '#10b981',
      strokeWidth: 2,
      borderRadius: shapeType === 'circle' ? 40 : 8,
      zIndex: 2,
      locked: false,
      hidden: false
    };
    const next = [...elements, newEl];
    setSelectedElementId(newEl.id);
    updateElementsWithHistory(next);
    toast.success('Shape added');
  };

  // Add Image / Logo
  const handleImageFileChange = (e, replace = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || 120;
        const naturalH = img.naturalHeight || 120;

        if (replace && selectedElementId) {
          commitSelectedElementChange({
            src: dataUrl,
            name: file.name.replace(/\.[^/.]+$/, ''),
            aspectRatio: naturalW / naturalH
          });
          toast.success('Image replaced successfully');
          return;
        }

        const maxDim = 130;
        let fitW = maxDim;
        let fitH = Math.round(maxDim * (naturalH / naturalW));
        if (fitH > maxDim) {
          fitH = maxDim;
          fitW = Math.round(maxDim * (naturalW / naturalH));
        }

        const newEl = {
          id: `image-${Date.now().toString(36)}`,
          type: 'image',
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: dataUrl,
          x: Math.round((canvasWidth - fitW) / 2),
          y: 60,
          width: fitW,
          height: fitH,
          aspectRatio: naturalW / naturalH,
          opacity: 1,
          borderRadius: 0,
          zIndex: elements.length + 5,
          locked: false,
          hidden: false
        };

        const next = [...elements, newEl];
        setSelectedElementId(newEl.id);
        updateElementsWithHistory(next);
        toast.success('Image added! Drag corner handles to resize.');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add QR Code
  const handleAddQr = () => {
    const hasQr = elements.some(e => e.type === 'qr');
    if (hasQr) {
      toast.info('QR code already exists on canvas');
      return;
    }
    const newEl = {
      id: `qr-${Date.now().toString(36)}`,
      type: 'qr',
      dynamicField: 'qr_code',
      x: 465,
      y: 530,
      width: 70,
      height: 70,
      color: '#000000',
      bgColor: '#ffffff',
      borderRadius: 6,
      zIndex: 5,
      locked: false,
      hidden: false
    };
    const next = [...elements, newEl];
    setSelectedElementId(newEl.id);
    updateElementsWithHistory(next);
    toast.success('Verification QR Code added');
  };

  // Update Canvas Background Color AND sync outer frame fill
  const handleUpdateCanvasBg = (newBg) => {
    setBackgroundColor(newBg);
    const updated = elements.map(el => {
      if (el.id === 'outer-frame') {
        return { ...el, fill: newBg };
      }
      return el;
    });
    updateElementsWithHistory(updated);
  };

  // Update Border Frame Color AND sync outer frame stroke, inner frame, and all 4 corners
  const handleUpdateBorderColor = (newBorder) => {
    setBorderColor(newBorder);
    const updated = elements.map(el => {
      if (el.id === 'outer-frame') {
        return { ...el, stroke: newBorder };
      }
      if (el.id === 'inner-frame') {
        return { ...el, stroke: `${newBorder}66` };
      }
      if (el.id.startsWith('corner-')) {
        return { ...el, fill: newBorder };
      }
      return el;
    });
    updateElementsWithHistory(updated);
  };

  // Comprehensive Preset Theme Application across ALL elements
  const handleApplyPreset = (preset) => {
    setBackgroundColor(preset.bgColor);
    setBorderColor(preset.borderColor);

    const updated = elements.map(el => {
      // Outer frame
      if (el.id === 'outer-frame') {
        return { ...el, stroke: preset.borderColor, fill: preset.bgColor };
      }
      // Inner frame
      if (el.id === 'inner-frame') {
        return { ...el, stroke: `${preset.borderColor}66` };
      }
      // Corners
      if (el.id.startsWith('corner-')) {
        return { ...el, fill: preset.borderColor };
      }
      // Main Title and Underline
      if (el.id === 'cert-title' || el.id === 'name-underline' || el.id === 'seal-ring') {
        return { ...el, color: preset.accentColor, stroke: preset.accentColor, fill: `${preset.accentColor}18` };
      }
      // Team and role
      if (el.id === 'team-and-role') {
        return { ...el, color: preset.subTextColor || preset.accentColor };
      }
      // Institution Headers
      if (el.id === 'inst-name') {
        return { ...el, color: preset.textColor };
      }
      if (el.id === 'inst-sub') {
        return { ...el, color: preset.subTextColor || '#94a3b8' };
      }
      // Signatures
      if (el.id === 'sig1-name' || el.id === 'sig2-name') {
        return { ...el, color: preset.textColor };
      }
      if (el.id === 'sig1-title' || el.id === 'sig2-title') {
        return { ...el, color: preset.subTextColor || '#94a3b8' };
      }
      if (el.id === 'sig1-line' || el.id === 'sig2-line') {
        return { ...el, stroke: preset.subTextColor || '#64748b', fill: preset.subTextColor || '#64748b' };
      }
      // Serial & date
      if (el.id === 'cert-serial') {
        return { ...el, color: preset.accentColor };
      }
      if (el.id === 'cert-issued' || el.id === 'cert-sub') {
        return { ...el, color: preset.subTextColor || '#94a3b8' };
      }
      if (el.id === 'recipient-name') {
        return { ...el, color: preset.textColor };
      }
      if (el.id === 'college-name') {
        return { ...el, color: preset.subTextColor || preset.textColor };
      }
      if (el.id === 'citation') {
        return { ...el, color: preset.subTextColor || '#94a3b8' };
      }
      if (el.type === 'text') {
        return { ...el, color: preset.textColor };
      }
      return el;
    });

    updateElementsWithHistory(updated);
    toast.success(`Applied ${preset.name}`);
  };

  // Save Template
  const handleSaveTemplate = async () => {
    if (!eventId) return;
    try {
      setSaving(true);
      const payload = {
        templateName,
        orientation,
        widthMm: orientation === 'landscape' ? 297 : 210,
        heightMm: orientation === 'landscape' ? 210 : 297,
        track: 'Virtual',
        isDefault: true,
        config: {
          TemplateName: templateName,
          Orientation: orientation,
          CanvasWidth: canvasWidth,
          CanvasHeight: canvasHeight,
          BackgroundColor: backgroundColor,
          BorderColor: borderColor,
          Elements: elements
        }
      };

      const endpoint = templateId
        ? `${API_BASE_URL}/api/certificates/events/${eventId}/templates/${templateId}`
        : `${API_BASE_URL}/api/certificates/events/${eventId}/templates`;

      const method = templateId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Certificate template saved successfully!');
        if (json.data?.id && !templateId) {
          setTemplateId(json.data.id);
        }
        fetchTemplates();
      } else {
        toast.error(json.message || 'Failed to save template');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save certificate template');
    } finally {
      setSaving(false);
    }
  };

  // Resolve active team and active member for live preview
  const activeTeam = previewTeams.find(t => t.teamId === selectedTeamId) || previewTeams[0] || null;
  const activeTeamMembers = activeTeam ? activeTeam.members : (previewMembers.length > 0 ? previewMembers : SAMPLE_TEAM_MEMBERS);
  const displayMembers = previewMembers.length > 0 ? previewMembers : (activeTeam?.members?.length > 0 ? activeTeam.members : SAMPLE_TEAM_MEMBERS);

  const currentMember = displayMembers[selectedPreviewMemberIdx] || displayMembers[0] || {
    name: 'Lakshmi Sai Saketh Bikkina',
    role: 'Team Lead',
    college: eventData?.location || 'AITAM College, Tekkali',
    teamName: 'CyberSentinels',
    certId: `CERT-VIRT-${eventId || '01'}-001-1`,
    track: eventData?.hackathonMode || 'Virtual'
  };

  // Download PDF Preview
  const handleDownloadPreview = async () => {
    try {
      const safeName = (currentMember.name || 'Participant').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Certificate_${(eventData?.eventName || 'Event').replace(/\s+/g, '_')}_${safeName}_${currentMember.certId || '01'}.pdf`;
      toast.info(`Generating A4 PDF for ${currentMember.name}...`);

      const configToUse = {
        CanvasWidth: canvasWidth,
        CanvasHeight: canvasHeight,
        BackgroundColor: backgroundColor,
        BorderColor: borderColor,
        Elements: elements
      };

      await downloadCertificatePdf(
        { templateConfig: configToUse, memberData: currentMember },
        filename
      );
      toast.success('Certificate downloaded successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  // Canvas Drag Handling
  const handleMouseDown = (e, el) => {
    if (previewMode) return;
    e.stopPropagation();
    setSelectedElementId(el.id);
    if (el.locked) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: el.x, y: el.y });
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e) => {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      const newX = Math.round(elementStart.x + dx);
      const newY = Math.round(elementStart.y + dy);
      updateSelectedElement({ x: newX, y: newY });
    };
    const onMouseUp = () => {
      setIsDragging(false);
      recordHistory(elements);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragStart, elementStart, zoom, elements]);

  // Interactive Resizing Handling
  const handleResizeMouseDown = (e, dir, el) => {
    if (previewMode || el.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedElementId(el.id);
    setResizingDirection(dir);
    setResizeStart({
      clientX: e.clientX,
      clientY: e.clientY,
      width: el.width || 100,
      height: el.height || 100,
      x: el.x || 0,
      y: el.y || 0,
      aspectRatio: (el.width || 100) / (el.height || 100)
    });
  };

  useEffect(() => {
    if (!resizingDirection) return;

    const onMouseMove = (e) => {
      const dx = (e.clientX - resizeStart.clientX) / zoom;
      const dy = (e.clientY - resizeStart.clientY) / zoom;

      let newW = resizeStart.width;
      let newH = resizeStart.height;
      let newX = resizeStart.x;
      let newY = resizeStart.y;

      // Handle Directional Resizing
      if (resizingDirection.includes('e')) {
        newW = Math.max(20, Math.round(resizeStart.width + dx));
      }
      if (resizingDirection.includes('s')) {
        newH = Math.max(10, Math.round(resizeStart.height + dy));
      }
      if (resizingDirection.includes('w')) {
        const potentialW = Math.round(resizeStart.width - dx);
        if (potentialW >= 20) {
          newW = potentialW;
          newX = Math.round(resizeStart.x + dx);
        }
      }
      if (resizingDirection.includes('n')) {
        const potentialH = Math.round(resizeStart.height - dy);
        if (potentialH >= 10) {
          newH = potentialH;
          newY = Math.round(resizeStart.y + dy);
        }
      }

      // Aspect ratio hold when Shift is pressed
      if (e.shiftKey && resizeStart.aspectRatio) {
        if (resizingDirection.includes('e') || resizingDirection.includes('w')) {
          newH = Math.round(newW / resizeStart.aspectRatio);
        } else {
          newW = Math.round(newH * resizeStart.aspectRatio);
        }
      }

      updateSelectedElement({ x: newX, y: newY, width: newW, height: newH });
    };

    const onMouseUp = () => {
      setResizingDirection(null);
      recordHistory(elements);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingDirection, resizeStart, zoom, elements]);

  // Live Substitution Helper with real event data & real team members
  const resolveElementText = (text = '') => {
    let res = text || '';
    const evName = eventData?.eventName || 'Avishkaar 4';
    const evLocation = eventData?.location || 'AITAM College, Tekkali';
    const evDate = eventData?.formattedEventDate || 'Nov 24 - 26, 2026';
    const issueDate = eventData?.formattedIssueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const evTrack = currentMember.track || eventData?.hackathonMode || 'Virtual';

    res = res.replace(/\{\{recipient_name\}\}/gi, currentMember.name);
    res = res.replace(/\{\{role\}\}/gi, currentMember.role);
    res = res.replace(/\{\{team_name\}\}/gi, currentMember.teamName);
    res = res.replace(/\{\{team_and_role\}\}/gi, `of Team ${currentMember.teamName} (${currentMember.role})`);
    res = res.replace(/\{\{college_name\}\}/gi, currentMember.college);
    res = res.replace(/\{\{event_name\}\}/gi, evName);
    res = res.replace(/\{\{track\}\}/gi, evTrack);
    res = res.replace(/\{\{event_date\}\}/gi, evDate);
    res = res.replace(/\{\{venue_location\}\}/gi, evLocation);
    res = res.replace(/\{\{certificate_id\}\}/gi, currentMember.certId);
    res = res.replace(/\{\{issue_date\}\}/gi, issueDate);
    res = res.replace(/\{\{signatory_1_name\}\}/gi, 'Dr. Ch. Ramesh');
    res = res.replace(/\{\{signatory_1_title\}\}/gi, 'Convener & HOD, CSE');
    res = res.replace(/\{\{signatory_2_name\}\}/gi, 'Dr. A.S. Srinivasa Rao');
    res = res.replace(/\{\{signatory_2_title\}\}/gi, 'Principal, AITAM');
    return res;
  };

  // Group tags for organized display
  const tagCategories = ['Participant', 'Team', 'Event', 'Verification', 'Signatories', 'Citation'];

  return (
    <div className="flex flex-col -z-10 h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-slate-100 select-none overflow-hidden transition-colors">
      {/* Hidden File Inputs for Image Upload & Replacement */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleImageFileChange(e, false)}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceImageInputRef}
        onChange={(e) => handleImageFileChange(e, true)}
        accept="image/*"
        className="hidden"
      />

      {/* ── TOP HEADER / TOOLBAR ── */}
      <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 transition-colors">
        {/* Left Cluster: Back, Toggle Panel, Event & Template Info */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Left panel collapse/expand toggle */}
          <button
            type="button"
            onClick={() => setLeftPanelOpen(o => !o)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              leftPanelOpen
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={leftPanelOpen ? "Collapse Left Panel" : "Expand Left Panel"}
          >
            {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {eventData?.eventName || 'Event Certificate'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                  A4 {orientation.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[240px]">
                {templateName}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Member Preview Stepper (Compact & Elegant) */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100/90 dark:bg-zinc-900/90 py-1 px-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs shadow-sm">
          {previewTeams.length > 1 && (
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-300 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Team:</span>
              <select
                value={selectedTeamId || ''}
                onChange={(e) => {
                  const tId = Number(e.target.value);
                  setSelectedTeamId(tId);
                  const tm = previewTeams.find(t => t.teamId === tId);
                  if (tm && tm.members?.length > 0) {
                    setPreviewMembers(tm.members);
                    setSelectedPreviewMemberIdx(0);
                  }
                }}
                className="bg-transparent text-slate-800 dark:text-zinc-200 text-xs font-bold outline-none cursor-pointer max-w-[130px] truncate"
              >
                {previewTeams.map(t => (
                  <option key={t.teamId} value={t.teamId} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
                    {t.teamName} ({t.members.length} {t.members.length === 1 ? 'member' : 'members'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={selectedPreviewMemberIdx <= 0}
              onClick={() => setSelectedPreviewMemberIdx(i => Math.max(0, i - 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Previous member"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
              <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                #{selectedPreviewMemberIdx + 1}/{displayMembers.length}
              </span>
              <select
                value={selectedPreviewMemberIdx}
                onChange={(e) => setSelectedPreviewMemberIdx(Number(e.target.value))}
                className="bg-transparent text-emerald-900 dark:text-emerald-200 text-xs font-bold outline-none cursor-pointer max-w-[180px] truncate"
              >
                {displayMembers.map((m, idx) => (
                  <option key={m.certId || idx} value={idx} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={selectedPreviewMemberIdx >= displayMembers.length - 1}
              onClick={() => setSelectedPreviewMemberIdx(i => Math.min(displayMembers.length - 1, i + 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Next member"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Cluster: View Mode, Right Panel Toggle, Export PDF, Save Template (Safe from Notifications bell!) */}
        <div className="flex items-center gap-2.5">
          {/* Design View / Live Preview Toggle */}
          <button
            type="button"
            onClick={() => {
              setPreviewMode(p => !p);
              setSelectedElementId(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
              previewMode
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
            }`}
            title={previewMode ? "Switch back to Edit Mode" : "Preview with real participant data"}
          >
            {previewMode ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{previewMode ? 'Live Preview' : 'Design View'}</span>
          </button>

          {/* Toggle Right Inspector */}
          <button
            type="button"
            onClick={() => setRightPanelOpen(o => !o)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              rightPanelOpen
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={rightPanelOpen ? "Collapse Inspector" : "Expand Inspector"}
          >
            {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleDownloadPreview}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Export current certificate to PDF"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Save Template Button */}
          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── WORKSPACE (LEFT TOOLBAR + CENTER CANVAS + RIGHT INSPECTOR) ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT SIDEBAR (Elements, Layers, Presets) ── */}
        <aside
          className={`bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out ${
            leftPanelOpen ? 'w-80' : 'w-0 overflow-hidden border-r-0'
          }`}
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-3 border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'elements'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Items</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-3 border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-3 border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'layers'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers ({elements.length})</span>
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'elements' && (
              <>
                {/* 1. Upload Custom Image / Seal / Logo (Prominent Card) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Custom Asset</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 transition flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Upload Image / Logo / Seal</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        PNG, JPG, SVG with interactive canvas resizing
                      </p>
                    </div>
                  </button>
                </div>

                {/* 2. Standard Elements & Shapes (2x3 Grid) */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Standard Elements
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddText('CERTIFICATE TITLE', null, 24, 'bold')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Type className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold">Headline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddText('Description or citation text...', null, 12, '400')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-sky-500" />
                      <span className="text-xs font-bold">Body Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShape('rectangle')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Square className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold">Rectangle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShape('circle')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Circle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold">Seal / Ring</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddShape('line')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <Minus className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold">Divider Line</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQr}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/90 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white flex flex-col items-center gap-1.5 cursor-pointer transition shadow-sm"
                    >
                      <QrCode className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-bold">Verify QR</span>
                    </button>
                  </div>
                </div>

                {/* 3. Dynamic Member Tags (Categorized & Spacious) */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Dynamic Member Tags</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Click any tag to insert dynamic placeholder. Automatically personalized per participant!
                  </p>

                  <div className="space-y-3">
                    {tagCategories.map(cat => {
                      const tagsInCat = CERTIFICATE_DYNAMIC_TAGS.filter(t => t.category === cat);
                      if (tagsInCat.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                            {cat}
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {tagsInCat.map(tag => (
                              <button
                                key={tag.tag}
                                type="button"
                                onClick={() => handleAddText(tag.tag, tag.tag.replace(/[{}]/g, ''), tag.category === 'Participant' ? 24 : 14, tag.category === 'Participant' ? 'bold' : '600')}
                                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 dark:bg-zinc-900/80 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition flex items-center justify-between cursor-pointer group shadow-sm"
                                title={`Insert ${tag.label}`}
                              >
                                <div className="truncate">
                                  <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                    {tag.label}
                                  </p>
                                  <p className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                                    {tag.tag}
                                  </p>
                                </div>
                                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pre-Designed Themes
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Applies harmonized colors across all backgrounds, frames, corner ornaments, and typography.
                </p>
                <div className="space-y-2.5">
                  {CERTIFICATE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-left transition space-y-2 cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {preset.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full border border-zinc-600 shadow-sm" style={{ backgroundColor: preset.bgColor }} />
                          <span className="w-4 h-4 rounded-full border border-zinc-600 shadow-sm" style={{ backgroundColor: preset.borderColor }} />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Canvas Elements Order ({elements.length})
                </span>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {elements.slice().reverse().map((el) => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition shadow-sm ${
                        selectedElementId === el.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white font-bold'
                          : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {el.type === 'text' && <Type className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {el.type === 'shape' && <Square className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                        {el.type === 'qr' && <QrCode className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                        <span className="truncate">
                          {el.name || (el.dynamicField ? `{{${el.dynamicField}}}` : (el.text || el.id))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(el.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Remove element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER INTERACTIVE CANVAS WORKSPACE ── */}
        <main
          className="flex-1 bg-slate-100 dark:bg-zinc-950 overflow-auto flex items-center justify-center p-12 relative cursor-default"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedElementId(null);
            }
          }}
        >
          {/* Quick toggle if Left Panel is collapsed */}
          {!leftPanelOpen && (
            <button
              type="button"
              onClick={() => setLeftPanelOpen(true)}
              className="absolute top-4 left-4 z-20 px-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Open Items panel"
            >
              <PanelLeft className="w-4 h-4 text-emerald-500" />
              <span>Add Items</span>
            </button>
          )}

          {/* Quick toggle if Right Panel is collapsed */}
          {!rightPanelOpen && (
            <button
              type="button"
              onClick={() => setRightPanelOpen(true)}
              className="absolute top-4 right-4 z-20 px-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Open Properties Inspector"
            >
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Inspector</span>
            </button>
          )}

          {/* Certificate Canvas Frame */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: (isDragging || resizingDirection) ? 'none' : 'transform 0.15s ease'
            }}
          >
            <div
              ref={certRef}
              onClick={(e) => {
                if (e.target === certRef.current) {
                  setSelectedElementId(null);
                }
              }}
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundColor: backgroundColor,
                borderColor: borderColor
              }}
              className="relative shadow-2xl rounded-2xl overflow-hidden select-none border"
            >
              {/* Elements rendering */}
              {elements.map((el) => {
                if (el.hidden) return null;
                const isSelected = selectedElementId === el.id && !previewMode;

                // Interactive Selection & Resize Handles
                const selectionHandles = isSelected ? (
                  <>
                    <div className="absolute inset-0 ring-2 ring-emerald-500 ring-offset-2 ring-offset-black/50 pointer-events-none rounded-[inherit]" />
                    {/* Corner resize handles */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 'nw', el)}
                      className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-sm shadow cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Top-Left"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 'ne', el)}
                      className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-sm shadow cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Top-Right"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 'sw', el)}
                      className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-sm shadow cursor-nesw-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Bottom-Left"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 'se', el)}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-sm shadow cursor-nwse-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Bottom-Right"
                    />
                    {/* Edge resize handles */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 'e', el)}
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow cursor-ew-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Width"
                    />
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, 's', el)}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow cursor-ns-resize z-50 hover:scale-125 transition-transform"
                      title="Resize Height"
                    />
                  </>
                ) : null;

                // ── Render Text ──
                if (el.type === 'text') {
                  const resolved = resolveElementText(el.text);
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(e, el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!previewMode) {
                          setSelectedElementId(el.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: el.height ? `${el.height}px` : 'auto',
                        fontSize: `${el.fontSize || 14}px`,
                        fontWeight: el.fontWeight || 'normal',
                        fontFamily: el.fontFamily || 'Inter, sans-serif',
                        textAlign: el.textAlign || 'center',
                        color: el.color || '#ffffff',
                        letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
                        lineHeight: el.lineHeight || 1.3,
                        zIndex: isSelected ? 50 : (el.zIndex || 2),
                        cursor: previewMode ? 'default' : (el.locked ? 'pointer' : 'move')
                      }}
                      className={`transition-all ${
                        !previewMode && !isSelected ? 'hover:outline hover:outline-1 hover:outline-emerald-500/50' : ''
                      }`}
                    >
                      {selectionHandles}
                      {resolved}
                    </div>
                  );
                }

                // ── Render Shape ──
                if (el.type === 'shape') {
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(e, el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!previewMode) {
                          setSelectedElementId(el.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        backgroundColor: el.fill || 'transparent',
                        borderColor: el.stroke || 'transparent',
                        borderWidth: `${el.strokeWidth || 0}px`,
                        borderStyle: el.strokeWidth ? 'solid' : 'none',
                        borderRadius: `${el.borderRadius || 0}px`,
                        zIndex: isSelected ? 49 : (el.zIndex || 1),
                        cursor: previewMode ? 'default' : (el.locked ? 'pointer' : 'move')
                      }}
                      className={`transition-all ${
                        !previewMode && !isSelected ? 'hover:outline hover:outline-1 hover:outline-emerald-500/50' : ''
                      }`}
                    >
                      {selectionHandles}
                    </div>
                  );
                }

                // ── Render Image / Logo ──
                if (el.type === 'image') {
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(e, el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!previewMode) {
                          setSelectedElementId(el.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        zIndex: isSelected ? 50 : (el.zIndex || 3),
                        cursor: previewMode ? 'default' : (el.locked ? 'pointer' : 'move')
                      }}
                      className={`transition-all ${
                        !previewMode && !isSelected ? 'hover:outline hover:outline-1 hover:outline-emerald-500/50' : ''
                      }`}
                    >
                      {selectionHandles}
                      <img
                        src={el.src}
                        alt={el.name || 'Certificate element'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: el.opacity ?? 1,
                          borderRadius: `${el.borderRadius || 0}px`
                        }}
                        draggable={false}
                      />
                    </div>
                  );
                }

                // ── Render QR Code ( ems.aitamsac.in domain ) ──
                if (el.type === 'qr') {
                  const qrVal = `https://ems.aitamsac.in/verify/certificate?id=${currentMember.certId}&member=${encodeURIComponent(currentMember.name)}&team=${encodeURIComponent(currentMember.teamName)}&event=${encodeURIComponent(eventData?.eventName || 'Avishkaar 4')}`;
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(e, el)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!previewMode) {
                          setSelectedElementId(el.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        backgroundColor: el.bgColor || '#ffffff',
                        padding: '4px',
                        borderRadius: `${el.borderRadius || 6}px`,
                        zIndex: isSelected ? 50 : (el.zIndex || 4),
                        cursor: previewMode ? 'default' : (el.locked ? 'pointer' : 'move')
                      }}
                      className={`transition-all flex items-center justify-center ${
                        !previewMode && !isSelected ? 'hover:outline hover:outline-1 hover:outline-emerald-500/50' : ''
                      }`}
                    >
                      {selectionHandles}
                      <QRCodeSVG
                        value={qrVal}
                        size={el.width - 8}
                        level="M"
                        fgColor={el.color || '#000000'}
                        bgColor={el.bgColor || '#ffffff'}
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* ── FLOATING BOTTOM DOCK (Undo/Redo, Zoom Controls & Fit) ── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-zinc-800 text-xs">
            {/* Undo / Redo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

            {/* Zoom controls */}
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(0.85)}
              className="px-2 py-0.5 rounded-lg font-mono font-bold text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
              title="Reset zoom to 85%"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={() => setZoom(z => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

            {/* Fit to screen */}
            <button
              type="button"
              onClick={() => setZoom(0.85)}
              className="px-2.5 py-1 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition flex items-center gap-1 font-semibold text-[11px]"
              title="Fit Certificate to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fit</span>
            </button>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR (Element Inspector & Color Palette) ── */}
        <aside
          className={`bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 z-20 transition-all duration-300 ease-in-out ${
            rightPanelOpen ? 'w-84' : 'w-0 overflow-hidden border-l-0'
          }`}
        >
          {/* Header */}
          <div className="h-12 border-b border-slate-200 dark:border-zinc-800 px-4 flex items-center justify-between bg-slate-50 dark:bg-black/60 shrink-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedElement ? `Edit ${selectedElement.type.toUpperCase()}` : 'Canvas Setup'}
            </span>
            {selectedElement && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCenterElement('horizontal')}
                  className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
                  title="Center Horizontally"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicateElement(selectedElement.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteElement(selectedElement.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedElement ? (
              <>
                {/* ── Image Controls ── */}
                {selectedElement.type === 'image' && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Image Properties
                    </span>

                    {/* Image Preview & Replace */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="h-24 w-full rounded-xl bg-black/40 flex items-center justify-center p-2 border border-slate-200 dark:border-zinc-800 overflow-hidden">
                        <img
                          src={selectedElement.src}
                          alt="Selected element"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => replaceImageInputRef.current?.click()}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                      </button>
                    </div>

                    {/* Opacity slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Opacity</span>
                        <span className="font-mono">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={selectedElement.opacity ?? 1}
                        onChange={(e) => commitSelectedElementChange({ opacity: Number(e.target.value) })}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Corner Radius */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Corner Radius (px)</label>
                      <input
                        type="number"
                        min="0"
                        value={selectedElement.borderRadius || 0}
                        onChange={(e) => commitSelectedElementChange({ borderRadius: Number(e.target.value) })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* ── Text Content ── */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Text Content / Template Tag
                    </label>
                    <textarea
                      rows={3}
                      value={selectedElement.text || ''}
                      onChange={(e) => commitSelectedElementChange({ text: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

                {/* ── Typography Controls ── */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Typography &amp; Color
                    </span>

                    {/* Font Family */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Font Family</label>
                      <select
                        value={selectedElement.fontFamily || 'Inter, sans-serif'}
                        onChange={(e) => commitSelectedElementChange({ fontFamily: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      >
                        {CERTIFICATE_FONTS.map(f => (
                          <option key={f.name} value={f.family}>{f.name} ({f.category})</option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size & Weight */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Size (px)</label>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 14}
                          onChange={(e) => commitSelectedElementChange({ fontSize: Number(e.target.value) })}
                          className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Weight</label>
                        <select
                          value={selectedElement.fontWeight || '400'}
                          onChange={(e) => commitSelectedElementChange({ fontWeight: e.target.value })}
                          className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        >
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="600">600 (Semibold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>
                    </div>

                    {/* Color with Quick Swatches */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Text Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedElement.color?.startsWith('#') ? selectedElement.color : '#ffffff'}
                          onChange={(e) => commitSelectedElementChange({ color: e.target.value })}
                          className="w-7 h-7 rounded border border-slate-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.color || '#ffffff'}
                          onChange={(e) => commitSelectedElementChange({ color: e.target.value })}
                          className="w-full rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1 px-1.5 text-[11px] text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                        />
                      </div>

                      {/* Quick Swatches */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {COLOR_SWATCHES.filter(s => s.value !== 'transparent').map(sw => (
                          <button
                            key={sw.value}
                            type="button"
                            onClick={() => commitSelectedElementChange({ color: sw.value })}
                            className="w-5 h-5 rounded-md border border-slate-300 dark:border-zinc-700 transition hover:scale-110 cursor-pointer shadow-sm"
                            style={{ backgroundColor: sw.value }}
                            title={sw.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Alignment</label>
                      <div className="flex bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-0.5">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => commitSelectedElementChange({ textAlign: align })}
                            className={`flex-1 py-1 text-[11px] rounded capitalize transition cursor-pointer ${
                              (selectedElement.textAlign || 'center') === align
                                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Shape Properties ── */}
                {selectedElement.type === 'shape' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Shape Styling &amp; Colors
                    </span>
                    <div className="space-y-2.5">
                      {/* Fill Color */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Fill Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={selectedElement.fill?.startsWith('#') ? selectedElement.fill : '#10b981'}
                            onChange={(e) => commitSelectedElementChange({ fill: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedElement.fill || 'transparent'}
                            onChange={(e) => commitSelectedElementChange({ fill: e.target.value })}
                            className="w-full rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1 px-1.5 text-[11px] text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {/* Swatches */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {COLOR_SWATCHES.map(sw => (
                            <button
                              key={sw.value}
                              type="button"
                              onClick={() => commitSelectedElementChange({ fill: sw.value })}
                              className="w-5 h-5 rounded-md border border-slate-300 dark:border-zinc-700 transition hover:scale-110 cursor-pointer shadow-sm"
                              style={{ backgroundColor: sw.value }}
                              title={sw.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Stroke Color */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400">Border (Stroke) Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={selectedElement.stroke?.startsWith('#') ? selectedElement.stroke : '#10b981'}
                            onChange={(e) => commitSelectedElementChange({ stroke: e.target.value })}
                            className="w-7 h-7 rounded border border-slate-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedElement.stroke || '#10b981'}
                            onChange={(e) => commitSelectedElementChange({ stroke: e.target.value })}
                            className="w-full rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1 px-1.5 text-[11px] text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {/* Swatches */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {COLOR_SWATCHES.filter(s => s.value !== 'transparent').map(sw => (
                            <button
                              key={sw.value}
                              type="button"
                              onClick={() => commitSelectedElementChange({ stroke: sw.value })}
                              className="w-5 h-5 rounded-md border border-slate-300 dark:border-zinc-700 transition hover:scale-110 cursor-pointer shadow-sm"
                              style={{ backgroundColor: sw.value }}
                              title={sw.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400">Border Width (px)</label>
                          <input
                            type="number"
                            value={selectedElement.strokeWidth || 0}
                            onChange={(e) => commitSelectedElementChange({ strokeWidth: Number(e.target.value) })}
                            className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400">Corner Radius (px)</label>
                          <input
                            type="number"
                            value={selectedElement.borderRadius || 0}
                            onChange={(e) => commitSelectedElementChange({ borderRadius: Number(e.target.value) })}
                            className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── QR Code Properties ── */}
                {selectedElement.type === 'qr' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      QR Code Settings
                    </span>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">Live Verification Domain:</p>
                      <p className="font-mono text-[10px] text-slate-700 dark:text-zinc-300 break-all">
                        https://ems.aitamsac.in/verify/certificate?id=...
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Position & Size (Supports all elements including Images) ── */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Position &amp; Size
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Drag canvas handles
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">X (px)</label>
                      <input
                        type="number"
                        value={selectedElement.x || 0}
                        onChange={(e) => commitSelectedElementChange({ x: Number(e.target.value) })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Y (px)</label>
                      <input
                        type="number"
                        value={selectedElement.y || 0}
                        onChange={(e) => commitSelectedElementChange({ y: Number(e.target.value) })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Width (px)</label>
                      <input
                        type="number"
                        min="20"
                        value={selectedElement.width || 0}
                        onChange={(e) => commitSelectedElementChange({ width: Number(e.target.value) })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">Height (px)</label>
                      <input
                        type="number"
                        min="10"
                        value={selectedElement.height || 0}
                        onChange={(e) => commitSelectedElementChange({ height: Number(e.target.value) })}
                        className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Layer Lock Control */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Lock Position
                    </span>
                    <button
                      type="button"
                      onClick={() => commitSelectedElementChange({ locked: !selectedElement.locked })}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        selectedElement.locked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{selectedElement.locked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Global Canvas Settings (When no element is selected) */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-2.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Certificate Canvas Info</span>
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">297 × 210 mm (A4)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Orientation:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 capitalize font-bold">{orientation}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">1000 × 707 px</strong>
                    </div>
                  </div>
                </div>

                {/* Canvas Background Color with Quick Swatches */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Canvas Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor?.startsWith('#') ? backgroundColor : '#021814'}
                      onChange={(e) => handleUpdateCanvasBg(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => handleUpdateCanvasBg(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_SWATCHES.filter(s => s.value !== 'transparent').map(sw => (
                      <button
                        key={sw.value}
                        type="button"
                        onClick={() => handleUpdateCanvasBg(sw.value)}
                        className="w-6 h-6 rounded-lg border border-slate-300 dark:border-zinc-700 transition hover:scale-110 cursor-pointer shadow-sm"
                        style={{ backgroundColor: sw.value }}
                        title={sw.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Border Frame Color with Quick Swatches */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Border Frame &amp; Corner Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor?.startsWith('#') ? borderColor : '#10b981'}
                      onChange={(e) => handleUpdateBorderColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 dark:border-zinc-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => handleUpdateBorderColor(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 py-1.5 px-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COLOR_SWATCHES.filter(s => s.value !== 'transparent').map(sw => (
                      <button
                        key={sw.value}
                        type="button"
                        onClick={() => handleUpdateBorderColor(sw.value)}
                        className="w-6 h-6 rounded-lg border border-slate-300 dark:border-zinc-700 transition hover:scale-110 cursor-pointer shadow-sm"
                        style={{ backgroundColor: sw.value }}
                        title={sw.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Multi-Member Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    When teams have multiple members (e.g. 4 students), this template dynamically produces distinct, individualized certificates for each member.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
