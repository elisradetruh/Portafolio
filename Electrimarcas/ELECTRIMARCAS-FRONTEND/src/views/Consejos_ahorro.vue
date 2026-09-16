<template>
    <!--
        Vista de consejos de ahorro energético.
        Cada consejo se muestra como una tarjeta con su color e ícono.
    -->
    <section class="consejos">
        <h1>Consejos de ahorro</h1>
        <p> Estos consejos te ayudarán a reducir el consumo de energía en tu hogar, 
            ahorrar dinero en tus recibos de luz y contribuir al cuidado del medio ambiente.</p>
                    
        <!-- Sección de dispositivos que más consumen -->
        <section v-if="dispositivosAltoConsumo.length > 0" class="alto-consumo-section">
            <h2 class="section-title">💡 Dispositivos que más consumen energía</h2>
            <p class="section-description">Estos son tus dispositivos con mayor consumo. Aplica estos consejos para reducir tu factura:</p>
            
            <!-- Simbología de niveles de consumo -->
            <div class="simbologia-consumo">
                <span class="simbologia-item">
                    <span class="simbologia-badge muy-alto"></span>
                    <span class="simbologia-texto">Muy Alto (>10 kWh/día)</span>
                </span>
                <span class="simbologia-item">
                    <span class="simbologia-badge alto"></span>
                    <span class="simbologia-texto">Alto (5-10 kWh/día)</span>
                </span>
                <span class="simbologia-item">
                    <span class="simbologia-badge medio"></span>
                    <span class="simbologia-texto">Medio (2-5 kWh/día)</span>
                </span>
                <span class="simbologia-item">
                    <span class="simbologia-badge bajo"></span>
                    <span class="simbologia-texto">Bajo (<2 kWh/día)</span>
                </span>
            </div>
            
            <div class="dispositivos-consumo-lista">
                <article 
                    v-for="(disp, idx) in dispositivosAltoConsumo" 
                    :key="idx"
                    class="dispositivo-consumo-card"
                    :class="disp.nivelConsumo"
                >
                    <div class="consumo-header">
                        <h3 class="dispositivo-nombre">{{ disp.title }}</h3>
                        <span class="consumo-badge" :class="disp.nivelConsumo">
                            {{ disp.consumoDiario.toFixed(2) }} kWh/día
                        </span>
                    </div>
                    <div class="consumo-info">
                        <p class="consumo-datos">
                            <strong>Potencia:</strong> {{ disp.potencia }}W | 
                            <strong>Uso diario:</strong> {{ disp.horasUsoPorDia }}h | 
                            <strong>Días/semana:</strong> {{ disp.diasUsoPorSemana }}
                        </p>
                        <div class="consumo-mensual">
                            <strong>Consumo mensual estimado:</strong> {{ disp.consumoMensual.toFixed(2) }} kWh
                        </div>
                    </div>
                    <div class="consejo-personalizado">
                        <strong>💡 Consejo:</strong> {{ disp.consejo }}
                    </div>
                </article>
            </div>
        </section>
        
        <!-- Sección de consejos generales
        <section class="consejos-lista">
            <h2 class="section-title">Consejos generales de ahorro</h2>
            <article class="cards">
                <Card
                v-for="c in consejosCards"
                :key="c.id"
                :title="c.title"
                :description="c.description"
                :background-color1="c.backgroundColor1"
                :background-color2="c.backgroundColor2"
                />
            </article>
        </section> -->
    </section>
</template>

