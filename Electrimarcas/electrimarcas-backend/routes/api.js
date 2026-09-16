// backend/routes/api.js
const express = require('express');
const router = express.Router();
//acceso a la bd
const db = require('../models/consumos.js'); 

const { formatDataForChartJS, formatDataForCardList } = require('../utils/dataFormatter'); // Función de formato


// Importar módulos de autenticación
const authModel = require('../models/auth.js');
const { generateToken, authenticateToken } = require('../middleware/auth.js');

// La ruta que el frontend de Vue llamará: http://localhost:3000/api/data-grafica
router.get('/data-grafica', async (req, res) => {
  try {
    // 1. Obtención de datos brutos de la DB
    const datosRaw = await db.fetchConsumoData(); 
    // 2. Formateo de los datos para la librería de gráficas (Chart.js)
    const datosGrafico = formatDataForChartJS(datosRaw);
    // 3. Respuesta de éxito (Status 200 OK)
    res.status(200).json({
      success: true,
      data: datosGrafico // El objeto que Vue usará
    });

  } catch (error) {
    console.error('Error en la ruta /data-grafica:', error);
    // Respuesta de error (Status 500 Internal Server Error)
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar los datos del servidor.' 
    });
  }
});

// ENDPOINT para la Lista de Cards
router.get('/dispositivos-lista', async (req, res) => {
    try {
        // 1. Obtención de datos brutos de la DB
        const dispositivosRaw = await db.fetchElectrodomesticosList(); 

        // 2. Formateo de los datos para la Card
        const cardList = formatDataForCardList(dispositivosRaw);

        // 3. Respuesta de éxito (Status 200 OK)
        res.status(200).json({
            success: true,
            data: cardList // Array de Cards listos para Vue
        });

    } catch (error) {
        console.error('❌ Error en la ruta /dispositivos-lista:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener la lista de dispositivos.' 
        });
    }
});

// ENDPOINT para obtener dispositivos por categoría
router.get('/dispositivos-lista/:categoriaId', async (req, res) => {
    try {
        const { categoriaId } = req.params;
        
        // 1. Obtención de datos brutos de la DB filtrados por categoría
        const dispositivosRaw = await db.fetchElectrodomesticosByCategoria(categoriaId); 

        // 2. Formateo de los datos para la Card
        const cardList = formatDataForCardList(dispositivosRaw);

        // 3. Respuesta de éxito (Status 200 OK)
        res.status(200).json({
            success: true,
            data: cardList // Array de Cards listos para Vue
        });

    } catch (error) {
        console.error('❌ Error en la ruta /dispositivos-lista/:categoriaId:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener la lista de dispositivos por categoría.' 
        });
    }
});

// ===========================================
// RUTAS DE AUTENTICACIÓN
// ===========================================

/**
 * POST /api/login
 * Iniciar sesión de usuario
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const user = await authModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await authModel.verifyPassword(password, user.contraseña_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre_completo,
          email: user.correo_electronico
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, id_municipio } = req.body;

    // Validar datos de entrada
    if (!nombre || !email || !password || !id_municipio) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await authModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Generar ID único para el usuario
    const id_usuario = 'U' + Date.now().toString().slice(-5);

    // Hashear contraseña
    const contraseña_hash = await authModel.hashPassword(password);

    // Crear usuario
    await authModel.createUser({
      id_usuario,
      id_municipio: parseInt(id_municipio),
      nombre_completo: nombre,
      correo_electronico: email,
      contraseña_hash
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/verify-token
 * Verificar si el token es válido
 */
router.get('/verify-token', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
});

/**
 * POST /api/logout
 * Cerrar sesión (el frontend debe eliminar el token)
 */
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

/**
 * GET /api/municipios
 * Obtener lista de municipios de Sinaloa
 */
router.get('/municipios', async (req, res) => {
  try {
    const { pool } = require('../src/db');
    
    const result = await pool.request().query(`
      SELECT id_municipio, municipio 
      FROM tarifa_municipios 
      WHERE estado = 'Sinaloa'
      ORDER BY id_municipio
    `);
    
    res.status(200).json({
      success: true,
      data: result.recordset
    });
    
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de municipios'
    });
  }
});

// ===========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===========================================

// Proteger las rutas existentes con autenticación
router.get('/data-grafica', authenticateToken, async (req, res) => {
  try {
    // 1. Obtención de datos brutos de la DB
    const datosRaw = await db.fetchConsumoData(); 
    // 2. Formateo de los datos para la librería de gráficas (Chart.js)
    const datosGrafico = formatDataForChartJS(datosRaw);

    // 3. Respuesta de éxito (Status 200 OK)
    res.status(200).json({
      success: true,
      data: datosGrafico // El objeto que Vue usará
    });

  } catch (error) {
    console.error('Error en la ruta /data-grafica:', error);
    // Respuesta de error (Status 500 Internal Server Error)
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar los datos del servidor.' 
    });
  }
});

