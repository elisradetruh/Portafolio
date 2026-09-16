// middleware/auth.js
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2024';

/**
 * Middleware para verificar el token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Genera un token JWT para el usuario
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id_usuario, 
      email: user.correo_electronico,
      nombre: user.nombre_completo 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
