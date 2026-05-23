// backend/server.js
// Local development entry point only.
// Imports the shared Express app and calls listen().
// In production (Vercel), api/index.js is used instead — it never calls listen().

const app  = require('./app');

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