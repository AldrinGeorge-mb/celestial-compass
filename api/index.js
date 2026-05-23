// api/index.js
// Vercel Serverless Function entry point.
// Vercel expects a file at /api/*.js and calls it as a Node.js handler.
// We simply export the Express app — Vercel wraps it automatically.

const app = require('../backend/app');

module.exports = app;
