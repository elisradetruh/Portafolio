

<template>
  <!-- Contenedor principal de la aplicación -->
  <nav class="app" :class="{ 'no-sidebar': !shouldShowSidebar }">
    <!-- Componente de navegación lateral -->
    <Sidebar v-if="shouldShowSidebar" />
    
    <!-- Área principal de contenido donde se renderizan las vistas -->
    <main>
      <router-view />
      
      <!-- Botón flotante para abrir panel de ayuda -->
      <button 
        v-if="shouldShowSidebar"
        class="help-toggle-btn" 
        @click="toggleHelpPanel"
        :title="showHelpPanel ? 'Cerrar ayuda (Ctrl+H)' : 'Abrir ayuda (Ctrl+H)'"
      >
        <span class="material-icons">
          {{ showHelpPanel ? 'help' : 'help_outline' }}
        </span>
      </button>
    </main>

    <!-- Panel de ayuda -->
    <HelpPanel 
      v-if="shouldShowSidebar"
      :isVisible="showHelpPanel" 
      @close="closeHelpPanel"
      @toggle="toggleHelpPanel"
    />
  </nav>
</template>

<script setup>
// Importación del componente Sidebar y HelpPanel
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import HelpPanel from './components/HelpPanel.vue'
import authService from './services/authService.js'

/**
 * Estado reactivo para controlar la visibilidad del panel de ayuda
 */
const showHelpPanel = ref(false)

/**
 * Detectar la ruta actual
 */
const route = useRoute()

/**
 * Computed para determinar si debe mostrar el sidebar
 * Solo se muestra si el usuario está autenticado y no está en la página de login
 */
const shouldShowSidebar = computed(() => {
  // Refrescar el estado del authService antes de verificar
  authService.refreshState()
  
  const isAuthenticated = authService.isAuthenticated()
  const isNotLoginPage = route.path !== '/inicio-sesion'
  
  // Debug logs
  console.log('🔍 Debug Sidebar:', {
    isAuthenticated,
    isNotLoginPage,
    currentPath: route.path,
    shouldShow: isAuthenticated && isNotLoginPage
  })
  
  return isAuthenticated && isNotLoginPage
})

/**
 * Función para alternar la visibilidad del panel de ayuda
 */
const toggleHelpPanel = () => {
  showHelpPanel.value = !showHelpPanel.value
}

/**
 * Función para cerrar el panel de ayuda
 */
const closeHelpPanel = () => {
  showHelpPanel.value = false
}
</script>
<style lang="scss">
/* ===========================================
   VARIABLES CSS GLOBALES
   =========================================== */
:root {
  --primary: #8aca1c;        /* Color primario de la aplicación */
  --grey: #6b7280;           /* Color gris para texto secundario */
  --dark: #1e293b;           /* Color oscuro para el sidebar */
  --dark-alt: #334155;       /* Color oscuro alternativo para hover */
  --light: #f1f5f9;          /* Color claro para texto en sidebar */
  --sidebar-width: 300px; 
  font-family: 'Inter', sans-serif; /* Ancho del sidebar cuando está expandido */
}

/* ===========================================
   RESET CSS Y ESTILOS BASE
   =========================================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

body {
  background-color: white;
  color: #333;
}

/* Estilos base para botones */
button {
  cursor: pointer;
  appearance: none;
  border: none;
  outline: none;
  background: none;
}

/* ===========================================
   LAYOUT PRINCIPAL DE LA APLICACIÓN
   =========================================== */
.app {
  display: flex;
  min-height: 100vh;
  
  width: 100%;
}

/* Layout cuando no hay sidebar (p.ej. login) */
.app.no-sidebar {
  main {
    margin-left: 0;
    padding: 0;
    width: 100%;
  }
}

/* Área principal de contenido */
main {
  flex: 1 1 0;
  padding: 2rem;
  background-color: white;
  min-height: 100vh;
  transition: margin-left 0.2s ease-in-out;
  position: relative; /* Para posicionar el botón flotante */
}

/* ===========================================
   BOTÓN FLOTANTE DE AYUDA
   =========================================== */
.help-toggle-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 900;
}

.help-toggle-btn:hover {
  background: #3ea832;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.help-toggle-btn .material-icons {
  font-size: 24px;
}

/* ===========================================
   RESPONSIVE DESIGN
   =========================================== */

/* Tablets y pantallas medianas */
@media (max-width: 1024px) {
  .app {
    flex-direction: row;
  }
  
  main {
    padding: 1rem;
    margin-left: calc(2rem + 32px); /* Espacio para el sidebar contraído */
  }
}

/* Móviles grandes */
@media (max-width: 768px) {
  main {
    padding: 1rem;
    margin-left: calc(2rem + 32px); /* Espacio para el sidebar contraído */
  }
  
  .help-toggle-btn {
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
  }
  
  .help-toggle-btn .material-icons {
    font-size: 20px;
  }
}
</style>
