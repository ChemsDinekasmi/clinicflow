const ApiError = require('../utils/ApiError');

// Valide req[source] avec un schéma Zod ; la valeur parsée est exposée dans req.valid[source]
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(ApiError.badRequest('Validation error', details));
  }
  req.valid = { ...req.valid, [source]: result.data };
  next();
};

module.exports = validate;
