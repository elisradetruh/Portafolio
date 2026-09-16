/**
 * ============================================================================
 * SERVICIO DE DATOS - dataService.js
 * ============================================================================
 * 
 * DESCRIPCIÓN:
 * Este archivo centraliza todas las operaciones relacionadas con datos en la aplicación.
 * Maneja comunicación con el backend, cálculos de consumo eléctrico y gestión de localStorage.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * 1. Comunicación con API del backend (axios)
 * 2. Cálculo de consumo eléctrico y costos con tarifa 1F
 * 3. Gestión de dispositivos del usuario
 * 4. Autenticación automática mediante interceptores
 * 
 * AUTOR: Equipo ElectriMarcas
 * FECHA: Noviembre 2025
 */

import axios from 'axios';
import authService from './authService.js';

// ============================================================================
// CONFIGURACIÓN DE LA API
// ============================================================================

/**
 * URL base de la API del backend
 * @constant {string}
 */
const API_URL = 'http://localhost:3001/api';

// ============================================================================
// INTERCEPTORES DE AXIOS
// ============================================================================

/**
 * INTERCEPTOR DE PETICIONES (Request)
 * 
 * PROPÓSITO:
 * Agrega automáticamente el token de autenticación a todas las peticiones HTTP
 * que se envían al backend.
 * 
 * FLUJO:
 * 1. Se ejecuta antes de cada petición HTTP
 * 2. Obtiene el token del usuario autenticado
 * 3. Agrega el token al header 'Authorization'
 * 4. La petición continúa con el token incluido
 */
axios.interceptors.request.use(
  (config) => {
    const token = authService.getAuthHeader();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTAS (Response)
 * 
 * PROPÓSITO:
 * Maneja automáticamente errores de autenticación (401 - No autorizado)
 * 
 * FLUJO:
 * 1. Se ejecuta después de cada respuesta HTTP
 * 2. Si la respuesta es 401 (token expirado/inválido):
 *    - Cierra la sesión del usuario
 *    - Redirige a la página de inicio de sesión
 * 3. Para otros errores, los propaga normalmente
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, cerrar sesión
      authService.logout();
      window.location.href = '/inicio-sesion';
    }
    return Promise.reject(error);
  }
); 

// ============================================================================
// FUNCIONES DE COMUNICACIÓN CON EL BACKEND
// ============================================================================

/**
 * OBTENER DATOS DE LA GRÁFICA
 * 
 * @description
 * Obtiene datos procesados desde el backend para renderizar gráficas de consumo.
 * 
 * @returns {Promise<Object>} Objeto con datos en formato Chart.js:
 *   - labels: Array de etiquetas (nombres de dispositivos)
 *   - datasets: Array de conjuntos de datos con valores
 * 
 * @throws {Error} Si falla la conexión o el procesamiento de datos
 * 
 * @example
 * const data = await getChartData();
 * // { labels: ['Refrigerador', 'TV'], datasets: [...] }
 */
export async function getChartData() {
  try {
    // Hace petición GET al endpoint /api/data-grafica
    const response = await axios.get(`${API_URL}/data-grafica`);
    // Axios parsea el JSON automáticamente
    return response.data.data; 
  } catch (error) {
    // Maneja el error a nivel de servicio y lo lanza para que el componente decida cómo mostrarlo
    console.error("Error al obtener datos de la API:", error);
    throw new Error("No se pudo conectar o procesar los datos del servidor.");
  }
}

/**
 * OBTENER LISTA COMPLETA DE DISPOSITIVOS
 * 
 * @description
 * Obtiene todos los electrodomésticos disponibles en la base de datos,
 * independientemente de su categoría.
 * 
 * @returns {Promise<Array>} Array de objetos Card con información de dispositivos:
 *   - id: Identificador único
 *   - title: Nombre del dispositivo
 *   - description: Descripción y potencia
 *   - category: Categoría a la que pertenece
 * 
 * @throws {Error} Si no se puede cargar la lista desde el servidor
 * 
 * @example
 * const dispositivos = await getDispositivosList();
 * // [{ id: 1, title: 'Refrigerador Samsung', ... }, ...]
 */
