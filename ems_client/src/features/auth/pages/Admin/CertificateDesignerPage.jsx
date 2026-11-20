import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CertificateDesigner from '@/features/certificate_designer/components/CertificateDesigner';

export default function CertificateDesignerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getAssignedEventId = () => {
    try {
      return String(JSON.parse(localStorage.getItem('admin') || 'null')?.EventId || '');
    } catch {
      return '';
    }
  };

  const eventId = searchParams.get('eventId')?.trim() || getAssignedEventId();
  const templateId = searchParams.get('templateId')?.trim() || null;

  return (
    <CertificateDesigner
      eventId={eventId}
      initialTemplateId={templateId}
      onBack={() => {
        navigate(`/admin/results?track=Virtual`);
      }}
    />
  );
}

