// scripts/checkUsers.js
const { pool, poolConnect } = require('../src/db');

async function checkUsers() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await poolConnect;
    
    // Ver todos los usuarios
    const users = await pool.request().query('SELECT id_usuario, nombre_completo, correo_electronico, fecha_registro FROM usuario');
    
    console.log('👥 Usuarios en la base de datos:');
    users.recordset.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id_usuario}`);
      console.log(`   Nombre: ${user.nombre_completo}`);
      console.log(`   Email: ${user.correo_electronico}`);
      console.log(`   Fecha: ${user.fecha_registro}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();
