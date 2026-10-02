const eventsService = require('./eventsService');

const createEvent = (req, res) => {
    const {
        EventName, Description, Facilities, Requirements, TeamSize,
        StartDate, EndDate, RegistrationStart, RegistrationEnd, Location,
        EventType, EventStatus, HackathonMode,
        VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate,
        VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd,
        VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements,
        PrimaryColor, SecondaryColor, TertiaryColor,
        PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters
    } = req.body;

    let effectiveStartDate = StartDate;
    let effectiveEndDate = EndDate;
    let effectiveRegistrationStart = RegistrationStart;
    let effectiveRegistrationEnd = RegistrationEnd;

    if (HackathonMode === 'Both' || HackathonMode === 'Hybrid') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd;
    } else if (HackathonMode === 'Virtual') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate;
        if (!effectiveEndDate) effectiveEndDate = VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = VirtualRegistrationEnd;
    } else if (HackathonMode === 'Physical') {
        if (!effectiveStartDate) effectiveStartDate = PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd;
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

    eventsService.createEvent(EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, (err, result) => {
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
        PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters
    } = req.body;

    let effectiveStartDate = StartDate;
    let effectiveEndDate = EndDate;
    let effectiveRegistrationStart = RegistrationStart;
    let effectiveRegistrationEnd = RegistrationEnd;

    if (HackathonMode === 'Both' || HackathonMode === 'Hybrid') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate || PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate || VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart || PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd || VirtualRegistrationEnd;
    } else if (HackathonMode === 'Virtual') {
        if (!effectiveStartDate) effectiveStartDate = VirtualStartDate;
        if (!effectiveEndDate) effectiveEndDate = VirtualEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = VirtualRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = VirtualRegistrationEnd;
    } else if (HackathonMode === 'Physical') {
        if (!effectiveStartDate) effectiveStartDate = PhysicalStartDate;
        if (!effectiveEndDate) effectiveEndDate = PhysicalEndDate;
        if (!effectiveRegistrationStart) effectiveRegistrationStart = PhysicalRegistrationStart;
        if (!effectiveRegistrationEnd) effectiveRegistrationEnd = PhysicalRegistrationEnd;
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

    eventsService.updateEventById(id, EventName, Description, effectiveFacilities, effectiveRequirements, TeamSize, effectiveStartDate, effectiveEndDate, effectiveRegistrationStart, effectiveRegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, Posters, VirtualStartDate, VirtualEndDate, PhysicalStartDate, PhysicalEndDate, VirtualRegistrationStart, VirtualRegistrationEnd, PhysicalRegistrationStart, PhysicalRegistrationEnd, VirtualFacilities, VirtualRequirements, PhysicalFacilities, PhysicalRequirements, (err, result) => {
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