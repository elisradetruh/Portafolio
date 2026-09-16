// scripts/checkDatabase.js
const { pool, poolConnect } = require('../src/db');

async function checkDatabase() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await poolConnect;
    
    // Verificar qué base de datos estamos usando
    const dbResult = await pool.request().query('SELECT DB_NAME() as current_db');
    console.log('📊 Base de datos actual:', dbResult.recordset[0].current_db);
    
    // Verificar si la tabla usuario existe
    const tableResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'usuario'
    `);
    
    if (tableResult.recordset.length > 0) {
      console.log('✅ La tabla "usuario" existe');
      
      // Verificar si hay usuarios
      const userCount = await pool.request().query('SELECT COUNT(*) as count FROM usuario');
      console.log('👥 Número de usuarios:', userCount.recordset[0].count);
      
    } else {
      console.log('❌ La tabla "usuario" NO existe');
      console.log('📋 Tablas disponibles:');
      
      const allTables = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
      
      allTables.recordset.forEach(table => {
        console.log('  -', table.TABLE_NAME);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Invalid object name')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. La base de datos no existe - necesitas crearla');
      console.log('2. La tabla no existe - necesitas ejecutar el script BD.sql');
      console.log('3. Estás conectado a la base de datos incorrecta');
    }
  }
}

checkDatabase();
