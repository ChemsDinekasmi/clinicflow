const db = require('../db/pool');

async function getStats() {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL)::int AS "totalPatients",
      (SELECT COUNT(*) FROM appointments a JOIN patients p ON p.id = a.patient_id
        WHERE p.deleted_at IS NULL
          AND a.appointment_date >= CURRENT_DATE AND a.appointment_date < CURRENT_DATE + 1)::int AS "todayAppointments",
      (SELECT COUNT(*) FROM appointments a JOIN patients p ON p.id = a.patient_id
        WHERE p.deleted_at IS NULL AND a.status = 'pending')::int AS "pendingCount",
      (SELECT COUNT(*) FROM appointments a JOIN patients p ON p.id = a.patient_id
        WHERE p.deleted_at IS NULL AND a.status = 'confirmed')::int AS "confirmedCount"
  `);
  return rows[0];
}

module.exports = { getStats };
