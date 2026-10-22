const express = require("express");
const controller = require("./physicalServicesController");
const router = express.Router();

router.get("/teams/:teamId/preferences", controller.getTeamPreference);
router.put("/teams/:teamId/preferences", controller.saveTeamPreference);
router.get("/events/:eventId/team-preferences", controller.getEventTeamPreferences);
router.get("/events/:eventId/facility-bookings", controller.getFacilityBookings);
router.put("/events/:eventId/teams/:teamId/booking-status", controller.updateBookingStatus);
router.get("/events/:eventId/accommodation-participants", controller.getAccommodationParticipants);
router.get("/events/:eventId/food-participants", controller.getFoodParticipants);
router.post("/events/:eventId/food-tokens", controller.generateFoodTokens);

module.exports = router;
