require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

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
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Start ─────────────────────────────────────────────────────────────────────
// Port 5001 avoids the conflict with Vite's default dev-server port (5173/3000/5000).
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log('║      Celestial Compass — Backend     ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log('\nAPI Key Status:');
    console.log(`  NASA         : ${process.env.NASA_API_KEY ? '✅ Loaded' : '⚠️  Missing (mock fallback active)'}`);
    console.log(`  N2YO         : ${process.env.N2YO_API_KEY ? '✅ Loaded' : '⚠️  Missing (no ISS passes)'}`);
    console.log(`  Positionstack: ${process.env.POSITIONSTACK_API_KEY ? '✅ Loaded' : '⚠️  Missing (events will use mock data)'}`);
    console.log(`  OpenWeather  : ${process.env.OPENWEATHER_API_KEY ? '✅ Loaded' : 'ℹ️  Missing (mock visibility scores active)'}`);
    console.log('');
});