'use strict';

// In local dev, load .env from server directory.
// On Vercel, env vars are injected automatically — dotenv is a safe no-op.
try {
  require('dotenv').config();
} catch (_) {}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const studentRoutes = require('./routes/students');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust Vercel's proxy headers for rate limiting
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow local dev, any *.vercel.app deployment, and custom FRONTEND_URL env var.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, curl)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.match(/\.vercel\.app$/)) return callback(null, true);
    // Allow explicitly whitelisted origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

// Stricter limit on AI endpoint (Groq has rate limits)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, error: 'AI rate limit reached. Please wait a moment.' },
});

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    success: true,
    status: 'CampusFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/students', studentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server (only when run directly, not when imported by Vercel) ────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[CampusFlow] API running on http://localhost:${PORT}`);
    console.log(`[CampusFlow] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
