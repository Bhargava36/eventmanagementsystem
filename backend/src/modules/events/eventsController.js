const eventsService = require('./eventsService');
const { saveBase64File } = require('../../middleware/multer');
const { broadcastEvent } = require('../../config/websocket');

const processPosters = (posters) => {
    if (!posters) return [];
    let list = [];
    if (Array.isArray(posters)) {
        list = posters;
    } else if (typeof posters === 'string') {
        try {
            const parsed = JSON.parse(posters);
            list = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            list = [posters];
        }
    }
    return list.map((item) => {
        if (typeof item === 'string' && item.startsWith('data:image/')) {
            return saveBase64File(item, 'images');
        }
        if (item && typeof item === 'object' && item.url && item.url.startsWith('data:image/')) {
            return { ...item, url: saveBase64File(item.url, 'images') };
        }
        return item;
    });
};

const createEvent = (req, res) => {
    const {
        EventName, Description, Facilities, Requirements, TeamSize,
        StartDate, EndDate, RegistrationStart, RegistrationEnd, Location,
        EventType, EventStatus, HackathonMode,
        VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate,
        VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd,
        VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements,
        PrimaryColor, SecondaryColor, TertiaryColor,
        PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters,
        PrizeMoney, VirtualPrizeMoney, PhysicalPrizeMoney
    } = req.body;

    let effectiveStartDate = StartDate;
    let effectiveEndDate = EndDate;
    let effectiveRegistrationStart = RegistrationStart;
    let effectiveRegistrationEnd = RegistrationEnd;

    let effVirtualStartDate = VirtualStartDate;
    let effVirtualEndDate = VirtualEndDate;
    let effVirtualRegStart = VirtualRegistrationStart;
    let effVirtualRegEnd = VirtualRegistrationEnd;

    let effPhysicalStartDate = PhysicalStartDate;
    let effPhysicalEndDate = PhysicalEndDate;
    let effPhysicalRegStart = PhysicalRegistrationStart;
    let effPhysicalRegEnd = PhysicalRegistrationEnd;

    let effectivePrizeMoney = PrizeMoney;
    let effectiveVirtualPrizeMoney = VirtualPrizeMoney;
    let effectivePhysicalPrizeMoney = PhysicalPrizeMoney;

    if (HackathonMode === 'Both' || HackathonMode === 'Virtual and Physical') {
        effectiveStartDate = VirtualStartDate || PhysicalStartDate || StartDate;
        effectiveEndDate = PhysicalEndDate || VirtualEndDate || EndDate;
        effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart || RegistrationStart;
        effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd || RegistrationEnd;

        effVirtualStartDate = VirtualStartDate || effectiveStartDate;
        effVirtualEndDate = VirtualEndDate || effectiveStartDate;
        effVirtualRegStart = VirtualRegistrationStart || effectiveRegistrationStart;
        effVirtualRegEnd = VirtualRegistrationEnd || effectiveRegistrationEnd;

        effPhysicalStartDate = PhysicalStartDate || effectiveEndDate;
        effPhysicalEndDate = PhysicalEndDate || effectiveEndDate;
        effPhysicalRegStart = PhysicalRegistrationStart || effectiveRegistrationStart;
        effPhysicalRegEnd = PhysicalRegistrationEnd || effectiveRegistrationEnd;

        if (!effectivePrizeMoney) {
            if (effectiveVirtualPrizeMoney && effectivePhysicalPrizeMoney) {
                const vNum = parseFloat(String(effectiveVirtualPrizeMoney).replace(/[^0-9.]/g, ''));
                const pNum = parseFloat(String(effectivePhysicalPrizeMoney).replace(/[^0-9.]/g, ''));
                if (!isNaN(vNum) && !isNaN(pNum)) {
                    effectivePrizeMoney = `₹${(vNum + pNum).toLocaleString('en-IN')}`;
                } else {
                    effectivePrizeMoney = `${effectivePhysicalPrizeMoney} + ${effectiveVirtualPrizeMoney}`;
                }
            } else {
                effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
            }
        }
    } else if (HackathonMode === 'Hybrid') {
        effectiveStartDate = StartDate || VirtualStartDate || PhysicalStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart || PhysicalRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
        effPhysicalStartDate = effectiveStartDate;
        effPhysicalEndDate = effectiveEndDate;
        effPhysicalRegStart = effectiveRegistrationStart;
        effPhysicalRegEnd = effectiveRegistrationEnd;
        if (!effectivePrizeMoney) effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
    } else if (HackathonMode === 'Virtual') {
        effectiveStartDate = StartDate || VirtualStartDate;
        effectiveEndDate = EndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || VirtualRegistrationEnd;
        effVirtualStartDate = effectiveStartDate;
        effVirtualEndDate = effectiveEndDate;
        effVirtualRegStart = effectiveRegistrationStart;
        effVirtualRegEnd = effectiveRegistrationEnd;
        if (!effectiveVirtualPrizeMoney && effectivePrizeMoney) effectiveVirtualPrizeMoney = effectivePrizeMoney;
    } else if (HackathonMode === 'Physical') {
        effectiveStartDate = StartDate || PhysicalStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate;
        effectiveRegistrationStart = RegistrationStart || PhysicalRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd;
        effPhysicalStartDate = effectiveStartDate;
        effPhysicalEndDate = effectiveEndDate;
        effPhysicalRegStart = effectiveRegistrationStart;
        effPhysicalRegEnd = effectiveRegistrationEnd;
        if (!effectivePhysicalPrizeMoney && effectivePrizeMoney) effectivePhysicalPrizeMoney = effectivePrizeMoney;
    } else {
        effectiveStartDate = StartDate || PhysicalStartDate || VirtualStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || PhysicalRegistrationStart || VirtualRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
    }

    const effectiveFacilities = Facilities || [VirtualFacilities, PhysicalFacilities].filter(Boolean).join('\n\n') || '';
    const effectiveRequirements = Requirements || [VirtualRequirements, PhysicalRequirements].filter(Boolean).join('\n\n') || '';

    if (!EventName || !TeamSize || !effectiveStartDate || !effectiveEndDate || !effectiveRegistrationStart || !effectiveRegistrationEnd || !Location || !EventType || !PrimaryColor || !SecondaryColor || !TertiaryColor || !PrimaryTextColor || !SecondaryTextColor || !TertiaryTextColor ) {
        return res.status(400).json({
            message: 'All required fields must be filled'
        });
    }

    // Chronological date order validation:
    // 1. Registration Start Date <= Registration End Date
    if (new Date(effectiveRegistrationStart).getTime() > new Date(effectiveRegistrationEnd).getTime()) {
        return res.status(400).json({
            message: 'Registration Start Date must be before or on Registration Closing Date'
        });
    }
    // 2. Registration End Date <= Event Start Date (Registrations must close before/on the event start)
    if (new Date(effectiveRegistrationEnd).getTime() > new Date(effectiveStartDate).getTime()) {
        return res.status(400).json({
            message: 'Registration Closing Date must be on or before Event Start Date (Registrations must close before the event starts)'
        });
    }
    // 3. Event Start Date <= Event End Date
    if (new Date(effectiveStartDate).getTime() > new Date(effectiveEndDate).getTime()) {
        return res.status(400).json({
            message: 'Event Start Date must be before or on Event End Date'
        });
    }

    if (EventType === 'Hackathon' && !HackathonMode) {
        return res.status(400).json({
            message: 'Hackathon mode is required for Hackathon events'
        });
    }

    const processedPosters = processPosters(Posters);

    eventsService.createEvent(EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, processedPosters, effVirtualStartDate, effVirtualEndDate, effPhysicalStartDate, effPhysicalEndDate, effVirtualRegStart, effVirtualRegEnd, effPhysicalRegStart, effPhysicalRegEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, effectivePrizeMoney, effectiveVirtualPrizeMoney, effectivePhysicalPrizeMoney, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'Event creation failed',
                    error: err.message
                });
            }

            return res.status(201).json({
                message: 'Event created successfully',
                eventId: result.insertId
            });
        }
    );
};

