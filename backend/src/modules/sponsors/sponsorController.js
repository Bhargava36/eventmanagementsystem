const sponsorServices = require("./sponsorServices");

const createSponsor = (req, res) => {
    const { EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder } = req.body;

    if (!EventId || !Name) {
        return res.status(400).json({ message: "EventId and Name are required" });
    }

    sponsorServices.createSponsor(EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to create sponsor", error: err.message });
        }
        res.status(201).json({
            message: "Sponsor added successfully",
            sponsorId: result.insertId
        });
    });
};

const getSponsorsByEvent = (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({ message: "EventId is required" });
    }

    sponsorServices.getSponsorsByEvent(eventId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch sponsors", error: err.message });
        }
        res.status(200).json({ sponsors: result || [] });
    });
};

const getSponsorById = (req, res) => {
    const { id } = req.params;

    sponsorServices.getSponsorById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch sponsor", error: err.message });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Sponsor not found" });
        }
        res.status(200).json({ sponsor: result[0] });
    });
};

const updateSponsor = (req, res) => {
    const { id } = req.params;
    const { Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder } = req.body;

    if (!Name) {
        return res.status(400).json({ message: "Sponsor Name is required" });
    }

    sponsorServices.updateSponsor(id, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to update sponsor", error: err.message });
        }
        res.status(200).json({ message: "Sponsor updated successfully" });
    });
};

const deleteSponsor = (req, res) => {
    const { id } = req.params;

    sponsorServices.deleteSponsor(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete sponsor", error: err.message });
        }
        res.status(200).json({ message: "Sponsor deleted successfully" });
    });
};

module.exports = {
    createSponsor,
    getSponsorsByEvent,
    getSponsorById,
    updateSponsor,
    deleteSponsor
};
