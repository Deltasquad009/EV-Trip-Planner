// Updated by Prasad
const EVModel = require("../models/EVModel");
const Trip = require("../models/Trip");
const { getRoute } = require("../services/routeService");
const { calculateEnergy } = require("../services/energyCalculator");
const { getWeather } = require("../services/weatherService");
const { getChargingStations } = require("../services/chargingStationService");

// POST /api/trip/plan
const planTrip = async (req, res) => {
    const { start, destination, evModelId, batteryPercent = 100 } = req.body;

    if (!start || !destination || !evModelId) {
        return res.status(400).json({ message: "start, destination, and evModelId are required." });
    }

    try {
        // 1. Get EV model
        const evModel = await EVModel.findById(evModelId);
        if (!evModel) return res.status(404).json({ message: "EV model not found." });

        // 2. Get route
        const route = await getRoute(start, destination);

        // 3. Get weather at start point (ORS returns [lng, lat])
        const [startLng, startLat] = route.startCoords;
        const weather = await getWeather(startLat, startLng);

        // 4. Calculate elevation ascent from route coordinates (simple approximation)
        // ORS driving-car geojson may include elevation as 3rd coordinate — use if available
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

        // 6. Find charging stations 
        let chargingStations = [];
        
        // As per request: "show all charging stations from start to ending" near 1km.
        // We will sample the route fairly densely but cap the number of requests to avoid API bans.
        const distanceInterval = 2; // Sample every 2km to get good coverage with a 1km radius
        let sampleCount = Math.floor(route.distance_km / distanceInterval);
        
        // Cap at max 40 queries
        sampleCount = Math.min(sampleCount, 40);
        // Ensure at least a few samples even for short routes
        sampleCount = Math.max(sampleCount, 2);

        const queryPoints = [];
        // Include start coordinates
        queryPoints.push(coords[0]);
        
        for(let i = 1; i <= sampleCount; i++) {
            const fraction = i / (sampleCount + 1);
            const idx = Math.floor(fraction * (coords.length - 1));
            queryPoints.push(coords[idx]);
        }
        
        // Include end coordinates
        queryPoints.push(coords[coords.length - 1]);

        // Search radius is exactly 1 km as requested
        const searchRadius = 1;

        // Fetch concurrently in chunks of 5
        const stationArrays = [];
        const chunkSize = 5;
        for (let i = 0; i < queryPoints.length; i += chunkSize) {
            const chunk = queryPoints.slice(i, i + chunkSize);
            const chunkResults = await Promise.all(
                chunk.map(([lng, lat]) => getChargingStations(lat, lng, searchRadius, 50))
            );
            stationArrays.push(...chunkResults);
            
            if (i + chunkSize < queryPoints.length) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const seen = new Set();
        chargingStations = stationArrays
            .flat()
            .filter((s) => {
                const key = `${s.name}|${s.lat}|${s.lng}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map(station => {
                const rand = Math.random();
                let status = "Available"; // 60% chance
                if (rand > 0.6 && rand <= 0.9) status = "Occupied"; // 30% chance
                if (rand > 0.9) status = "Offline"; // 10% chance
                return { ...station, status };
            });

        // 7. Build response
        // Estimate toll cost (approx ₹1.5 per km on Indian highways)
        const estimatedTolls = Math.round(route.distance_km * 1.5);

        const tripResult = {
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

        // 8. Save trip to DB (optional, userId from token if auth middleware used)
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
        console.error("🔴 Trip planning error:", err.message);
        console.error("    Error type:", err.code || err.constructor.name);
        if (err.response) {
            console.error("    API Response status:", err.response.status);
            console.error("    API Response data:", err.response.data);
            console.error("    API Request URL:", err.config?.url);
        }
        if (err.message.includes("geocode")) {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message || "Failed to plan trip." });
    }
};

// GET /api/trip/history (requires auth)
const getTripHistory = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Not authenticated." });
        const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch trip history.", error: err.message });
    }
};

// GET /api/trip/reverse-geocode
const reverseGeocodeController = async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ message: "lat and lon are required." });
    }

    try {
        const { reverseGeocode } = require("../services/routeService");
        const address = await reverseGeocode(lat, lon);
        res.json({ address });
    } catch (err) {
        res.status(500).json({ message: "Failed to reverse geocode.", error: err.message });
    }
};

module.exports = { planTrip, getTripHistory, reverseGeocodeController };
