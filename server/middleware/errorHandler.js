function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error.';

  const body = { error: message };

  if (isDev && status >= 500) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
