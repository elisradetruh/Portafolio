// Importaciones necesarias para el router de Vue
import {createRouter, createWebHistory} from 'vue-router'
import Inicio from '../views/Inicio.vue'
import Acercade from '../views/Acercade.vue'
import Mis_dispositivos from '../views/Mis_dispositivos.vue'
import Estadisticas from '../views/Estadisticas.vue'
import Consejos_ahorro from '../views/Consejos_ahorro.vue'
import Nuevo_dispositivo from '../views/Nuevo_dispositivo.vue'
import InicioSesion from '../views/InicioSesion.vue'
import Registro from '../views/Registro.vue'
import authService from '../services/authService.js'

/**
 * Configuración del router de Vue
 * Define las rutas de la aplicación y su comportamiento
 */
const router = createRouter({
  // Usa el historial del navegador para la navegación
  history: createWebHistory(),
  
  // Array de rutas de la aplicación
  routes: [
    {
      path: '/',                    // Ruta raíz - redirige al login
      redirect: '/inicio-sesion'
    },
    {
      path: '/inicio-sesion',       // Página de inicio de sesión (pública)
      name: 'Inicio Sesión',
      component: InicioSesion,
      meta: { requiresAuth: false }
    },
    {
      path: '/registro',            // Página de registro (pública)
      name: 'Registro',
      component: Registro,
      meta: { requiresAuth: false }
    },
    {
      path: '/Inicio',              // Ruta principal (protegida)
      name: 'Inicio',
      component: Inicio,
      meta: { requiresAuth: true }
    },
    {
      path: '/Acerca-de',           // Ruta para la página de Acerca de (protegida)
      name: 'Acerca de',
      component: Acercade,
      meta: { requiresAuth: true }
    },
    {
      path: '/Mis-dispositivos',    // Ruta para la página de Mis Dispositivos (protegida)
      name: 'Mis Dispositivos',
      component: Mis_dispositivos,
      meta: { requiresAuth: true }
    },
    {
      path: '/Estadisticas',        // Ruta para la página de Estadísticas (protegida)
      name: 'Estadísticas',
      component: Estadisticas,
      meta: { requiresAuth: true }
    },
    {
      path: '/Consejos-de-ahorro',  // Ruta para la página de Consejos de Ahorro (protegida)
      name: 'Consejos de Ahorro',
      component: Consejos_ahorro,
      meta: { requiresAuth: true }
    },
    {
      path: '/Nuevo_dispositivo',   // Ruta para la página de Nuevo Dispositivo (protegida)
      name: 'Nuevo Dispositivo',
      component: Nuevo_dispositivo,
      meta: { requiresAuth: true }
    }
  ]
})

// ===========================================
// GUARD DE NAVEGACIÓN (NAVIGATION GUARD)
// ===========================================

/**
 * Guard global que se ejecuta antes de cada navegación
 * Verifica si el usuario está autenticado para rutas protegidas
 */
router.beforeEach(async (to, from, next) => {
  // Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Si la ruta no requiere autenticación, permitir acceso
  if (!requiresAuth) {
    // Si el usuario ya está autenticado y trata de acceder al login o registro, redirigir al inicio
    if ((to.path === '/inicio-sesion' || to.path === '/registro') && authService.isAuthenticated()) {
      next('/Inicio');
    } else {
      next();
    }
    return;
  }

  // Si la ruta requiere autenticación, verificar si el usuario está logueado
  if (authService.isAuthenticated()) {
    // Verificar si el token sigue siendo válido
    const isValidToken = await authService.verifyToken();
    if (isValidToken) {
      next(); // Permitir acceso
    } else {
      // Token inválido, redirigir al login
      next('/inicio-sesion');
    }
  } else {
    // Usuario no autenticado, redirigir al login
    next('/inicio-sesion');
  }
});

// Exporta la instancia del router para ser utilizada en main.js
export default router