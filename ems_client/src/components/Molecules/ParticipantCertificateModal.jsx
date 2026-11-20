import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Download,
  Printer,
  Award,
  ShieldCheck,
  CheckCircle2,
  User,
  Users,
  Calendar,
  Building,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  FolderDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import useTheme from '@/Hooks/useTheme';
import useToast from '@/Hooks/useToast';
import { downloadCertificatePdf } from '@/features/certificate_designer/services/certificatePdfGenerator';

export default function ParticipantCertificateModal({
  isOpen,
  onClose,
  certificateData = null,
  currentUserName = ''
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const toast = useToast();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [downloadingIdx, setDownloadingIdx] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const certRef = useRef(null);
  const previewBoxRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(0.85);

  // Normalize certificates list
  // If backend returns `certificates` array (one per member), use it;
  // otherwise fallback to members list or team lead
  const certificatesList = React.useMemo(() => {
    if (Array.isArray(certificateData?.certificates) && certificateData.certificates.length > 0) {
      return certificateData.certificates;
    }

    const members = certificateData?.members || [];
    const team = certificateData?.team || {};
    const event = certificateData?.event || {};

    if (members.length > 0) {
      return members.map((m, idx) => ({
        certificateId: `${certificateData?.certificateId || 'CERT-VIRT'}-${idx + 1}`,
        sequenceIndex: idx + 1,
        memberId: m.Id,
        recipientName: m.MemberName || team.teamLeadName || 'Participant',
        role: String(m.Role || '').toLowerCase() === 'teamlead' || idx === 0 ? 'Team Lead' : 'Team Member',
        college: m.MemberCollege || team.college || 'AITAM College, Tekkali',
        teamName: team.teamName || 'Team',
        eventName: event.eventName || 'Avishkaar 4',
        track: team.track || 'Virtual',
        issueDate: certificateData?.certificateIssuedAt
          ? new Date(certificateData.certificateIssuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        eventDate: event.startDate
          ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'November 2026',
        qrVerificationUrl: `https://ems.aitamsac.in/verify/certificate?id=${certificateData?.certificateId || 'CERT-VIRT'}-${idx + 1}`,
        templateConfig: certificateData?.template?.config || certificateData?.templateConfig || null
      }));
    }

    return [{
      certificateId: certificateData?.certificateId || 'CERT-VIRT-01',
      sequenceIndex: 1,
      memberId: 0,
      recipientName: team.teamLeadName || 'Participant',
      role: 'Team Lead',
      college: team.college || 'AITAM College, Tekkali',
      teamName: team.teamName || 'Team',
      eventName: event.eventName || 'Avishkaar 4',
      track: team.track || 'Virtual',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      eventDate: 'November 2026',
      qrVerificationUrl: `https://ems.aitamsac.in/verify/certificate?id=${certificateData?.certificateId || 'CERT-VIRT-01'}`,
      templateConfig: certificateData?.template?.config || certificateData?.templateConfig || null
    }];
  }, [certificateData]);

  // Default active tab to current logged-in user if found
  useEffect(() => {
    if (!certificatesList || certificatesList.length === 0) return;
    if (currentUserName) {
      const matchIdx = certificatesList.findIndex(
        (c) => (c.recipientName || '').toLowerCase() === currentUserName.toLowerCase()
      );
      if (matchIdx !== -1) {
        setSelectedIdx(matchIdx);
        return;
      }
    }
    setSelectedIdx(0);
  }, [certificatesList, currentUserName]);

  const currentCert = certificatesList[selectedIdx] || certificatesList[0] || {};

  // Active saved template config
  const activeConfig = currentCert?.templateConfig || certificateData?.template?.config || certificateData?.templateConfig || null;

  // Sync active config to ref & window cache
  useEffect(() => {
    if (typeof window !== 'undefined' && activeConfig) {
      window.__ACTIVE_CERT_CONFIG = activeConfig;
    }
    if (certRef.current) {
      certRef.current.__templateConfig = activeConfig;
      certRef.current.__memberData = currentCert;
    }
  }, [activeConfig, currentCert]);

  // Responsive scale calculator for previewing 1000px wide certificate in modal
  useEffect(() => {
    const handleResize = () => {
      if (!previewBoxRef.current) return;
      const availWidth = previewBoxRef.current.clientWidth - 24;
      const targetW = activeConfig?.CanvasWidth || 1000;
      const computed = Math.min(0.92, Math.max(0.35, availWidth / targetW));
      setPreviewScale(Number(computed.toFixed(3)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeConfig, isOpen, selectedIdx]);

  if (!isOpen) return null;

  // Dynamic text resolver for any remaining placeholder tags
  const resolveText = (raw) => {
    if (!raw) return '';
    let str = String(raw);
    str = str.replace(/\{\{recipient_name\}\}/gi, currentCert.recipientName || 'Participant');
    str = str.replace(/\{\{team_name\}\}/gi, currentCert.teamName || 'Team');
    str = str.replace(/\{\{college_name\}\}/gi, currentCert.college || 'AITAM');
    str = str.replace(/\{\{role\}\}/gi, currentCert.role || 'Member');
    str = str.replace(/\{\{team_and_role\}\}/gi, `of Team ${currentCert.teamName || 'Team'} (${currentCert.role || 'Member'})`);
    str = str.replace(/\{\{event_name\}\}/gi, currentCert.eventName || 'Avishkaar 4');
    str = str.replace(/\{\{track\}\}/gi, currentCert.track || 'Virtual');
    str = str.replace(/\{\{event_date\}\}/gi, currentCert.eventDate || '');
    str = str.replace(/\{\{venue_location\}\}/gi, currentCert.college || 'AITAM College, Tekkali');
    str = str.replace(/\{\{certificate_id\}\}/gi, currentCert.certificateId || '');
    str = str.replace(/\{\{issue_date\}\}/gi, currentCert.issueDate || '');
    str = str.replace(/\{\{signatory_1_name\}\}/gi, 'Dr. Ch. Ramesh');
    str = str.replace(/\{\{signatory_1_title\}\}/gi, 'Convener & HOD, CSE');
    str = str.replace(/\{\{signatory_2_name\}\}/gi, 'Dr. A.S. Srinivasa Rao');
    str = str.replace(/\{\{signatory_2_title\}\}/gi, 'Principal, AITAM');
    return str;
  };

  // Fallback elements matching default AITAM Prestige template if no templateConfig was returned
  const defaultFallbackElements = [
    { id: 'outer-frame', type: 'shape', x: 24, y: 24, width: 952, height: 659, fill: '#021814', stroke: '#10b981', strokeWidth: 3, borderRadius: 16, zIndex: 1 },
    { id: 'inner-frame', type: 'shape', x: 38, y: 38, width: 924, height: 631, fill: 'transparent', stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 1.5, borderRadius: 12, zIndex: 1 },
    { id: 'corner-tl', type: 'shape', x: 32, y: 32, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
    { id: 'corner-tr', type: 'shape', x: 948, y: 32, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
    { id: 'corner-bl', type: 'shape', x: 32, y: 655, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
    { id: 'corner-br', type: 'shape', x: 948, y: 655, width: 20, height: 20, fill: '#10b981', stroke: 'transparent', strokeWidth: 0, borderRadius: 2, zIndex: 2 },
    { id: 'inst-name', type: 'text', text: 'ADITYA INSTITUTE OF TECHNOLOGY AND MANAGEMENT (AITAM)', x: 80, y: 60, width: 840, fontSize: 14, fontWeight: '800', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#e2e8f0', letterSpacing: 2.5, zIndex: 3 },
    { id: 'inst-sub', type: 'text', text: 'An Autonomous Institution • Approved by AICTE • Accredited by NAAC A+', x: 80, y: 86, width: 840, fontSize: 9.5, fontWeight: '600', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', letterSpacing: 1.5, zIndex: 3 },
    { id: 'cert-title', type: 'text', text: 'CERTIFICATE OF PARTICIPATION', x: 80, y: 122, width: 840, fontSize: 28, fontWeight: '900', fontFamily: 'Georgia, serif', textAlign: 'center', color: '#10b981', letterSpacing: 4, zIndex: 3 },
    { id: 'cert-sub', type: 'text', text: 'THIS IS PROUDLY PRESENTED TO', x: 80, y: 170, width: 840, fontSize: 10.5, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', letterSpacing: 3, zIndex: 3 },
    { id: 'recipient-name', type: 'text', text: '{{recipient_name}}', x: 80, y: 200, width: 840, fontSize: 32, fontWeight: '900', fontFamily: 'Georgia, serif', textAlign: 'center', color: '#ffffff', letterSpacing: 1.5, zIndex: 4 },
    { id: 'name-underline', type: 'shape', x: 320, y: 255, width: 360, height: 2, fill: '#10b981', stroke: '#10b981', strokeWidth: 2, zIndex: 3 },
    { id: 'team-and-role', type: 'text', text: 'of Team {{team_name}} ({{role}})', x: 80, y: 270, width: 840, fontSize: 14, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#34d399', letterSpacing: 1, zIndex: 3 },
    { id: 'college-name', type: 'text', text: 'representing {{college_name}}', x: 80, y: 298, width: 840, fontSize: 12, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#cbd5e1', letterSpacing: 0.5, zIndex: 3 },
    { id: 'citation', type: 'text', text: 'for exemplary participation and successful jury evaluation in {{event_name}} ({{track}} Hackathon Track), organized on {{event_date}} at {{venue_location}}. The candidate demonstrated notable software innovation, technical diligence, and team excellence.', x: 120, y: 340, width: 760, fontSize: 11, fontWeight: '400', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', lineHeight: 1.6, zIndex: 3 },
    { id: 'event-date', type: 'text', text: '{{event_date}}', x: 80, y: 415, width: 840, fontSize: 14, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#f8fafc', letterSpacing: 1, zIndex: 3 },
    { id: 'sig1-line', type: 'shape', x: 160, y: 535, width: 220, height: 1.5, fill: '#64748b', stroke: '#64748b', strokeWidth: 1.5, zIndex: 3 },
    { id: 'sig1-name', type: 'text', text: 'Dr. Ch. Ramesh', x: 160, y: 545, width: 220, fontSize: 11, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#ffffff', zIndex: 3 },
    { id: 'sig1-title', type: 'text', text: 'Convener & HOD, CSE', x: 160, y: 562, width: 220, fontSize: 9.5, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', zIndex: 3 },
    { id: 'qr-code', type: 'qr', x: 460, y: 510, width: 80, height: 80, zIndex: 4, color: '#000000', bgColor: '#ffffff' },
    { id: 'sig2-line', type: 'shape', x: 620, y: 535, width: 220, height: 1.5, fill: '#64748b', stroke: '#64748b', strokeWidth: 1.5, zIndex: 3 },
    { id: 'sig2-name', type: 'text', text: 'Dr. A.S. Srinivasa Rao', x: 620, y: 545, width: 220, fontSize: 11, fontWeight: '700', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#ffffff', zIndex: 3 },
    { id: 'sig2-title', type: 'text', text: 'Principal, AITAM', x: 620, y: 562, width: 220, fontSize: 9.5, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'center', color: '#94a3b8', zIndex: 3 },
    { id: 'cert-serial', type: 'text', text: 'Certificate ID: {{certificate_id}}', x: 80, y: 625, width: 300, fontSize: 9, fontWeight: '600', fontFamily: 'Courier Prime, monospace', textAlign: 'left', color: '#eab308', zIndex: 3 },
    { id: 'cert-issued', type: 'text', text: 'Issued: {{issue_date}}', x: 620, y: 625, width: 300, fontSize: 9, fontWeight: '500', fontFamily: 'Inter, sans-serif', textAlign: 'right', color: '#94a3b8', zIndex: 3 }
  ];

  const activeElements = (activeConfig?.Elements && activeConfig.Elements.length > 0)
    ? activeConfig.Elements
    : defaultFallbackElements;

  // Single PDF download for a specific member
  const handleDownloadMember = async (idx) => {
    const mem = certificatesList[idx];
    if (!mem) return;

    try {
      setDownloadingIdx(idx);
      // If the selected index is not this member, switch and wait for render
      if (selectedIdx !== idx) {
        setSelectedIdx(idx);
        await new Promise((r) => setTimeout(r, 200));
      }

      const safeName = (mem.recipientName || `Member_${idx + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Certificate_${safeName}_${mem.certificateId}.pdf`;
      const configToUse = mem.templateConfig || activeConfig;

      await downloadCertificatePdf(
        { templateConfig: configToUse, memberData: mem },
        filename
      );
      toast.success(`Downloaded certificate for ${mem.recipientName}`);
    } catch (e) {
      console.error('PDF generation error:', e);
      toast.error('Failed to generate certificate PDF');
    } finally {
      setDownloadingIdx(null);
    }
  };

  // Bulk download for all team members (e.g. 4 members -> 4 individual certificates)
  const handleDownloadAll = async () => {
    if (certificatesList.length === 0) return;
    try {
      setDownloadingAll(true);
      toast.info(`Preparing ${certificatesList.length} certificates for download...`);

      for (let i = 0; i < certificatesList.length; i++) {
        const mem = certificatesList[i];
        setSelectedIdx(i);
        const safeName = (mem.recipientName || `Member_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Certificate_${safeName}_${mem.certificateId}.pdf`;
        const configToUse = mem.templateConfig || activeConfig;

        await downloadCertificatePdf(
          { templateConfig: configToUse, memberData: mem },
          filename
        );
        if (i < certificatesList.length - 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      toast.success(`All ${certificatesList.length} certificates downloaded successfully!`);
    } catch (e) {
      console.error('Bulk download error:', e);
      toast.error('Failed during bulk download');
    } finally {
      setDownloadingAll(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 my-auto space-y-5 text-slate-900 dark:text-white transition-colors">
        
        {/* ── TOP HEADER / CONTROLS ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Official Participation Certificate
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  Official Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {currentCert.eventName} &bull; {currentCert.track} Track &bull; {certificatesList.length} Team {certificatesList.length === 1 ? 'Member' : 'Members'}
              </p>
            </div>
          </div>

          {/* Top Actions: Download All, Print, Close */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {certificatesList.length > 1 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={downloadingAll || downloadingIdx !== null}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Download all certificates for all team members"
              >
                {downloadingAll ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Exporting All...</span>
                  </>
                ) : (
                  <>
                    <FolderDown className="h-3.5 w-3.5" />
                    <span>Download All ({certificatesList.length} Certificates)</span>
                  </>
                )}
              </button>
            )}

            
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── HIGH-RESOLUTION CERTIFICATE CANVAS PREVIEW ── */}
        <div ref={previewBoxRef} className="w-full flex justify-center items-center py-2 overflow-hidden">
          <div
            style={{
              width: `${(activeConfig?.CanvasWidth || 1000) * previewScale}px`,
              height: `${(activeConfig?.CanvasHeight || 707) * previewScale}px`,
              position: 'relative'
            }}
          >
            <div
              ref={certRef}
              style={{
                width: `${activeConfig?.CanvasWidth || 1000}px`,
                height: `${activeConfig?.CanvasHeight || 707}px`,
                backgroundColor: activeConfig?.BackgroundColor || '#021814',
                borderColor: activeConfig?.BorderColor || '#10b981',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              className="rounded-2xl border shadow-2xl relative overflow-hidden select-none"
            >
              {activeElements.map((el) => {
                if (el.hidden) return null;
                if (el.type === 'text') {
                  return (
                    <div
                      key={el.id}
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
                        zIndex: el.zIndex || 2
                      }}
                    >
                      {resolveText(el.text)}
                    </div>
                  );
                }
                if (el.type === 'shape') {
                  return (
                    <div
                      key={el.id}
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
                        zIndex: el.zIndex || 1
                      }}
                    />
                  );
                }
                if (el.type === 'qr') {
                  const qrVal = el.qrValue || currentCert.qrVerificationUrl || `https://ems.aitamsac.in/verify/certificate?id=${currentCert.certificateId}`;
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        backgroundColor: el.bgColor || '#ffffff',
                        padding: '4px',
                        borderRadius: `${el.borderRadius || 6}px`,
                        zIndex: el.zIndex || 4
                      }}
                      className="flex items-center justify-center"
                    >
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
                if (el.type === 'image' && el.src) {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        zIndex: el.zIndex || 3
                      }}
                    >
                      <img
                        src={el.src}
                        alt={el.name || 'Certificate asset'}
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
                return null;
              })}
            </div>
          </div>
        </div>

        {/* ── INDIVIDUAL TEAM MEMBERS DOWNLOAD LIST (Crucial Requirement!) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Team Members Certificates ({certificatesList.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Click &quot;Download Certificate&quot; on any person below to download their individual certificate PDF.
            </p>
          </div>

          {/* Member Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certificatesList.map((cert, idx) => {
              const isSelected = selectedIdx === idx;
              const isDownloadingThis = downloadingIdx === idx;
              const isLead = cert.role?.toLowerCase().includes('lead') || idx === 0;

              return (
                <div
                  key={cert.certificateId || idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-zinc-950/70 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isLead
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cert.recipientName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isLead
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {cert.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate max-w-[240px]">
                          {cert.college}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{cert.certificateId}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        Previewing
                      </span>
                    )}
                  </div>

                  {/* Member Actions: Preview & Download Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold'
                          : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isSelected ? 'Viewing On Canvas' : 'Preview Certificate'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadMember(idx)}
                      disabled={isDownloadingThis || downloadingAll}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title={`Download official certificate for ${cert.recipientName}`}
                    >
                      {isDownloadingThis ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Certificate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER METADATA ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1 pt-2 gap-2 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Digital Certificate Verifiable online at <code className="text-emerald-500 font-mono">avishkaar.aitamsac.in</code></span>
          </div>
          <div>
            Issued: <strong className="text-slate-700 dark:text-zinc-200">{currentCert.issueDate}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
