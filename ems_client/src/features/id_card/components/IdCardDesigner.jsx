import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import {
  IdCard,
  Save,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Type,
  Square,
  Circle,
  Minus,
  Image as ImageIcon,
  QrCode,
  LayoutGrid,
  Download,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Shield,
  Upload,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Palette,
  Check,
  X,
  Layers,
  SlidersHorizontal,
  Flame,
  FileImage,
  Lock,
  Unlock,
  Ratio,
  Move,
  Users,
  Sparkles,
  MapPin,
  Target,
  Code2,
  Building2,
  Award,
  Calendar
} from 'lucide-react';
import { renderCardSide } from '../services/idCardRenderer';
import BulkGenerationModal from './BulkGenerationModal';
import FontPickerModal from './FontPickerModal';
import FigmaFontPicker from './FigmaFontPicker';
import {
  FONTS_CATALOG,
  FONT_CATEGORIES,
  loadGoogleFontDynamically
} from '../constants/fontsCatalog';

const FONT_OPTIONS = FONTS_CATALOG;

export const CARD_SIZES = [
  {
    id: 'cr80',
    name: 'CR80 Standard',
    badge: 'PVC Pass',
    dimensions: '85.6 × 54 mm',
    widthMm: 53.98,
    heightMm: 85.60,
    portrait: { width: 380, height: 600 },
    landscape: { width: 600, height: 380 }
  },
  {
    id: 'a6',
    name: 'A6 Large Badge',
    badge: 'Conference / Festival',
    dimensions: '105 × 148 mm',
    widthMm: 105,
    heightMm: 148,
    portrait: { width: 440, height: 620 },
    landscape: { width: 620, height: 440 }
  },
  {
    id: 'a7',
    name: 'A7 Compact Pass',
    badge: 'Pocket Badge',
    dimensions: '74 × 105 mm',
    widthMm: 74,
    heightMm: 105,
    portrait: { width: 360, height: 510 },
    landscape: { width: 510, height: 360 }
  },
  {
    id: 'square',
    name: 'Square VIP Pass',
    badge: 'Convention Badge',
    dimensions: '100 × 100 mm',
    widthMm: 100,
    heightMm: 100,
    portrait: { width: 480, height: 480 },
    landscape: { width: 480, height: 480 }
  },
  {
    id: 'hanging',
    name: 'Tall Lanyard Pass',
    badge: 'Large Hanging Pass',
    dimensions: '90 × 140 mm',
    widthMm: 90,
    heightMm: 140,
    portrait: { width: 390, height: 610 },
    landscape: { width: 610, height: 390 }
  }
];

export const TEAM_CARD_SIZES = [
  {
    id: 'desk_tent',
    name: 'Desk Tent Display',
    badge: 'Standard Presentation Placard',
    dimensions: '150 × 95 mm',
    widthMm: 150,
    heightMm: 95,
    landscape: { width: 750, height: 475 },
    portrait: { width: 475, height: 750 }
  },
  {
    id: 'table_a5',
    name: 'Table Placard A5',
    badge: 'Booth Exhibition Board',
    dimensions: '210 × 148 mm',
    widthMm: 210,
    heightMm: 148,
    landscape: { width: 780, height: 550 },
    portrait: { width: 550, height: 780 }
  },
  {
    id: 'compact_desk',
    name: 'Compact Table Card',
    badge: 'Mini Desk Display',
    dimensions: '120 × 80 mm',
    widthMm: 120,
    heightMm: 80,
    landscape: { width: 660, height: 440 },
    portrait: { width: 440, height: 660 }
  },
  {
    id: 'cr80_land',
    name: 'CR80 Landscape Badge',
    badge: 'Standard Landscape Pass',
    dimensions: '85.6 × 54 mm',
    widthMm: 85.60,
    heightMm: 53.98,
    landscape: { width: 600, height: 380 },
    portrait: { width: 380, height: 600 }
  }
];

export const DYNAMIC_FIELD_CHIPS = [
  { id: 'participant_name', label: 'Participant Name', placeholder: '{{participant_name}}', type: 'text', icon: Type },
  { id: 'registration_id', label: 'ID Card Number', placeholder: '{{registration_id}}', type: 'text', icon: Type },
  { id: 'participant_photo', label: 'Participant Photo', placeholder: '{{participant_photo}}', type: 'image', icon: ImageIcon },
  { id: 'college_name', label: 'College Name', placeholder: '{{college_name}}', type: 'text', icon: Type },
  { id: 'department', label: 'Department / Branch', placeholder: '{{department}}', type: 'text', icon: Type },
  { id: 'team_name', label: 'Team Name', placeholder: '{{team_name}}', type: 'text', icon: Type },
  { id: 'event_name', label: 'Event Name', placeholder: '{{event_name}}', type: 'text', icon: Type },
  { id: 'event_date', label: 'Event Date', placeholder: '{{event_date}}', type: 'text', icon: Type },
  { id: 'participant_category', label: 'Category / Role', placeholder: '{{participant_category}}', type: 'text', icon: Type },
  { id: 'qr_code', label: 'Verification QR', placeholder: '{{qr_code}}', type: 'qr', icon: QrCode }
];

export const TEAM_DYNAMIC_FIELD_CHIPS = [
  { id: 'team_name', label: 'Team Name', placeholder: '{{team_name}}', type: 'text', icon: Users },
  { id: 'team_id', label: 'Team ID Badge', placeholder: 'TEAM-{{team_id}}', type: 'text', icon: Sparkles },
  { id: 'placement', label: 'Desk / Lab Placement', placeholder: '{{placement}}', type: 'text', icon: MapPin },
  { id: 'direction', label: 'Wing / Direction', placeholder: '{{direction}}', type: 'text', icon: MapPin },
  { id: 'problem_statement', label: 'Problem Statement', placeholder: '{{problem_statement}}', type: 'text', icon: Target },
  { id: 'ps_domain', label: 'Track / Domain', placeholder: '{{ps_domain}}', type: 'text', icon: Code2 },
  { id: 'qr_code', label: 'Evaluation QR Code', placeholder: '{{qr_code}}', type: 'qr', icon: QrCode },
  { id: 'college_name', label: 'College / Institute', placeholder: '{{college_name}}', type: 'text', icon: Building2 },
  { id: 'event_name', label: 'Event Name', placeholder: '{{event_name}}', type: 'text', icon: Award },
  { id: 'team_lead_name', label: 'Team Lead Name', placeholder: '{{team_lead_name}}', type: 'text', icon: Type },
  { id: 'team_lead_photo', label: 'Team Lead Photo', placeholder: '{{team_lead_photo}}', type: 'image', icon: ImageIcon },
  { id: 'member_2_name', label: 'Member 2 Name', placeholder: '{{member_2_name}}', type: 'text', icon: Type },
  { id: 'member_2_photo', label: 'Member 2 Photo', placeholder: '{{member_2_photo}}', type: 'image', icon: ImageIcon },
  { id: 'member_3_name', label: 'Member 3 Name', placeholder: '{{member_3_name}}', type: 'text', icon: Type },
  { id: 'member_3_photo', label: 'Member 3 Photo', placeholder: '{{member_3_photo}}', type: 'image', icon: ImageIcon },
  { id: 'member_4_name', label: 'Member 4 Name', placeholder: '{{member_4_name}}', type: 'text', icon: Type },
  { id: 'member_4_photo', label: 'Member 4 Photo', placeholder: '{{member_4_photo}}', type: 'image', icon: ImageIcon }
];

const SOLID_PRESETS = [
  { name: 'Obsidian Black', value: '#09090b' },
  { name: 'Deep Emerald', value: '#064e3b' },
  { name: 'Midnight Navy', value: '#020617' },
  { name: 'Slate Gray', value: '#0f172a' },
  { name: 'Carbon Zinc', value: '#18181b' },
  { name: 'Deep Crimson', value: '#450a0a' },
  { name: 'Royal Indigo', value: '#1e1b4b' },
  { name: 'Dark Teal', value: '#042f2e' }
];

