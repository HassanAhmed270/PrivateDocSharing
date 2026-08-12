export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  const payload = {
    success: false,
    message,
  };

  // Do not leak stack trace in production
  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
