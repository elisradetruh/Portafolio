<template>
  <section>
    <header class="header-nuevo">
      <h1>{{ getTituloCategoria() }}</h1>
      <router-link to="/Inicio" class="volver-inicio-btn">
        <span class="material-icons">arrow_back</span>
        Volver al inicio
      </router-link>
    </header>
    <br>

    <Buscador v-model="searchQuery" placeholder="Buscar dispositivo..." />
    
    <section class="navegador">
      
      <div v-if="isLoading" class="loading-state">
        Cargando lista de dispositivos... ⏳
      </div>
      <div v-else-if="error" class="error-state">
        <p style="color: red;">¡Error al cargar dispositivos! {{ error }}</p>
      </div>

      <div v-else-if="!filteredCards.length" class="no-results-state">
        <p>No se encontraron dispositivos que coincidan con la búsqueda.</p>
      </div>
      
      <div class="cards-scroll-container"> 
        <article class="cards">
          <Card
            v-for="(card, i) in filteredCards"
            :key="i"
            :title="card.title"
            :description="card.description"
            :image="card.image"
            :background-color1="card.backgroundColor1"
            :background-color2="card.backgroundColor2"
            :showAdd="true"
            buttonText="Agregar"
            @agregar="seleccionar(card)"
          />
        </article>
      </div>
    </section>
    
    <footer class="footer-agregar">
      <button class="agregar-no-registrado" @click="abrirFormulario">
        Agregar dispositivo no registrado
      </button>
      <span style="width: 1rem;"></span>
      <button
        class="agregar-no-registrado"
        @click="guardarSeleccion"
        :disabled="!selectedCards.length"
      >
        Guardar selección ({{ selectedCards.length }})
      </button>
    </footer>
    
    <Formulario
      :visible="showForm"
      :categorias="['Cocina', 'Limpieza', 'Entretenimiento', 'Climatización', 'Cuidado Personal']" 
      @close="cerrarFormulario"
      @submit="agregarDispositivo"
    />

    <!-- ====== NUEVO: Modal de resultado del insert ====== -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-card">
        <h3>{{ resultModal.titulo }}</h3>
        <!-- Usamos v-html para poder meter saltos de línea y <strong> -->
        <p v-html="resultModal.mensaje"></p>
        <div class="modal-buttons">
          <button class="btn-cancel" @click="cerrarResultado" autofocus>
            Aceptar
          </button>
        </div>
      </div>
    </div>
    <!-- ================================================ -->
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDispositivosList, getDispositivosByCategoria, agregarNuevoDispositivo } from '../services/dataService'; // Función API
import Buscador from "../components/Buscador.vue";
import Card from "../components/Card.vue";
import Formulario from "../components/formulario.vue";
import RefrigeradorIcon from "../assets/refrigerator.png"
import LavadoraIcon from "../assets/lavadora.png"
import AfeitadoraIcon from "../assets/afeitadora.png"
import AireAcondicionadoIcon from "../assets/aire.png"
import AspiradoraIcon from "../assets/aspiradora.png"
import lavavajillasIcon from "../assets/lavavajillas.png"
import planchaPeloIcon from "../assets/planchapelo.png"
import planchaRopaIcon from "../assets/plancharopa.png"
import secadoraIcon from "../assets/secadora.png"
import vaporetaIcon from "../assets/vaporeta.png"
import batidoraIcon from "../assets/batidora.png"
import cafeteraIcon from "../assets/cafetera.png"
import hornoElectricoIcon from "../assets/hornoelectrico.png"
import licuadoraIcon from "../assets/licuadora.png"
import microondasIcon from "../assets/microondas.png"
import tostadoraIcon from "../assets/tostadora.png"
import tvIcon from "../assets/tv.png"
import barraSonidoIcon from "../assets/barrasonido.png"
import consolaIcon from "../assets/consola.png"
import laptopIcon from "../assets/laptop.png"
import proyectorIcon from "../assets/proyector.png"
import tabletIcon from "../assets/tablet.png"
import teatroIcon from "../assets/teatro.png"
import airePortatilIcon from "../assets/aireportatil.png"
import calefactorIcon from "../assets/calefactor.png"
import calefactorAceiteIcon from "../assets/calefactoraceite.png"
import deshumificadorIcon from "../assets/desumificador.png"
import climatizadorPortatilIcon from "../assets/climatizador.png"
import estufaElectriaIcon from "../assets/estufa.png"
import extractorIcon from "../assets/extractoraire.png"
import purificadorIcon from "../assets/purificador.png"
import ventiladorTechoIcon from "../assets/ventiladortecho.png"
import ventiladorTorreIcon from "../assets/ventiladortorre.png"



