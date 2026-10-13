const db = require('../db/pool');
const ApiError = require('../utils/ApiError');

const CONFLICT_WINDOW_MINUTES = 30;

const APPOINTMENT_SELECT = `
  SELECT a.id, a.patient_id AS "patientId", a.appointment_date AS "appointmentDate",
         a.status, a.reason, a.notes, a.created_by AS "createdBy",
         a.created_at AS "createdAt", a.updated_at AS "updatedAt",
         p.full_name AS "patientName", p.cin AS "patientCin",
         u.full_name AS "createdByName"
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN users u ON u.id = a.created_by`;

// Règle métier : un patient ne peut pas avoir 2 RDV confirmés à moins de 30 min d'écart.
// Doublée par la contrainte EXCLUDE en base (filet de sécurité contre les accès concurrents).
async function assertNoConfirmedConflict(patientId, appointmentDate, excludeId = null) {
  const { rows } = await db.query(
    `SELECT id FROM appointments
     WHERE patient_id = $1
       AND status = 'confirmed'
       AND ($3::uuid IS NULL OR id <> $3::uuid)
       AND appointment_date > $2::timestamptz - make_interval(mins => $4)
       AND appointment_date < $2::timestamptz + make_interval(mins => $4)
     LIMIT 1`,
    [patientId, appointmentDate, excludeId, CONFLICT_WINDOW_MINUTES],
  );
  if (rows.length) {
    throw ApiError.conflict(
      `Patient already has a confirmed appointment within ${CONFLICT_WINDOW_MINUTES} minutes`,
    );
  }
}

async function getById(id) {
  const { rows } = await db.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id]);
  if (!rows[0]) throw ApiError.notFound('Appointment not found');
  return rows[0];
}

async function list({ date, status, patientId, page, limit }) {
  const conditions = ['p.deleted_at IS NULL'];
  const params = [];

  if (date) {
    params.push(date);
    conditions.push(
      `a.appointment_date >= $${params.length}::date AND a.appointment_date < $${params.length}::date + 1`,
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }
  if (patientId) {
    params.push(patientId);
    conditions.push(`a.patient_id = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const countRes = await db.query(
    `SELECT COUNT(*)::int AS total FROM appointments a JOIN patients p ON p.id = a.patient_id ${where}`,
    params,
  );
  const total = countRes.rows[0].total;

  params.push(limit, (page - 1) * limit);
  const { rows } = await db.query(
    `${APPOINTMENT_SELECT} ${where}
     ORDER BY a.appointment_date DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: rows,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function create({ patientId, appointmentDate, status, reason, notes }, userId) {
  const patient = await db.query('SELECT 1 FROM patients WHERE id = $1 AND deleted_at IS NULL', [patientId]);
  if (!patient.rowCount) throw ApiError.notFound('Patient not found');

  if (status === 'confirmed') await assertNoConfirmedConflict(patientId, appointmentDate);

  const { rows } = await db.query(
    `INSERT INTO appointments (patient_id, appointment_date, status, reason, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [patientId, appointmentDate, status, reason, notes, userId],
  );
  return getById(rows[0].id);
}

async function updateStatus(id, status) {
  const current = await getById(id);
  if (current.status === status) return current;

  if (status === 'confirmed') {
    await assertNoConfirmedConflict(current.patientId, current.appointmentDate, id);
  }

  await db.query('UPDATE appointments SET status = $2, updated_at = NOW() WHERE id = $1', [id, status]);
  return getById(id);
}

module.exports = { list, getById, create, updateStatus };
