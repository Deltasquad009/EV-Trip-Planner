const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  vehicleType: {
    type: String,
    default: "EV"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);