const eventsService = require('./eventsService');

const createEvent = (req, res) => {

    const { EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor } = req.body;

    if (!EventName || !Description || !Facilities || !Requirements || !TeamSize || !StartDate || !EndDate || !RegistrationStart || !RegistrationEnd || !Location || !EventType || !EventStatus || !HackathonMode || !PrimaryColor || !SecondaryColor || !TertiaryColor || !PrimaryTextColor || !SecondaryTextColor || !TertiaryTextColor) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    eventsService.createEvent( EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Event creation failed",
                    error: err.message
                });
            }

            return res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });
        }
    );
};

const getAllEvents = (req, res) => {

    eventsService.getAllEvents((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get events",
                error: err
            });
        }

        return res.status(200).json({
            message: "Events fetched successfully",
            events: result
        });
    });
};

const getEventById = (req, res) => {

    const { id } = req.params;

    eventsService.getEventById(id, (err, result) => {

        if (err) {

            console.error("Get Event By ID Error:", err);

            return res.status(500).json({
                message: "Failed to get event by id",
                error: err.message
            });
        }

        if (result.length === 0) {

            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.status(200).json({
            message: "Event fetched successfully",
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

    const { EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor } = req.body;

    if (!EventName || !StartDate || !EndDate) {

        return res.status(400).json({
            message: "EventName, StartDate and EndDate are required"
        });
    }

    eventsService.updateEventById( id, EventName, Description, Facilities, Requirements, TeamSize, StartDate, EndDate, RegistrationStart, RegistrationEnd, Location, EventType, EventStatus, HackathonMode, PrimaryColor, SecondaryColor, TertiaryColor, PrimaryTextColor, SecondaryTextColor, TertiaryTextColor, (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Event update failed",
                    error: err
                });
            }

            return res.status(200).json({
                message: "Event updated successfully"
            });
        }
    );
};

const deleteEvent = (req, res) => {

    const id = req.params.id;

    eventsService.deleteEvent(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Event deletion failed",
                error: err
            });
        }

        return res.status(200).json({
            message: "Event deleted successfully"
        });
    });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    getEventCount,
    updateEvent,
    deleteEvent
};