<script>
/**
 * ============================================================================
 * COMPONENTE: Consejos_ahorro.vue
 * ============================================================================
 * 
 * DESCRIPCIÓN:
 * Este componente muestra consejos personalizados de ahorro energético basados
 * en los dispositivos que el usuario tiene configurados. Analiza el consumo
 * de cada dispositivo y genera recomendaciones específicas según:
 * - Tipo de dispositivo (refrigerador, aire acondicionado, lavadora, etc.)
 * - Nivel de consumo diario (muy alto, alto, medio, bajo)
 * - Horas de uso diarias
 * 
 * FUNCIONALIDAD PRINCIPAL:
 * 1. Carga los dispositivos desde localStorage (donde se guardan al configurarlos)
 * 2. Calcula el consumo diario y mensual de cada dispositivo
 * 3. Identifica los 5 dispositivos que más consumen energía
 * 4. Genera consejos personalizados según el tipo y consumo de cada uno
 * 5. Muestra los dispositivos ordenados por consumo con badges de color
 * 
 * FLUJO DE DATOS:
 * localStorage.getItem('categoriasCards') → procesarDispositivos() → 
 * calcularConsumo() → generarConsejo() → mostrar en UI
 * 
 * ESTRUCTURA DE DATOS ESPERADA (localStorage):
 * {
 *   "1": [{ // ID de categoría
 *     title: "Refrigerador",
 *     description: "Modelo: MD001 | Potencia: 120W",
 *     potencia: 120,
 *     cantidad: 1,
 *     horasUsoPorDia: 24,
 *     diasUsoPorSemana: 7
 *   }],
 *   "2": [...]
 * }
 * 
 * FÓRMULA DE CÁLCULO:
 * consumoDiario (kWh) = (potencia * horasUsoPorDia * cantidad) / 1000
 * consumoMensual (kWh) = consumoDiario * 30
 * 
 * NIVELES DE CONSUMO:
 * - muy-alto: > 10 kWh/día (rojo)
 * - alto: > 5 kWh/día (naranja)
 * - medio: > 2 kWh/día (azul)
 * - bajo: ≤ 2 kWh/día (verde)
 * 
 * @author Equipo ElectriMarcas
 * @version 1.0
 */
import Card from '../components/Card.vue';
import { getConsumoResumen } from '../services/dataService.js';
   
