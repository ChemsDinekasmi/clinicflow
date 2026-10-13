const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  // Erreurs PostgreSQL connues
  switch (err.code) {
    case '23505':
      return res.status(409).json({ error: { message: 'Duplicate value', details: err.detail } });
    case '23P01':
      return res.status(409).json({
        error: { message: 'Patient already has a confirmed appointment within 30 minutes' },
      });
    case '23503':
      return res.status(409).json({ error: { message: 'Related resource constraint violated' } });
    case '22P02':
      return res.status(400).json({ error: { message: 'Invalid input format' } });
    default:
      break;
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error' } });
}

module.exports = { notFound, errorHandler };
