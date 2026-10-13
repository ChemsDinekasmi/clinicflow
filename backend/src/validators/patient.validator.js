const { z } = require('zod');

const patientSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  cin: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,20}$/, 'CIN must be 4-20 alphanumeric chars'),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,20}$/, 'Invalid phone number'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD')
    .refine((d) => !Number.isNaN(Date.parse(d)) && new Date(d) <= new Date(), 'Invalid birth date'),
  address: z.string().trim().max(255).optional().nullable().transform((v) => v || null),
});

const listPatientsQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { patientSchema, listPatientsQuerySchema };
