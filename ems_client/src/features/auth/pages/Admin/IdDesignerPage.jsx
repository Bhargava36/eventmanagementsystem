import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import IdCardDesigner from '@/features/id_card/components/IdCardDesigner';

export default function IdDesignerPage() {
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
    <IdCardDesigner
      eventId={eventId}
      initialTemplateId={templateId}
      initialCardType="id_card"
      lockCardType={true}
      onBack={() => {
        navigate(`/admin/id-card?eventId=${encodeURIComponent(eventId)}`);
      }}
    />
  );
}
