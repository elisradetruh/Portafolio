<template>
    <!-- 
      =========================================================================
      SECCIÓN PRINCIPAL: ESTADÍSTICAS DE CONSUMO
      =========================================================================
      Esta vista muestra dos apartados principales:
      1. Gráfica de barras con los 5 dispositivos de mayor consumo
      2. Desglose de costos mensuales según tarifa 1F de CFE
    -->
    <section class="estadisticas">
        <!-- ENCABEZADO -->
        <h1>Estadísticas de Consumo Energético</h1>
        <p class="descripcion">Visualiza el consumo de tus 5 dispositivos que más energía consumen</p>
        
        <!-- 
          ========================================================================
          APARTADO 1: DESGLOSE DE COSTOS MENSUALES
          ========================================================================
          Solo se muestra si:
          - Hay datos de costo calculados (costoMensual existe)
          - No hay error de carga
          
          Muestra:
          1. Tarjetas con consumo y costo total
          2. Desglose por rangos de tarifa (básico, intermedio, excedente)
          3. Consejo personalizado según nivel de consumo
        -->
        <article v-if="costoMensual && !error" class="costo-mensual-container">
            <!-- ENCABEZADO DEL APARTADO DE COSTOS -->
            <div class="costo-header">
                <h2>💰 Estimación de Costo Mensual</h2>
                <p class="tarifa-info">Basado en Tarifa 1F de Sinaloa (CFE)</p>
            </div>

            <!-- 
              ====================================================================
              TARJETAS RESUMEN: CONSUMO Y COSTO
              ====================================================================
              Grid responsivo con 2 tarjetas:
              1. Consumo total mensual en kWh
              2. Costo estimado en pesos mexicanos
            -->
            <div class="costo-grid">
                <!-- TARJETA 1: CONSUMO TOTAL -->
                <div class="costo-card consumo-card">
                    <div class="card-icon">⚡</div>
                    <div class="card-content">
                        <p class="card-label">Consumo Total Mensual</p>
                        <!-- 
                          Muestra el consumo con 2 decimales
                          Ej: 450.50 kWh
                        -->
                        <p class="card-value">
                            {{ costoMensual.consumoTotal.toFixed(2) }} 
                            <span class="unit">kWh</span>
                        </p>
                    </div>
                </div>

                <!-- TARJETA 2: COSTO TOTAL -->
                <div class="costo-card costo-total-card">
                    <div class="card-icon">💵</div>
                    <div class="card-content">
                        <p class="card-label">Costo Estimado Mensual</p>
                        <!-- 
                          Muestra el costo en pesos mexicanos con 2 decimales
                          Ej: $1,234.56 MXN
                        -->
                        <p class="card-value costo-destacado">
                            ${{ costoMensual.costoTotal.toFixed(2) }} 
                            <span class="unit">MXN</span>
                        </p>
                    </div>
                </div>
            </div>

            <!-- 
              ====================================================================
              DESGLOSE POR RANGOS DE TARIFA
              ====================================================================
              Muestra cómo se distribuye el consumo en los 3 rangos de tarifa:
              - Básico: 0-150 kWh a $0.872/kWh
              - Intermedio: 151-300 kWh a $1.062/kWh
              - Excedente: +300 kWh a $3.046/kWh
              
              Cada rango muestra:
              - Nombre y tarifa aplicable
              - Consumo en ese rango (kWh)
              - Costo de ese rango (pesos)
              - Barra de progreso visual
            -->
            <div class="desglose-container">
                <h3>📊 Desglose por Rangos de Consumo</h3>
                <div class="desglose-grid">
                    <!-- RANGO BÁSICO (0-150 kWh) -->
                    <div class="desglose-item basico">
                        <div class="desglose-header">
                            <span class="desglose-titulo">Básico (0-150 kWh)</span>
                            <span class="desglose-tarifa">$0.872/kWh</span>
                        </div>
                        <div class="desglose-info">
                            <!-- Consumo en este rango -->
                            <span class="desglose-consumo">
                                {{ costoMensual.desglose.basico.toFixed(2) }} kWh
                            </span>
                            <!-- Costo en este rango = consumo × tarifa -->
                            <span class="desglose-costo">
                                ${{ (costoMensual.desglose.basico * 0.872).toFixed(2) }}
                            </span>
                        </div>
                        <!-- 
                          Barra de progreso: muestra qué porcentaje del rango se consumió
                          Máximo: 150 kWh (100% del rango)
                        -->
                        <div class="progress-bar">
                            <div 
                                class="progress-fill basico-fill" 
                                :style="{ width: getProgressWidth(costoMensual.desglose.basico, 150) }"
                            ></div>
                        </div>
                    </div>

                    <!-- RANGO INTERMEDIO (151-300 kWh) -->
                    <div class="desglose-item intermedio">
                        <div class="desglose-header">
                            <span class="desglose-titulo">Intermedio (151-300 kWh)</span>
                            <span class="desglose-tarifa">$1.062/kWh</span>
                        </div>
                        <div class="desglose-info">
                            <span class="desglose-consumo">
                                {{ costoMensual.desglose.intermedio.toFixed(2) }} kWh
                            </span>
                            <span class="desglose-costo">
                                ${{ (costoMensual.desglose.intermedio * 1.062).toFixed(2) }}
                            </span>
                        </div>
                        <!-- Máximo: 150 kWh (tamaño del rango intermedio) -->
                        <div class="progress-bar">
                            <div 
                                class="progress-fill intermedio-fill" 
                                :style="{ width: getProgressWidth(costoMensual.desglose.intermedio, 150) }"
                            ></div>
                        </div>
                    </div>

                    <!-- RANGO EXCEDENTE (+300 kWh) -->
                    <div class="desglose-item excedente">
                        <div class="desglose-header">
                            <span class="desglose-titulo">Excedente (+300 kWh)</span>
                            <span class="desglose-tarifa">$3.046/kWh</span>
                        </div>
                        <div class="desglose-info">
                            <span class="desglose-consumo">
                                {{ costoMensual.desglose.excedente.toFixed(2) }} kWh
                            </span>
                            <span class="desglose-costo">
                                ${{ (costoMensual.desglose.excedente * 3.046).toFixed(2) }}
                            </span>
                        </div>
                        <!-- 
                          Para excedente no hay límite superior,
                          usa el valor mismo como máximo para que siempre sea 100%
                        -->
                        <div class="progress-bar">
                            <div 
                                class="progress-fill excedente-fill" 
                                :style="{ width: getProgressWidth(costoMensual.desglose.excedente, costoMensual.desglose.excedente) }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 
              ====================================================================
              CONSEJO PERSONALIZADO DE AHORRO
              ====================================================================
              Muestra un mensaje diferente según el nivel de consumo:
              - >300 kWh: Advertencia (tarifa más cara)
              - >150 kWh: Recomendación (tarifa media)
              - ≤150 kWh: Felicitación (tarifa más económica)
            -->
            <div class="ahorro-tip">
                <span class="tip-icon">💡</span>
                <!-- ADVERTENCIA: Consumo alto (rango excedente) -->
                <p v-if="costoMensual.consumoTotal > 300">
                    <strong>¡Advertencia!</strong> Tu consumo está en el rango excedente. 
                    Considera reducir el uso de tus dispositivos de mayor consumo para 
                    ahorrar en tu factura.
                </p>
                <!-- RECOMENDACIÓN: Consumo medio (rango intermedio) -->
                <p v-else-if="costoMensual.consumoTotal > 150">
                    Tu consumo está en rango intermedio. Intenta mantenerlo por debajo 
                    de 300 kWh para evitar tarifas más altas.
                </p>
                <!-- FELICITACIÓN: Consumo bajo (rango básico) -->
                <p v-else>
                    ¡Excelente! Tu consumo está en el rango básico con la tarifa más económica.
                </p>
            </div>
        </article>
        <!-- 
          ========================================================================
          APARTADO 2: GRÁFICA DE CONSUMO
          ========================================================================
          Muestra una gráfica de barras con 3 datasets:
          - Consumo diario (azul)
          - Consumo semanal (verde)
          - Consumo mensual (rojo)
        -->
        <article class="grafica-container">
            <!-- ESTADO: CARGANDO -->
            <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando estadísticas... ⏳</p>
            </div>
            
            <!-- ESTADO: ERROR -->
            <div v-else-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <p class="error-message">{{ error }}</p>
                <!-- Botón para ir a agregar dispositivos -->
                <router-link to="/Inicio" class="btn-add-devices">
                    ➕ Agregar dispositivos
                </router-link>
            </div>
            
            <!-- ESTADO: DATOS DISPONIBLES - Mostrar gráfica -->
            <div v-else-if="chartData" class="grafica-wrapper">
                <!-- 
                  Componente Chart.js para renderizar la gráfica
                  Props:
                  - chartData: Datos en formato Chart.js (labels + datasets)
                  - chartOptions: Configuración de la gráfica
                -->
                <bar-chart :chartData="chartData" :chartOptions="chartOptions" />
            </div>
            
            <!-- ESTADO: SIN DATOS -->
            <div v-else class="empty-state">
                <p>No se encontraron datos para mostrar.</p>
            </div>
        </article>
    </section>
    