const getAllEvents = (req, res) => {
    eventsService.getAllEvents((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get events',
                error: err.message
            });
        }

        return res.status(200).json({
            message: 'Events fetched successfully',
            events: result
        });
    });
};

const getEventById = (req, res) => {
    const { id } = req.params;

    eventsService.getEventById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get event by id',
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        return res.status(200).json({
            message: 'Event fetched successfully',
            event: result[0]
        });
    });
};

const getEventCount = (req, res) => {
    eventsService.getEventCount((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get event count',
                error: err.message
            });
        }

        return res.status(200).json({
            message: 'Event count fetched successfully',
            count: result.eventCount
        });
    });
};

const updateEvent = (req, res) => {
    const id = req.params.id;

    const {
        EventName, Description, Facilities, Requirements, TeamSize,
        StartDate, EndDate, RegistrationStart, RegistrationEnd, Location,
        EventType, EventStatus, HackathonMode,
        VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate,
        VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd,
        VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements,
        PrimaryColor, SecondaryColor, TertiaryColor,
        PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters,
        PrizeMoney, VirtualPrizeMoney, PhysicalPrizeMoney
    } = req.body;

    let effectiveStartDate = StartDate;
    let effectiveEndDate = EndDate;
    let effectiveRegistrationStart = RegistrationStart;
    let effectiveRegistrationEnd = RegistrationEnd;

    let effVirtualStartDate = VirtualStartDate;
    let effVirtualEndDate = VirtualEndDate;
    let effVirtualRegStart = VirtualRegistrationStart;
    let effVirtualRegEnd = VirtualRegistrationEnd;

    let effPhysicalStartDate = PhysicalStartDate;
    let effPhysicalEndDate = PhysicalEndDate;
    let effPhysicalRegStart = PhysicalRegistrationStart;
    let effPhysicalRegEnd = PhysicalRegistrationEnd;

    let effectivePrizeMoney = PrizeMoney;
    let effectiveVirtualPrizeMoney = VirtualPrizeMoney;
    let effectivePhysicalPrizeMoney = PhysicalPrizeMoney;

    if (HackathonMode === 'Both' || HackathonMode === 'Virtual and Physical') {
        effectiveStartDate = VirtualStartDate || PhysicalStartDate || StartDate;
        effectiveEndDate = PhysicalEndDate || VirtualEndDate || EndDate;
        effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart || RegistrationStart;
        effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd || RegistrationEnd;

        effVirtualStartDate = VirtualStartDate || effectiveStartDate;
        effVirtualEndDate = VirtualEndDate || effectiveStartDate;
        effVirtualRegStart = VirtualRegistrationStart || effectiveRegistrationStart;
        effVirtualRegEnd = VirtualRegistrationEnd || effectiveRegistrationEnd;

        effPhysicalStartDate = PhysicalStartDate || effectiveEndDate;
        effPhysicalEndDate = PhysicalEndDate || effectiveEndDate;
        effPhysicalRegStart = PhysicalRegistrationStart || effectiveRegistrationStart;
        effPhysicalRegEnd = PhysicalRegistrationEnd || effectiveRegistrationEnd;

        if (!effectivePrizeMoney) {
            if (effectiveVirtualPrizeMoney && effectivePhysicalPrizeMoney) {
                const vNum = parseFloat(String(effectiveVirtualPrizeMoney).replace(/[^0-9.]/g, ''));
                const pNum = parseFloat(String(effectivePhysicalPrizeMoney).replace(/[^0-9.]/g, ''));
                if (!isNaN(vNum) && !isNaN(pNum)) {
                    effectivePrizeMoney = `₹${(vNum + pNum).toLocaleString('en-IN')}`;
                } else {
                    effectivePrizeMoney = `${effectivePhysicalPrizeMoney} + ${effectiveVirtualPrizeMoney}`;
                }
            } else {
                effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
            }
        }
    } else if (HackathonMode === 'Hybrid') {
        effectiveStartDate = StartDate || VirtualStartDate || PhysicalStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart || PhysicalRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
        effPhysicalStartDate = effectiveStartDate;
        effPhysicalEndDate = effectiveEndDate;
        effPhysicalRegStart = effectiveRegistrationStart;
        effPhysicalRegEnd = effectiveRegistrationEnd;
        if (!effectivePrizeMoney) effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
    } else if (HackathonMode === 'Virtual') {
        effectiveStartDate = StartDate || VirtualStartDate;
        effectiveEndDate = EndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || VirtualRegistrationEnd;
        effVirtualStartDate = effectiveStartDate;
        effVirtualEndDate = effectiveEndDate;
        effVirtualRegStart = effectiveRegistrationStart;
        effVirtualRegEnd = effectiveRegistrationEnd;
        if (!effectiveVirtualPrizeMoney && effectivePrizeMoney) effectiveVirtualPrizeMoney = effectivePrizeMoney;
    } else if (HackathonMode === 'Physical') {
        effectiveStartDate = StartDate || PhysicalStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate;
        effectiveRegistrationStart = RegistrationStart || PhysicalRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd;
        effPhysicalStartDate = effectiveStartDate;
        effPhysicalEndDate = effectiveEndDate;
        effPhysicalRegStart = effectiveRegistrationStart;
        effPhysicalRegEnd = effectiveRegistrationEnd;
        if (!effectivePhysicalPrizeMoney && effectivePrizeMoney) effectivePhysicalPrizeMoney = effectivePrizeMoney;
    } else {
        effectiveStartDate = StartDate || PhysicalStartDate || VirtualStartDate;
        effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        effectiveRegistrationStart = RegistrationStart || PhysicalRegistrationStart || VirtualRegistrationStart;
        effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
    }

    const effectiveFacilities = Facilities || [VirtualFacilities, PhysicalFacilities].filter(Boolean).join('\n\n') || '-';
    const effectiveRequirements = Requirements || [VirtualRequirements, PhysicalRequirements].filter(Boolean).join('\n\n') || '-';

    if (!EventName || !effectiveStartDate || !effectiveEndDate) {
        return res.status(400).json({
            message: 'EventName, StartDate and EndDate are required'
        });
    }

    // Chronological date order validation:
    // 1. Registration Start Date <= Registration End Date
    if (effectiveRegistrationStart && effectiveRegistrationEnd) {
        if (new Date(effectiveRegistrationStart).getTime() > new Date(effectiveRegistrationEnd).getTime()) {
            return res.status(400).json({
                message: 'Registration Start Date must be before or on Registration Closing Date'
            });
        }
    }
    // 2. Registration End Date <= Event Start Date (Registrations must close before/on the event start)
    if (effectiveRegistrationEnd && effectiveStartDate) {
        if (new Date(effectiveRegistrationEnd).getTime() > new Date(effectiveStartDate).getTime()) {
            return res.status(400).json({
                message: 'Registration Closing Date must be on or before Event Start Date (Registrations must close before the event starts)'
            });
        }
    }
    // 3. Event Start Date <= Event End Date
    if (effectiveStartDate && effectiveEndDate) {
        if (new Date(effectiveStartDate).getTime() > new Date(effectiveEndDate).getTime()) {
            return res.status(400).json({
                message: 'Event Start Date must be before or on Event End Date'
            });
        }
    }

    if (EventType === 'Hackathon' && !HackathonMode) {
        return res.status(400).json({
            message: 'Hackathon mode is required for Hackathon events'
        });
    }

    const processedPosters = processPosters(Posters);

    eventsService.updateEventById(id, EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, processedPosters, effVirtualStartDate, effVirtualEndDate, effPhysicalStartDate, effPhysicalEndDate, effVirtualRegStart, effVirtualRegEnd, effPhysicalRegStart, effPhysicalRegEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, effectivePrizeMoney, effectiveVirtualPrizeMoney, effectivePhysicalPrizeMoney, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'Event update failed',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Event not found'
                });
            }

            return res.status(200).json({
                message: 'Event updated successfully'
            });
        }
    );
};

