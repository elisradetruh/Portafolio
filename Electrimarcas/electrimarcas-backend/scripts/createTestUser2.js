// scripts/createTestUser2.js
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const { pool, poolConnect } = require('../src/db');

async function createTestUser() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await poolConnect;
    
    // Verificar si ya existe el usuario de prueba
    const existingUser = await pool.request()
      .input('email', sql.VarChar, 'admin@electrimarcas.com')
      .query('SELECT * FROM usuario WHERE correo_electronico = @email');
    
    if (existingUser.recordset.length > 0) {
      console.log('✅ Usuario admin@electrimarcas.com ya existe');
      return;
    }
    
    // Hashear la contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario de prueba
    const result = await pool.request()
      .input('id_usuario', sql.Char, 'ADM001')
      .input('id_municipio', sql.Int, 1) // Culiacán
      .input('nombre_completo', sql.VarChar, 'Administrador')
      .input('correo_electronico', sql.VarChar, 'admin@electrimarcas.com')
      .input('contraseña_hash', sql.VarChar, hashedPassword)
      .query(`
        INSERT INTO usuario (id_usuario, id_municipio, nombre_completo, correo_electronico, contraseña_hash)
        VALUES (@id_usuario, @id_municipio, @nombre_completo, @correo_electronico, @contraseña_hash)
      `);
    
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('📧 Email: admin@electrimarcas.com');
    console.log('🔑 Contraseña: admin123');
    
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error);
  }
}

createTestUser();
