// backend/services/nasaService.js
// Responsible solely for fetching data from the NASA APOD API.
// Falls back to mockApod on any failure.

const axios = require('axios');
const { mockApod } = require('../data/mockData');

/**
 * Fetches the Astronomy Picture of the Day from NASA's API.
 * Falls back to mockApod if the API key is missing or the request fails.
 *
 * @returns {Promise<Object>} APOD data object matching the NASA API response shape.
 */
const fetchApod = async () => {
    const NASA_API_KEY = process.env.NASA_API_KEY;

    if (!NASA_API_KEY) {
        console.warn('[NASA Service] API key not configured. Returning mock APOD.');
        return mockApod;
    }

    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

    try {
        const { data } = await axios.get(url, { timeout: 8000 });
        return data;
    } catch (error) {
        console.error('[NASA Service] Request failed:', error.message);
        console.warn('[NASA Service] Falling back to mock APOD data.');
        return { ...mockApod, _fallback: true };
    }
};

module.exports = { fetchApod };