// ENDPOINT para la Lista de Cards (protegido)
router.get('/dispositivos-lista', authenticateToken, async (req, res) => {
    try {
        // 1. Obtención de datos brutos de la DB
        const dispositivosRaw = await db.fetchElectrodomesticosList(); 

        // 2. Formateo de los datos para la Card
        const cardList = formatDataForCardList(dispositivosRaw);

        // 3. Respuesta de éxito (Status 200 OK)
        res.status(200).json({
            success: true,
            data: cardList // Array de Cards listos para Vue
        });

    } catch (error) {
        console.error('❌ Error en la ruta /dispositivos-lista:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener la lista de dispositivos.' 
        });
    }
});

// ENDPOINT para obtener dispositivos por categoría (protegido)
router.get('/dispositivos-lista/:categoriaId', authenticateToken, async (req, res) => {
    try {
        const { categoriaId } = req.params;
        
        // 1. Obtención de datos brutos de la DB filtrados por categoría
        const dispositivosRaw = await db.fetchElectrodomesticosByCategoria(categoriaId); 

        // 2. Formateo de los datos para la Card
        const cardList = formatDataForCardList(dispositivosRaw);

        // 3. Respuesta de éxito (Status 200 OK)
        res.status(200).json({
            success: true,
            data: cardList // Array de Cards listos para Vue
        });

    } catch (error) {
        console.error('❌ Error en la ruta /dispositivos-lista/:categoriaId:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener la lista de dispositivos por categoría.' 
        });
    }
});