export async function getDispositivosList() {
    try {
        const response = await axios.get(`${API_URL}/dispositivos-lista`);
        // Devolvemos el array de objetos Card listos para ser usados
        return response.data.data; 
    } catch (error) {
        console.error("Error al obtener la lista de dispositivos:", error);
        throw new Error("No se pudo cargar la lista de dispositivos desde el servidor.");
    }
}

/**
 * OBTENER DISPOSITIVOS POR CATEGORÍA
 * 
 * @description
 * Obtiene solo los electrodomésticos que pertenecen a una categoría específica
 * (Ej: Cocina, Entretenimiento, Climatización).
 * 
 * @param {number} categoriaId - ID de la categoría a filtrar
 * 
 * @returns {Promise<Array>} Array de dispositivos de esa categoría
 * 
 * @throws {Error} Si no se pueden cargar los dispositivos de la categoría
 * 
 * @example
 * const cocina = await getDispositivosByCategoria(1);
 * // Solo dispositivos de cocina: refrigeradores, hornos, etc.
 */
export async function getDispositivosByCategoria(categoriaId) {
    try {
        const response = await axios.get(`${API_URL}/dispositivos-lista/${categoriaId}`);
        return response.data.data; 
    } catch (error) {
        console.error("Error al obtener la lista de dispositivos por categoría:", error);
        throw new Error("No se pudo cargar la lista de dispositivos de la categoría desde el servidor.");
    }
}

// ============================================================================
// FUNCIONES DE CÁLCULO DE CONSUMO
// ============================================================================

/**
 * OBTENER RESUMEN DE CONSUMO TOTAL
 * 
 * @description
 * Calcula el consumo energético total de todos los dispositivos del usuario
 * almacenados en localStorage. Suma consumos diarios, semanales, mensuales y anuales.
 * 
 * @returns {Object} Objeto con consumos totales en kWh:
 *   - diarioKWh: Consumo diario total
 *   - semanalKWh: Consumo semanal total
 *   - mensualKWh: Consumo mensual total
 *   - anualKWh: Consumo anual total
 * 
 * @example
 * const resumen = getConsumoResumen();
 * console.log(`Consumo mensual: ${resumen.mensualKWh} kWh`);
 * // Consumo mensual: 450.5 kWh
 * 
 * FÓRMULA DE CÁLCULO:
 * Consumo diario (kWh) = (Potencia en watts × Horas de uso × Cantidad) / 1000
 * Consumo semanal = Consumo diario × Días de uso por semana
 * Consumo mensual = Consumo diario × 30 días
 * Consumo anual = Consumo diario × 365 días
 */
export function getConsumoResumen() {
  try {
    // Intentar leer dispositivos guardados en localStorage
    const saved = localStorage.getItem('categoriasCards');
    
    // Si no hay datos guardados, retornar consumos en cero
    if (!saved) return { diarioKWh: 0, semanalKWh: 0, mensualKWh: 0, anualKWh: 0 };
    
    // Parsear JSON de localStorage (es un mapa: { categoriaId: [dispositivos] })
    const map = JSON.parse(saved);
    
    // Inicializar objeto de resumen con valores en cero
    const resumen = { diarioKWh: 0, semanalKWh: 0, mensualKWh: 0, anualKWh: 0 };
    
    // Iterar sobre todas las categorías y sus dispositivos
    Object.values(map || {}).forEach(arr => {
      (arr || []).forEach(d => {
        // Obtener datos del dispositivo (con valores por defecto si faltan)
        const cantidad = d.cantidad ?? 1; // Número de dispositivos iguales
        const horas = d.horasUsoPorDia ?? 0; // Horas de uso diario
        const diasSemana = d.diasUsoPorSemana ?? 7; // Días que se usa por semana
        const potencia = d.potencia ?? 0; // Potencia en watts
        
        // Calcular consumo diario en kWh
        const diario = (potencia * horas * cantidad) / 1000;
        
        // Sumar a los totales
        resumen.diarioKWh += diario;
        resumen.semanalKWh += diario * diasSemana;
        resumen.mensualKWh += diario * 30;
        resumen.anualKWh += diario * 365;
      });
    });
    
    return resumen;
  } catch {
    // Si hay error parseando, retornar consumos en cero
    return { diarioKWh: 0, semanalKWh: 0, mensualKWh: 0, anualKWh: 0 };
  }
}

