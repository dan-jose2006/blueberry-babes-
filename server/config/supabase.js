'use strict';

// In local dev, load .env from the server directory.
// In production (Vercel), env vars come from the Vercel dashboard — dotenv is a no-op.
try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch (_) {
  // dotenv not available or .env not found — fine in production
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Log the error but DON'T call process.exit() — that would crash the
  // entire Vercel serverless function and prevent any response from being sent.
  console.error('[CampusFlow] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.');
}

// Create the client. If credentials are missing it will be a broken client
// that throws on each query, which is handled in supabaseService.js.
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

module.exports = supabase;
