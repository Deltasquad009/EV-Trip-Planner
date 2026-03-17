const axios = require("axios");

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Fetch weather at a given [lng, lat] coordinate
 * Returns: { temperature, windSpeed_kmh, description }
 */
async function getWeather(lat, lng) {
    if (!OPENWEATHER_KEY) {
        // Graceful fallback if no key provided
        return { temperature: 20, windSpeed_kmh: 10, description: "N/A (no API key)" };
    }

    try {
        const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
                lat,
                lon: lng,
                appid: OPENWEATHER_KEY,
                units: "metric",
            },
        });

        const data = res.data;
        return {
            temperature: parseFloat(data.main.temp.toFixed(1)),
            windSpeed_kmh: parseFloat((data.wind.speed * 3.6).toFixed(1)), // m/s → km/h
            description: data.weather[0]?.description || "",
        };
    } catch (err) {
        console.warn("Weather API error:", err.message);
        return { temperature: 20, windSpeed_kmh: 10, description: "Unavailable" };
    }
}

module.exports = { getWeather };