/**
 * EXTRAER POTENCIA DE LA DESCRIPCIÓN
 * 
 * @description
 * Función auxiliar que busca y extrae el valor de potencia (watts) desde
 * la descripción de texto de un dispositivo usando expresiones regulares.
 * 
 * @param {string} description - Texto descriptivo del dispositivo
 * 
 * @returns {number|null} Valor de potencia en watts o null si no se encuentra
 * 
 * @example
 * extraerPotencia("Refrigerador 200W");  // 200
 * extraerPotencia("Potencia: 1500");     // 1500
 * extraerPotencia("Sin potencia");       // null
 * 
 * PATRONES QUE RECONOCE:
 * - "200W" o "200 W"
 * - "Potencia: 1500"
 */
function extraerPotencia(description) {
  if (!description || typeof description !== 'string') return null;
  
  // Buscar patrón "XXX W" o "Potencia: XXX" (case insensitive)
  const match = description.match(/(\d+)\s*W/i) || description.match(/Potencia:\s*(\d+)/i);
  
  // Si encuentra coincidencia, retornar el número; si no, null
  return match ? parseInt(match[1]) : null;
}

/**
 * OBTENER TOP 5 DISPOSITIVOS CON MAYOR CONSUMO
 * 
 * @description
 * Analiza todos los dispositivos del usuario y retorna los 5 que más energía
 * consumen, ordenados de mayor a menor consumo. Útil para mostrar en gráficas
 * y dar recomendaciones de ahorro.
 * 
 * @returns {Array} Array de máximo 5 objetos con información de consumo:
 *   - nombre: Nombre del dispositivo
 *   - potencia: Potencia en watts
 *   - horasUsoPorDia: Horas de uso diario configuradas
 *   - diasUsoPorSemana: Días de uso semanal
 *   - cantidad: Número de dispositivos iguales
 *   - consumoDiario: kWh consumidos por día
 *   - consumoSemanal: kWh consumidos por semana
 *   - consumoMensual: kWh consumidos por mes
 * 
 * @example
 * const top5 = getTop5DispositivosConsumo();
 * // [
 * //   { nombre: 'Refrigerador', consumoDiario: 2.4, ... },
 * //   { nombre: 'Aire Acondicionado', consumoDiario: 1.8, ... },
 * //   ...
 * // ]
 * 
 * FUENTES DE DATOS:
 * 1. localStorage - Datos persistentes del usuario
 * 2. sessionStorage - Datos temporales de la sesión actual
 */
export function getTop5DispositivosConsumo() {
  try {
    // Intentar obtener dispositivos desde localStorage
    const saved = localStorage.getItem('categoriasCards');
    
    if (!saved) {
      // Si no hay en localStorage, intentar desde sessionStorage
      const sessionData = sessionStorage.getItem('selectedDevices');
      if (sessionData) {
        const { cards } = JSON.parse(sessionData);
        return procesarDispositivosParaTop5(cards);
      }
      return []; // No hay datos en ningún lado
    }
    
    const map = JSON.parse(saved);
    const allDevices = [];
    
    // Recolectar todos los dispositivos de todas las categorías en un solo array
    Object.values(map || {}).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(d => {
          // Solo agregar dispositivos válidos (con título)
          if (d && d.title) {
            allDevices.push(d);
          }
        });
      }
    });
    
    // Procesar y retornar top 5
    return procesarDispositivosParaTop5(allDevices);
    
  } catch (error) {
    console.error('Error al obtener top 5 dispositivos:', error);
    return [];
  }
}

/**
 * PROCESAR DISPOSITIVOS PARA TOP 5
 * 
 * @description
 * Función auxiliar que toma un array de dispositivos, calcula su consumo,
 * los ordena y retorna los 5 con mayor consumo.
 * 
 * @param {Array} devices - Array de objetos dispositivo
 * 
 * @returns {Array} Array de máximo 5 dispositivos procesados y ordenados
 * 
 * @private
 * 
 * PROCESO:
 * 1. Calcular consumo de cada dispositivo
 * 2. Filtrar dispositivos con consumo > 0
 * 3. Ordenar por consumo diario (mayor a menor)
 * 4. Tomar solo los primeros 5
 */