const GRADIENT_PRESETS = [
  { name: 'Emerald Cyber', color1: '#064e3b', color2: '#022c22', angle: 135 },
  { name: 'Neon Midnight', color1: '#0f172a', color2: '#064e3b', angle: 135 },
  { name: 'Cosmic Indigo', color1: '#020617', color2: '#1e1b4b', angle: 135 },
  { name: 'Royal Violet', color1: '#09090b', color2: '#2e1065', angle: 135 },
  { name: 'Sunset Dusk', color1: '#18181b', color2: '#450a0a', angle: 135 },
  { name: 'Deep Abyss', color1: '#042f2e', color2: '#083344', angle: 135 }
];

const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', className: '-top-1.5 -left-1.5' },
  { id: 'n',  cursor: 'ns-resize',   className: '-top-1.5 left-1/2 -translate-x-1/2' },
  { id: 'ne', cursor: 'nesw-resize', className: '-top-1.5 -right-1.5' },
  { id: 'e',  cursor: 'ew-resize',   className: 'top-1/2 -translate-y-1/2 -right-1.5' },
  { id: 'se', cursor: 'nwse-resize', className: '-bottom-1.5 -right-1.5' },
  { id: 's',  cursor: 'ns-resize',   className: '-bottom-1.5 left-1/2 -translate-x-1/2' },
  { id: 'sw', cursor: 'nesw-resize', className: '-bottom-1.5 -left-1.5' },
  { id: 'w',  cursor: 'ew-resize',   className: 'top-1/2 -translate-y-1/2 -left-1.5' }
];

