// Importación de la función createApp de Vue 3
import { createApp } from 'vue'

// Importación de los estilos globales de la aplicación
import './style.css'

// Importación del componente raíz de la aplicación
import App from './App.vue'

// Importación de la configuración del router
import router from './router/index.js'

/**
 * Punto de entrada principal de la aplicación Vue
 * Crea la instancia de la aplicación, configura el router
 * y monta la aplicación en el elemento con id 'app'
 */
createApp(App).use(router).mount('#app')
