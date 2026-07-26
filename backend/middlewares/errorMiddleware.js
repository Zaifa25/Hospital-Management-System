/**
 * Global Express Error Handling Middleware.
 * Catches unhandled errors and formats a clean JSON error response.
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
