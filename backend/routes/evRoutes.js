const express = require("express");
const router = express.Router();
const { getEVModels, seedEVModels } = require("../controllers/evController");

router.get("/models", getEVModels);
router.post("/seed", seedEVModels);

module.exports = router;
