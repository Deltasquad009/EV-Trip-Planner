/**
 * Input validation middleware using express-validator
 * Centralizes request validation for all API endpoints.
 */
const { body, validationResult } = require("express-validator");

// Middleware to check validation results and return errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────
const validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

// ─── Trip Validators ──────────────────────────────────────────────────────────
const validateTripPlan = [
  body("start")
    .trim()
    .notEmpty()
    .withMessage("Start location is required")
    .isLength({ max: 200 })
    .withMessage("Start location is too long"),
  body("destination")
    .trim()
    .notEmpty()
    .withMessage("Destination is required")
    .isLength({ max: 200 })
    .withMessage("Destination is too long"),
  body("evModelId")
    .trim()
    .notEmpty()
    .withMessage("EV model is required")
    .isMongoId()
    .withMessage("Invalid EV model ID"),
  body("batteryPercent")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Battery percent must be between 1 and 100"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTripPlan,
};
