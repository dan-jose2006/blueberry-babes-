/**
 * api/index.js — Vercel Serverless Function entry point.
 *
 * This file is ESM (root package.json has "type":"module") and re-exports
 * the Express app from server/index.js which is CommonJS (server/package.json
 * has "type":"commonjs").
 *
 * The trick: use createRequire so we can call require() inside an ESM file.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);

// Load the CJS Express app
const app = require(path.join(__dirname, '../server/index.js'));

export default app;
