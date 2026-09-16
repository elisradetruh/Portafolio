// config.js - Configuración temporal para pruebas
module.exports = {
  port: process.env.PORT || 3001,
  database: {
    user: 'sa',
    password: '1234', // Contraseña de SQL Server
    server: 'localhost',
    database: 'ELECTRIMARCASS',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
};