const deleteEvent = (req, res) => {
    const id = req.params.id;

    eventsService.deleteEvent(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Event deletion failed',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Event not found'
            });
        }

        return res.status(200).json({
            message: 'Event deleted successfully'
        });
    });
};

const updateEventGuidelines = (req, res) => {
    const { id } = req.params;
    const {
        Description,
        VirtualFacilities,
        VirtualRequirements,
        PhysicalFacilities,
        PhysicalRequirements,
        Facilities,
        Requirements
    } = req.body;

    eventsService.saveEventGuidelines(id, {
        Description,
        VirtualFacilities,
        VirtualRequirements,
        PhysicalFacilities,
        PhysicalRequirements,
        Facilities,
        Requirements
    }, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to update event guidelines',
                error: err.message
            });
        }

        return res.status(200).json({
            message: 'Event guidelines updated successfully'
        });
    });
};

const updateVirtualStatus = (req, res) => {
    const { id } = req.params;
    const { VirtualStatus } = req.body;

    const validStatuses = ['NOT_STARTED', 'LIVE', 'COMPLETED'];
    if (!validStatuses.includes(VirtualStatus)) {
        return res.status(400).json({ message: 'Invalid VirtualStatus' });
    }

    eventsService.updateVirtualEventStatus(id, VirtualStatus, (err, updated) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to update virtual event status',
                error: err.message
            });
        }
        broadcastEvent(id, {
            type: 'VIRTUAL_STATUS_UPDATED',
            eventId: id,
            status: VirtualStatus
        });
        return res.status(200).json({
            message: 'Virtual event status updated successfully',
            event: updated
        });
    });
};

