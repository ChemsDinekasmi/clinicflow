const db = require('../db/pool');
const ApiError = require('../utils/ApiError');

const PATIENT_COLUMNS = `
  id, full_name AS "fullName", cin, phone,
  to_char(birth_date, 'YYYY-MM-DD') AS "birthDate", address,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

async function list({ search, page, limit }) {
  const params = [];
  let where = 'deleted_at IS NULL';
  if (search) {
    params.push(`%${escapeLike(search)}%`);
    where += ` AND (full_name ILIKE $1 OR cin ILIKE $1)`;
  }
  params.push(limit, (page - 1) * limit);

  const { rows } = await db.query(
    `SELECT ${PATIENT_COLUMNS}, COUNT(*) OVER()::int AS total_count
     FROM patients
     WHERE ${where}
     ORDER BY created_at DESC, id
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  let total = rows[0]?.total_count ?? 0;
  if (rows.length === 0 && page > 1) {
    // Page hors limites : on récupère quand même le total pour la pagination
    const countRes = await db.query(`SELECT COUNT(*)::int AS c FROM patients WHERE ${where}`, params.slice(0, -2));
    total = countRes.rows[0].c;
  }

  return {
    data: rows.map(({ total_count: _t, ...p }) => p),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

async function getById(id) {
  const { rows } = await db.query(
    `SELECT ${PATIENT_COLUMNS} FROM patients WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  if (!rows[0]) throw ApiError.notFound('Patient not found');
  return rows[0];
}

async function create({ fullName, cin, phone, birthDate, address }) {
  try {
    const { rows } = await db.query(
      `INSERT INTO patients (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${PATIENT_COLUMNS}`,
      [fullName, cin, phone, birthDate, address],
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('A patient with this CIN already exists');
    throw err;
  }
}

async function update(id, { fullName, cin, phone, birthDate, address }) {
  try {
    const { rows } = await db.query(
      `UPDATE patients
       SET full_name = $2, cin = $3, phone = $4, birth_date = $5, address = $6, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING ${PATIENT_COLUMNS}`,
      [id, fullName, cin, phone, birthDate, address],
    );
    if (!rows[0]) throw ApiError.notFound('Patient not found');
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('A patient with this CIN already exists');
    throw err;
  }
}

// Soft delete : l'historique des RDV est conservé
async function remove(id) {
  const { rowCount } = await db.query(
    `UPDATE patients SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  if (rowCount === 0) throw ApiError.notFound('Patient not found');
}

module.exports = { list, getById, create, update, remove };
