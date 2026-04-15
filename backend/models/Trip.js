const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
        start: { type: String, required: true },
        destination: { type: String, required: true },
        evModel: { type: String },
        distance: { type: Number },           // km
        duration: { type: Number },           // hours
        energyUsed: { type: Number },         // kWh
        batteryRemaining: { type: Number },   // %
        chargingStops: { type: Number, default: 0 },
        chargingStations: [
            {
                name: String,
                lat: Number,
                lng: Number,
                power: String,
                connectorType: String,
            },
        ],
        weather: {
            temperature: Number,
            windSpeed: Number,
            description: String,
        },
        coordinates: { type: Array, default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
