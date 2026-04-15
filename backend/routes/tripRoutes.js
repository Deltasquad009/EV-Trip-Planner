const express = require("express");
const router = express.Router();
const { planTrip, getTripHistory, reverseGeocodeController } = require("../controllers/tripController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { validateTripPlan } = require("../middleware/validate");

// optionalAuth: saves trip with userId if user is logged in, works as guest too
router.post("/plan", optionalAuth, validateTripPlan, planTrip);
// protect: requires valid JWT to view trip history
router.get("/history", protect, getTripHistory);
// Public: Reverse geocode for current location
router.get("/reverse-geocode", reverseGeocodeController);

module.exports = router;
