<script>
// Componente de vista de categorías de electrodomésticos.
// Falta hacer un panel a la izquierda en añadir dispositivo que acumule los dispositivos añadidos y al dar click en guardar
// se añadan todos a la categoría correspondiente y con sus respectivos datos (voltaje, potencia, etc.)
import Card from '../components/Card.vue'
import Formulario from '../components/formulario.vue'
import ConfigDeviceModal from '../components/ConfigDeviceModal.vue'
// import { getDispositivosList } from '../services/dataService.js'
// import Refrigerador from '../assets/refrigerator.png' 
// import Lavadora from '../assets/lavadora.png'
// import Tv from '../assets/tv.png'
// import Aire from '../assets/aire.png'
// import Plancha from '../assets/plancha.png'

export default {
  name: 'Inicio',
  components: { Card, Formulario, ConfigDeviceModal },
  data() {
    return {
      categorias: [
        {
          id: 1,
          nombre: 'Limpieza',
          descripcion: 'Electrodomésticos para limpiar el hogar y la ropa.',
          cards: []
        },
        {
          id: 2,
          nombre: 'Cocina',
          descripcion: 'Electrodomésticos para cocinar y preparar alimentos.',
          cards: []
        },
        {
          id: 3,
          nombre: 'Entretenimiento',
          descripcion: 'Dispositivos para ocio y entretenimiento.',
          cards: []
        },
        {
          id: 4,
          nombre: 'Climatización',
          descripcion: 'Equipos para regular la temperatura y el ambiente.',
          cards: []
        },
        {
          id: 5,
          nombre: 'Cuidado Personal',
          descripcion: 'Electrodomésticos para el cuidado y bienestar personal.',
          cards: []
        },
        // Se pueden agregar más categorías aquí
      ],

      // Estado para mostrar el formulario y categoría seleccionada
      showForm: false,
      categoriaSeleccionada: null,

      // Estado del modal de configuración
      showConfigModal: false,
      configCategoriaId: null,
      configCardIndex: null,
      deviceToConfig: null,

      // ====== NUEVO: Modal de confirmación de eliminación ======
      showConfirmDelete: false,
      pendingDelete: { categoriaId: null, cardIndex: null, nombre: '' },
    };
  },
  async created() {
    // 1) Cargar desde localStorage lo que ya estaba guardado
    this.loadCategoriasFromStorage();

    // 2) Consumir selección desde Nuevo_dispositivo (sessionStorage) y fusionarla
    try {
      const stored = sessionStorage.getItem('selectedDevices');
      if (stored) {
        const { cards, categoriaId } = JSON.parse(stored);
        const categoria = this.categorias.find(c => c.id === categoriaId);
        if (categoria && cards && Array.isArray(cards)) {
          // Agregar todos los dispositivos seleccionados
          cards.forEach(card => {
            const potenciaFromDesc = this.extractPotenciaFromText(card?.description);
            const potenciaValue = typeof card?.potencia === 'number' ? card.potencia : (potenciaFromDesc ?? 0);
            const fromDb = potenciaValue > 0; // si detectamos potencia desde catálogo/desc, se bloquea edición
            categoria.cards.push({
              title: card.title,
              description: card.description,
              image: card.image || '',
              backgroundColor1: card.backgroundColor1 || 'white',
              buttonText: "Eliminar",
              // datos opcionales ya contemplados en save/load
            });
          });
          this.saveCategoriasToStorage();
        }
        sessionStorage.removeItem('selectedDevices');
      }
    } catch (e) {
      console.error('Error al cargar dispositivos desde sessionStorage:', e);
      sessionStorage.removeItem('selectedDevices');
    }
  },
  methods: {
    // ====== MODIFICADO: ahora abre modal de confirmación ======
    removeCard(categoriaId, cardIndex) {
      const categoria = this.categorias.find(c => c.id === categoriaId);
      if (!categoria) return;
      const card = categoria.cards[cardIndex];
      const nombre = card?.title || 'este electrodoméstico';

      // Mostrar modal personalizado
      this.pendingDelete = { categoriaId, cardIndex, nombre };
      this.showConfirmDelete = true;
    },

    // ====== NUEVOS: acciones del modal de confirmación ======
    confirmDelete() {
      const { categoriaId, cardIndex } = this.pendingDelete;
      const categoria = this.categorias.find(c => c.id === categoriaId);
      if (!categoria) return;
      categoria.cards.splice(cardIndex, 1);
      this.saveCategoriasToStorage();
      this.showConfirmDelete = false;
      this.pendingDelete = { categoriaId: null, cardIndex: null, nombre: '' };
    },
    cancelDelete() {
      this.showConfirmDelete = false;
      this.pendingDelete = { categoriaId: null, cardIndex: null, nombre: '' };
    },

    abrirSelector(categoriaId) {
      // Navega a la pantalla Nuevo_dispositivo con la categoría seleccionada
      this.$router.push({ path: '/Nuevo_dispositivo', query: { categoriaId } });
    },
    cerrarFormulario() {
      this.showForm = false;
      this.categoriaSeleccionada = null;
    },
    agregarDispositivo(dispositivo) {
      // Añade el dispositivo a la categoría seleccionada
      const categoria = this.categorias.find(c => c.id === this.categoriaSeleccionada);
      if (categoria) {
        categoria.cards.push({
          title: dispositivo.nombre,
          description: dispositivo.descripcion,
          image: '', // Puedes pedir imagen en el formulario si lo deseas
          backgroundColor1: 'white',
          voltaje: dispositivo.voltaje,
          potencia: dispositivo.potencia,
          potenciaFromDb: false, // no registrado: editable en el modal
          buttonText: 'Eliminar'
        });
        this.saveCategoriasToStorage();
      }
      this.cerrarFormulario();
    },
    // Abrir modal de configuración para una card específica
    openConfig(categoriaId, cardIndex) {
      const categoria = this.categorias.find(c => c.id === categoriaId);
      if (!categoria) return;
      const card = categoria.cards[cardIndex];
      this.configCategoriaId = categoriaId;
      this.configCardIndex = cardIndex;
      this.deviceToConfig = { ...card };
      this.showConfigModal = true;
    },
    // Cerrar modal de configuración
    closeConfig() {
      this.showConfigModal = false;
      this.configCategoriaId = null;
      this.configCardIndex = null;
      this.deviceToConfig = null;
    },
    // Guardar configuración recibida del modal
    saveConfig(payload) {
      const categoria = this.categorias.find(c => c.id === this.configCategoriaId);
      if (!categoria) { this.closeConfig(); return; }
      const idx = this.configCardIndex;
      if (idx == null || idx < 0 || idx >= categoria.cards.length) { this.closeConfig(); return; }
      const current = categoria.cards[idx];
      categoria.cards.splice(idx, 1, {
        ...current,
        cantidad: payload.cantidad,
        horasUsoPorDia: payload.horasUsoPorDia,
        diasUsoPorSemana: payload.diasUsoPorSemana,
        potencia: typeof current.potencia === 'number' && current.potenciaFromDb ? current.potencia : payload.potencia,
      });
      this.saveCategoriasToStorage();
      this.closeConfig();
    },
    // Persistencia en localStorage por categoría
    saveCategoriasToStorage() {
      try {
        const map = {};
        this.categorias.forEach(cat => {
          map[cat.id] = (cat.cards || []).map(d => ({
            title: d.title,
            description: d.description,
            image: d.image,
            backgroundColor1: d.backgroundColor1,
            cantidad: d.cantidad,
            horasUsoPorDia: d.horasUsoPorDia,
            diasUsoPorSemana: d.diasUsoPorSemana,
            potencia: d.potencia,
            potenciaFromDb: d.potenciaFromDb === true
          }));
        });
        localStorage.setItem('categoriasCards', JSON.stringify(map));
      } catch (e) {
        console.error('No se pudo guardar categoriasCards:', e);
      }
    },
    loadCategoriasFromStorage() {
      try {
        const saved = localStorage.getItem('categoriasCards');
        if (!saved) return;
        const map = JSON.parse(saved);
        this.categorias.forEach(cat => {
          const arr = map?.[cat.id] || [];
          if (Array.isArray(arr)) {
            cat.cards = arr.map(d => ({
              title: d.title,
              description: d.description,
              image: d.image || '',
              backgroundColor1: d.backgroundColor1 || 'white',
              cantidad: d.cantidad,
              horasUsoPorDia: d.horasUsoPorDia,
              diasUsoPorSemana: d.diasUsoPorSemana,
              potencia: d.potencia,
              potenciaFromDb: d.potenciaFromDb === true,
              buttonText: 'Eliminar'
            }));
          }
        });
      } catch (e) {
        console.error('No se pudo cargar categoriasCards:', e);
      }
    },
    extractPotenciaFromText(text) {
      if (!text || typeof text !== 'string') return null;
      const m = text.match(/(\d+)\s*W/i) || text.match(/Potencia:\s*(\d+)/i);
      return m ? parseInt(m[1]) : null;
    }
  },
};
</script>