</template>

<script setup>
/**
 * ============================================================================
 * COMPONENTE: Estadisticas.vue
 * ============================================================================
 * 
 * DESCRIPCIÓN:
 * Vista principal de estadísticas que muestra:
 * 1. Gráfica de barras de los 5 dispositivos con mayor consumo
 * 2. Cálculo de costos mensuales según tarifa 1F de CFE
 * 3. Desglose por rangos de consumo
 * 4. Consejos personalizados de ahorro
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API (script setup)
 * - Chart.js para gráficas
 * - Axios para comunicación con backend (indirecto vía dataService)
 * 
 * AUTOR: Equipo ElectriMarcas
 * FECHA: Noviembre 2025
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { ref, onMounted } from 'vue';
import { 
    getTop5DispositivosConsumo,  // Obtiene los 5 dispositivos con mayor consumo
    calcularCostoTarifa1F,       // Calcula el costo según tarifa CFE
    getConsumoTotalMensual        // Obtiene el consumo total mensual
} from '../services/dataService';
import BarChart from '../components/GraficaBarras.vue';  // Componente de gráfica

// ============================================================================
// VARIABLES REACTIVAS (STATE)
// ============================================================================

/**
 * chartData
 * @type {Ref<Object|null>}
 * @description Datos en formato Chart.js para renderizar la gráfica
 * Estructura:
 * {
 *   labels: ['Dispositivo 1', 'Dispositivo 2', ...],
 *   datasets: [
 *     { label: 'Consumo Diario', data: [...], backgroundColor: '...', ... },
 *     { label: 'Consumo Semanal', data: [...], backgroundColor: '...', ... },
 *     { label: 'Consumo Mensual', data: [...], backgroundColor: '...', ... }
 *   ]
 * }
 */
