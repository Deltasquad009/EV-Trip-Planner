const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Full auth guard — rejects unauthenticated requests
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Optional auth — attaches user if token is present, but doesn't block if missing
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(); // Guest — allow without auth

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (err) {
    // Invalid token — just skip, don't block
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
