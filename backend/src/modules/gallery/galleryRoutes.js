const express = require("express");
const router = express.Router();
const galleryController = require("./galleryController");

router.post("/", galleryController.createGalleryItem);
router.post("/bulk", galleryController.createBulkGalleryItems);
router.get("/event/:eventId", galleryController.getGalleryByEvent);
router.get("/:id", galleryController.getGalleryById);
router.put("/:id", galleryController.updateGalleryItem);
router.delete("/:id", galleryController.deleteGalleryItem);

module.exports = router;
