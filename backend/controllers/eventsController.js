// backend/controllers/eventsController.js
// Orchestrates the full pipeline for the sky events endpoint:
//   Geocode → ISS Passes → Merge Static Events → Append Visibility Scores → Return

const { geocodeLocation } = require('../services/geocodingService');
const { getIssPasses } = require('../services/n2yoService');
const { getVisibilityScore } = require('../services/weatherService');
const { staticEvents } = require('../data/staticEvents');
const { mockEvents } = require('../data/mockData');

/**
 * GET /api/events?location={query}
 *
 * Response shape (success):
 * {
 *   location: { name: string, lat: number, lon: number },
 *   events:   Array<EventObject>,
 *   degradedMode: false
 * }
 *
 * Response shape (graceful fallback):
 * {
 *   location: { name: string, lat: null, lon: null },
 *   events:   Array<MockEventObject>,
 *   degradedMode: true,
 *   message:  string
 * }
 */
const getEvents = async (req, res) => {
    const locationQuery = req.query.location?.trim();

    if (!locationQuery) {
        return res.status(400).json({ message: 'A location query is required.' });
    }

    try {
        // ── Step 1: Geocode the user-provided location string ──────────────
        const location = await geocodeLocation(locationQuery);
        console.log(`[Events] Geocoded "${locationQuery}" → ${location.name} (${location.lat}, ${location.lon})`);

        // ── Step 2: Fetch live ISS passes (fails silently → []) ────────────
        const passes = await getIssPasses(location.lat, location.lon);

        // ── Step 3: Map live passes to the standardized event format ────────
        const liveFlyoverEvents = passes.map((pass) => ({
            type: 'flyover',
            title: `ISS Pass over ${location.name}`,
            date: new Date(pass.startUTC * 1000).toISOString(),
            description: `A live ISS pass reaching a maximum elevation of ${pass.maxEl}° above the horizon.`,
            duration: Math.round(pass.duration / 60),
            details: `<strong>Max Elevation:</strong> ${pass.maxEl}°<br><strong>Appears:</strong> ${pass.startAz}° ${pass.startAzCompass}<br><strong>Disappears:</strong> ${pass.endAz}° ${pass.endAzCompass}`,
        }));

        // ── Step 4: Merge live passes + static events, sorted by date ───────
        const allEvents = [...liveFlyoverEvents, ...staticEvents].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        // ── Step 5: Append visibility score to each event in parallel ────────
        // We use Promise.all for concurrency; each call is fast (in-memory mock
        // or a single OpenWeatherMap request per event).
        const eventsWithVisibility = await Promise.all(
            allEvents.map(async (event) => {
                const eventTimestamp = Math.floor(new Date(event.date).getTime() / 1000);
                const visibility = await getVisibilityScore(location.lat, location.lon, eventTimestamp);
                return { ...event, ...visibility };
            })
        );

        // ── Step 6: Return standardized response ────────────────────────────
        return res.json({
            location: { name: location.name, lat: location.lat, lon: location.lon },
            events: eventsWithVisibility,
            degradedMode: false,
        });

    } catch (error) {
        // ── Graceful fallback: geocoding or other pipeline step failed ───────
        console.error('[Events Controller] Pipeline failed:', error.message);
        console.warn('[Events Controller] Serving mock events as fallback.');

        return res.json({
            location: { name: locationQuery, lat: null, lon: null },
            events: mockEvents,
            degradedMode: true,
            message: 'Live data is currently unavailable. Showing sample events.',
        });
    }
};

module.exports = { getEvents };
