export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const body = { success: false, message };
  if (process.env.NODE_ENV !== 'production') {
    body.error = err.stack || message;
  }

  res.status(status).json(body);
}
