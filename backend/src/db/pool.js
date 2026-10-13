const { Pool } = require('pg');
const { databaseUrl } = require('../config/env');

const pool = new Pool({ connectionString: databaseUrl, max: 10 });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
