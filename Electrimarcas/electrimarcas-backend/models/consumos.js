const { pool } = require('../src/db');

/**
 * Obtiene los totales de ventas agrupados por mes.
 * @returns {Promise<Array>} Datos brutos de la DB.
 */
async function fetchConsumoData() {
    try {
        const query = "select TOP 5 nombre_electrodomestico,SUM(potencia)/ 1000.0 AS consumo_total_kwh FROM electrodomestico	Group By nombre_electrodomestico order by  consumo_total_kwh  ";
        const result = await pool.query(query);
        return result && result.recordset ? result.recordset : []; 
 
    } catch (error) {
        console.error("Error en la consulta de ventas:", error);
        throw error; // Lanza el error para que la ruta lo maneje
    }
}

/**
 * Obtiene la lista COMPLETA de electrodomésticos registrados (para la vista de tarjetas).
 * @returns {Promise<Array>} Array de todos los electrodomésticos con sus datos clave.
 */
async function fetchElectrodomesticosList() {
    // Consulta simple: Obtener todos los campos necesarios para la Card.
    const query = `
        SELECT 
            e.id_electrodomestico, 
            e.nombre_electrodomestico, 
            e.descripcion, 
            e.potencia,
            e.id_modelo,
            c.id_categoria,
            c.nombre_categoria
        FROM 
            electrodomestico e
        INNER JOIN 
            categoria c ON e.id_categoria = c.id_categoria
        ORDER BY 
            e.nombre_electrodomestico;
    `;
    try {
        const result = await pool.query(query);
        // Usamos result.recordset para SQL Server. Cambia a result.rows si usas PostgreSQL/MySQL.
        return result.recordset || result.rows || []; 
    } catch (error) {
        console.error("❌ Error en la consulta fetchElectrodomesticosList:", error);
        throw error;
    }
}

/**
 * Obtiene la lista de electrodomésticos filtrada por categoría.
 * @param {string} categoriaId - ID de la categoría a filtrar
 * @returns {Promise<Array>} Array de electrodomésticos de la categoría especificada.
 */
async function fetchElectrodomesticosByCategoria(categoriaId) {
    const query = `
        SELECT 
            e.id_electrodomestico, 
            e.nombre_electrodomestico, 
            e.descripcion, 
            e.potencia,
            e.id_modelo,
            c.id_categoria,
            c.nombre_categoria
        FROM 
            electrodomestico e
        INNER JOIN 
            categoria c ON e.id_categoria = c.id_categoria
        WHERE 
            c.id_categoria = @categoriaId
        ORDER BY 
            e.nombre_electrodomestico;
    `;
    try {
        const request = pool.request();
        request.input('categoriaId', categoriaId);
        const result = await request.query(query);
        return result.recordset || result.rows || []; 
    } catch (error) {
        console.error("❌ Error en la consulta fetchElectrodomesticosByCategoria:", error);
        throw error;
    }
}

module.exports = { fetchConsumoData, fetchElectrodomesticosList, fetchElectrodomesticosByCategoria };