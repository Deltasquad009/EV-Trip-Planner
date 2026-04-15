const express = require("express");
const router = express.Router();
const { getEVModels, seedEVModels } = require("../controllers/evController");
const { protect } = require("../middleware/authMiddleware");

// Public: list all EV models
router.get("/models", getEVModels);

// Protected: seed route requires authentication (admin action)
// In production, add an admin role check middleware here
router.post("/seed", protect, seedEVModels);

module.exports = router;
