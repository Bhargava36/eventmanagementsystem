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
                submitted: Boolean(Number(preference.PreferencesSubmitted))
            },
            event: {
                id: preference.EventId,
                name: preference.EventName,
                accommodationEnabled: Boolean(
                    Number(preference.AccommodationEnabled)
                ),
                foodEnabled: Boolean(Number(preference.FoodEnabled))
            },
            team: {
                id: preference.TeamId,
                name: preference.TeamName,
                teamLeadUserId: preference.TeamLeadUserId,
                participationMode: preference.ParticipationMode,
                registrationStatus: preference.RegistrationStatus
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
    const { accommodationRequested, foodAccepted } = req.body;

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
            foodAccepted
        );
        return res.status(200).json({
            message: "Physical event preferences saved.",
            preference: {
                accommodationRequested: Boolean(
                    Number(preference.AccommodationRequested)
                ),
                foodAccepted: Boolean(Number(preference.FoodAccepted)),
                submitted: true
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

module.exports = {
    getTeamPreference,
    saveTeamPreference,
    getAccommodationParticipants,
    getFoodParticipants,
    getEventTeamPreferences,
    generateFoodTokens
};
