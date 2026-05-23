// backend/app.js
// Express app factory — no app.listen() here.
// This file is imported by:
//   - server.js        (local development — calls listen() itself)
//   - api/index.js     (Vercel serverless — Vercel calls the handler)

const path   = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express    = require('express');
const cors       = require('cors');
const apiRoutes  = require('./routes/api');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger — helpful during development
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

module.exports = app;
