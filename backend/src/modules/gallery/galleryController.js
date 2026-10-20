const galleryServices = require("./galleryServices");

const createGalleryItem = (req, res) => {
    const { EventId, ImageUrl, Caption, Season, Year, DisplayOrder } = req.body;

    if (!EventId || !ImageUrl) {
        return res.status(400).json({ message: "EventId and ImageUrl are required" });
    }

    galleryServices.createGalleryItem(EventId, ImageUrl, Caption, Season, Year, DisplayOrder, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to add photo to gallery", error: err.message });
        }
        res.status(201).json({
            message: "Photo added to gallery successfully",
            galleryId: result.insertId
        });
    });
};

const createBulkGalleryItems = (req, res) => {
    const { EventId, items } = req.body;

    if (!EventId || !items || !Array.isArray(items)) {
        return res.status(400).json({ message: "EventId and an array of items are required" });
    }

    galleryServices.createBulkGalleryItems(EventId, items, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to add photos to gallery", error: err.message });
        }
        res.status(201).json({
            message: "Photos added to gallery successfully",
            affectedRows: result.affectedRows
        });
    });
};

const getGalleryByEvent = (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({ message: "EventId is required" });
    }

    galleryServices.getGalleryByEvent(eventId, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch gallery items", error: err.message });
        }
        res.status(200).json({ gallery: result || [] });
    });
};

const getGalleryById = (req, res) => {
    const { id } = req.params;

    galleryServices.getGalleryById(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch gallery item", error: err.message });
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Gallery item not found" });
        }
        res.status(200).json({ item: result[0] });
    });
};

const updateGalleryItem = (req, res) => {
    const { id } = req.params;
    const { ImageUrl, Caption, Season, Year, DisplayOrder } = req.body;

    if (!ImageUrl) {
        return res.status(400).json({ message: "ImageUrl is required" });
    }

    galleryServices.updateGalleryItem(id, ImageUrl, Caption, Season, Year, DisplayOrder, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to update gallery item", error: err.message });
        }
        res.status(200).json({ message: "Gallery item updated successfully" });
    });
};

const deleteGalleryItem = (req, res) => {
    const { id } = req.params;

    galleryServices.deleteGalleryItem(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete gallery item", error: err.message });
        }
        res.status(200).json({ message: "Gallery item deleted successfully" });
    });
};

module.exports = {
    createGalleryItem,
    createBulkGalleryItems,
    getGalleryByEvent,
    getGalleryById,
    updateGalleryItem,
    deleteGalleryItem
};
