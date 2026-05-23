// backend/services/weatherService.js
// Calculates a sky visibility score (0–100) for a location and time.
// Uses OpenWeatherMap when a key is present; otherwise returns a
// plausible mock score so the frontend always has data to display.

const axios = require('axios');

/**
 * Returns a visibility score object for a given location and unix timestamp.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} unixTimestamp - Unix timestamp (seconds) of the event
 * @returns {Promise<{ visibilityScore: number, cloudCover: number, isMock: boolean }>}
 *   visibilityScore: 0–100 (higher = better viewing conditions)
 *   cloudCover:      0–100 (percentage cloud cover)
 *   isMock:          true if data is estimated rather than live
 */
const getVisibilityScore = async (lat, lon, unixTimestamp) => {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

    // --- No API key: generate a seeded-random plausible score ---
    if (!OPENWEATHER_API_KEY) {
        // Use a simple hash of lat+lon+timestamp so the same event
        // always returns the same mock score within a server session.
        const seed = Math.abs(Math.sin(lat * lon + unixTimestamp) * 10000) % 1;
        const visibilityScore = Math.round(40 + seed * 55); // Range: 40–95
        return {
            visibilityScore,
            cloudCover: Math.round((1 - seed) * 60), // Range: 0–60
            isMock: true,
        };
    }

    // --- Real OpenWeatherMap forecast data ---
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const { data } = await axios.get(url, { timeout: 8000 });

        // Find the forecast entry closest to the event timestamp
        const forecasts = data.list;
        const closest = forecasts.reduce((prev, curr) =>
            Math.abs(curr.dt - unixTimestamp) < Math.abs(prev.dt - unixTimestamp) ? curr : prev
        );

        const cloudCover = closest.clouds.all; // 0–100%
        const visibilityScore = Math.max(0, 100 - cloudCover);
        return { visibilityScore, cloudCover, isMock: false };
    } catch (error) {
        console.error('[Weather Service] Request failed:', error.message);
        // Graceful fallback: return a neutral score rather than crashing
        return { visibilityScore: 65, cloudCover: 30, isMock: true };
    }
};

module.exports = { getVisibilityScore };
