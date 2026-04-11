const axios = require("axios");

// Using Nominatim (OpenStreetMap) for geocoding — FREE, no API key needed
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Using OSRM public server for routing — FREE, no API key needed
const OSRM_BASE = "https://router.project-osrm.org";

// Geocode an address string → [lng, lat]
async function geocode(address) {
    try {
        const res = await axios.get(`${NOMINATIM_BASE}/search`, {
            params: {
                q: address,
                format: "json",
                limit: 1,
                addressdetails: 1,
            },
            headers: {
                // Nominatim requires a User-Agent header
                "User-Agent": "EVTripPlanner/1.0 (contact@evtripplanner.app)",
                "Accept-Language": "en",
            },
            timeout: 10000,
        });

        const results = res.data;
        if (!results || results.length === 0) {
            throw new Error(`Could not geocode address: "${address}". Please check the spelling.`);
        }

        const { lon, lat } = results[0];
        return [parseFloat(lon), parseFloat(lat)]; // [lng, lat]
    } catch (err) {
        if (err.message.includes("Could not geocode")) throw err;
        throw new Error(`Geocoding failed for "${address}": ${err.message}`);
    }
}

// Get driving route between two addresses using OSRM
async function getRoute(startAddress, destinationAddress) {
    // Step 1: Geocode both addresses
    const startCoords = await geocode(startAddress);
    const endCoords = await geocode(destinationAddress);

    // Step 2: Get route from OSRM
    // OSRM expects coordinates as "lng,lat;lng,lat"
    const coordStr = `${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}`;

    let res;
    try {
        res = await axios.get(
            `${OSRM_BASE}/route/v1/driving/${coordStr}`,
            {
                params: {
                    overview: "full",
                    geometries: "geojson",
                    steps: true,
                },
                timeout: 15000,
            }
        );
    } catch (err) {
        throw new Error(
            `Could not calculate a driving route between "${startAddress}" and "${destinationAddress}". ` +
            (err.response?.data?.message || err.message)
        );
    }

    const data = res.data;
    if (!data || data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error(
            `Could not calculate a driving route between "${startAddress}" and "${destinationAddress}". ` +
            `Please check the addresses or ensure a valid driving path exists.`
        );
    }

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates; // [[lng, lat], ...]
    const distance_km = parseFloat((route.distance / 1000).toFixed(2));
    const duration_hr = parseFloat((route.duration / 3600).toFixed(2));

    // Process turn-by-turn directions if available
    const directions = (route.legs && route.legs[0] && route.legs[0].steps) 
        ? route.legs[0].steps.map(step => {
            const maneuver = step.maneuver || {};
            const type = maneuver.type || "";
            const modifier = maneuver.modifier || "";
            const roadName = step.name ? `onto ${step.name}` : "";
            
            let instruction = "";
            if (type === "depart") instruction = `Head ${modifier} ${roadName}`;
            else if (type === "arrive") instruction = `Arrive at destination`;
            else if (type === "turn") instruction = `Turn ${modifier} ${roadName}`;
            else if (type === "roundabout") instruction = `Enter roundabout and take exit ${roadName}`;
            else if (type === "continue") instruction = `Continue ${modifier} ${roadName}`;
            else instruction = `${type.replace(/-/g, " ")} ${modifier} ${roadName}`;
            
            // Clean up multiple spaces and capitalize
            instruction = instruction.replace(/\s+/g, " ").trim();
            instruction = instruction.charAt(0).toUpperCase() + instruction.slice(1);

            return {
                instruction,
                distance_km: parseFloat((step.distance / 1000).toFixed(2)),
                type,
                modifier,
                location: maneuver.location
            };
        }).filter(d => d.distance_km > 0.05 || d.type === "arrive") // filter out micro-steps
        : [];

    return {
        distance_km,
        duration_hr,
        coordinates,   // [lng, lat] pairs — same format as before
        startCoords,
        endCoords,
        directions
    };
}

// Reverse geocode [lat, lon] → Address string
async function reverseGeocode(lat, lon) {
    try {
        const res = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client`, {
            params: {
                latitude: lat,
                longitude: lon,
                localityLanguage: "en",
            },
            timeout: 10000,
        });

        const data = res.data;
        if (!data || (!data.city && !data.locality && !data.principalSubdivision)) {
            return "Unknown Location";
        }

        const locationName = data.city || data.locality || data.principalSubdivision;
        const state = data.principalSubdivision || "";
        
        return state && locationName !== state ? `${locationName}, ${state}` : locationName;
    } catch (err) {
        console.error("Reverse geocoding failed:", err.message);
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)}`;
    }
}

module.exports = { getRoute, geocode, reverseGeocode };
