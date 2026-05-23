// backend/controllers/apodController.js
// Thin controller — delegates all business logic to nasaService.
// A controller's only job is to translate HTTP <-> service calls.

const { fetchApod } = require('../services/nasaService');

/**
 * GET /api/apod
 * Returns today's Astronomy Picture of the Day.
 * Falls back to mock data automatically via nasaService on any failure.
 */
const getApod = async (req, res) => {
    try {
        const apodData = await fetchApod();
        return res.json(apodData);
    } catch (error) {
        // nasaService already handles its own errors; this catch is
        // a final safety net for truly unexpected exceptions.
        console.error('[APOD Controller] Unexpected error:', error.message);
        return res.status(500).json({
            message: 'Failed to retrieve Astronomy Picture of the Day.',
        });
    }
};

module.exports = { getApod };
