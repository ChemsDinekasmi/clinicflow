const { z } = require('zod');

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentDate: z.string().datetime({ offset: true, message: 'appointmentDate must be an ISO datetime' }),
  status: z.enum(STATUSES).default('pending'),
  reason: z.string().trim().min(2).max(255),
  notes: z.string().trim().max(2000).optional().nullable().transform((v) => v || null),
});

const updateStatusSchema = z.object({ status: z.enum(STATUSES) });

const listAppointmentsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
  status: z.enum(STATUSES).optional(),
  patientId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { createAppointmentSchema, updateStatusSchema, listAppointmentsQuerySchema };