const chartData = ref(null);

/**
 * isLoading
 * @type {Ref<boolean>}
 * @description Indica si se están cargando los datos (muestra spinner)
 */
const isLoading = ref(true);

/**
 * error
 * @type {Ref<string|null>}
 * @description Mensaje de error si falla la carga (muestra mensaje de error)
 */
const error = ref(null);

/**
 * costoMensual
 * @type {Ref<Object|null>}
 * @description Objeto con el desglose de costos mensuales
 * Estructura:
 * {
 *   consumoTotal: 450.5,        // kWh totales del mes
 *   costoTotal: 1234.56,        // Pesos mexicanos
 *   desglose: {
 *     basico: 150,              // kWh en rango básico
 *     intermedio: 150,          // kWh en rango intermedio
 *     excedente: 150.5          // kWh en rango excedente
 *   }
 * }
 */
const costoMensual = ref(null);

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * fetchData
 * @async
 * @description
 * Función principal que se ejecuta al montar el componente.
 * Realiza las siguientes operaciones:
 * 
 * 1. Obtiene los 5 dispositivos con mayor consumo del usuario
 * 2. Prepara los datos para la gráfica de Chart.js
 * 3. Calcula el costo mensual según tarifa 1F
 * 4. Maneja estados de carga, error y datos vacíos
 * 
 * FLUJO:
 * 1. Activa estado de carga (spinner)
 * 2. Llama a getTop5DispositivosConsumo()
 * 3. Si hay datos:
 *    - Extrae nombres y consumos
 *    - Formatea para Chart.js
 *    - Calcula costos
 * 4. Si no hay datos:
 *    - Muestra mensaje de error
 * 5. Desactiva estado de carga
 * 
 * @throws {Error} Si falla alguna operación de cálculo
 */