// 1. ESTADO REACTIVO PARA LA CARGA DE DATOS
const searchQuery = ref("");
const cardsList = ref([]); // Almacenará la lista dinámica de la DB
const isLoading = ref(true);
const error = ref(null);
const showForm = ref(false);
const DefaultIcon = '';
const selectedCards = ref([]); // acumulador de selección múltiple
const route = useRoute();
const router = useRouter();
const categoriaId = computed(() => {
  const raw = route.query.categoriaId;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});

// ====== NUEVO: estado del modal de resultado ======
const showResultModal = ref(false);
const resultModal = ref({
  titulo: '',
  mensaje: '',
  esError: false
});

// Mapeo de categorías del frontend a IDs de la base de datos
const categoriaMapping = {
  1: 'C01', // Limpieza
  2: 'C02', // Cocina
  3: 'C03', // Entretenimiento
  4: 'C04', // Climatización
  5: 'C05'  // Cuidado Personal
};

//Mapeo de iconos por electrodomestico
const iconMap = {
    'Refrigerador': RefrigeradorIcon,
    'Lavadora':LavadoraIcon,
    'Hidrolavadora':LavadoraIcon,
    'Afeitadora eléctrica':AfeitadoraIcon,
    'Aire acondicionado portátil':airePortatilIcon,
    'Aire acondicionado split':AireAcondicionadoIcon,
    'Aspiradora':AspiradoraIcon,
    'Lavavajillas':lavavajillasIcon,
    'PlanchaPelo':planchaPeloIcon,
    'Plancha':planchaRopaIcon,
    'Plancha para cabello':planchaPeloIcon,
    'Secadora':secadoraIcon,
    'Vaporeta':vaporetaIcon,
    'Batidora':batidoraIcon,
    'Cafetera':cafeteraIcon,
    'Horno Electrico':hornoElectricoIcon,
    'Licuadora':licuadoraIcon,
    'Microondas':microondasIcon,
    'Tostadora':tostadoraIcon,
    'Televisor':tvIcon,
    'Barra de Sonido':barraSonidoIcon,
    'Consola de Videojuegos':consolaIcon,
    'Laptop Gamer':laptopIcon,
    'Proyector':proyectorIcon,
    'Tablet':tabletIcon,
    'Teatro en Casa':teatroIcon,
    'Calefactor eléctrico':calefactorIcon,
    'Calefactor de aceite':calefactorAceiteIcon,
    'Deshumidificador':deshumificadorIcon,
    'Climatizador portátil':climatizadorPortatilIcon,
    'Estufa eléctrica':estufaElectriaIcon,
    'Extractor de aire':extractorIcon,
    'Purificador de aire':purificadorIcon,
    'Ventilador de techo':ventiladorTechoIcon,
    'Ventilador de torre':ventiladorTorreIcon,  

};

// 2. FUNCIÓN DE CARGA ASÍNCRONA
const fetchDispositivos = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    let data;
    
    // Si hay una categoría seleccionada, obtener solo dispositivos de esa categoría
    if (categoriaId.value && categoriaMapping[categoriaId.value]) {
      const dbCategoriaId = categoriaMapping[categoriaId.value];
      data = await getDispositivosByCategoria(dbCategoriaId);
    } else {
      // Si no hay categoría, obtener todos los dispositivos
      data = await getDispositivosList();
    }
    
    cardsList.value = data.map(card => {
      // Buscamos la imagen en el mapa usando el Título de la Card (nombre del electrodoméstico)
      const imagePath = iconMap[card.title] || DefaultIcon; 
      return {
        ...card, // Mantiene id, title, description, colors
        image: imagePath // <--- Se inyecta la ruta local
      };
    });
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

// 3. CICLO DE VIDA: Llamar a la API al montar
onMounted(fetchDispositivos);

// 4. LÓGICA COMPUTADA PARA EL BUSCADOR
const filteredCards = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return cardsList.value;

  // Filtramos directamente sobre la lista cargada de la DB
  return cardsList.value.filter(
    card =>
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q)
  );
});

// 5. MÉTODOS DE FORMULARIO
const abrirFormulario = () => {
  showForm.value = true;
};
const cerrarFormulario = () => {
  showForm.value = false;
};