function procesarDispositivosParaTop5(devices) {
  // Validar que recibimos un array con elementos
  if (!Array.isArray(devices) || devices.length === 0) return [];
  
  const dispositivosConConsumo = devices
    .map(device => {
      // Extraer datos del dispositivo (con valores por defecto)
      const cantidad = device.cantidad ?? 1;
      const horas = device.horasUsoPorDia ?? 1;
      const diasSemana = device.diasUsoPorSemana ?? 7;
      
      // Intentar obtener potencia: primero del objeto, luego de la descripción
      const potencia = device.potencia ?? extraerPotencia(device.description) ?? 0;
      
      // Calcular consumos en kWh (dividir entre 1000 para convertir W a kW)
      const consumoDiario = (potencia * horas * cantidad) / 1000;
      const consumoSemanal = consumoDiario * 7;
      const consumoMensual = consumoDiario * 30;
      
      // Retornar objeto con todos los datos calculados
      return {
        nombre: device.title,
        potencia,
        horasUsoPorDia: horas,
        diasUsoPorSemana: diasSemana,
        cantidad,
        consumoDiario: parseFloat(consumoDiario.toFixed(2)),    // Redondear a 2 decimales
        consumoSemanal: parseFloat(consumoSemanal.toFixed(2)),
        consumoMensual: parseFloat(consumoMensual.toFixed(2))
      };
    })
    .filter(d => d.consumoDiario > 0)              // Solo dispositivos con consumo
    .sort((a, b) => b.consumoDiario - a.consumoDiario)  // Ordenar descendente
    .slice(0, 5);                                   // Tomar solo top 5
  
  return dispositivosConConsumo;
}

// ============================================================================
// FUNCIONES DE CÁLCULO DE COSTOS (TARIFA CFE)
// ============================================================================

/**
 * CALCULAR COSTO CON TARIFA 1F
 * 
 * @description
 * Calcula el costo en pesos mexicanos del consumo eléctrico usando la tarifa 1F
 * de CFE aplicable en Sinaloa. Esta tarifa tiene 3 rangos progresivos:
 * más consumes, más caro es el kWh.
 * 
 * @param {number} consumoMensualKWh - Consumo total del mes en kWh
 * 
 * @returns {Object} Objeto con desglose completo:
 *   - consumoTotal: kWh totales del mes
 *   - costoTotal: Costo total en pesos mexicanos
 *   - desglose: {
 *       basico: kWh en rango básico (0-150)
 *       intermedio: kWh en rango intermedio (151-300)
 *       excedente: kWh en rango excedente (+300)
 *     }
 * 
 * @example
 * const costo = calcularCostoTarifa1F(350);
 * // {
 * //   consumoTotal: 350,
 * //   costoTotal: 339.1,  // pesos
 * //   desglose: { basico: 150, intermedio: 150, excedente: 50 }
 * // }
 * 
 * TARIFAS 1F (VERIFICAR CON CFE):
 * - Básico (0-150 kWh):      $0.872 por kWh
 * - Intermedio (151-300 kWh): $1.062 por kWh
 * - Excedente (+ 300 kWh):    $3.046 por kWh
 * 
 * NOTA: Estas tarifas pueden cambiar. Verificar en: www.cfe.mx
 */
