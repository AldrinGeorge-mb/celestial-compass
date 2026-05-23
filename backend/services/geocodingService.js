// backend/services/geocodingService.js
// Resolves a human-readable location query to geographic coordinates
// using the Positionstack forward geocoding API.

const axios = require('axios');

/**
 * Converts a location string to { lat, lon, name } coordinates.
 * Throws on failure — callers should handle errors and fall back accordingly.
 *
 * @param {string} query - A human-readable location string (e.g. "London", "Tokyo").
 * @returns {Promise<{ lat: number, lon: number, name: string }>}
 */
const geocodeLocation = async (query) => {
    const POSITIONSTACK_API_KEY = process.env.POSITIONSTACK_API_KEY;

    if (!POSITIONSTACK_API_KEY) {
        throw new Error('POSITIONSTACK_API_KEY is not configured in .env');
    }

    const url = `http://api.positionstack.com/v1/forward?access_key=${POSITIONSTACK_API_KEY}&query=${encodeURIComponent(query)}&limit=1`;

    const { data } = await axios.get(url, { timeout: 8000 });

    if (!data?.data?.length) {
        throw new Error(`No coordinates found for location: "${query}"`);
    }

    const { latitude: lat, longitude: lon, label: name } = data.data[0];
    return { lat, lon, name };
};

module.exports = { geocodeLocation };
