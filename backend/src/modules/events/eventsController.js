const eventsService = require('./eventsService');
const { saveBase64File } = require('../../middleware/multer');

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

    let effectivePrizeMoney = PrizeMoney;
    let effectiveVirtualPrizeMoney = VirtualPrizeMoney;
    let effectivePhysicalPrizeMoney = PhysicalPrizeMoney;

    if (HackathonMode === 'Both' || HackathonMode === 'Virtual and Physical') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd;

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
        if (!effectiveStartDate) effectiveStartDate = StartDate || VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
        if (!effectivePrizeMoney) effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
    } else if (HackathonMode === 'Virtual') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate;
        if (!effectiveEndDate) effectiveEndDate = VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = VirtualRegistrationEnd;
        if (!effectiveVirtualPrizeMoney && effectivePrizeMoney) effectiveVirtualPrizeMoney = effectivePrizeMoney;
    } else if (HackathonMode === 'Physical') {
        if (!effectiveStartDate) effectiveStartDate = PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd;
        if (!effectivePhysicalPrizeMoney && effectivePrizeMoney) effectivePhysicalPrizeMoney = effectivePrizeMoney;
    }

    const effectiveFacilities = Facilities || [VirtualFacilities, PhysicalFacilities].filter(Boolean).join('\n\n') || '';
    const effectiveRequirements = Requirements || [VirtualRequirements, PhysicalRequirements].filter(Boolean).join('\n\n') || '';

    if (!EventName || !TeamSize || !effectiveStartDate || !effectiveEndDate || !effectiveRegistrationStart || !effectiveRegistrationEnd || !Location || !EventType || !PrimaryColor || !SecondaryColor || !TertiaryColor || !PrimaryTextColor || !SecondaryTextColor || !TertiaryTextColor ) {
        return res.status(400).json({
            message: 'All required fields must be filled'
        });
    }

    if (EventType === 'Hackathon' && !HackathonMode) {
        return res.status(400).json({
            message: 'Hackathon mode is required for Hackathon events'
        });
    }

    const processedPosters = processPosters(Posters);

    eventsService.createEvent(EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, processedPosters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, effectivePrizeMoney, effectiveVirtualPrizeMoney, effectivePhysicalPrizeMoney, (err, result) => {
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

    let effectivePrizeMoney = PrizeMoney;
    let effectiveVirtualPrizeMoney = VirtualPrizeMoney;
    let effectivePhysicalPrizeMoney = PhysicalPrizeMoney;

    if (HackathonMode === 'Both' || HackathonMode === 'Virtual and Physical') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd;

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
        if (!effectiveStartDate) effectiveStartDate = StartDate || VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = EndDate || PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = RegistrationStart || VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = RegistrationEnd || PhysicalRegistrationEnd || VirtualRegistrationEnd;
        if (!effectivePrizeMoney) effectivePrizeMoney = effectivePhysicalPrizeMoney || effectiveVirtualPrizeMoney || null;
    } else if (HackathonMode === 'Virtual') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate;
        if (!effectiveEndDate) effectiveEndDate = VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = VirtualRegistrationEnd;
        if (!effectiveVirtualPrizeMoney && effectivePrizeMoney) effectiveVirtualPrizeMoney = effectivePrizeMoney;
    } else if (HackathonMode === 'Physical') {
        if (!effectiveStartDate) effectiveStartDate = PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd;
        if (!effectivePhysicalPrizeMoney && effectivePrizeMoney) effectivePhysicalPrizeMoney = effectivePrizeMoney;
    }

    const effectiveFacilities = Facilities || [VirtualFacilities, PhysicalFacilities].filter(Boolean).join('\n\n') || '-';
    const effectiveRequirements = Requirements || [VirtualRequirements, PhysicalRequirements].filter(Boolean).join('\n\n') || '-';

    if (!EventName || !effectiveStartDate || !effectiveEndDate) {
        return res.status(400).json({
            message: 'EventName, StartDate and EndDate are required'
        });
    }

    if (EventType === 'Hackathon' && !HackathonMode) {
        return res.status(400).json({
            message: 'Hackathon mode is required for Hackathon events'
        });
    }

    const processedPosters = processPosters(Posters);

    eventsService.updateEventById(id, EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, processedPosters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, effectivePrizeMoney, effectiveVirtualPrizeMoney, effectivePhysicalPrizeMoney, (err, result) => {
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

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    updateEvent,
    deleteEvent,
    updateEventGuidelines
};