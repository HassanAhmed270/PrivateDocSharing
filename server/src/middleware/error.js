export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  const response = {
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
