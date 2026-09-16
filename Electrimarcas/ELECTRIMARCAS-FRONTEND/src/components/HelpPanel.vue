<template>
  <!--
    Panel de ayuda lateral derecho.
    Muestra indicaciones y guías para usar la aplicación.
    Se puede mostrar/ocultar con un botón toggle.
  -->
  <div class="help-panel-overlay" v-if="isVisible" @click="closePanel">
    <aside class="help-panel" @click.stop>
      <!-- Header del panel -->
      <header class="help-header">
        <h2>
          <span class="material-icons">help_outline</span>
          Guía de Uso
        </h2>
        <button class="close-btn" @click="closePanel">
          <span class="material-icons">close</span>
        </button>
      </header>

      <!-- Contenido del panel -->
      <div class="help-content">
        <!-- Sección: Navegación -->
        <section class="help-section">
          <h3>
            <span class="material-icons">navigation</span>
            Navegación
          </h3>
          <ul>
            <li>
              <strong>Inicio:</strong> Ve las categorías de electrodomésticos disponibles
            </li>
            <li>
              <strong>Mis Dispositivos:</strong> Gestiona tus electrodomésticos guardados
            </li>
            <li>
              <strong>Estadísticas:</strong> Revisa el consumo energético
            </li>
            <li>
              <strong>Consejos de Ahorro:</strong> Tips para reducir el consumo
            </li>
          </ul>
        </section>

        <!-- Sección: Agregar Dispositivos -->
        <section class="help-section">
          <h3>
            <span class="material-icons">add_circle</span>
            Agregar Dispositivos
          </h3>
          <ol>
            <li>Selecciona una categoría en la página de Inicio</li>
            <li>Busca tu electrodoméstico en la base de datos</li>
            <li>Revisa los datos técnicos (voltaje, potencia, etc.)</li>
            <li>Agrega el dispositivo a tu lista personal</li>
          </ol>
        </section>

        <!-- Sección: Consejos Rápidos -->
        <section class="help-section">
          <h3>
            <span class="material-icons">lightbulb</span>
            Consejos Rápidos
          </h3>
          <div class="tips">
            <div class="tip">
              <span class="tip-icon">💡</span>
              <p>Usa el sidebar para navegar rápidamente entre secciones</p>
            </div>
            <div class="tip">
              <span class="tip-icon">📊</span>
              <p>Revisa las estadísticas regularmente para optimizar tu consumo</p>
            </div>
            <div class="tip">
              <span class="tip-icon">⚡</span>
              <p>Los datos de voltaje te ayudan a verificar compatibilidad</p>
            </div>
          </div>
        </section>

        <!-- Sección: Atajos de Teclado -->
        <section class="help-section">
          <h3>
            <span class="material-icons">keyboard</span>
            Atajos Útiles
          </h3>
          <div class="shortcuts">
            <div class="shortcut">
              <kbd>Ctrl</kbd> + <kbd>H</kbd>
              <span>Mostrar/ocultar este panel</span>
            </div>
            <div class="shortcut">
              <kbd>Esc</kbd>
              <span>Cerrar panel actual</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer del panel -->
      <footer class="help-footer">
        <p>¿Necesitas más ayuda? Consulta la sección "Acerca de la app"</p>
      </footer>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props para controlar la visibilidad
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Eventos que emite el componente
const emit = defineEmits(['close'])

/**
 * Función para cerrar el panel
 */
const closePanel = () => {
  emit('close')
}

/**
 * Manejo de teclas de atajo
 */
const handleKeypress = (event) => {
  // Cerrar con Escape
  if (event.key === 'Escape' && props.isVisible) {
    closePanel()
  }
  // Toggle con Ctrl+H
  if (event.ctrlKey && event.key === 'h') {
    event.preventDefault()
    if (props.isVisible) {
      closePanel()
    } else {
      // Emitir evento para abrir (lo manejará el componente padre)
      emit('toggle')
    }
  }
}

// Agregar/remover event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeypress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeypress)
})
</script>

<style scoped>
/*
  Estilos para el panel de ayuda lateral derecho.
  .help-panel-overlay: Fondo semi-transparente que cubre toda la pantalla.
  .help-panel: Panel lateral derecho con contenido de ayuda.
  .help-header: Encabezado del panel con título y botón de cerrar.
  .help-content: Contenido principal con secciones de ayuda.
  .help-section: Cada sección individual de ayuda.
  .tips: Contenedor para consejos rápidos.
  .shortcuts: Contenedor para atajos de teclado.
*/

.help-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.help-panel {
  background: #ffffff;
  width: 400px;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Header del panel */
.help-header {
  background: var(--primary);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.help-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Contenido del panel */
.help-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 2rem;
}

.help-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dark);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 0.5rem;
}

.help-section ul,
.help-section ol {
  margin-left: 1rem;
  color: #555;
}

.help-section li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.help-section strong {
  color: var(--dark);
}

/* Consejos rápidos */
.tips {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid var(--primary);
}

.tip-icon {
  font-size: 1.5rem;
}

.tip p {
  margin: 0;
  color: #555;
  line-height: 1.4;
}

/* Atajos de teclado */
.shortcuts {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.shortcut {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

kbd {
  background: var(--dark);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.9rem;
  font-family: monospace;
}

/* Footer del panel */
.help-footer {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.help-footer p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Responsive - Móviles */
@media (max-width: 768px) {
  .help-panel {
    width: 100vw;
  }
}

@media (max-width: 480px) {
  .help-header {
    padding: 1rem;
  }
  
  .help-content {
    padding: 1rem;
  }
  
  .help-header h2 {
    font-size: 1.1rem;
  }
}
</style>