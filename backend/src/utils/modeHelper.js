// Reusable Universal Mode and Registration-Based Scoping Utility
// Provides dynamic track normalization, multi-mode event detection, and data scoping across all event types.

/**
 * Normalizes any participation mode or hackathon mode string into standard representations:
 * 'Virtual' | 'Physical' | 'Both'
 */
function normalizeParticipationMode(mode, location = '') {
    const raw = String(mode || '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');

    if (
        raw === 'both' ||
        raw === 'hybrid' ||
        raw === 'virtual and physical' ||
        raw === 'physical and virtual' ||
        raw === 'virtual & physical' ||
        raw === 'physical & virtual'
    ) {
        return 'Both';
    }

    if (raw === 'virtual' || raw === 'online' || raw === 'remote' || raw === 'webinar') {
        return 'Virtual';
    }

    if (
        raw === 'physical' ||
        raw === 'offline' ||
        raw === 'in person' ||
        raw === 'in-person' ||
        raw === 'on campus' ||
        raw === 'on-campus'
    ) {
        return 'Physical';
    }

    const loc = String(location || '').trim().toLowerCase();
    if (loc.includes('virtual') || loc.includes('online') || loc.includes('zoom') || loc.includes('meet')) {
        return 'Virtual';
    }

    return 'Physical';
}

/**
 * Checks whether an event supports multiple participation categories (e.g., both Virtual and Physical)
 * Works dynamically across any event type (Hackathon, Workshop, Webinar, Seminar, Project Expo, etc.)
 */
function isMultiModeEvent(event) {
    if (!event) return false;
    const mode = normalizeParticipationMode(event.HackathonMode || event.ParticipationMode || '', event.Location || '');
    if (mode === 'Both') return true;

    // Check if separate virtual and physical dates/registrations are configured
    const hasVirtual = Boolean(event.VirtualStartDate || event.VirtualRegistrationStart || event.VirtualMeetUrl);
    const hasPhysical = Boolean(event.PhysicalStartDate || event.PhysicalRegistrationStart || event.PhysicalFacilities);
    return hasVirtual && hasPhysical;
}

/**
 * Resolves the participant or team's exact registered participation mode:
 * Returns 'Virtual' | 'Physical'
 */
function resolveParticipantTrack(registrationOrTeam, fallbackEvent = null) {
    if (!registrationOrTeam) {
        if (fallbackEvent) {
            const evMode = normalizeParticipationMode(fallbackEvent.HackathonMode || fallbackEvent.ParticipationMode || '', fallbackEvent.Location || '');
            return evMode === 'Both' ? 'Physical' : evMode;
        }
        return 'Physical';
    }

    const raw = registrationOrTeam.ParticipationMode || registrationOrTeam.Track || '';
    if (raw) {
        const norm = normalizeParticipationMode(raw);
        if (norm === 'Virtual') return 'Virtual';
        if (norm === 'Physical') return 'Physical';
    }

    // Check HackathonMode on team object if present
    if (registrationOrTeam.HackathonMode) {
        const norm = normalizeParticipationMode(registrationOrTeam.HackathonMode);
        if (norm === 'Virtual') return 'Virtual';
        if (norm === 'Physical') return 'Physical';
    }

    // Default to event mode if event is single-mode
    if (fallbackEvent && !isMultiModeEvent(fallbackEvent)) {
        return normalizeParticipationMode(fallbackEvent.HackathonMode || '', fallbackEvent.Location || '');
    }

    return 'Physical';
}

/**
 * Sanitizes an event data object based on the caller's registered track:
 * Ensures physical participants never receive virtual live room triggers or meet URLs,
 * and virtual participants never receive physical hostel/campus room allocations.
 */
function sanitizeEventForTrack(event, participantTrack) {
    if (!event) return event;
    const sanitized = { ...event };
    const multiMode = isMultiModeEvent(event);

    sanitized.isMultiModeEvent = multiMode;
    sanitized.participantTrack = participantTrack;

    if (multiMode) {
        if (participantTrack !== 'Virtual') {
            // Physical participant: completely remove virtual live broadcasting signals
            sanitized.VirtualStatus = 'NOT_APPLICABLE';
            sanitized.VirtualMeetUrl = null;
            sanitized.VirtualStartedAt = null;
            if (sanitized.PhysicalFacilities) {
                sanitized.Facilities = sanitized.PhysicalFacilities;
            }
            if (sanitized.PhysicalRequirements) {
                sanitized.Requirements = sanitized.PhysicalRequirements;
            }
        } else {
            // Virtual participant: replace physical instructions with virtual guidelines
            if (sanitized.VirtualFacilities) {
                sanitized.Facilities = sanitized.VirtualFacilities;
            }
            if (sanitized.VirtualRequirements) {
                sanitized.Requirements = sanitized.VirtualRequirements;
            }
            sanitized.AccommodationEnabled = 0;
            sanitized.FoodEnabled = 0;
        }
    }

    return sanitized;
}

module.exports = {
    normalizeParticipationMode,
    isMultiModeEvent,
    resolveParticipantTrack,
    sanitizeEventForTrack
};

