const express = require("express");
const router = express.Router();
const { planTrip, getTripHistory } = require("../controllers/tripController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// optionalAuth: saves trip with userId if user is logged in, works as guest too
router.post("/plan", optionalAuth, planTrip);
// protect: requires valid JWT to view trip history
router.get("/history", protect, getTripHistory);

module.exports = router;