export function calcularCostoTarifa1F(consumoMensualKWh) {
  // Definir estructura de tarifas 1F de CFE
  const tarifas = {
    basico: { limite: 150, precio: 0.872 },      // Primer rango: más barato
    intermedio: { limite: 300, precio: 1.062 },  // Segundo rango: precio medio
    excedente: { precio: 3.046 }                 // Tercer rango: más caro
  };

  let costoTotal = 0;
  let consumoRestante = consumoMensualKWh;

  // PASO 1: Calcular costo del rango básico (0-150 kWh)
  if (consumoRestante > 0) {
    // Tomar solo hasta 150 kWh o lo que quede si es menos
    const consumoBasico = Math.min(consumoRestante, tarifas.basico.limite);
    costoTotal += consumoBasico * tarifas.basico.precio;
    consumoRestante -= consumoBasico;
  }

  // PASO 2: Calcular costo del rango intermedio (151-300 kWh)
  if (consumoRestante > 0) {
    // El rango intermedio tiene 150 kWh (de 151 a 300)
    const rangoIntermedio = tarifas.intermedio.limite - tarifas.basico.limite;
    // Tomar solo hasta el límite o lo que quede
    const consumoIntermedio = Math.min(consumoRestante, rangoIntermedio);
    costoTotal += consumoIntermedio * tarifas.intermedio.precio;
    consumoRestante -= consumoIntermedio;
  }

  // PASO 3: Calcular costo del rango excedente (+ 300 kWh)
  if (consumoRestante > 0) {
    // Todo lo que quede se cobra a tarifa excedente
    costoTotal += consumoRestante * tarifas.excedente.precio;
  }

  // Retornar objeto con desglose completo
  return {
    consumoTotal: consumoMensualKWh,
    costoTotal: costoTotal,
    desglose: {
      // Calcular cuántos kWh cayeron en cada rango
      basico: Math.min(consumoMensualKWh, tarifas.basico.limite),
      intermedio: Math.min(
        Math.max(0, consumoMensualKWh - tarifas.basico.limite), 
        tarifas.intermedio.limite - tarifas.basico.limite
      ),
      excedente: Math.max(0, consumoMensualKWh - tarifas.intermedio.limite)
    }
  };
}

/**
 * OBTENER CONSUMO TOTAL MENSUAL
 * 
 * @description
 * Función de conveniencia que obtiene el top 5 de dispositivos y suma
 * su consumo mensual total. Útil para calcular el costo total de la factura.
 * 
 * @returns {number} Consumo total mensual en kWh de todos los dispositivos
 * 
 * @example
 * const total = getConsumoTotalMensual();
 * console.log(`Tu consumo mensual es: ${total} kWh`);
 * // Tu consumo mensual es: 450.5 kWh
 */
export function getConsumoTotalMensual() {
  // Obtener dispositivos con mayor consumo
  const dispositivos = getTop5DispositivosConsumo();
  
  // Si no hay dispositivos, retornar 0
  if (!dispositivos || dispositivos.length === 0) {
    return 0;
  }
  
  // Sumar el consumo mensual de todos los dispositivos usando reduce
  const consumoTotal = dispositivos.reduce((total, dispositivo) => {
    return total + dispositivo.consumoMensual;
  }, 0);
  
  return consumoTotal;
}

/**
 * Agregar nuevo electrodoméstico a la base de datos
 * 
 * @param {Object} dispositivoData - Datos completos del dispositivo
 * @param {string} dispositivoData.nombre - Nombre del electrodoméstico
 * @param {string} dispositivoData.marca - Marca del electrodoméstico
 * @param {string} dispositivoData.modelo - Modelo del electrodoméstico
 * @param {string} dispositivoData.categoria - Categoría (Cocina, Limpieza, etc.)
 * @param {number} dispositivoData.voltaje - Voltaje en V
 * @param {number} dispositivoData.potencia - Potencia en W
 * @param {string} dispositivoData.descripcion - Descripción opcional
 * @returns {Promise<Object>} Respuesta del servidor con el dispositivo creado
 */
export async function agregarNuevoDispositivo(dispositivoData) {
  try {
    console.log('📤 Enviando dispositivo al servidor:', dispositivoData);
    
    const response = await axios.post(`${API_URL}/dispositivo/nuevo`, {
      nombre: dispositivoData.nombre,
      marca: dispositivoData.marca,
      modelo: dispositivoData.modelo,
      categoria: dispositivoData.categoria,
      voltaje: parseInt(dispositivoData.voltaje),
      potencia: parseInt(dispositivoData.potencia),
      descripcion: dispositivoData.descripcion || ''
    });
    
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error al agregar dispositivo:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
}

// ============================================================================
// FIN DEL ARCHIVO dataService.js
// ============================================================================