// ====== AQUÍ SE MODIFICA PARA USAR EL MODAL EN VEZ DE alert() ======
const agregarDispositivo = async (dispositivo) => {
  try {
    console.log('📤 Enviando dispositivo a la BD:', dispositivo);
    
    // Llamar a la función del servicio para insertar en la BD
    const resultado = await agregarNuevoDispositivo(dispositivo);
    
    if (resultado.success) {
      // Armamos el mensaje bonito para el modal
      resultModal.value = {
        titulo: 'Dispositivo registrado',
        mensaje: `✅ ${resultado.message}<br><br>Dispositivo: <strong>${dispositivo.nombre}</strong>`,
        esError: false
      };
      showResultModal.value = true;

      // Recargar la lista para mostrar el nuevo dispositivo
      await fetchDispositivos();
      
      // Cerrar el formulario
      cerrarFormulario();
    }
  } catch (error) {
    console.error('❌ Error al agregar dispositivo:', error);
    
    // Manejo especial para dispositivos duplicados (error 409)
    if (error.response?.status === 409) {
      const errorData = error.response.data;
      resultModal.value = {
        titulo: 'Dispositivo duplicado',
        mensaje:
          `⚠️ Dispositivo Duplicado<br><br>` +
          `${errorData.message}<br><br>` +
          `<strong>Dispositivo existente:</strong><br>${errorData.detalles}<br><br>` +
          `${errorData.sugerencia}`,
        esError: true
      };
    } else {
      // Otros errores
      const msg = error.response?.data?.message || error.message;
      resultModal.value = {
        titulo: 'Error al agregar dispositivo',
        mensaje: `❌ Ocurrió un error al agregar el dispositivo.<br><br>Detalle:<br>${msg}`,
        esError: true
      };
    }
    showResultModal.value = true;
  }
};

// cerrar el modal de resultado
const cerrarResultado = () => {
  showResultModal.value = false;
};

// Seleccionar (toggle) sin navegar; se guardará con el botón Guardar selección
const seleccionar = (card) => {
  const idx = selectedCards.value.findIndex(c => c.title === card.title && c.description === card.description);
  if (idx >= 0) {
    selectedCards.value.splice(idx, 1);
  } else {
    selectedCards.value.push(card);
  }
};

// Persistir selección acumulada y regresar a Inicio
const guardarSeleccion = () => {
  const catId = categoriaId.value;
  if (!catId || selectedCards.value.length === 0) return;
  try {
    sessionStorage.setItem('selectedDevices', JSON.stringify({ cards: selectedCards.value, categoriaId: catId }));
  } catch {}
  router.push('/Inicio');
};

// Función para obtener el título de la categoría
const getTituloCategoria = () => {
  const nombresCategoria = {
    1: 'Limpieza',
    2: 'Cocina',
    3: 'Entretenimiento',
    4: 'Climatización',
    5: 'Cuidado Personal'
  };
  
  const catId = categoriaId.value;
  if (catId && nombresCategoria[catId]) {
    return `Agregar dispositivo - ${nombresCategoria[catId]}`;
  }
  return 'Agregar dispositivo';
};

</script>

<style>
    .header-nuevo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .volver-inicio-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary, #4ec145);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: background 0.2s;
    }
    .volver-inicio-btn:hover {
      background: #3ea832;
      
    }
    .volver-inicio-btn .material-icons {
      font-size: 1.2rem;
      
    }
    .card{
        margin-bottom: 5px;
    }
    .footer-agregar {
      display: flex;
      justify-content: flex-start;
      margin-top: 2rem;
      margin-bottom: 2rem;
      
    }
    .agregar-no-registrado {
      background: var(--primary, #4ec145);
      color: #fff;
      border: none;
      border-radius: 0.5rem;
      padding: 0.8rem 1.5rem;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: background 0.2s;
    }
    .agregar-no-registrado:hover {
      background: #3ea832;
    }
    .cards-scroll-container {
      max-height: 50vh; /* Ajusta este valor (ej. 70% del viewport height) */
      max-width: 1000px;
      overflow-y: auto; 
      padding: 25px;
      border: 1px solid #ccc;
      border-radius: 8px;
      width: 780px;
    }

    /* ====== DISEÑO DEL MODAL (MISMO QUE EL DE ELIMINAR) ====== */

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

    .modal-card h3 {
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .modal-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-cancel,
    .btn-delete {
      border: none;
      border-radius: 0.5rem;
      padding: 0.6rem 1.2rem;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.2s;
    }

    .btn-cancel {
      background-color: var(--primary);
      color: #fff;
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

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
</style>
