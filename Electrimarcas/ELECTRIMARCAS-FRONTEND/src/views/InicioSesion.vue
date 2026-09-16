<template>
  <main class="login-container">
    <!-- Logo y título -->
    <header class="login-header">
      <img src="/electrimarcas.png" alt="Electri Marcas Logo" class="logo">
      <h1>Electri Marcas</h1>
      <p>Gestiona el consumo eléctrico de tus dispositivos</p>
    </header>

    <!-- Formulario de inicio de sesión -->
    <section class="login-form-container">
      <form @submit.prevent="iniciarSesion" class="login-form">
        <h2>Iniciar Sesión</h2>
        
        <!-- Campo de email -->
        <fieldset class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            required 
            placeholder="usuario@ejemplo.com"
            :class="{ 'error': errors.email }"
          >
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </fieldset>

        <!-- Campo de contraseña -->
        <fieldset class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password" 
            required 
            placeholder="••••••••"
            :class="{ 'error': errors.password }"
          >
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </fieldset>

        <!-- Recordar usuario -->
        <fieldset class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.recordar">
            <span class="checkmark"></span>
            Recordar mi sesión
          </label>
        </fieldset>

        <!-- Botón de envío -->
        <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>

        <!-- Enlaces adicionales -->
        <footer class="form-footer">
          <a href="#" @click.prevent="mostrarRecuperacion">¿Olvidaste tu contraseña?</a>
          <span>|</span>
          <router-link to="/registro">Crear cuenta nueva</router-link>
        </footer>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService.js'

const router = useRouter()

// Estado reactivo del formulario
const formData = reactive({
  email: '',
  password: '',
  recordar: false
})

// Estado de errores
const errors = reactive({
  email: '',
  password: ''
})

// Estado de carga
const isLoading = ref(false)

/**
 * Función para validar el formulario
 */
const validarFormulario = () => {
  let esValido = true
  
  // Limpiar errores previos
  errors.email = ''
  errors.password = ''
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    errors.email = 'El correo electrónico es requerido'
    esValido = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Ingresa un correo electrónico válido'
    esValido = false
  }
  
  // Validar contraseña
  if (!formData.password) {
    errors.password = 'La contraseña es requerida'
    esValido = false
  } else if (formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    esValido = false
  }
  
  return esValido
}

/**
 * Función para iniciar sesión
 */
const iniciarSesion = async () => {
  if (!validarFormulario()) return
  
  isLoading.value = true
  
  try {
    // Llamar al servicio de autenticación
    const result = await authService.login(formData.email, formData.password)
    
    if (result.success) {
      // Guardar preferencia de recordar sesión
      if (formData.recordar) {
        localStorage.setItem('recordar_sesion', 'true')
      }
      
      // Redirigir al dashboard principal
      router.push('/Inicio')
    } else {
      // Mostrar error de credenciales
      errors.email = result.message || 'Credenciales incorrectas'
    }
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    errors.email = 'Error de conexión. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Función para mostrar recuperación de contraseña
 */
const mostrarRecuperacion = () => {
  // Aquí puedes abrir un modal o redirigir a otra vista
  alert('Función de recuperación de contraseña')
}
</script>

<style scoped>
/* Contenedor principal */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* Header con logo */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* Contenedor del formulario */
.login-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

/* Formulario */
.login-form {
  padding: 2.5rem;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 600;
}

/* Grupos de campos */
.form-group {
  margin-bottom: 1.5rem;
  border: none;
  padding: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f7fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #e53e3e;
  background-color: #fed7d7;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Checkbox personalizado */
.checkbox-group {
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Botón de login */
.login-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Footer del formulario */
.form-footer {
  text-align: center;
  font-size: 0.9rem;
  color: #718096;
}

.form-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.form-footer a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.form-footer span {
  margin: 0 0.5rem;
  color: #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .login-form {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    max-width: 100%;
  }
  
  .login-header h1 {
    font-size: 1.8rem;
  }
  
  .login-header p {
    font-size: 1rem;
  }
}
</style>