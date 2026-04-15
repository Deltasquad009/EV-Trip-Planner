const axios = require("axios");

const OPENCHARGEMAP_KEY = process.env.OPENCHARGEMAP_API_KEY;

/**
 * Find EV charging stations near a given [lat, lng] along a route.
 * Uses OpenChargeMap API.
 */
async function getChargingStations(lat, lng, radius = 30, maxResults = 10) {
    try {
        const params = {
            output: "json",
            latitude: lat,
            longitude: lng,
            distance: radius,
            distanceunit: "km",
            maxresults: maxResults,
            verbose: true, // Get full details
            compact: false, // Don't strip connection info
        };

        if (OPENCHARGEMAP_KEY) {
            params.key = OPENCHARGEMAP_KEY;
        }

        const res = await axios.get("https://api.openchargemap.io/v3/poi/", { params });

        return res.data.map((station) => {
            // Find best connection info (highest power)
            const connections = station.Connections || [];
            let bestPower = 0;
            let bestType = "Unknown";

            connections.forEach(conn => {
                const kw = parseFloat(conn.PowerKW) || 0;
                if (kw > bestPower) {
                    bestPower = kw;
                    bestType = conn.ConnectionType?.Title || bestType;
                } else if (bestType === "Unknown" && conn.ConnectionType?.Title) {
                    bestType = conn.ConnectionType.Title;
                }
            });

            // Map status
            const statusType = station.StatusType;
            let status = "Unknown";
            if (statusType) {
                if (statusType.IsOperational === true) status = "Available";
                else if (statusType.IsOperational === false) status = "Offline";
                else status = statusType.Title || "Unknown";
            }

            return {
                name: station.AddressInfo?.Title || station.OperatorInfo?.Title || "Charging Station",
                lat: station.AddressInfo?.Latitude,
                lng: station.AddressInfo?.Longitude,
                power: bestPower > 0 ? `${bestPower} kW` : "Standard Charging",
                connectorType: bestType !== "Unknown" ? bestType : "Details not provided",
                address: station.AddressInfo?.AddressLine1 || "",
                status,
            };
        });
    } catch (err) {
        console.warn("OpenChargeMap API error:", err.message);
        return [];
    }
}


module.exports = { getChargingStations };