const fetchData = async () => {
    // PASO 1: Iniciar estado de carga
    isLoading.value = true;
    error.value = null;
    
    try {
        // PASO 2: Obtener dispositivos con mayor consumo desde localStorage
        const dispositivos = getTop5DispositivosConsumo();
        
        // PASO 3: Validar que hay dispositivos
        if (!dispositivos || dispositivos.length === 0) {
            // No hay dispositivos configurados, mostrar error
            error.value = 'No hay dispositivos configurados. Agrega dispositivos en la página de Inicio para ver estadísticas.';
            chartData.value = null;
            costoMensual.value = null;
            return;
        }
        
        // PASO 4: Preparar datos para la gráfica
        
        // Extraer nombres de los dispositivos para las etiquetas del eje X
        const labels = dispositivos.map(d => d.nombre);
        
        // Extraer consumos diarios para el primer dataset
        const consumoDiario = dispositivos.map(d => d.consumoDiario);
        
        // Extraer consumos semanales para el segundo dataset
        const consumoSemanal = dispositivos.map(d => d.consumoSemanal);
        
        // Extraer consumos mensuales para el tercer dataset
        const consumoMensual = dispositivos.map(d => d.consumoMensual);
        
        // PASO 5: Formatear datos para Chart.js
        chartData.value = {
            labels: labels,  // Nombres en eje X
            datasets: [
                // Dataset 1: Consumo Diario (Azul)
                {
                    label: 'Consumo Diario (kWh)',
                    data: consumoDiario,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',    // Azul con transparencia
                    borderColor: 'rgba(59, 130, 246, 1)',           // Azul sólido para borde
                    borderWidth: 2
                },
                // Dataset 2: Consumo Semanal (Verde)
                {
                    label: 'Consumo Semanal (kWh)',
                    data: consumoSemanal,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',     // Verde con transparencia
                    borderColor: 'rgba(34, 197, 94, 1)',            // Verde sólido para borde
                    borderWidth: 2
                },
                // Dataset 3: Consumo Mensual (Rojo)
                {
                    label: 'Consumo Mensual (kWh)',
                    data: consumoMensual,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',     // Rojo con transparencia
                    borderColor: 'rgba(239, 68, 68, 1)',            // Rojo sólido para borde
                    borderWidth: 2
                }
            ]
        };

        // PASO 6: Calcular el costo mensual total
        const consumoTotal = getConsumoTotalMensual();  // Suma de todos los dispositivos
        costoMensual.value = calcularCostoTarifa1F(consumoTotal);  // Aplica tarifa 1F
        
    } catch (err) {
        // Manejar cualquier error durante el proceso
        error.value = err.message || 'Ocurrió un error al cargar la gráfica.';
        chartData.value = null;
        costoMensual.value = null;
    } finally {
        // Siempre desactivar estado de carga al finalizar
        isLoading.value = false;
    }
};

/**
 * getProgressWidth
 * @param {number} valor - Valor actual del consumo
 * @param {number} maximo - Valor máximo del rango
 * @returns {string} Ancho de la barra en porcentaje (Ej: "75%")
 * 
 * @description
 * Calcula el ancho de la barra de progreso como porcentaje.
 * Usado para visualizar qué porcentaje del rango de consumo se utilizó.
 * 
 * @example
 * getProgressWidth(75, 150)   // "50%" (75 es el 50% de 150)
 * getProgressWidth(200, 150)  // "100%" (no puede pasar del 100%)
 * getProgressWidth(0, 150)    // "0%" (nada consumido)
 */
const getProgressWidth = (valor, maximo) => {
    if (maximo === 0) return '0%';
    return `${Math.min((valor / maximo) * 100, 100)}%`;
};

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * onMounted
 * @description
 * Hook del ciclo de vida que se ejecuta cuando el componente es montado en el DOM.
 * Llama a fetchData() para cargar los datos iniciales.
 */
