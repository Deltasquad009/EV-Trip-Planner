/**
 * Energy Calculator Service
 *
 * Formula:
 *   baseEnergy (kWh) = distance_km × efficiency_Wh_per_km / 1000
 *   elevationPenalty (kWh) = mass_kg × 9.81 × totalAscent_m / 3,600,000
 *   weatherPenalty (fraction) = 0.10 if temp < 10°C | 0.05 if windSpeed > 30 km/h
 *   totalEnergy = baseEnergy × (1 + weatherPenalty) + elevationPenalty
 */

function calculateEnergy({
    distance_km,
    efficiency,       // Wh/km
    batteryCapacity,  // kWh
    batteryPercent,   // 0-100
    weight,           // kg
    totalAscent,      // metres (from elevation data, 0 if unavailable)
    temperature,      // °C
    windSpeed_kmh,    // km/h
}) {
    const availableEnergy = (batteryPercent / 100) * batteryCapacity; // kWh

    // Base consumption
    const baseEnergy = (distance_km * efficiency) / 1000; // kWh

    // Elevation penalty
    const g = 9.81;
    const elevationPenalty = (weight * g * (totalAscent || 0)) / 3_600_000; // kWh

    // Weather penalties
    let weatherFactor = 0;
    if (temperature !== null && temperature !== undefined && temperature < 10) {
        weatherFactor += 0.10;
    }
    if (windSpeed_kmh !== null && windSpeed_kmh !== undefined && windSpeed_kmh > 30) {
        weatherFactor += 0.05;
    }

    const weatherPenalty = baseEnergy * weatherFactor;

    const totalEnergy = baseEnergy + elevationPenalty + weatherPenalty;
    const batteryRemaining = ((availableEnergy - totalEnergy) / batteryCapacity) * 100;
    const needsCharging = batteryRemaining < 10; // alert if below 10%

    // Simple charging stop estimate: how many full charges needed
    const chargingStops =
        totalEnergy > availableEnergy
            ? Math.ceil((totalEnergy - availableEnergy) / batteryCapacity)
            : 0;

    return {
        baseEnergy: parseFloat(baseEnergy.toFixed(2)),
        elevationPenalty: parseFloat(elevationPenalty.toFixed(2)),
        weatherPenalty: parseFloat(weatherPenalty.toFixed(2)),
        totalEnergy: parseFloat(totalEnergy.toFixed(2)),
        batteryRemaining: parseFloat(Math.max(batteryRemaining, 0).toFixed(1)),
        availableEnergy: parseFloat(availableEnergy.toFixed(2)),
        needsCharging,
        chargingStops,
        weatherFactor: parseFloat((weatherFactor * 100).toFixed(0)), // %
    };
}

module.exports = { calculateEnergy };
