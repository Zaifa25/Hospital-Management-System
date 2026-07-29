/**
 * Global Express Error Handling Middleware.
 * Catches unhandled errors across all API routes and returns structured JSON error responses.
 *
 * @param {Error} err - Error object passed down from route handlers
 * @param {import('express').Request} req - Incoming Express HTTP request
 * @param {import('express').Response} res - Outgoing Express HTTP response
 * @param {import('express').NextFunction} next - Next middleware trigger function
 */
const errorHandler = (err, req, res, next) => {

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
