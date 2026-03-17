const mongoose = require("mongoose");

const evModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batteryCapacity: { type: Number, required: true }, // kWh
    efficiency: { type: Number, required: true },      // Wh/km
    weight: { type: Number, default: 1800 },           // kg
    dragCoefficient: { type: Number, default: 0.23 },
    frontalArea: { type: Number, default: 2.22 },      // m²
    range: { type: Number },                           // km (approx)
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EVModel", evModelSchema);
