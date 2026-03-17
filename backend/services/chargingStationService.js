const axios = require("axios");

const OPENCHARGEMAP_KEY = process.env.OPENCHARGEMAP_API_KEY;

/**
 * Find EV charging stations near a given [lat, lng] along a route.
 * Uses OpenChargeMap API.
 * Returns array of station objects.
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
            compact: true,
            verbose: false,
        };

        if (OPENCHARGEMAP_KEY) {
            params.key = OPENCHARGEMAP_KEY;
        }

        const res = await axios.get("https://api.openchargemap.io/v3/poi/", { params });

        return res.data.map((station) => ({
            name: station.AddressInfo?.Title || "Charging Station",
            lat: station.AddressInfo?.Latitude,
            lng: station.AddressInfo?.Longitude,
            power: station.Connections?.[0]?.PowerKW
                ? `${station.Connections[0].PowerKW} kW`
                : "Unknown",
            connectorType:
                station.Connections?.[0]?.ConnectionType?.Title || "Unknown",
            address: station.AddressInfo?.AddressLine1 || "",
        }));
    } catch (err) {
        console.warn("OpenChargeMap API error:", err.message);
        return [];
    }
}

module.exports = { getChargingStations };
