const physicalServicesService = require("./physicalServicesService");

const parsePositiveId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const getTeamPreference = async (req, res) => {
    const teamId = parsePositiveId(req.params.teamId);
    const userId = parsePositiveId(req.query.userId);

    if (!teamId || !userId) {
        return res.status(400).json({
            message: "Valid team and user IDs are required."
        });
    }

    try {
        const preference = await physicalServicesService.getTeamPreference(
            teamId,
            userId
        );
        if (!preference) {
            return res.status(404).json({
                message: "Team membership or physical registration was not found."
            });
        }

        return res.status(200).json({
            preference: {
                accommodationRequested: Boolean(
                    Number(preference.AccommodationRequested)
                ),
                foodAccepted: Boolean(Number(preference.FoodAccepted)),
                submitted: Boolean(Number(preference.PreferencesSubmitted)),
                totalAmount: Number(preference.TotalAmount || 0),
                paymentRefId: preference.PaymentRefId || '',
                paymentReceiptUrl: preference.PaymentReceiptUrl || '',
                paymentNotes: preference.PaymentNotes || '',
                bookingStatus: preference.BookingStatus || 'Pending',
                adminRemarks: preference.AdminRemarks || '',
                bookingCreatedAt: preference.BookingCreatedAt || null
            },
            event: {
                id: preference.EventId,
                name: preference.EventName,
                accommodationEnabled: Boolean(
                    Number(preference.AccommodationEnabled)
                ),
                foodEnabled: Boolean(Number(preference.FoodEnabled)),
                accommodationFee: Number(preference.AccommodationFee || 0),
                foodFee: Number(preference.FoodFee || 0),
                facilitiesPackageFee: Number(preference.FacilitiesPackageFee || 0),
                adminUpiId: preference.AdminUpiId || '',
                adminPaymentQr: preference.AdminPaymentQr || '',
                adminPaymentInstructions: preference.AdminPaymentInstructions || ''
            },
            team: {
                id: preference.TeamId,
                name: preference.TeamName,
                teamLeadUserId: preference.TeamLeadUserId,
                participationMode: preference.ParticipationMode,
                registrationStatus: preference.RegistrationStatus,
                memberCount: Number(preference.MemberCount || 1)
            }
        });
    } catch (error) {
        console.error("Get team physical preferences error:", error);
        return res.status(500).json({
            message: "Failed to fetch physical event preferences."
        });
    }
};

const saveTeamPreference = async (req, res) => {
    const teamId = parsePositiveId(req.params.teamId);
    const userId = parsePositiveId(req.body.userId);
    const { 
        accommodationRequested, 
        foodAccepted,
        totalAmount,
        paymentRefId,
        paymentReceiptUrl,
        paymentNotes
    } = req.body;

    if (
        !teamId ||
        !userId ||
        typeof accommodationRequested !== "boolean" ||
        typeof foodAccepted !== "boolean"
    ) {
        return res.status(400).json({
            message: "Valid IDs and boolean service selections are required."
        });
    }

    try {
        const preference = await physicalServicesService.saveTeamPreference(
            teamId,
            userId,
            accommodationRequested,
            foodAccepted,
            {
                totalAmount,
                paymentRefId,
                paymentReceiptUrl,
                paymentNotes
            }
        );
        return res.status(200).json({
            message: "Campus facility booking and payment references submitted successfully.",
            preference: {
                accommodationRequested: Boolean(
                    Number(preference.AccommodationRequested)
                ),
                foodAccepted: Boolean(Number(preference.FoodAccepted)),
                submitted: true,
                totalAmount: Number(preference.TotalAmount || 0),
                paymentRefId: preference.PaymentRefId || '',
                paymentReceiptUrl: preference.PaymentReceiptUrl || '',
                bookingStatus: preference.BookingStatus || 'Pending'
            }
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Save team physical preferences error:", error);
        return res.status(500).json({
            message: "Failed to save physical event preferences."
        });
    }
};

const getFoodParticipants = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    if (!eventId) {
        return res.status(400).json({ message: "Valid event ID is required." });
    }

    try {
        const participants =
            await physicalServicesService.getFoodParticipants(eventId);
        return res.status(200).json({ participants });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Get food participants error:", error);
        return res.status(500).json({
            message: "Failed to fetch food participants."
        });
    }
};

const getAccommodationParticipants = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    if (!eventId) {
        return res.status(400).json({ message: "Valid event ID is required." });
    }

    try {
        const participants =
            await physicalServicesService.getAccommodationParticipants(eventId);
        return res.status(200).json({ participants });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Get accommodation participants error:", error);
        return res.status(500).json({
            message: "Failed to fetch accommodation requests."
        });
    }
};

const getEventTeamPreferences = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    if (!eventId) {
        return res.status(400).json({ message: "Valid event ID is required." });
    }

    try {
        const preferences =
            await physicalServicesService.getEventTeamPreferences(eventId);
        return res.status(200).json({ preferences });
    } catch (error) {
        console.error("Get event team preferences error:", error);
        return res.status(500).json({
            message: "Failed to fetch team service choices."
        });
    }
};

const generateFoodTokens = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    const mealType = String(req.body.mealType || "").toLowerCase();

    if (!eventId || !["tiffin", "lunch", "dinner"].includes(mealType)) {
        return res.status(400).json({
            message: "Valid event ID and meal type are required."
        });
    }

    try {
        const result = await physicalServicesService.generateFoodTokens(
            eventId,
            mealType
        );
        return res.status(200).json({
            ...result,
            message: `${result.generated} ${mealType} token(s) generated.`
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Generate food tokens error:", error);
        return res.status(500).json({
            message: "Failed to generate food tokens."
        });
    }
};

const getFacilityBookings = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    if (!eventId) {
        return res.status(400).json({ message: "Valid event ID is required." });
    }

    try {
        const bookings = await physicalServicesService.getFacilityBookings(eventId);
        return res.status(200).json({
            success: true,
            bookings: bookings || []
        });
    } catch (error) {
        console.error("Get facility bookings error:", error);
        return res.status(500).json({
            message: "Failed to fetch facility bookings."
        });
    }
};

const updateBookingStatus = async (req, res) => {
    const eventId = parsePositiveId(req.params.eventId);
    const teamId = parsePositiveId(req.params.teamId);
    const { bookingStatus, adminRemarks } = req.body;

    if (!eventId || !teamId || !bookingStatus) {
        return res.status(400).json({
            message: "Event ID, Team ID, and bookingStatus are required."
        });
    }

    try {
        const result = await physicalServicesService.updateBookingStatus(
            eventId,
            teamId,
            bookingStatus,
            adminRemarks
        );
        return res.status(200).json({
            success: true,
            message: `Booking status updated to ${bookingStatus}.`,
            ...result
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        return res.status(500).json({
            message: "Failed to update booking status."
        });
    }
};

module.exports = {
    getTeamPreference,
    saveTeamPreference,
    getAccommodationParticipants,
    getFoodParticipants,
    getEventTeamPreferences,
    generateFoodTokens,
    getFacilityBookings,
    updateBookingStatus
};
