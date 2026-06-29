'use strict';

/**
 * Global Express error handler.
 * Must be the LAST middleware registered with app.use().
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[CampusFlow] [${req.method} ${req.path}] ${status} — ${message}`);

  if (process.env.NODE_ENV === 'development') {
    return res.status(status).json({
      success: false,
      error: message,
      stack: err.stack,
    });
  }

  res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
