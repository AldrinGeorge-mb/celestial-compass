// backend/routes/api.js
// Thin routing layer. No business logic lives here — only route definitions
// and middleware attachment. Each route delegates to a dedicated controller.

const express = require('express');
const axios = require('axios');
const router = express.Router();

const { getApod } = require('../controllers/apodController');
const { getEvents } = require('../controllers/eventsController');
const { cacheMiddleware } = require('../middleware/cache');

// ── APOD ──────────────────────────────────────────────────────────────────────
// Cache for 24 hours: NASA publishes a new picture once per day.
router.get('/apod', cacheMiddleware(86400), getApod);

// ── Sky Events ────────────────────────────────────────────────────────────────
// Cache per-location for 5 minutes: ISS orbital data changes, but not by the second.
router.get('/events', cacheMiddleware(300), getEvents);

// ── Globe Image Proxy ─────────────────────────────────────────────────────────
// Proxies a high-resolution NASA earth texture to avoid CORS issues from the browser.
// Relies on browser Cache-Control rather than node-cache (image is too large for memory).
router.get('/globe-image', async (req, res) => {
    const NASA_TEXTURE_URL =
        'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg';

    try {
        const response = await axios.get(NASA_TEXTURE_URL, {
            responseType: 'arraybuffer',
            timeout: 30000, // Large file — allow 30s
        });

        res.set('Content-Type', 'image/jpeg');
        // Tell the browser to cache this for 7 days — the texture never changes.
        res.set('Cache-Control', 'public, max-age=604800, immutable');
        res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('[Globe Proxy] Failed to fetch texture:', error.message);
        res.status(502).json({ message: 'Failed to proxy the globe image.' });
    }
});

module.exports = router;