/**
 * Global error handler middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`💥 [${new Date().toISOString()}] Error:`, err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
