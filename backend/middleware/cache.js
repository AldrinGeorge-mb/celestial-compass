// backend/middleware/cache.js
// In-memory caching layer using node-cache.
// Wraps Express routes to cache successful JSON responses.

const NodeCache = require('node-cache');

// Single shared cache instance for the entire server process.
// stdTTL: 0 means no default TTL — each route sets its own via the factory.
const cache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

/**
 * Creates an Express middleware that caches successful JSON responses.
 *
 * @param {number} ttlSeconds - How long (in seconds) to store the cached result.
 * @returns {import('express').RequestHandler}
 *
 * Usage:
 *   router.get('/apod', cacheMiddleware(86400), apodController.getApod);
 */
const cacheMiddleware = (ttlSeconds) => (req, res, next) => {
    // Build a deterministic cache key from the full request URL (includes query params)
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached !== undefined) {
        console.log(`[CACHE HIT]  ${key}`);
        return res.json(cached);
    }

    console.log(`[CACHE MISS] ${key}`);

    // Intercept res.json to store the payload before it's sent.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        // Only cache 200-level responses; never cache errors.
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache.set(key, body, ttlSeconds);
            console.log(`[CACHE SET]  ${key} (TTL: ${ttlSeconds}s)`);
        }
        return originalJson(body);
    };

    next();
};

module.exports = { cache, cacheMiddleware };