onMounted(fetchData);

// ============================================================================
// CONFIGURACIÓN DE LA GRÁFICA (CHART.JS OPTIONS)
// ============================================================================

/**
 * chartOptions
 * @type {Object}
 * @description
 * Objeto de configuración para Chart.js que define:
 * - Comportamiento responsive
 * - Configuración de plugins (leyenda, título, tooltips)
 * - Configuración de escalas (ejes X e Y)
 * - Estilos y colores
 * 
 * Para más opciones: https://www.chartjs.org/docs/latest/
 */
const chartOptions = {
  // Hacer que la gráfica se adapte al tamaño del contenedor
  responsive: true,
  // No mantener aspect ratio original (permitir ajuste de altura)
  maintainAspectRatio: false,
  
  // =========================================================================
  // CONFIGURACIÓN DE PLUGINS
  // =========================================================================
  plugins: {
    // Leyenda (muestra qué representa cada color)
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#000000',
        font: {
          size: 12
        },
        padding: 15
      }
    },
    // Título de la gráfica
    title: {
      display: true,
      text: 'Top 5 Dispositivos con Mayor Consumo Eléctrico',
      color: '#0f172a',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 20
      }
    },
    // Tooltips (cuadros que aparecen al pasar el mouse)
    tooltip: {
      callbacks: {
        // Personalizar el formato del texto en el tooltip
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          label += context.parsed.y.toFixed(2) + ' kWh';
          return label;
        }
      }
    }
  },
  
  // =========================================================================
  // CONFIGURACIÓN DE ESCALAS (EJES)
  // =========================================================================
  scales: {
    // EJE Y (vertical): Valores de consumo
    y: {
      beginAtZero: true,  // Empezar desde 0
      title: {
        display: true,
        text: 'Consumo Energético (kWh)',
        color: '#1e293b',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 25
        }
      },
      ticks: {
        color: '#1e293b',
        callback: function(value) {
          return value.toFixed(1) + ' kWh';
        }
      },
      grid: {
        color: 'rgba(0,0,0,0.1)'
      }
    },
    // EJE X (horizontal): Nombres de dispositivos
    x: {
      title: {
        display: true,
        text: 'Dispositivos',
        color: '#1e293b',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      ticks: {
        color: '#1e293b',
        maxRotation: 45,  // Rotar etiquetas 45° para mejor legibilidad
        minRotation: 45,
        font: {
          size: 13
        }
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    }
  }
};

</script>

<style scoped>
/* 
  =========================================================================
  ESTILOS DEL COMPONENTE ESTADISTICAS
  =========================================================================
  
  ESTRUCTURA CSS:
  1. Estilos generales del contenedor
  2. Estilos de la gráfica
  3. Estilos de estados (loading, error, empty)
  4. Estilos del apartado de costos
  5. Estilos del desglose por rangos
  6. Estilos del consejo de ahorro
  7. Media queries para responsive
  
  NOTA: 'scoped' significa que estos estilos solo aplican a este componente
*/

/* Contenedor principal de la vista */
article{
    margin-bottom: 30px;
}

