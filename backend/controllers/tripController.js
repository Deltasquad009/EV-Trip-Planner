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

        // 6. Find charging stations if needed
        let chargingStations = [];
        if (energyResult.needsCharging || energyResult.chargingStops > 0) {
            const neededStops = Math.max(energyResult.chargingStops, 1);

            // To prevent blind spots on long 3000km+ routes, sample every ~100-150km.
            // Distance is in km. So dynamically calculate sample points.
            const distanceInterval = 100; // Sample a point every 100km
            let sampleCount = Math.max(Math.floor(route.distance_km / distanceInterval), neededStops + 2, 6);

            // Avoid overloading API: cap at max 20 queries (so ~2000km dense coverage, sparse beyond)
            sampleCount = Math.min(sampleCount, 20);

            const queryPoints = Array.from({ length: sampleCount }).map((_, i) => {
                const fraction = (i + 1) / (sampleCount + 1);
                const idx = Math.min(Math.floor(fraction * coords.length), coords.length - 1);
                return coords[idx];
            });

            // Increase search radius proportionally if the gaps between queries are large 
            // So if we have 20 points for 3000km = 150km gaps -> radius should be at least ~75km to cover it all.
            const gapDistance = route.distance_km / sampleCount;
            const searchRadius = Math.max(gapDistance / 1.5, 40); // Base 40km, scales up if gaps are huge

            // Fetch sequentially to avoid rate-limiting the OpenChargeMap API on long routes
            const stationArrays = [];
            for (const [lng, lat] of queryPoints) {
                const stations = await getChargingStations(lat, lng, searchRadius, 15);
                stationArrays.push(stations);
                // Optional: tiny delay to breathe
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            const seen = new Set();
            // Take up to 3 stations per query point to ensure even distribution along the route
            chargingStations = stationArrays
                .map(stations => stations.slice(0, 3))
                .flat()
                .filter((s) => {
                    const key = `${s.name}|${s.lat}|${s.lng}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                })
                .map(station => {
                    // Inject Simulated Status for Phase 1 Feature
                    const rand = Math.random();
                    let status = "Available"; // 60% chance
                    if (rand > 0.6 && rand <= 0.9) status = "Occupied"; // 30% chance
                    if (rand > 0.9) status = "Offline"; // 10% chance
                    return { ...station, status };
                });
        }

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
        console.error("Trip planning error:", err.message);
        if (err.response) {
            console.error("API Error details:", err.response.status, err.response.data, err.config?.url);
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

module.exports = { planTrip, getTripHistory };
