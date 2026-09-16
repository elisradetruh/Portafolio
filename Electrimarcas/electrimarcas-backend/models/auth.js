// models/auth.js
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');

/**
 * Busca un usuario por email
 */
const findUserByEmail = async (email) => {
  try {
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM usuario WHERE correo_electronico = @email');
    
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error al buscar usuario por email:', error);
    throw error;
  }
};

/**
 * Verifica la contraseña del usuario
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario (para registro)
 */
const createUser = async (userData) => {
  try {
    const { id_usuario, id_municipio, nombre_completo, correo_electronico, contraseña_hash } = userData;
    
    const result = await pool.request()
      .input('id_usuario', sql.Char, id_usuario)
      .input('id_municipio', sql.Int, id_municipio)
      .input('nombre_completo', sql.VarChar, nombre_completo)
      .input('correo_electronico', sql.VarChar, correo_electronico)
      .input('contraseña_hash', sql.VarChar, contraseña_hash)
      .query(`
        INSERT INTO usuario (id_usuario, id_municipio, nombre_completo, correo_electronico, contraseña_hash)
        VALUES (@id_usuario, @id_municipio, @nombre_completo, @correo_electronico, @contraseña_hash)
      `);
    
    return result;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

/**
 * Genera un hash de contraseña
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  verifyPassword,
  createUser,
  hashPassword
};
 