export default {
  name: 'Consejos',
  components: { Card },
  data() {
    return {
      /**
       * Array de consejos generales de ahorro energético.
       * Actualmente están definidos de forma estática, pero en el futuro
       * podrían cargarse dinámicamente desde la base de datos.
       * 
       * @type {Array<Object>}
       * @property {number} id - Identificador único del consejo
       * @property {string} titulo - Título del consejo
       * @property {string} descripcion - Descripción detallada del consejo
       * @property {string} color1 - Color de gradiente inicial (hex)
       * @property {string} color2 - Color de gradiente final (hex)
       */
      consejos: [
        {
          id: 1,
          titulo: 'Desconecta los aparatos que no uses.',
          descripcion:
            'Muchos dispositivos en "stand by" (televisión, consolas, cargadores) siguen consumiendo energía.',
          color1: '#ef4444',
          color2: '#dc2626',
        },
        {
          id: 2,
          titulo: 'Evita abrir y cerrar mucho el refrigerador.',
          descripcion: 'Cada vez que lo abres, el motor trabaja más para enfriarlo.',
          color1: '#3b82f6',
          color2: '#0ea5e9',
        },
        {
          id: 3,
          titulo: 'Usa lavadoras solo con carga completa.',
          descripcion: 'Evita el desperdicio de agua y energía lavando pocas prendas por carga.',
          color1: '#34d399',
          color2: '#22c55e',
        },
      ],
      /**
       * Array que almacena los dispositivos con mayor consumo energético.
       * Se calcula automáticamente al montar el componente y contiene
       * los top 5 dispositivos ordenados por consumo diario descendente.
       * 
       * Estructura de cada elemento:
       * {
       *   title: string,              // Nombre del dispositivo
       *   potencia: number,            // Potencia en watts
       *   horasUsoPorDia: number,      // Horas de uso diario
       *   diasUsoPorSemana: number,    // Días de uso por semana
       *   cantidad: number,            // Cantidad de dispositivos
       *   consumoDiario: number,       // Consumo diario en kWh
       *   consumoMensual: number,      // Consumo mensual en kWh
       *   nivelConsumo: string,        // 'muy-alto' | 'alto' | 'medio' | 'bajo'
       *   consejo: string              // Consejo personalizado generado
       * }
       * 
       * @type {Array<Object>}
       */
      dispositivosAltoConsumo: []
    };
  },
  computed: {
    /**
     * Computed property que transforma los consejos estáticos
     * en el formato esperado por el componente Card.
     * 
     * @returns {Array<Object>} Array de consejos formateados para Card
     */
    consejosCards() {
      return this.consejos.map(c => ({
        id: c.id,
        title: c.titulo,
        description: c.descripcion,
        backgroundColor1: c.color1,
        backgroundColor2: c.color2,
      }));
    },
  },
  /**
   * Hook del ciclo de vida: Se ejecuta cuando el componente se monta.
   * Carga los dispositivos de alto consumo desde el almacenamiento local.
   */
  mounted() {
    this.cargarDispositivosAltoConsumo();
  },
  methods: {
    /**
     * Método auxiliar para ver detalles de un consejo (actualmente no implementado).
     * @param {Object} c - Objeto del consejo
     */
    verDetalle(c) {
      console.log('Tip seleccionado:', c.title);
    },
    
    /**
     * ========================================================================
     * MÉTODO PRINCIPAL: cargarDispositivosAltoConsumo()
     * ========================================================================
     * 
     * Carga los dispositivos configurados por el usuario desde el almacenamiento
     * local del navegador. Busca en dos ubicaciones:
     * 1. localStorage.getItem('categoriasCards') - Dispositivos guardados permanentemente
     * 2. sessionStorage.getItem('selectedDevices') - Dispositivos agregados recientemente
     * 
     * PROCESO:
     * 1. Intenta leer desde localStorage (datos persistidos)
     * 2. Si no hay datos en localStorage, intenta sessionStorage
     * 3. Recolecta todos los dispositivos de todas las categorías
     * 4. Procesa los dispositivos para calcular consumos y generar consejos
     * 
     * @throws {Error} Si hay un error al parsear JSON o acceder al almacenamiento
     */
    cargarDispositivosAltoConsumo() {
      try {
        // Intentar obtener desde localStorage (datos guardados con ConfigDeviceModal)
        const saved = localStorage.getItem('categoriasCards');
        if (!saved) {
          // También intentar desde sessionStorage (dispositivos agregados recientemente)
          const sessionData = sessionStorage.getItem('selectedDevices');
          if (sessionData) {
            const { cards } = JSON.parse(sessionData);
            this.procesarDispositivos(cards);
          }
          return;
        }
        
        const map = JSON.parse(saved);
        const allDevices = [];
        
        // Recolectar todos los dispositivos de todas las categorías
        Object.values(map || {}).forEach(arr => {
          if (Array.isArray(arr)) {
            arr.forEach(d => {
              if (d && d.title) {
                allDevices.push(d);
              }
            });
          }
        });
        
        this.procesarDispositivos(allDevices);
      } catch (error) {
        console.error('Error al cargar dispositivos de alto consumo:', error);
      }
    },
    
    /**
     * ========================================================================
     * MÉTODO: procesarDispositivos(devices)
     * ========================================================================
     * 
     * Procesa un array de dispositivos para calcular su consumo energético
     * y generar consejos personalizados. Solo incluye dispositivos con consumo > 0.
     * 
     * PROCESO:
     * 1. Para cada dispositivo, calcula consumo diario y mensual
     * 2. Determina el nivel de consumo (muy-alto, alto, medio, bajo)
     * 3. Genera un consejo personalizado según tipo y consumo
     * 4. Filtra dispositivos sin consumo (potencia = 0 o sin datos)
     * 5. Ordena por consumo diario descendente
     * 6. Selecciona solo los top 5 dispositivos
     * 
     * FÓRMULAS:
     * - consumoDiario (kWh) = (potencia × horasUsoPorDia × cantidad) / 1000
     * - consumoMensual (kWh) = consumoDiario × 30
     * 
     * @param {Array<Object>} devices - Array de dispositivos a procesar
     * @param {string} devices[].title - Nombre del dispositivo
     * @param {number} [devices[].potencia] - Potencia en watts (se extrae de description si no existe)
     * @param {number} [devices[].cantidad=1] - Cantidad de dispositivos
     * @param {number} [devices[].horasUsoPorDia=1] - Horas de uso diario
     * @param {number} [devices[].diasUsoPorSemana=7] - Días de uso por semana
     * @param {string} [devices[].description] - Descripción que puede contener la potencia
     * 
     * @returns {void} Actualiza this.dispositivosAltoConsumo con los top 5 dispositivos
     */
    procesarDispositivos(devices) {
      if (!Array.isArray(devices) || devices.length === 0) return;
      
      const dispositivosConConsumo = devices
        .map(device => {
          const cantidad = device.cantidad ?? 1;
          const horas = device.horasUsoPorDia ?? 1;
          const diasSemana = device.diasUsoPorSemana ?? 7;
          const potencia = device.potencia ?? this.extraerPotencia(device.description) ?? 0;
          
          const consumoDiario = (potencia * horas * cantidad) / 1000; // kWh
          const consumoMensual = consumoDiario * 30;
          
          return {
            title: device.title,
            potencia,
            horasUsoPorDia: horas,
            diasUsoPorSemana: diasSemana,
            cantidad,
            consumoDiario,
            consumoMensual,
            nivelConsumo: this.obtenerNivelConsumo(consumoDiario),
            consejo: this.generarConsejo(device.title, consumoDiario, potencia, horas)
          };
        })
        .filter(d => d.consumoDiario > 0)
        .sort((a, b) => b.consumoDiario - a.consumoDiario)
        .slice(0, 5); // Top 5 dispositivos que más consumen
      
      this.dispositivosAltoConsumo = dispositivosConConsumo;
    },
    
    /**
     * ========================================================================
     * MÉTODO: extraerPotencia(description)
     * ========================================================================
     * 
     * Extrae el valor de potencia (en watts) de la descripción del dispositivo
     * usando expresiones regulares. Busca patrones como:
     * - "Potencia: 120W"
     * - "120W"
     * 
     * @param {string|null} description - Descripción del dispositivo que puede contener la potencia
     * @returns {number|null} Potencia en watts o null si no se encuentra
     * 
     * @example
     * extraerPotencia("Modelo: MD001 | Potencia: 120W") // returns 120
     * extraerPotencia("Aspiradora 850W de potencia")    // returns 850
     * extraerPotencia("Sin información")                 // returns null
     */
    extraerPotencia(description) {
      if (!description || typeof description !== 'string') return null;
      const match = description.match(/(\d+)\s*W/i) || description.match(/Potencia:\s*(\d+)/i);
      return match ? parseInt(match[1]) : null;
    },
    
    /**
     * ========================================================================
     * MÉTODO: obtenerNivelConsumo(consumoDiario)
     * ========================================================================
     * 
     * Determina el nivel de consumo energético de un dispositivo basado
     * en su consumo diario en kWh. Se usa para asignar colores y estilos
     * visuales a las tarjetas de dispositivos.
     * 
     * RANGOS:
     * - muy-alto: > 10 kWh/día (rojo - #ef4444)
     * - alto: > 5 kWh/día (naranja - #f59e0b)
     * - medio: > 2 kWh/día (azul - #3b82f6)
     * - bajo: ≤ 2 kWh/día (verde - #22c55e)
     * 
     * @param {number} consumoDiario - Consumo diario en kWh
     * @returns {string} Nivel de consumo: 'muy-alto' | 'alto' | 'medio' | 'bajo'
     * 
     * @example
     * obtenerNivelConsumo(12.5)  // returns 'muy-alto'
     * obtenerNivelConsumo(7)     // returns 'alto'
     * obtenerNivelConsumo(3)     // returns 'medio'
     * obtenerNivelConsumo(1.5)   // returns 'bajo'
     */
    obtenerNivelConsumo(consumoDiario) {
      if (consumoDiario > 10) return 'muy-alto';
      if (consumoDiario > 5) return 'alto';
      if (consumoDiario > 2) return 'medio';
      return 'bajo';
    },
    
    /**
     * ========================================================================
     * MÉTODO: generarConsejo(nombre, consumoDiario, potencia, horas)
     * ========================================================================
     * 
     * Genera un consejo personalizado de ahorro energético basado en:
     * - Tipo de dispositivo (refrigerador, aire acondicionado, etc.)
     * - Nivel de consumo diario
     * - Horas de uso diarias
     * 
     * ESTRATEGIA:
     * 1. Primero busca consejos específicos por tipo de dispositivo
     * 2. Si el consumo es muy alto, da consejos más urgentes
     * 3. Si no hay consejo específico, da consejos generales según consumo
     * 
     * DISPOSITIVOS CON CONSEJOS ESPECÍFICOS:
     * - Refrigerador/Refrigeradora
     * - Aire acondicionado/Climatización
     * - Lavadora
     * - Televisor/TV
     * - Plancha
     * 
     * @param {string} nombre - Nombre del dispositivo
     * @param {number} consumoDiario - Consumo diario en kWh
     * @param {number} potencia - Potencia en watts
     * @param {number} horas - Horas de uso diario
     * @returns {string} Consejo personalizado de ahorro energético
     * 
     * @example
     * generarConsejo("Refrigerador", 8.5, 120, 24)
     * // "Considera revisar el sello de la puerta y ajustar la temperatura a 4-5°C..."
     * 
     * generarConsejo("Lámpara LED", 0.5, 10, 5)
     * // "Asegúrate de desconectarlo cuando no lo estés usando..."
     */
    generarConsejo(nombre, consumoDiario, potencia, horas) {
      const nombreLower = nombre.toLowerCase();
      
      // ======================================================================
      // CONSEJOS ESPECÍFICOS POR TIPO DE DISPOSITIVO
      // ======================================================================
      
      // REFRIGERADOR: Consumo alto por estar encendido 24/7
      if (nombreLower.includes('refrigerador') || nombreLower.includes('refrigeradora')) {
        if (consumoDiario > 5) {
          return 'Considera revisar el sello de la puerta y ajustar la temperatura a 4-5°C. Evita abrir la puerta frecuentemente.';
        }
        return 'Mantén la puerta cerrada y verifica que el sello esté en buen estado.';
      }
      
      // AIRE ACONDICIONADO: Uno de los mayores consumidores
      if (nombreLower.includes('aire') || nombreLower.includes('climatiz')) {
        if (consumoDiario > 8) {
          return 'Usa el modo ventilador cuando sea posible y mantén la temperatura en 24-26°C. Cierra ventanas y puertas mientras esté encendido.';
        }
        return 'Ajusta la temperatura a 24-26°C y limpia los filtros regularmente.';
      }
      
      // LAVADORA: Consumo en ciclos de lavado
      if (nombreLower.includes('lavadora')) {
        if (consumoDiario > 3) {
          return 'Usa siempre cargas completas y elige ciclos de agua fría cuando sea posible. Reduce la frecuencia de uso si es posible.';
        }
        return 'Usa cargas completas y programas de lavado eficientes.';
      }
      
      // TELEVISOR: Consumo por horas de uso
      if (nombreLower.includes('televisor') || nombreLower.includes('tv')) {
        if (horas > 8) {
          return 'Reduce las horas de uso diario. Activa el modo de ahorro de energía y apágalo cuando no estés viéndolo.';
        }
        return 'Desconéctalo cuando no lo uses y activa el modo de ahorro de energía.';
      }
      
      // PLANCHA: Alto consumo en cortos periodos
      if (nombreLower.includes('plancha')) {
        return 'Úsala solo cuando tengas suficiente ropa para planchar. Desconéctala inmediatamente después de usar.';
      }
      
      // ======================================================================
      // CONSEJOS GENERALES BASADOS EN NIVEL DE CONSUMO
      // ======================================================================
      // Si no hay consejo específico, se aplican consejos según el consumo
      
      // Consumo muy alto (> 10 kWh/día): Recomendaciones urgentes
      if (consumoDiario > 10) {
        return `Este dispositivo consume mucha energía (${consumoDiario.toFixed(2)} kWh/día). Considera reducir las horas de uso o buscar una alternativa más eficiente.`;
      }
      
      // Consumo alto (5-10 kWh/día): Recomendaciones moderadas
      if (consumoDiario > 5) {
        return `Modera el uso de este dispositivo. Cada hora adicional representa ${(potencia/1000).toFixed(2)} kWh más en tu factura.`;
      }
      
      // Uso prolongado (> 12 horas/día): Recomendación de reducir tiempo
      if (horas > 12) {
        return 'Este dispositivo está encendido muchas horas al día. Considera apagarlo cuando no sea necesario.';
      }
      
      // Consejo por defecto: Reducir consumo en stand-by
      return 'Asegúrate de desconectarlo cuando no lo estés usando para evitar consumo en modo stand-by.';
    }
  },
};
</script>