<template>
  <!--
      Vista de categorías de electrodomésticos.
      Cada categoría se muestra como una tarjeta.
      Los electrodomésticos de cada categoría se cargarán dinámicamente desde la base de datos.
  -->
  <section class="inicio">
    <!-- Botón para ir a inicio de sesión -->
    <!-- <button @click="irAInicioSesion" class="login-test-btn">
      Ir a Inicio de Sesión
    </button> -->
    <section class="texto">
      <h1>Categorías de Electrodomésticos</h1>
      <p>Añade un electrodoméstico a su respectiva categoría con sus datos para su calcular su consumo.</p>
    </section>
    <nav class="categorias-lista">
      <!-- Lista de categorías fijas -->
      <nav
        v-for="categoria in categorias"
        :key="categoria.id"
        class="categoria-card">
        <h2>{{ categoria.nombre }}</h2>
        <p class="categoria-descripcion">{{ categoria.descripcion }}</p>
        <Card
          v-for="(card, idx) in categoria.cards"
          :key="idx"
          :title="card.title"
          :description="card.description"
          :buttonText="card.buttonText"
          :image="card.image"
          :backgroundColor1="card.backgroundColor1"
          :showConfigure="true"
          :showDelete="true"
          @configurar="openConfig(categoria.id, idx)"
          @eliminar="removeCard(categoria.id,idx)"
        />
        <br>
        <button class="add-button" @click="abrirSelector(categoria.id)">
          <span class="textoBotonAniadir">Añadir dispositivo</span>
        </button>
        <br>
        <!-- Botón para abrir el formulario modal -->
      </nav>
    </nav>

    <!-- Formulario modal -->
    <Formulario
      :visible="showForm"
      :categorias="categorias.map(c => c.nombre)"
      @close="cerrarFormulario"
      @submit="agregarDispositivo"
    />

    <!-- Modal de configuración de uso -->
    <ConfigDeviceModal
      :visible="showConfigModal"
      :device="deviceToConfig"
      @close="closeConfig"
      @save="saveConfig"
    />

    <!-- ====== NUEVO: Modal de confirmación de eliminación ====== -->
    <div v-if="showConfirmDelete" class="modal-overlay">
      <div class="modal-card">
        <h3>Confirmar eliminación</h3>
        <p>
          ¿Deseas eliminar <strong>{{ pendingDelete.nombre }}</strong>?<br>
          Esta acción no se puede deshacer.
        </p>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="cancelDelete" autofocus>Cancelar</button>
          <button class="btn-delete" @click="confirmDelete">Eliminar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Botón de prueba para ir a inicio de sesión */
