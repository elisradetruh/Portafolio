// src/db.js
require('dotenv').config();
const sql = require('mssql');
const config = require('../config.js');

const dbConfig = {
  user: config.database.user,
  password: config.database.password,
  server: config.database.server,
  database: config.database.database,
  port: config.database.port,
  options: config.database.options
};

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect()
  .then(() => console.log('✅ Conectado a SQL Server'))
  .catch(err => {
    console.error('❌ Error conectando a SQL Server:', err);
    process.exit(1);
  });

module.exports = { sql, pool, poolConnect };


