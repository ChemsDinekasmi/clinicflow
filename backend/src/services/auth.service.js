const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/pool');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const ApiError = require('../utils/ApiError');

const USER_COLUMNS = 'id, full_name AS "fullName", email, role, created_at AS "createdAt"';

async function login(email, password) {
  const { rows } = await db.query(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];
  // Même message dans les deux cas pour ne pas révéler l'existence du compte
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { password_hash: _ignored, ...safeUser } = user;
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
  return { token, user: safeUser };
}

async function getById(id) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  if (!rows[0]) throw ApiError.notFound('User not found');
  return rows[0];
}

module.exports = { login, getById };