.login-test-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #66ea9d 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  z-index: 1000;
}

.login-test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/*
  Estilos para la vista de categorías de electrodomésticos.
  .inicio: Contenedor principal de la vista.
  .categorias-lista: Grid de tarjetas de categorías.
  .categoria-card: Tarjeta individual de categoría.
  .categoria-descripcion: Descripción de la categoría.
  .electrodomesticos-placeholder: Espacio reservado para los electrodomésticos.
*/
.inicio {
  padding: 2rem;
}

.categorias-lista {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Centra las tarjetas */
  gap: 0;
  margin-top: 2rem;
}

.categoria-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: box-shadow 0.2s;
  margin-bottom: 1.5rem;
  max-width: 700px; /* Ancho máximo de la tarjeta */
  width: 100%; /* Que no crezca más allá del contenedor */
}

.categoria-card:last-child {
  margin-bottom: 0;
}

.categoria-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}
.categoria-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.categoria-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: #2c3e50;
}

.categoria-descripcion {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
}

.card{
  color: white;
  margin-bottom: 1em;
  
}

.electrodomesticos-placeholder {
  font-size: 0.95rem;
  color: #888;
  font-style: italic;
  margin-top: 0.5rem;
}
.add-button {
  background-color: var(--primary);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
}

.texto{
  line-height: 1.5;
}

.textoBotonAniadir{
  color: white;
}

/* Responsive para el botón */
@media (max-width: 768px) {
  .login-test-btn {
    top: 10px;
    right: 10px;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .login-test-btn {
    position: static;
    margin: 0 auto 1rem auto;
    display: block;
    width: fit-content;
  }
}

/* ====== NUEVO: Estilos del modal de confirmación ====== */

/* Fondo semitransparente del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Tarjeta central del mensaje */
.modal-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  text-align: center;
  animation: fadeIn 0.25s ease;
}

/* Título */
.modal-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Botones */
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-delete {
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel {
  /* background-color: #ffffff; */
  background-color: var(--primary);
  color: #fff;
  /* color: #2c3e50; */
  border: 2px solid var(--primary);
  font-weight: 600;
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
}

.btn-cancel:hover {
  color: #fff;
  background-color: var(--primary);
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
}

.btn-delete {
  background-color: #ffffff;
  color: #2c3e50;
  border: 2px solid #c0392b; 
  font-weight: 600;
}

.btn-delete:hover {
  background-color: #c0392b;
  color: #fff; 
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
}

/* Animación ligera */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