const updateVirtualMeetUrl = (req, res) => {
    const { id } = req.params;
    const { VirtualMeetUrl } = req.body;

    eventsService.updateVirtualMeetUrl(id, VirtualMeetUrl || '', (err, updated) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to update virtual meet url',
                error: err.message
            });
        }
        broadcastEvent(id, {
            type: 'VIRTUAL_MEET_UPDATED',
            eventId: id,
            url: VirtualMeetUrl || ''
        });
        return res.status(200).json({
            message: 'Virtual meet url updated successfully',
            event: updated
        });
    });
};

const updateEventSettings = (req, res) => {
    const { id } = req.params;
    const settings = { ...req.body };
    const featureFlags = [
        'AccommodationEnabled',
        'FoodEnabled',
        'IDCardEnabled'
    ];

    for (const key of featureFlags) {
        if (settings[key] !== undefined) {
            const value = settings[key];
            if (![true, false, 0, 1, '0', '1'].includes(value)) {
                return res.status(400).json({
                    message: `${key} must be a boolean value`
                });
            }
            settings[key] = value === true || value === 1 || value === '1' ? 1 : 0;
        }
    }

    eventsService.updateEventSettings(id, settings, (err, updated) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to update event settings',
                error: err.message
            });
        }
        return res.status(200).json({
            message: 'Event settings updated successfully',
            event: updated
        });
    });
};

const getAdminDashboardSummary = (req, res) => {
    const eventId = req.params.id;
    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }

    eventsService.getAdminDashboardSummary(eventId, (err, summary) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to fetch dashboard summary',
                error: err.message
            });
        }
        if (!summary) {
            return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json({
            message: 'Dashboard summary fetched successfully',
            data: summary
        });
    });
};

const getPublicStats = (req, res) => {
    eventsService.getPublicPlatformStats((err, stats) => {
        if (err) {
            console.error('getPublicStats error:', err);
            return res.status(500).json({ message: 'Failed to fetch platform stats', error: err.message });
        }
        return res.status(200).json({
            message: 'Platform stats fetched successfully',
            stats
        });
    });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    getPublicStats,
    updateEvent,
    deleteEvent,
    updateEventGuidelines,
    updateVirtualStatus,
    updateVirtualMeetUrl,
    updateEventSettings,
    getAdminDashboardSummary
};