.estadisticas {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.estadisticas h1 {
    color: #2c3e50;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    text-align: left;
}

.descripcion {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    text-align: left;
}

/* Contenedor de la gráfica */
.grafica-container {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    min-height: 550px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.grafica-wrapper {
    width: 100%;
    height: 550px;
}

/* =========================================================================
   ESTADOS DE CARGA Y ERROR
   ============================================================================ */

/* Estado: Cargando */
.loading-state {
    text-align: center;
    color: #666;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary, #4CAF50);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-state p {
    font-size: 1.1rem;
}

/* Estado: Error */
.error-state {
    text-align: center;
    padding: 3rem 2rem;
}

.error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.error-message {
    color: #ef4444;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.btn-add-devices {
    display: inline-block;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-add-devices:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

/* Estado: Sin datos */
.empty-state {
    text-align: center;
    color: #666;
    padding: 3rem;
    font-size: 1.1rem;
}

/* =========================================================================
   APARTADO DE COSTOS MENSUALES
   ============================================================================ */

.costo-mensual-container {
    margin-top: 2rem;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.costo-header {
    text-align: center;
    margin-bottom: 2rem;
}

.costo-header h2 {
    color: #2c3e50;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.tarifa-info {
    color: #666;
    font-size: 1rem;
}

/* Grid de tarjetas de resumen */
.costo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

/* Estilos base de tarjetas */
.costo-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.costo-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Tarjeta de consumo (morada) */
.consumo-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

/* Tarjeta de costo (rosa-roja) */
.costo-total-card {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.card-icon {
    font-size: 3rem;
}

.card-content {
    flex: 1;
}

.card-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
}

.card-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
}

.costo-destacado {
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.unit {
    font-size: 1.2rem;
    font-weight: normal;
    opacity: 0.8;
}

/* =========================================================================
   DESGLOSE POR RANGOS DE TARIFA
   ============================================================================ */

.desglose-container {
    margin: 2rem 0;
}

.desglose-container h3 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
}

.desglose-grid {
    display: grid;
    gap: 1rem;
}

/* Estilos base de items de desglose */
.desglose-item {
    background: #f8f9fa;
    border-radius: 0.75rem;
    padding: 1.25rem;
    border-left: 4px solid;
}

/* Colores de borde según el rango */
.desglose-item.basico {
    border-color: #22c55e;  /* Verde */
}

.desglose-item.intermedio {
    border-color: #f59e0b;  /* Amarillo */
}

.desglose-item.excedente {
    border-color: #ef4444;  /* Rojo */
}

.desglose-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.desglose-titulo {
    font-weight: 600;
    color: #2c3e50;
}

.desglose-tarifa {
    color: #666;
    font-size: 0.9rem;
    background: #e5e7eb;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
}

.desglose-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.desglose-consumo {
    color: #4b5563;
}

.desglose-costo {
    font-weight: bold;
    color: #1f2937;
}

/* Barras de progreso */
.progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    transition: width 0.5s ease;
}

/* Colores de barras según rango */
.basico-fill {
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.intermedio-fill {
    background: linear-gradient(90deg, #f59e0b, #d97706);
}

.excedente-fill {
    background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* =========================================================================
   CONSEJO DE AHORRO
   ============================================================================ */

.ahorro-tip {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-left: 4px solid #f59e0b;
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-top: 1.5rem;
}

.tip-icon {
    font-size: 2rem;
}

.ahorro-tip p {
    margin: 0;
    color: #78350f;
    line-height: 1.6;
}

.ahorro-tip strong {
    color: #92400e;
}

/* =========================================================================
   RESPONSIVE DESIGN
   ============================================================================ */

/* Tablets y pantallas medianas */
@media (max-width: 768px) {
    .estadisticas {
        padding: 1rem;
    }
    
    .estadisticas h1 {
        font-size: 1.5rem;
    }
    
    .descripcion {
        font-size: 1rem;
    }
    
    .grafica-container {
        padding: 1.5rem;
        min-height: 450px;
    }
    
    .grafica-wrapper {
        height: 450px;
    }
    
    .error-icon {
        font-size: 3rem;
    }
    
    .error-message {
        font-size: 1rem;
    }
    
    .btn-add-devices {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
    }

    .costo-mensual-container {
        padding: 1.5rem;
    }

    .costo-grid {
        grid-template-columns: 1fr;
    }

    .card-value {
        font-size: 1.5rem;
    }

    .desglose-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* Móviles pequeños */
@media (max-width: 480px) {
    .grafica-container {
        padding: 1rem;
        min-height: 400px;
    }
    
    .grafica-wrapper {
        height: 400px;
    }
}
</style>

<!-- 
  =========================================================================
  FIN DEL COMPONENTE Estadisticas.vue
  =========================================================================
  
  RESUMEN DE FUNCIONALIDADES:
  ✅ Visualización de gráfica con top 5 dispositivos
  ✅ Cálculo automático de costos según tarifa 1F
  ✅ Desglose detallado por rangos de consumo
  ✅ Consejos personalizados de ahorro
  ✅ Estados de carga, error y datos vacíos
  ✅ Diseño responsive para todos los dispositivos
  ✅ Integración con localStorage para persistencia de datos
-->