<style scoped>
/**
 * ============================================================================
 * ESTILOS: Consejos_ahorro.vue
 * ============================================================================
 * 
 * Estilos scoped (solo aplican a este componente) para la vista de consejos
 * de ahorro energético. Incluye:
 * 
 * - Estilos para la sección principal de consejos
 * - Estilos para las tarjetas de dispositivos de alto consumo
 * - Badges de color según nivel de consumo (muy-alto, alto, medio, bajo)
 * - Panel de consejos personalizados
 * - Diseño responsive para dispositivos móviles
 * 
 * COLORES POR NIVEL DE CONSUMO:
 * - muy-alto: Rojo (#ef4444, #dc2626)
 * - alto: Naranja (#f59e0b, #d97706)
 * - medio: Azul (#3b82f6, #2563eb)
 * - bajo: Verde (#22c55e, #16a34a)
 */
.consejos {
    line-height: 1.5;
    max-width: 900px;
    width: 100%;
    padding: 2rem;
    text-align: left;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 0.8rem;
    margin-bottom: 0.5rem;
}

.section-description {
    font-size: 1rem;
    color: #555;
    margin-bottom: 1.5rem;
}

/* Simbología de colores */
.simbologia-consumo {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.simbologia-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.simbologia-badge {
    width: 20px;
    height: 20px;
    border-radius: 0.25rem;
    display: inline-block;
}

.simbologia-badge.muy-alto {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.simbologia-badge.alto {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.simbologia-badge.medio {
    background: linear-gradient(135deg, #e2cc03, #b69501);
}

.simbologia-badge.bajo {
    background: linear-gradient(135deg, #22c55e, #16a34a);
}

.simbologia-texto {
    font-size: 0.9rem;
    color: #2c3e50;
    font-weight: 500;
}

.alto-consumo-section {
    margin-bottom: 3rem;
    margin-top: 30px; 
    /* background: #f8f9fa; */
    border-radius: 1rem;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.dispositivos-consumo-lista {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.dispositivo-consumo-card {
    background: #fff;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s;
    border-left: 4px solid #4ec145;
}

.dispositivo-consumo-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.dispositivo-consumo-card.muy-alto {
    border-left-color: #ef4444;
}

.dispositivo-consumo-card.alto {
    border-left-color: #f59e0b;
}

.dispositivo-consumo-card.medio {
    border-left-color: #e2cc03;
}

.dispositivo-consumo-card.bajo {
    border-left-color: #22c55e;
}

.consumo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.dispositivo-nombre {
    font-size: 1.2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
}

.consumo-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #fff;
}

.consumo-badge.muy-alto {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.consumo-badge.alto {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.consumo-badge.medio {
    background: linear-gradient(135deg, #e2cc03, #b69501);
}

.consumo-badge.bajo {
    background: linear-gradient(135deg, #22c55e, #16a34a);
}

.consumo-info {
    margin-bottom: 0.75rem;
}

.consumo-datos {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0;
}

.consumo-mensual {
    font-size: 0.95rem;
    color: #2c3e50;
    margin-top: 0.5rem;
}

.consejo-personalizado {
    background: #fff7ed;
    border-left: 3px solid #f59e0b;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #431407;
    margin-top: 0.75rem;
}

.consejo-personalizado strong {
    color: #d97706;
}

.consejos-lista {
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: 1.2rem;
    margin-top: 1.5rem;
}

.consejo-card {
    border-radius: 1rem;
    padding: 1.5rem;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    max-width: 700px;
    width: 100%;
    transition: box-shadow 0.2s;
}

.consejo-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.consejo-card h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: left;
    gap: 0.5rem;
}

.consejo-descripcion {
    font-size: 1rem;
    line-height: 1.4;
}
.consejos-info {
    font-size: 0.9rem;
    color: #888;
    font-style: italic;
    margin-top: 0.5rem;
}

@media (max-width: 768px) {
    .consumo-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .dispositivo-consumo-card {
        padding: 1rem;
    }
}
</style>