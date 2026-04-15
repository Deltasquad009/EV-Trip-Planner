// Updated by Prasad
const EVModel = require("../models/EVModel");
const Trip = require("../models/Trip");
const { getRoute } = require("../services/routeService");
const { calculateEnergy } = require("../services/energyCalculator");
const { getWeather } = require("../services/weatherService");
const { getChargingStations } = require("../services/chargingStationService");

// POST /api/trip/plan
const planTrip = async (req, res, next) => {
    try {
        const { start, destination, evModelId, batteryPercent = 100 } = req.body;

        // 1. Get EV model
        const evModel = await EVModel.findById(evModelId);
        if (!evModel) {
            const error = new Error("EV model not found");
            error.statusCode = 404;
            throw error;
        }

        // 2. Get route
        const route = await getRoute(start, destination);

        // 3. Get weather at start point
        const [startLng, startLat] = route.startCoords;
        const weather = await getWeather(startLat, startLng);

        // 4. Calculate elevation ascent
        let totalAscent = 0;
        const coords = route.coordinates;
        for (let i = 1; i < coords.length; i++) {
            const prevAlt = coords[i - 1][2] || 0;
            const currAlt = coords[i][2] || 0;
            const diff = currAlt - prevAlt;
            if (diff > 0) totalAscent += diff;
        }

        // 5. Calculate energy
        const energyResult = calculateEnergy({
            distance_km: route.distance_km,
            efficiency: evModel.efficiency,
            batteryCapacity: evModel.batteryCapacity,
            batteryPercent,
            weight: evModel.weight,
            totalAscent,
            temperature: weather.temperature,
            windSpeed_kmh: weather.windSpeed_kmh,
        });

        // 6. Find charging stations with improved logic
        const queryPoints = [];
        queryPoints.push(coords[0]); // Start

        // Sample every 15km for better density
        const distanceInterval = 15;
        let sampleCount = Math.floor(route.distance_km / distanceInterval);
        sampleCount = Math.min(Math.max(sampleCount, 3), 40);

        for (let i = 1; i <= sampleCount; i++) {
            const fraction = i / (sampleCount + 1);
            const idx = Math.floor(fraction * (coords.length - 1));
            queryPoints.push(coords[idx]);
        }
        queryPoints.push(coords[coords.length - 1]); // End

        // Intermediate search radius (higher for highway stretches)
        const searchRadius = 40;
        const stationArrays = [];

        // Parallelize fetching in batches of 5 to be fast but respectful
        const batchSize = 5;
        for (let i = 0; i < queryPoints.length; i += batchSize) {
            const batch = queryPoints.slice(i, i + batchSize);
            const batchPromises = batch.map(([lng, lat]) =>
                getChargingStations(lat, lng, searchRadius, 15)
            );
            const results = await Promise.all(batchPromises);
            stationArrays.push(...results);
            
            // Minimal sleep between batches if needed, but Promise.all is faster
            if (i + batchSize < queryPoints.length) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        const seen = new Set();
        const chargingStations = stationArrays
            .flat()
            .filter((s) => {
                const key = `${s.name}|${s.lat}|${s.lng}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

        // 7. Build response
        const estimatedTolls = Math.round(route.distance_km * 1.5);
        const tripResult = {
            success: true,
            start,
            destination,
            evModel: evModel.name,
            batteryCapacity: evModel.batteryCapacity,
            distance_km: route.distance_km,
            duration_hr: route.duration_hr,
            coordinates: route.coordinates,
            energy: energyResult,
            weather,
            chargingStations,
            totalAscent: parseFloat(totalAscent.toFixed(0)),
            estimatedTolls,
            directions: route.directions,
        };

        // 8. Save trip to DB
        const userId = req.user?._id || null;
        if (userId) {
            await Trip.create({
                userId,
                start,
                destination,
                evModel: evModel.name,
                distance: route.distance_km,
                duration: route.duration_hr,
                energyUsed: energyResult.totalEnergy,
                batteryRemaining: energyResult.batteryRemaining,
                chargingStops: energyResult.chargingStops,
                chargingStations,
                weather,
                coordinates: route.coordinates,
            });
        }

        res.json(tripResult);
    } catch (err) {
        next(err);
    }
};

// GET /api/trip/history
const getTripHistory = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            const error = new Error("Not authenticated");
            error.statusCode = 401;
            throw error;
        }
        const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json({ success: true, trips });
    } catch (err) {
        next(err);
    }
};

// GET /api/trip/reverse-geocode
const reverseGeocodeController = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            const error = new Error("lat and lon are required");
            error.statusCode = 400;
            throw error;
        }

        const { reverseGeocode } = require("../services/routeService");
        const address = await reverseGeocode(lat, lon);
        res.json({ success: true, address });
    } catch (err) {
        next(err);
    }
};

module.exports = { planTrip, getTripHistory, reverseGeocodeController };


module.exports = { planTrip, getTripHistory, reverseGeocodeController };
