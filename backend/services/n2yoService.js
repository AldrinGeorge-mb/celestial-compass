// backend/services/n2yoService.js
// Fetches upcoming ISS flyover predictions for a given lat/lon
// from the N2YO satellite tracking API.

const axios = require('axios');

/**
 * Retrieves upcoming ISS radio passes for the specified coordinates.
 * Returns an empty array on failure so the app degrades gracefully.
 *
 * @param {number} lat - Latitude of the observer.
 * @param {number} lon - Longitude of the observer.
 * @returns {Promise<Array>} Array of pass objects from N2YO, or [].
 */
const getIssPasses = async (lat, lon) => {
    const N2YO_API_KEY = process.env.N2YO_API_KEY;

    if (!N2YO_API_KEY) {
        console.warn('[N2YO Service] API key not configured. Skipping ISS passes.');
        return [];
    }

    // NORAD catalog ID 25544 = International Space Station
    const url = `https://api.n2yo.com/rest/v1/satellite/radiopasses/25544/${lat}/${lon}/0/2/10/&apiKey=${N2YO_API_KEY}`;

    try {
        const { data } = await axios.get(url, { timeout: 8000 });
        return data.passes || [];
    } catch (error) {
        console.error('[N2YO Service] Request failed:', error.message);
        console.warn('[N2YO Service] Returning empty passes list — static events will still load.');
        return [];
    }
};

module.exports = { getIssPasses };