// ENDPOINT para agregar un nuevo electrodoméstico
router.post('/dispositivo/nuevo', async (req, res) => {
    try {
        const { nombre, marca, modelo, categoria, voltaje, potencia, descripcion } = req.body;

        console.log('📥 Datos recibidos:', { nombre, marca, modelo, categoria, voltaje, potencia, descripcion });

        // Validar campos requeridos
        if (!nombre || !marca || !modelo || !categoria || !voltaje || !potencia) {
            return res.status(400).json({
                success: false,
                message: 'Los campos nombre, marca, modelo, categoría, voltaje y potencia son obligatorios'
            });
        }
        
        // Usar año 2025 por defecto
        const anio_fabricacion = 2025;

        // Mapeo de categorías
        const categoriaMap = {
            'Limpieza': 'C01',
            'Cocina': 'C02',
            'Entretenimiento': 'C03',
            'Climatización': 'C04',
            'Cuidado Personal': 'C05'
        };

        const id_categoria = categoriaMap[categoria];
        
        if (!id_categoria) {
            return res.status(400).json({
                success: false,
                message: 'Categoría no válida. Debe ser: Cocina, Limpieza, Entretenimiento, Climatización o Cuidado Personal'
            });
        }

        // Obtener pool de conexión
        const { pool } = require('../src/db');
        const sql = require('mssql');

        // Primero, necesitamos obtener o crear la marca
        console.log('🔍 Buscando o creando marca:', marca);
        
        let id_marca;
        const checkMarca = await pool.request()
            .input('nombre_marca', sql.VarChar(30), marca.trim())
            .query(`
                SELECT id_marca FROM marca 
                WHERE LOWER(LTRIM(RTRIM(nombre_marca))) = LOWER(LTRIM(RTRIM(@nombre_marca)))
            `);

        if (checkMarca.recordset.length > 0) {
            id_marca = checkMarca.recordset[0].id_marca;
            console.log('✅ Marca encontrada:', id_marca);
        } else {
            // Crear nueva marca
            id_marca = 'M' + Date.now().toString().slice(-5);
            await pool.request()
                .input('id_marca', sql.Char(6), id_marca)
                .input('nombre_marca', sql.VarChar(30), marca.trim())
                .query(`INSERT INTO marca (id_marca, nombre_marca) VALUES (@id_marca, @nombre_marca)`);
            console.log('✅ Nueva marca creada:', id_marca);
        }

        // Luego, necesitamos obtener o crear el modelo
        console.log('🔍 Buscando o creando modelo:', modelo);
        
        let id_modelo;
        const checkModelo = await pool.request()
            .input('id_marca', sql.Char(6), id_marca)
            .input('nombre_modelo', sql.VarChar(30), modelo.trim())
            .query(`
                SELECT id_modelo FROM modelo 
                WHERE id_marca = @id_marca 
                  AND LOWER(LTRIM(RTRIM(nombre_modelo))) = LOWER(LTRIM(RTRIM(@nombre_modelo)))
            `);

        if (checkModelo.recordset.length > 0) {
            id_modelo = checkModelo.recordset[0].id_modelo;
            console.log('✅ Modelo encontrado:', id_modelo);
        } else {
            // Crear nuevo modelo
            id_modelo = 'MD' + Date.now().toString().slice(-4);
            await pool.request()
                .input('id_modelo', sql.Char(6), id_modelo)
                .input('id_marca', sql.Char(6), id_marca)
                .input('nombre_modelo', sql.VarChar(40), modelo.trim())
                .input('año_fabricacion', sql.Int, parseInt(anio_fabricacion))
                .query(`INSERT INTO modelo (id_modelo, id_marca, nombre_modelo, año_fabricacion) VALUES (@id_modelo, @id_marca, @nombre_modelo, @año_fabricacion)`);
            console.log('✅ Nuevo modelo creado:', id_modelo);
        }

        // ⚠️ VALIDAR SI YA EXISTE el mismo electrodoméstico (nombre + modelo)
        console.log('🔍 Verificando si ya existe el electrodoméstico...');
        
        const checkExisting = await pool.request()
            .input('id_modelo', sql.Char(6), id_modelo)
            .input('nombre', sql.VarChar(60), nombre.trim())
            .query(`
                SELECT e.id_electrodomestico, e.nombre_electrodomestico, m.nombre_modelo, ma.nombre_marca
                FROM electrodomestico e
                INNER JOIN modelo m ON e.id_modelo = m.id_modelo
                INNER JOIN marca ma ON m.id_marca = ma.id_marca
                WHERE e.id_modelo = @id_modelo
                  AND LOWER(LTRIM(RTRIM(e.nombre_electrodomestico))) = LOWER(LTRIM(RTRIM(@nombre)))
            `);

        // Si ya existe, retornar error informativo
        if (checkExisting.recordset.length > 0) {
            const existente = checkExisting.recordset[0];
            console.log('⚠️ Dispositivo duplicado encontrado:', existente);
            
            return res.status(409).json({
                success: false,
                message: `Este dispositivo ya existe en la base de datos`,
                detalles: `${existente.nombre_marca} ${existente.nombre_modelo} - ${existente.nombre_electrodomestico}`,
                sugerencia: 'Verifica los datos o busca el dispositivo en la lista existente',
                dispositivoExistente: {
                    id: existente.id_electrodomestico,
                    nombre: existente.nombre_electrodomestico,
                    marca: existente.nombre_marca,
                    modelo: existente.nombre_modelo
                }
            });
        }

        console.log('✅ No se encontraron duplicados, procediendo con la inserción...');

        // Generar ID único para el electrodoméstico (máximo 6 caracteres)
        const id_electrodomestico = 'E' + Date.now().toString().slice(-5);

        console.log('🆔 ID generado:', id_electrodomestico);
        console.log('📂 Categoría mapeada:', id_categoria);
        console.log('🏷️ ID Marca:', id_marca);
        console.log('📦 ID Modelo:', id_modelo);

        // Insertar en la base de datos
        await pool.request()
            .input('id_electrodomestico', sql.Char(6), id_electrodomestico)
            .input('id_categoria', sql.Char(6), id_categoria)
            .input('id_modelo', sql.Char(6), id_modelo)
            .input('voltaje', sql.Int, parseInt(voltaje))
            .input('potencia', sql.Int, parseInt(potencia))
            .input('nombre_electrodomestico', sql.VarChar(60), nombre.trim())
            .input('descripcion', sql.VarChar(150), descripcion ? descripcion.trim() : '')
            .query(`
                INSERT INTO electrodomestico 
                (id_electrodomestico, id_categoria, id_modelo, voltaje, potencia, nombre_electrodomestico, descripcion)
                VALUES 
                (@id_electrodomestico, @id_categoria, @id_modelo, @voltaje, @potencia, @nombre_electrodomestico, @descripcion)
            `);

        console.log('✅ Dispositivo insertado exitosamente');

        res.status(201).json({
            success: true,
            message: 'Dispositivo agregado exitosamente',
            data: {
                id_electrodomestico,
                nombre,
                marca,
                modelo,
                categoria,
                voltaje,
                potencia
            }
        });

    } catch (error) {
        console.error('❌ Error al insertar dispositivo:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al agregar el dispositivo a la base de datos',
            error: error.message
        });
    }
});

module.exports = router;