export default function IdCardDesigner({
  eventId,
  onBack,
  initialTemplateId = null,
  initialCardType = 'id_card',
  onSaveTemplate = null
}) {
  const [event, setEvent] = useState(null);
  const [cardType, setCardType] = useState(initialCardType || 'id_card');
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [templateName, setTemplateName] = useState(initialCardType === 'team_card' ? 'Official Cyber Desk Tent' : 'Official Event Badge');
  const [orientation, setOrientation] = useState(initialCardType === 'team_card' ? 'landscape' : 'portrait');
  const [cardSizeId, setCardSizeId] = useState(initialCardType === 'team_card' ? 'desk_tent' : 'cr80');
  const [leftTab, setLeftTab] = useState('background');
  const [zoom, setZoom] = useState(1);
  const [showSafeMargin, setShowSafeMargin] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [sampleParticipants, setSampleParticipants] = useState([]);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  // Single Front-Side Card Config (No backside needed)
  const [cardConfig, setCardConfig] = useState({
    bgType: 'solid', // 'solid' | 'gradient' | 'image'
    backgroundColor: '#09090b',
    gradientColor1: '#064e3b',
    gradientColor2: '#022c22',
    gradientAngle: 135,
    backgroundImage: null,
    bgImageOpacity: 1,
    bgOverlayOpacity: 0.35,
    safeMargin: 15,
    elements: []
  });

  const [selectedElementId, setSelectedElementId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFontStudio, setShowFontStudio] = useState(false);

  const canvasRef = useRef(null);
  const assetFileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);

  const activeSizes = cardType === 'team_card' ? TEAM_CARD_SIZES : CARD_SIZES;
  const activeSizePreset = activeSizes.find((s) => s.id === cardSizeId) || activeSizes[0];
  const activeDynamicChips = cardType === 'team_card' ? TEAM_DYNAMIC_FIELD_CHIPS : DYNAMIC_FIELD_CHIPS;
  const cardWidth = orientation === 'portrait' ? activeSizePreset.portrait.width : activeSizePreset.landscape.width;
  const cardHeight = orientation === 'portrait' ? activeSizePreset.portrait.height : activeSizePreset.landscape.height;

  // 1. Initial Load: Event details, Templates, Sample Participants
  useEffect(() => {
    if (!eventId) return;

    fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}`)
      .then((r) => r.json())
      .then((d) => setEvent(d.event || d.data || d))
      .catch((e) => console.error(e));

    fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/participants`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.participants) ? d.participants : [];
        setSampleParticipants(list);
      })
      .catch((e) => console.error(e));

    fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/templates?cardType=${encodeURIComponent(cardType)}`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.templates) ? d.templates : [];
        setTemplates(list);
        if (list.length > 0) {
          const match = initialTemplateId
            ? list.find((t) => t.Id === Number(initialTemplateId))
            : list[0];
          loadTemplate(match || list[0]);
        }
      })
      .catch((e) => console.error(e));
  }, [eventId, cardType]);

  const handleSwitchCardType = (newType) => {
    if (newType === cardType) return;
    setCardType(newType);
    if (newType === 'team_card') {
      setOrientation('landscape');
      setCardSizeId('desk_tent');
      setTemplateName('Official Cyber Desk Tent');
    } else {
      setOrientation('portrait');
      setCardSizeId('cr80');
      setTemplateName('Official Event Badge');
    }
  };

  const DEFAULT_CARD_CONFIG = {
    bgType: 'solid',
    backgroundColor: '#09090b',
    gradientColor1: '#064e3b',
    gradientColor2: '#022c22',
    gradientAngle: 135,
    backgroundImage: null,
    bgImageOpacity: 1,
    bgOverlayOpacity: 0.35,
    safeMargin: 15,
    elements: []
  };

  const loadTemplate = (tmpl) => {
    if (!tmpl) return;
    setCurrentTemplate(tmpl);
    setTemplateName(tmpl.TemplateName || (cardType === 'team_card' ? 'Official Cyber Desk Tent' : 'Official Event Badge'));
    setOrientation(tmpl.Orientation || (cardType === 'team_card' ? 'landscape' : 'portrait'));

    try {
      const f = typeof tmpl.FrontConfig === 'string' ? JSON.parse(tmpl.FrontConfig) : tmpl.FrontConfig;
      if (f && typeof f === 'object') {
        if (f.cardSizeId) setCardSizeId(f.cardSizeId);
        setCardConfig({
          ...DEFAULT_CARD_CONFIG,
          ...f,
          elements: Array.isArray(f.elements) ? f.elements : []
        });
      }
    } catch (e) {
      console.error(e);
    }

    setSelectedElementId(null);
  };

  // Push State to History
  const recordHistory = useCallback((nextConfig) => {
    if (!nextConfig) return;
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyStep + 1);
      return [...trimmed, nextConfig];
    });
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  const handleUndo = () => {
    if (historyStep > 0 && history[historyStep - 1]) {
      const target = history[historyStep - 1];
      if (target && typeof target === 'object') {
        setCardConfig(target);
        setHistoryStep((prev) => prev - 1);
        setSelectedElementId(null);
      }
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && history[historyStep + 1]) {
      const target = history[historyStep + 1];
      if (target && typeof target === 'object') {
        setCardConfig(target);
        setHistoryStep((prev) => prev + 1);
        setSelectedElementId(null);
      }
    }
  };

  // 2. Render Live Canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentCfg = cardConfig || DEFAULT_CARD_CONFIG;
    const sample = cardType === 'team_card' ? {
      TeamId: '104',
      TeamName: 'CyberSentinels',
      LeaderName: 'Alex Rivers',
      College: event?.CollegeName || 'AITAM Institute of Tech',
      Placement: 'D-BLOCK • Innovation Hall • Desk 14',
      Direction: 'Right Wing Floor 2',
      ProblemStatement: 'AI Automated Campus Resource Allocation',
      Category: 'Software & AI',
      members: [
        { UserName: 'Alex Rivers', Role: 'Team Leader', Branch: 'CSE', RollNumber: '21A51A0501' },
        { UserName: 'Priya Sharma', Role: 'Member', Branch: 'AI & ML', RollNumber: '21A51A4205' },
        { UserName: 'David Chen', Role: 'Member', Branch: 'IT', RollNumber: '21A51A1210' },
        { UserName: 'Aisha Patel', Role: 'Member', Branch: 'ECE', RollNumber: '21A51A0415' }
      ]
    } : (sampleParticipants.length > 0 ? sampleParticipants[sampleIndex] : {
      ParticipantName: 'Alex Carter',
      IdCardNumber: `EV${eventId || 22}-U101`,
      College: 'AITAM Institute of Tech',
      Department: 'Engineering & Technology',
      TeamName: 'NeuralHacks',
      ParticipantCategory: 'Team Leader',
      VerificationToken: 'DEMO-VERIFY-TOKEN'
    });

    renderCardSide(canvas, currentCfg, sample, event || {}, {
      scale: 1.5,
      cardWidth,
      cardHeight,
      showSafeMargin: showSafeMargin && !previewMode,
      previewMode
    });
  }, [cardConfig, orientation, cardSizeId, previewMode, sampleIndex, sampleParticipants, event, showSafeMargin, cardWidth, cardHeight, cardType]);

  const safeConfig = cardConfig || DEFAULT_CARD_CONFIG;
  const elements = safeConfig.elements || [];
  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  const addElement = (newElem) => {
    const currentList = Array.isArray(safeConfig.elements) ? safeConfig.elements : [];
    const nextElements = [...currentList, newElem];
    const nextConfig = { ...safeConfig, elements: nextElements };
    setCardConfig(nextConfig);
    setSelectedElementId(newElem.id);
    recordHistory(nextConfig);
  };

  const updateSelectedElement = (updates) => {
    if (!selectedElementId) return;
    const currentList = Array.isArray(safeConfig.elements) ? safeConfig.elements : [];
    const nextElements = currentList.map((el) => {
      if (el.id === selectedElementId) {
        return { ...el, ...updates };
      }
      return el;
    });
    const nextConfig = { ...safeConfig, elements: nextElements };
    setCardConfig(nextConfig);
    recordHistory(nextConfig);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const currentList = Array.isArray(safeConfig.elements) ? safeConfig.elements : [];
    const nextElements = currentList.filter((el) => el.id !== selectedElementId);
    const nextConfig = { ...safeConfig, elements: nextElements };
    setCardConfig(nextConfig);
    setSelectedElementId(null);
    recordHistory(nextConfig);
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const clone = {
      ...selectedElement,
      id: `elem-${Date.now()}`,
      x: selectedElement.x + 15,
      y: selectedElement.y + 15
    };
    addElement(clone);
  };

  const alignElement = (type) => {
    if (!selectedElement) return;
    let updates = {};
    if (type === 'left') updates.x = 20;
    else if (type === 'center') updates.x = Math.round((cardWidth - selectedElement.width) / 2);
    else if (type === 'right') updates.x = cardWidth - selectedElement.width - 20;
    else if (type === 'top') updates.y = 20;
    else if (type === 'middle') updates.y = Math.round((cardHeight - selectedElement.height) / 2);
    else if (type === 'bottom') updates.y = cardHeight - selectedElement.height - 20;

    updateSelectedElement(updates);
  };

  // Save Template (Single Front Side)
  const handleSaveTemplate = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const activeSize = activeSizes.find((s) => s.id === cardSizeId) || activeSizes[0];
    const widthMm = orientation === 'portrait' ? activeSize.widthMm : activeSize.heightMm;
    const heightMm = orientation === 'portrait' ? activeSize.heightMm : activeSize.widthMm;

    const payload = {
      Id: currentTemplate?.Id || null,
      TemplateName: templateName,
      Orientation: orientation,
      CardWidth: widthMm,
      CardHeight: heightMm,
      Unit: 'mm',
      CardType: cardType,
      FrontConfig: {
        ...cardConfig,
        cardSizeId,
        widthMm,
        heightMm,
        canvasWidth: cardWidth,
        canvasHeight: cardHeight
      },
      BackConfig: null,
      IsDefault: currentTemplate?.IsDefault || 1
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const saved = data.template || { ...payload, Id: currentTemplate?.Id };
      setCurrentTemplate(saved);
      if (onSaveTemplate) {
        onSaveTemplate(saved);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      const listRes = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/templates?cardType=${encodeURIComponent(cardType)}`);
      const listData = await listRes.json();
      if (Array.isArray(listData.templates)) setTemplates(listData.templates);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Interactive Canvas Resizing for all elements
  const handleResizeStart = (e, direction, elem) => {
    if (elem.locked) return;
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = elem.x;
    const initialY = elem.y;
    const initialW = elem.width;
    const initialH = elem.height;
    const minSize = 15;
    const initialAspect = initialW / (initialH || 1);

    const onMouseMove = (moveEvent) => {
      const dx = Math.round((moveEvent.clientX - startX) / zoom);
      const dy = Math.round((moveEvent.clientY - startY) / zoom);

      let nextX = initialX;
      let nextY = initialY;
      let nextW = initialW;
      let nextH = initialH;

      if (direction.includes('e')) {
        nextW = Math.max(minSize, initialW + dx);
      }
      if (direction.includes('s')) {
        nextH = Math.max(minSize, initialH + dy);
      }
      if (direction.includes('w')) {
        const allowedDelta = Math.min(initialW - minSize, dx);
        nextX = initialX + allowedDelta;
        nextW = initialW - allowedDelta;
      }
      if (direction.includes('n')) {
        const allowedDelta = Math.min(initialH - minSize, dy);
        nextY = initialY + allowedDelta;
        nextH = initialH - allowedDelta;
      }

      // Proportional resizing if shift is held or ratio locked
      if (moveEvent.shiftKey || aspectRatioLocked) {
        if (direction === 'e' || direction === 'w') {
          nextH = Math.max(minSize, Math.round(nextW / initialAspect));
        } else if (direction === 'n' || direction === 's') {
          nextW = Math.max(minSize, Math.round(nextH * initialAspect));
        } else {
          nextH = Math.max(minSize, Math.round(nextW / initialAspect));
        }
      }

      updateSelectedElement({
        x: nextX,
        y: nextY,
        width: nextW,
        height: nextH
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Upload Asset (Logo/Icon) with natural dimensions and objectFit contain
  const handleAssetUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('asset', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/upload-asset`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Asset upload failed');

      // Detect natural image size so logos are not forced into a square
      const tempImg = new window.Image();
      tempImg.onload = () => {
        const nw = tempImg.naturalWidth || 140;
        const nh = tempImg.naturalHeight || 60;
        const aspect = nw / (nh || 1);

        let initialW = 140;
        let initialH = 60;

        if (aspect >= 1.2) {
          // Rectangular / Wide Logo
          initialW = 150;
          initialH = Math.max(25, Math.round(150 / aspect));
        } else if (aspect <= 0.8) {
          // Tall Crest / Emblem
          initialH = 90;
          initialW = Math.max(25, Math.round(90 * aspect));
        } else {
          // Roughly square badge
          initialW = 90;
          initialH = 90;
        }

        addElement({
          id: `img-${Date.now()}`,
          type: 'image',
          dynamicField: null,
          src: data.url,
          x: Math.round((cardWidth - initialW) / 2),
          y: 35,
          width: initialW,
          height: initialH,
          borderRadius: 4,
          borderWidth: 0,
          borderColor: '#10b981',
          objectFit: 'contain', // Default contain so logos fit naturally without cropping
          zIndex: (cardConfig.elements?.length || 0) + 2,
          locked: false,
          hidden: false
        });
      };

      tempImg.onerror = () => {
        addElement({
          id: `img-${Date.now()}`,
          type: 'image',
          dynamicField: null,
          src: data.url,
          x: Math.round((cardWidth - 140) / 2),
          y: 35,
          width: 140,
          height: 60,
          borderRadius: 4,
          borderWidth: 0,
          borderColor: '#10b981',
          objectFit: 'contain',
          zIndex: (cardConfig.elements?.length || 0) + 2,
          locked: false,
          hidden: false
        });
      };

      tempImg.src = data.url;
    } catch (err) {
      alert(err.message);
    }
  };

  // Upload Background Image directly
  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('asset', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/upload-asset`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Background upload failed');

      const next = {
        ...cardConfig,
        bgType: 'image',
        backgroundImage: data.url
      };
      setCardConfig(next);
      recordHistory(next);
    } catch (err) {
      alert(`Background upload error: ${err.message}`);
    }
  };

  // Background Editor Component (Rendered in both Left tab and Right inspector)
  const renderBackgroundControls = () => {
    const currentType = cardConfig.bgType || (cardConfig.backgroundImage ? 'image' : 'solid');

    return (
      <div className="space-y-4">
        {/* Type Toggle: Solid vs Gradient vs Image */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
            Background Style
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {[
              { id: 'solid', label: 'Solid Color', icon: Square },
              { id: 'gradient', label: 'Gradient', icon: Flame },
              { id: 'image', label: 'Photo / Image', icon: FileImage }
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = currentType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const next = { ...cardConfig, bgType: t.id };
                    setCardConfig(next);
                    recordHistory(next);
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 mb-0.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. SOLID COLOR SECTION */}
        {currentType === 'solid' && (
          <div className="space-y-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Pick Solid Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cardConfig.backgroundColor || '#09090b'}
                  onChange={(e) => {
                    const next = { ...cardConfig, backgroundColor: e.target.value, bgType: 'solid' };
                    setCardConfig(next);
                  }}
                  onBlur={() => recordHistory(cardConfig)}
                  className="w-9 h-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={cardConfig.backgroundColor || '#09090b'}
                  onChange={(e) => {
                    const next = { ...cardConfig, backgroundColor: e.target.value, bgType: 'solid' };
                    setCardConfig(next);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5">
                Popular Swatches
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {SOLID_PRESETS.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    onClick={() => {
                      const next = { ...cardConfig, backgroundColor: swatch.value, bgType: 'solid' };
                      setCardConfig(next);
                      recordHistory(next);
                    }}
                    className="h-7 rounded-lg border border-zinc-700/80 flex items-center justify-center transition hover:scale-105 cursor-pointer relative"
                    style={{ backgroundColor: swatch.value }}
                    title={swatch.name}
                  >
                    {cardConfig.backgroundColor === swatch.value && (
                      <Check className="h-3 w-3 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. GRADIENT SECTION */}
        {currentType === 'gradient' && (
          <div className="space-y-3.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                  Start Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cardConfig.gradientColor1 || '#064e3b'}
                    onChange={(e) => {
                      const next = { ...cardConfig, gradientColor1: e.target.value };
                      setCardConfig(next);
                    }}
                    onBlur={() => recordHistory(cardConfig)}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cardConfig.gradientColor1 || '#064e3b'}
                    onChange={(e) => {
                      const next = { ...cardConfig, gradientColor1: e.target.value };
                      setCardConfig(next);
                    }}
                    className="w-18 px-1.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                  End Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cardConfig.gradientColor2 || '#022c22'}
                    onChange={(e) => {
                      const next = { ...cardConfig, gradientColor2: e.target.value };
                      setCardConfig(next);
                    }}
                    onBlur={() => recordHistory(cardConfig)}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cardConfig.gradientColor2 || '#022c22'}
                    onChange={(e) => {
                      const next = { ...cardConfig, gradientColor2: e.target.value };
                      setCardConfig(next);
                    }}
                    className="w-18 px-1.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Angle */}
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Direction / Angle
              </label>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {[
                  { angle: 135, label: 'Diagonal ↘' },
                  { angle: 90, label: 'Right →' },
                  { angle: 180, label: 'Down ↓' },
                  { angle: 45, label: 'Up ↗' }
                ].map((dir) => (
                  <button
                    key={dir.angle}
                    type="button"
                    onClick={() => {
                      const next = { ...cardConfig, gradientAngle: dir.angle };
                      setCardConfig(next);
                      recordHistory(next);
                    }}
                    className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer ${
                      Number(cardConfig.gradientAngle || 135) === dir.angle
                        ? 'bg-emerald-600/25 border-emerald-500 text-emerald-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Gradients */}
            <div>
              <p className="text-[10px] font-bold uppercase text-zinc-500 mb-1.5">
                Curated Gradient Presets
              </p>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((gp) => (
                  <button
                    key={gp.name}
                    type="button"
                    onClick={() => {
                      const next = {
                        ...cardConfig,
                        bgType: 'gradient',
                        gradientColor1: gp.color1,
                        gradientColor2: gp.color2,
                        gradientAngle: gp.angle
                      };
                      setCardConfig(next);
                      recordHistory(next);
                    }}
                    className="h-10 rounded-xl border border-zinc-700/80 p-2 flex items-center justify-between transition hover:scale-102 cursor-pointer shadow-xs"
                    style={{
                      background: `linear-gradient(${gp.angle}deg, ${gp.color1}, ${gp.color2})`
                    }}
                  >
                    <span className="text-[10px] font-extrabold text-white drop-shadow-sm truncate">
                      {gp.name}
                    </span>
                    {cardConfig.gradientColor1 === gp.color1 && cardConfig.gradientColor2 === gp.color2 && (
                      <Check className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. BACKGROUND IMAGE SECTION */}
        {currentType === 'image' && (
          <div className="space-y-3.5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div>
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={handleBgImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bgFileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/15 text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Custom Background Image</span>
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Or Image URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={cardConfig.backgroundImage || ''}
                onChange={(e) => {
                  const next = { ...cardConfig, backgroundImage: e.target.value };
                  setCardConfig(next);
                }}
                onBlur={() => recordHistory(cardConfig)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white outline-none"
              />
            </div>

            {/* Dark Tint Overlay Slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                <span>Dark Tint Overlay (for Text Legibility)</span>
                <span className="text-emerald-400">{Math.round((Number(cardConfig.bgOverlayOpacity) || 0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                value={cardConfig.bgOverlayOpacity !== undefined ? cardConfig.bgOverlayOpacity : 0.35}
                onChange={(e) => {
                  const next = { ...cardConfig, bgOverlayOpacity: Number(e.target.value) };
                  setCardConfig(next);
                }}
                onMouseUp={() => recordHistory(cardConfig)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Image Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                <span>Image Opacity</span>
                <span className="text-emerald-400">{Math.round((Number(cardConfig.bgImageOpacity) || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={cardConfig.bgImageOpacity !== undefined ? cardConfig.bgImageOpacity : 1}
                onChange={(e) => {
                  const next = { ...cardConfig, bgImageOpacity: Number(e.target.value) };
                  setCardConfig(next);
                }}
                onMouseUp={() => recordHistory(cardConfig)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {cardConfig.backgroundImage && (
              <button
                type="button"
                onClick={() => {
                  const next = { ...cardConfig, backgroundImage: null, bgType: 'solid' };
                  setCardConfig(next);
                  recordHistory(next);
                }}
                className="w-full py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
              >
                Remove Background Image
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteSelectedElement();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelectedElement();
      } else if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        updateSelectedElement({
          x: selectedElement.x + dx,
          y: selectedElement.y + dy
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, cardConfig, historyStep]);

  return (
    <div className="flex flex-col h-full min-h-[680px] w-full bg-[#0a0d0b] text-slate-100 select-none overflow-hidden font-sans">
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. TOP TOOLBAR (Figma Style, Front-Side Focused)              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <header className="h-14 border-b border-zinc-800 bg-[#111613] px-4 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Return to Studio"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              cardType === 'team_card'
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            }`}>
              {cardType === 'team_card' ? <Users className="h-4 w-4" /> : <IdCard className="h-4 w-4" />}
            </div>
            <div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="bg-transparent text-sm font-extrabold text-white hover:bg-zinc-800/60 focus:bg-zinc-800 px-2 py-0.5 rounded-md outline-none transition w-44 sm:w-56"
              />
            </div>
          </div>

          {/* Segmented Card Type Switcher */}
          <div className="hidden md:flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchCardType('id_card')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                cardType === 'id_card'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <IdCard className="h-3.5 w-3.5" />
              <span>Participant ID</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCardType('team_card')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                cardType === 'team_card'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Team Display Card</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-zinc-800">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center: Card Size Selector & Orientation */}
        <div className="flex items-center gap-2">
          {/* Card Size Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              {cardType === 'team_card' ? 'Placard Size:' : 'Badge Size:'}
            </span>
            <select
              value={cardSizeId}
              onChange={(e) => {
                const nextSize = e.target.value;
                setCardSizeId(nextSize);
                const nextCfg = { ...cardConfig, cardSizeId: nextSize };
                setCardConfig(nextCfg);
                recordHistory(nextCfg);
              }}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {activeSizes.map((sz) => (
                <option key={sz.id} value={sz.id} className="bg-zinc-950 text-white py-1">
                  {sz.name} ({sz.dimensions})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
            title="Toggle Orientation (Portrait / Landscape)"
          >
            <Maximize2 className={`h-3.5 w-3.5 ${cardType === 'team_card' ? 'text-cyan-400' : 'text-emerald-400'}`} />
            <span className="capitalize font-bold">{orientation}</span>
          </button>
        </div>

        {/* Right actions: Preview, Save, Generate / Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              previewMode
                ? (cardType === 'team_card' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400')
                : 'border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{previewMode ? 'Live Preview' : 'Template View'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition cursor-pointer"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save'}</span>
          </button>

          {cardType === 'team_card' ? (
            <button
              type="button"
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const link = document.createElement('a');
                link.download = `${templateName.replace(/\s+/g, '_')}_TeamCard.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-black text-white shadow-lg shadow-cyan-600/25 transition cursor-pointer hover:scale-102 active:scale-98"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Team Card</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer hover:scale-102 active:scale-98"
            >
              <IdCard className="h-3.5 w-3.5" />
              <span>Generate All ID Cards</span>
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN WORKSPACE                                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: Tools, Dynamic Fields, Background & Assets */}
        <aside className="w-80 border-r border-zinc-800/80 bg-[#0d0f11] flex flex-col shrink-0 shadow-lg">
          {/* Segmented Icon Dock Tabs */}
          <div className="p-2.5 border-b border-zinc-800/80 bg-[#090b0d]">
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800/70 shadow-inner">
              {[
                { id: 'background', label: 'Backdrop', icon: Palette },
                { id: 'uploads', label: 'Logos', icon: FileImage },
                { id: 'fields', label: 'Data', icon: Type },
                { id: 'elements', label: 'Shapes', icon: Square },
                { id: 'layers', label: 'Layers', icon: Layers }
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = leftTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLeftTab(t.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-md scale-102'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-[10px] leading-tight font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB: SHAPES & TYPOGRAPHY */}
            {leftTab === 'elements' && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Typography
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `txt-${Date.now()}`,
                          type: 'text',
                          text: 'HEADING',
                          fontSize: 22,
                          fontWeight: '800',
                          fontFamily: 'Inter, sans-serif',
                          textAlign: 'center',
                          color: '#ffffff',
                          x: 40,
                          y: 80,
                          width: 300,
                          height: 35,
                          zIndex: (cardConfig.elements?.length || 0) + 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <Type className="h-4 w-4 text-emerald-400 mb-1" />
                      <p className="text-xs font-bold text-white">Heading</p>
                      <p className="text-[10px] text-zinc-500">22px Bold</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `txt-${Date.now()}`,
                          type: 'text',
                          text: 'Body text description or detail',
                          fontSize: 12,
                          fontWeight: '400',
                          fontFamily: 'Inter, sans-serif',
                          textAlign: 'center',
                          color: '#94a3b8',
                          x: 40,
                          y: 120,
                          width: 300,
                          height: 25,
                          zIndex: (cardConfig.elements?.length || 0) + 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <Type className="h-4 w-4 text-zinc-400 mb-1" />
                      <p className="text-xs font-bold text-white">Body Text</p>
                      <p className="text-[10px] text-zinc-500">12px Regular</p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Shapes & Badges
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `shp-${Date.now()}`,
                          type: 'shape',
                          shapeType: 'rectangle',
                          x: 20,
                          y: 20,
                          width: cardWidth - 40,
                          height: 60,
                          fill: 'rgba(16, 185, 129, 0.15)',
                          stroke: '#10b981',
                          strokeWidth: 1,
                          borderRadius: 12,
                          zIndex: 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <Square className="h-4 w-4 text-emerald-400 mb-1" />
                      <p className="text-xs font-bold text-white">Card Box</p>
                      <p className="text-[10px] text-zinc-500">Rounded rect</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `shp-${Date.now()}`,
                          type: 'shape',
                          shapeType: 'circle',
                          x: 140,
                          y: 80,
                          width: 100,
                          height: 100,
                          fill: 'rgba(16, 185, 129, 0.2)',
                          stroke: '#10b981',
                          strokeWidth: 2,
                          borderRadius: 50,
                          zIndex: 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <Circle className="h-4 w-4 text-emerald-400 mb-1" />
                      <p className="text-xs font-bold text-white">Circle / Ring</p>
                      <p className="text-[10px] text-zinc-500">Photo ring</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `shp-${Date.now()}`,
                          type: 'shape',
                          shapeType: 'line',
                          x: 40,
                          y: 200,
                          width: cardWidth - 80,
                          height: 2,
                          fill: 'transparent',
                          stroke: '#334155',
                          strokeWidth: 1,
                          zIndex: 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <Minus className="h-4 w-4 text-zinc-400 mb-1" />
                      <p className="text-xs font-bold text-white">Divider Line</p>
                      <p className="text-[10px] text-zinc-500">Separator</p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        addElement({
                          id: `qr-${Date.now()}`,
                          type: 'qr',
                          x: Math.round((cardWidth - 110) / 2),
                          y: 350,
                          width: 110,
                          height: 110,
                          color: '#000000',
                          bgColor: '#ffffff',
                          borderRadius: 8,
                          borderWidth: 0,
                          borderColor: 'transparent',
                          zIndex: (cardConfig.elements?.length || 0) + 1
                        })
                      }
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500 transition text-left cursor-pointer"
                    >
                      <QrCode className="h-4 w-4 text-sky-400 mb-1" />
                      <p className="text-xs font-bold text-white">QR Code</p>
                      <p className="text-[10px] text-zinc-500">Security pass</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DYNAMIC FIELDS */}
            {leftTab === 'fields' && (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border text-xs ${
                  cardType === 'team_card'
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }`}>
                  {cardType === 'team_card'
                    ? 'Click any team or member placeholder to add it to your Team Display Card design.'
                    : 'Click any field to add it as a dynamic placeholder to the card design.'}
                </div>

                <div className="space-y-1.5">
                  {activeDynamicChips.map((chip) => {
                    const ChipIcon = chip.icon;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          if (chip.type === 'image' || chip.id.includes('photo')) {
                            const isLeadOrP = chip.id === 'participant_photo' || chip.id === 'team_lead_photo';
                            const photoSize = cardType === 'team_card' ? (isLeadOrP ? 60 : 56) : 110;
                            addElement({
                              id: `photo-${Date.now()}`,
                              type: 'image',
                              dynamicField: chip.id,
                              src: '',
                              x: cardType === 'team_card' ? 80 : Math.round((cardWidth - photoSize) / 2),
                              y: cardType === 'team_card' ? 236 : 80,
                              width: photoSize,
                              height: photoSize,
                              borderRadius: Math.round(photoSize / 2),
                              borderWidth: 2,
                              borderColor: cardType === 'team_card' ? '#00e5ff' : '#10b981',
                              zIndex: (cardConfig.elements?.length || 0) + 2
                            });
                          } else if (chip.id === 'qr_code') {
                            const qrSize = cardType === 'team_card' ? 90 : 110;
                            addElement({
                              id: `qr-${Date.now()}`,
                              type: 'qr',
                              dynamicField: 'qr_code',
                              x: cardType === 'team_card' ? cardWidth - 130 : Math.round((cardWidth - qrSize) / 2),
                              y: cardType === 'team_card' ? 86 : 340,
                              width: qrSize,
                              height: qrSize,
                              color: '#000000',
                              bgColor: '#ffffff',
                              borderRadius: 8,
                              borderWidth: 0,
                              borderColor: 'transparent',
                              zIndex: (cardConfig.elements?.length || 0) + 2
                            });
                          } else {
                            const isMainTitle = chip.id === 'participant_name' || chip.id === 'team_name';
                            addElement({
                              id: `field-${Date.now()}`,
                              type: 'text',
                              text: chip.placeholder,
                              dynamicField: chip.id,
                              fontSize: isMainTitle ? (cardType === 'team_card' ? 24 : 20) : (chip.id === 'team_id' ? 12 : 13),
                              fontWeight: isMainTitle || chip.id === 'team_id' ? '800' : '600',
                              fontFamily: 'Inter, sans-serif',
                              textAlign: cardType === 'team_card' ? 'left' : 'center',
                              color: isMainTitle
                                ? (cardType === 'team_card' ? '#00e5ff' : '#ffffff')
                                : (chip.id === 'team_id' ? '#38bdf8' : '#94a3b8'),
                              x: 30,
                              y: isMainTitle ? (cardType === 'team_card' ? 88 : 210) : 180,
                              width: cardType === 'team_card' ? 440 : cardWidth - 40,
                              height: 28,
                              zIndex: (cardConfig.elements?.length || 0) + 2
                            });
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-between transition cursor-pointer text-left ${
                          cardType === 'team_card' ? 'hover:border-cyan-500 hover:bg-zinc-850' : 'hover:border-emerald-500 hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg bg-zinc-800 ${cardType === 'team_card' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                            <ChipIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{chip.label}</p>
                            <p className={`text-[10px] font-mono ${cardType === 'team_card' ? 'text-cyan-400/80' : 'text-emerald-400/80'}`}>{chip.placeholder}</p>
                          </div>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: BACKGROUND (SOLID, GRADIENT, IMAGE) */}
            {leftTab === 'background' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  Configure card background using solid colors, rich gradients, or uploaded background images.
                </div>
                {renderBackgroundControls()}
              </div>
            )}

            {/* TAB: LOGOS & GRAPHICS */}
            {leftTab === 'uploads' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  <p className="font-bold text-white mb-0.5">Movable Logos & Graphics</p>
                  <p className="text-[11px] text-zinc-400">
                    Add sponsor logos, crests, or icons. Move them anywhere on the card and resize them using the 8 interactive handles.
                  </p>
                </div>

                {/* Primary Upload Button */}
                <div>
                  <input
                    type="file"
                    ref={assetFileInputRef}
                    onChange={handleAssetUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => assetFileInputRef.current?.click()}
                    className="w-full py-3.5 px-3 rounded-2xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 text-xs font-bold text-emerald-300 flex flex-col items-center justify-center gap-1 transition cursor-pointer shadow-sm group"
                  >
                    <Upload className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-white text-xs">+ Upload Logo Image</span>
                    <span className="text-[10px] text-zinc-400">PNG, SVG, or JPG (aspect ratio preserved)</span>
                  </button>
                </div>

                {/* Add Logo via URL */}
                <div className="space-y-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block">
                    Or Add Logo by Web URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!logoUrlInput.trim()) return;
                        addElement({
                          id: `logo-${Date.now()}`,
                          type: 'image',
                          dynamicField: null,
                          src: logoUrlInput.trim(),
                          x: Math.round((cardWidth - 150) / 2),
                          y: 35,
                          width: 150,
                          height: 55,
                          borderRadius: 4,
                          borderWidth: 0,
                          borderColor: '#10b981',
                          objectFit: 'contain',
                          zIndex: (cardConfig.elements?.length || 0) + 2,
                          locked: false,
                          hidden: false
                        });
                        setLogoUrlInput('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Quick Logo Starter Templates */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1.5">
                    Quick Logo Placeholders
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Event Logo Banner', w: 160, h: 55, desc: 'Top horizontal logo' },
                      { label: 'Sponsor Badge', w: 120, h: 45, desc: 'Partner logo' },
                      { label: 'Organizer Crest', w: 80, h: 80, desc: 'Square / Round crest' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          addElement({
                            id: `logo-${Date.now()}`,
                            type: 'image',
                            dynamicField: null,
                            src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
                            x: Math.round((cardWidth - item.w) / 2),
                            y: 30,
                            width: item.w,
                            height: item.h,
                            borderRadius: item.w === item.h ? 40 : 4,
                            borderWidth: 0,
                            borderColor: '#10b981',
                            objectFit: 'contain',
                            zIndex: (cardConfig.elements?.length || 0) + 2,
                            locked: false,
                            hidden: false
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-emerald-500 flex items-center justify-between text-left transition cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{item.label}</p>
                          <p className="text-[10px] text-zinc-400">{item.desc} ({item.w}×{item.h})</p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difference Callout */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="text-emerald-400 font-bold block mb-0.5">Looking for Card Background?</span>
                  To set full card background image, gradient or solid color, switch to the <button type="button" onClick={() => setLeftTab('background')} className="text-emerald-400 underline font-semibold cursor-pointer">Background tab</button>.
                </div>
              </div>
            )}

            {/* TAB: LAYERS */}
            {leftTab === 'layers' && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Card Elements ({(cardConfig.elements || []).length})
                </p>
                <div className="space-y-1">
                  {(cardConfig.elements || []).map((elem) => {
                    const isSelected = elem.id === selectedElementId;
                    return (
                      <div
                        key={elem.id}
                        onClick={() => setSelectedElementId(elem.id)}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                            : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate max-w-[150px]">
                          {elem.dynamicField ? `{{${elem.dynamicField}}}` : elem.text || elem.type}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSelectedElement({ hidden: !elem.hidden });
                            }}
                            className="p-1 hover:text-white text-zinc-500"
                          >
                            {elem.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* CENTER: INTERACTIVE CANVAS ARTBOARD                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col items-center justify-center relative overflow-auto bg-[#0a0d0e] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] p-8">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-bold text-zinc-300 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSafeMargin(!showSafeMargin)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                showSafeMargin ? 'text-rose-400 bg-rose-500/15' : 'text-zinc-500 hover:text-white'
              }`}
              title="Toggle Safe Print Margins (3mm bleed)"
            >
              <Shield className="h-4 w-4" />
            </button>
          </div>

          {previewMode && sampleParticipants.length > 0 && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 backdrop-blur-md shadow-lg">
              <span className="text-xs text-zinc-400 font-semibold pl-1">
                Sample ({sampleIndex + 1}/{sampleParticipants.length}):
              </span>
              <span className="text-xs font-bold text-emerald-400 max-w-[140px] truncate">
                {sampleParticipants[sampleIndex]?.ParticipantName}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSampleIndex((i) => (i > 0 ? i - 1 : sampleParticipants.length - 1))}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSampleIndex((i) => (i < sampleParticipants.length - 1 ? i + 1 : 0))}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Central Artboard */}
          <div
            className="relative rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-100 ease-out"
            style={{
              width: cardWidth,
              height: cardHeight,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 rounded-2xl pointer-events-none z-10"
              style={{ width: cardWidth, height: cardHeight }}
            />

            <div
              className="absolute inset-0 z-20 overflow-hidden"
              onClick={() => setSelectedElementId(null)}
            >
              {!previewMode && elements.map((elem) => {
                const isSelected = elem.id === selectedElementId;
                if (elem.hidden) return null;

                return (
                  <div
                    key={elem.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(elem.id);
                    }}
                    onMouseDown={(e) => {
                      if (elem.locked) return;
                      e.stopPropagation();
                      setSelectedElementId(elem.id);

                      const startX = e.clientX;
                      const startY = e.clientY;
                      const initialElemX = elem.x;
                      const initialElemY = elem.y;

                      const handleMouseMove = (moveEvent) => {
                        const dx = Math.round((moveEvent.clientX - startX) / zoom);
                        const dy = Math.round((moveEvent.clientY - startY) / zoom);
                        updateSelectedElement({
                          x: initialElemX + dx,
                          y: initialElemY + dy
                        });
                      };

                      const handleMouseUp = () => {
                        window.removeEventListener('mousemove', handleMouseMove);
                        window.removeEventListener('mouseup', handleMouseUp);
                      };

                      window.addEventListener('mousemove', handleMouseMove);
                      window.addEventListener('mouseup', handleMouseUp);
                    }}
                    style={{
                      position: 'absolute',
                      left: elem.x,
                      top: elem.y,
                      width: elem.width,
                      height: elem.height,
                      cursor: elem.locked ? 'not-allowed' : 'move'
                    }}
                    className={`group ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-black'
                        : 'hover:ring-1 hover:ring-emerald-500/50'
                    }`}
                  >
                    {/* Bounding Box Info Badge */}
                    {isSelected && (
                      <div className="absolute -top-5 left-0 flex items-center gap-1.5 pointer-events-none z-30">
                        {elem.dynamicField && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-mono font-bold text-black uppercase tracking-wider shadow">
                            {elem.dynamicField}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono font-semibold text-zinc-300 shadow">
                          {elem.type}
                        </span>
                      </div>
                    )}

                    {/* 8 Interactive Resize Handles */}
                    {isSelected && !elem.locked && (
                      <>
                        {RESIZE_HANDLES.map((h) => (
                          <div
                            key={h.id}
                            onMouseDown={(e) => handleResizeStart(e, h.id, elem)}
                            className={`absolute w-2.5 h-2.5 bg-white border-2 border-emerald-500 rounded-xs shadow-md z-30 pointer-events-auto hover:scale-130 transition-transform ${h.className}`}
                            style={{ cursor: h.cursor }}
                            title={`Drag to resize (${h.id.toUpperCase()})`}
                          />
                        ))}

                        {/* Live dimensions pill at bottom */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-zinc-950/95 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 whitespace-nowrap shadow-lg pointer-events-none z-30 flex items-center gap-1">
                          <span>{elem.width} × {elem.height} px</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* RIGHT SIDEBAR: PROPERTIES INSPECTOR                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <aside className="w-80 border-l border-zinc-800/80 bg-[#0d0f11] flex flex-col shrink-0 overflow-y-auto p-4 space-y-4 shadow-lg">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {selectedElement.type} Element
                  </h4>
                  {selectedElement.dynamicField && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      Bound: {selectedElement.dynamicField}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={duplicateSelectedElement}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={deleteSelectedElement}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-zinc-800"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Bind Dynamic Field
                </label>
                <select
                  value={selectedElement.dynamicField || ''}
                  onChange={(e) => updateSelectedElement({ dynamicField: e.target.value || null })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Static (No dynamic binding)</option>
                  {activeDynamicChips.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">
                    Position & Size
                  </label>
                  <button
                    type="button"
                    onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                      aspectRatioLocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={aspectRatioLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                  >
                    {aspectRatioLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    <span>{aspectRatioLocked ? 'Locked' : 'Lock Ratio'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 mr-1 font-mono">X</span>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                      className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 mr-1 font-mono">Y</span>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                      className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 mr-1 font-mono">W</span>
                    <input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => {
                        const newW = Math.max(10, Number(e.target.value));
                        if (aspectRatioLocked && selectedElement.width > 0) {
                          const ratio = selectedElement.height / selectedElement.width;
                          updateSelectedElement({ width: newW, height: Math.max(10, Math.round(newW * ratio)) });
                        } else {
                          updateSelectedElement({ width: newW });
                        }
                      }}
                      className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 mr-1 font-mono">H</span>
                    <input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => {
                        const newH = Math.max(10, Number(e.target.value));
                        if (aspectRatioLocked && selectedElement.height > 0) {
                          const ratio = selectedElement.width / selectedElement.height;
                          updateSelectedElement({ height: newH, width: Math.max(10, Math.round(newH * ratio)) });
                        } else {
                          updateSelectedElement({ height: newH });
                        }
                      }}
                      className="w-16 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                  Align to Card
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => alignElement('left')}
                    className="p-1.5 flex-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-center text-zinc-300"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('center')}
                    className="p-1.5 flex-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-center text-zinc-300"
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => alignElement('right')}
                    className="p-1.5 flex-1 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-center text-zinc-300"
                  >
                    Right
                  </button>
                </div>
              </div>

              {/* --- FIGMA-STYLE TYPOGRAPHY CONTROLS --- */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3.5 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Text Content
                    </label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Figma-Style Font Picker (Displays every font in its real font style, contained dropdown) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">
                        Typography ({FONTS_CATALOG.length}+ Fonts)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowFontStudio(true)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Open full Typography Studio Grid"
                      >
                        <LayoutGrid className="h-3 w-3" />
                        <span>Studio Grid</span>
                      </button>
                    </div>

                    <FigmaFontPicker
                      value={selectedElement.fontFamily || FONTS_CATALOG[0].value}
                      onChange={(newFont) => {
                        updateSelectedElement({ fontFamily: newFont });
                      }}
                      onOpenStudio={() => setShowFontStudio(true)}
                    />
                  </div>

                  {/* Font Weight & Italic Style */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Weight
                      </label>
                      <select
                        value={selectedElement.fontWeight || '400'}
                        onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="300">300 Light</option>
                        <option value="400">400 Regular</option>
                        <option value="500">500 Medium</option>
                        <option value="600">600 SemiBold</option>
                        <option value="700">700 Bold</option>
                        <option value="800">800 ExtraBold</option>
                        <option value="900">900 Black</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Style
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
                          })
                        }
                        className={`w-full py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          selectedElement.fontStyle === 'italic'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <span className="italic">Italic</span>
                      </button>
                    </div>
                  </div>

                  {/* Size (px) & Letter Spacing (Tracking) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Size ({selectedElement.fontSize || 14}px)
                      </label>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Tracking ({selectedElement.letterSpacing || 0}px)
                      </label>
                      <input
                        type="number"
                        min="-2"
                        max="12"
                        value={selectedElement.letterSpacing || 0}
                        onChange={(e) => updateSelectedElement({ letterSpacing: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Text Transform (Case) */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Text Transform
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-center">
                      {[
                        { id: 'none', label: 'Default' },
                        { id: 'uppercase', label: 'UPPER' },
                        { id: 'capitalize', label: 'Title' },
                        { id: 'lowercase', label: 'lower' }
                      ].map((c) => {
                        const current = selectedElement.textTransform || 'none';
                        const isSel = current === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updateSelectedElement({ textTransform: c.id })}
                            className={`py-1 rounded-lg transition cursor-pointer ${
                              isSel ? 'bg-emerald-600 text-white font-extrabold' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
                      {['left', 'center', 'right'].map((al) => {
                        const current = selectedElement.textAlign || 'center';
                        const isSel = current === al;
                        return (
                          <button
                            key={al}
                            type="button"
                            onClick={() => updateSelectedElement({ textAlign: al })}
                            className={`py-1 rounded-lg capitalize transition cursor-pointer ${
                              isSel ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {al}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="flex-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- IMAGE SPECIFIC CONTROLS (FIT, SHAPE, QUICK SIZES) --- */}
              {selectedElement.type === 'image' && (
                <div className="space-y-3.5 pt-2 border-t border-zinc-800">
                  {/* Object Fit Control */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1.5 flex items-center justify-between">
                      <span>Image Fit Mode</span>
                      <span className="text-emerald-400 font-mono text-[9px] uppercase">
                        {selectedElement.objectFit || (selectedElement.dynamicField === 'participant_photo' ? 'cover' : 'contain')}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-bold">
                      {[
                        { id: 'contain', label: 'Contain', desc: 'Logo / No Crop' },
                        { id: 'cover', label: 'Cover', desc: 'Photo / Crop' },
                        { id: 'fill', label: 'Stretch', desc: 'Exact Fill' }
                      ].map((m) => {
                        const currentFit = selectedElement.objectFit || (selectedElement.dynamicField === 'participant_photo' ? 'cover' : 'contain');
                        const isSel = currentFit === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateSelectedElement({ objectFit: m.id })}
                            className={`py-1.5 px-1 rounded-lg text-center cursor-pointer transition ${
                              isSel ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                            }`}
                            title={m.desc}
                          >
                            <span className="block font-bold leading-tight">{m.label}</span>
                            <span className="block text-[8px] opacity-75 font-normal leading-tight">{m.desc.split('/')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Shape Presets */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Shape / Corner Radius
                    </label>
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {[
                        { label: 'Square', radius: 0 },
                        { label: 'Rounded', radius: 8 },
                        { label: 'Pill', radius: 24 },
                        {
                          label: 'Circle',
                          radius: Math.round(Math.min(selectedElement.width, selectedElement.height) / 2)
                        }
                      ].map((sh) => (
                        <button
                          key={sh.label}
                          type="button"
                          onClick={() => updateSelectedElement({ borderRadius: sh.radius })}
                          className="py-1 px-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-semibold text-zinc-300 hover:text-white transition cursor-pointer text-center"
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={Math.round(Math.min(selectedElement.width, selectedElement.height) / 2)}
                        value={selectedElement.borderRadius || 0}
                        onChange={(e) => updateSelectedElement({ borderRadius: Number(e.target.value) })}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-400 w-8 text-right">
                        {selectedElement.borderRadius || 0}px
                      </span>
                    </div>
                  </div>

                  {/* Quick Size Presets for Logos & Images */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Quick Dimensions
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Wide Logo', w: 160, h: 60, fit: 'contain', radius: 4 },
                        { label: 'Compact Logo', w: 120, h: 50, fit: 'contain', radius: 4 },
                        { label: 'Square Badge', w: 90, h: 90, fit: 'contain', radius: 8 },
                        { label: 'Photo Avatar', w: 110, h: 110, fit: 'cover', radius: 55 }
                      ].map((sz) => (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() =>
                            updateSelectedElement({
                              width: sz.w,
                              height: sz.h,
                              objectFit: sz.fit,
                              borderRadius: sz.radius
                            })
                          }
                          className="py-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition cursor-pointer"
                        >
                          <span className="block text-[10px] font-bold text-zinc-300">{sz.label}</span>
                          <span className="block text-[9px] font-mono text-emerald-400">{sz.w} × {sz.h}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border / Stroke */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Border Ring
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedElement.borderWidth || 0}
                        onChange={(e) => updateSelectedElement({ borderWidth: Number(e.target.value) })}
                        className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                      >
                        <option value="0">No Border</option>
                        <option value="1">1px Thin</option>
                        <option value="2">2px Medium</option>
                        <option value="3">3px Bold</option>
                        <option value="4">4px Heavy</option>
                      </select>
                      {Number(selectedElement.borderWidth) > 0 && (
                        <input
                          type="color"
                          value={selectedElement.borderColor || '#10b981'}
                          onChange={(e) => updateSelectedElement({ borderColor: e.target.value })}
                          className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                        />
                      )}
                    </div>
                  </div>

                  {/* Image Source / Change URL */}
                  {!selectedElement.dynamicField && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                        Image Source URL
                      </label>
                      <input
                        type="text"
                        value={selectedElement.src || ''}
                        onChange={(e) => updateSelectedElement({ src: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* --- SHAPE SPECIFIC CONTROLS --- */}
              {selectedElement.type === 'shape' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                      Corner Radius (px)
                    </label>
                    <input
                      type="number"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateSelectedElement({ borderRadius: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                      Fill Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.fill?.startsWith('#') ? selectedElement.fill : '#10b981'}
                      onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                      className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* --- QR CODE SPECIFIC CONTROLS --- */}
              {selectedElement.type === 'qr' && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                      Corner Radius (px)
                    </label>
                    <input
                      type="number"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateSelectedElement({ borderRadius: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Artboard Settings (when no element is selected) */
            <div className="space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider pb-2 border-b border-zinc-800">
                ID Card Artboard
              </h4>

              <div>
                <p className="text-[11px] text-zinc-400 font-semibold mb-1.5">Card Size & Format</p>
                <div className="space-y-1.5 mb-2">
                  {CARD_SIZES.map((sz) => {
                    const isSel = sz.id === cardSizeId;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => {
                          setCardSizeId(sz.id);
                          const nextCfg = { ...cardConfig, cardSizeId: sz.id };
                          setCardConfig(nextCfg);
                          recordHistory(nextCfg);
                        }}
                        className={`w-full p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold shadow-xs'
                            : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{sz.name}</p>
                          <p className="text-[10px] text-zinc-500">{sz.badge} • {sz.dimensions}</p>
                        </div>
                        {isSel && <Check className="h-4 w-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] font-mono text-emerald-400 font-bold">
                  Active Dimensions: {cardWidth} × {cardHeight} px ({orientation})
                </p>
              </div>

              {renderBackgroundControls()}
            </div>
          )}
        </aside>
      </div>

      <BulkGenerationModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        eventId={eventId}
        event={event}
        template={{
          ...(currentTemplate || {}),
          Id: currentTemplate?.Id || null,
          TemplateName: templateName,
          Orientation: orientation,
          cardSizeId,
          CardWidth: orientation === 'portrait' ? activeSizePreset.widthMm : activeSizePreset.heightMm,
          CardHeight: orientation === 'portrait' ? activeSizePreset.heightMm : activeSizePreset.widthMm,
          FrontConfig: {
            ...cardConfig,
            cardSizeId,
            widthMm: orientation === 'portrait' ? activeSizePreset.widthMm : activeSizePreset.heightMm,
            heightMm: orientation === 'portrait' ? activeSizePreset.heightMm : activeSizePreset.widthMm,
            canvasWidth: cardWidth,
            canvasHeight: cardHeight
          },
          BackConfig: null
        }}
      />

      <FontPickerModal
        isOpen={showFontStudio}
        onClose={() => setShowFontStudio(false)}
        currentFont={selectedElement?.fontFamily}
        onSelectFont={(fontVal) => {
          loadGoogleFontDynamically(fontVal);
          updateSelectedElement({ fontFamily: fontVal });
        }}
      />
    </div>
  );
}
