const { z } = require('zod');

const idParamSchema = z.object({ id: z.string().uuid('Invalid id') });

module.exports = { idParamSchema };
