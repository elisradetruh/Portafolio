<template>
  <main class="register-container">
    <!-- Logo y título -->
    <header class="register-header">
      <img src="/electrimarcas.png" alt="Electri Marcas Logo" class="logo">
      <h1>Electri Marcas</h1>
      <p>Crear nueva cuenta</p>
    </header>

    <!-- Formulario de registro -->
    <section class="register-form-container">
      <form @submit.prevent="registrarUsuario" class="register-form">
        <h2>Registrarse</h2>
        
        <!-- Campo de nombre completo -->
        <fieldset class="form-group">
          <label for="nombre">Nombre Completo</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="formData.nombre" 
            required 
            placeholder="Ingresa tu nombre completo"
            :class="{ 'error': errors.nombre }"
          >
          <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
        </fieldset>

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

        <!-- Campo de confirmar contraseña -->
        <fieldset class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="formData.confirmPassword" 
            required 
            placeholder="••••••••"
            :class="{ 'error': errors.confirmPassword }"
          >
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </fieldset>

        <!-- Campo de municipio -->
        <fieldset class="form-group">
          <label for="municipio">Municipio</label>
          <select 
            id="municipio" 
            v-model="formData.municipio" 
            required 
            :class="{ 'error': errors.municipio }"
          >
            <option value="">Selecciona tu municipio</option>
            <option 
              v-for="municipio in municipios" 
              :key="municipio.id_municipio" 
              :value="municipio.id_municipio"
            >
              {{ municipio.municipio }}
            </option>
          </select>
          <span v-if="errors.municipio" class="error-message">{{ errors.municipio }}</span>
        </fieldset>

        <!-- Botón de envío -->
        <button type="submit" class="register-btn" :disabled="isLoading">
          <span v-if="isLoading">Creando cuenta...</span>
          <span v-else>Crear Cuenta</span>
        </button>

        <!-- Enlaces adicionales -->
        <footer class="form-footer">
          <p>¿Ya tienes cuenta? <router-link to="/inicio-sesion">Inicia sesión aquí</router-link></p>
        </footer>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService.js'

const router = useRouter()

// Estado reactivo del formulario
const formData = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  municipio: ''
})

// Estado de errores
const errors = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
  municipio: ''
})

// Estado de carga
const isLoading = ref(false)

// Lista de municipios
const municipios = ref([])

/**
 * Cargar municipios desde la API
 */
const cargarMunicipios = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/municipios')
    const data = await response.json()
    
    if (data.success) {
      municipios.value = data.data.sort((a, b) => a.id_municipio - b.id_municipio)
    } else {
      console.error('Error al cargar municipios:', data.message)
    }
  } catch (error) {
    console.error('Error al cargar municipios:', error)
  }
}

/**
 * Función para validar el formulario
 */
const validarFormulario = () => {
  let esValido = true
  
  // Limpiar errores previos
  Object.keys(errors).forEach(key => errors[key] = '')
  
  // Validar nombre
  if (!formData.nombre.trim()) {
    errors.nombre = 'El nombre completo es requerido'
    esValido = false
  } else if (formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
    esValido = false
  }
  
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
  
  // Validar confirmación de contraseña
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña'
    esValido = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    esValido = false
  }
  
  // Validar municipio
  if (!formData.municipio) {
    errors.municipio = 'Selecciona tu municipio'
    esValido = false
  }
  
  return esValido
}

/**
 * Función para registrar usuario
 */
const registrarUsuario = async () => {
  if (!validarFormulario()) return
  
  isLoading.value = true
  
  try {
    const result = await authService.register({
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      password: formData.password,
      id_municipio: parseInt(formData.municipio)
    })
    
    if (result.success) {
      // Mostrar mensaje de éxito
      alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.')
      
      // Redirigir al login
      router.push('/inicio-sesion')
    } else {
      // Mostrar error
      if (result.message.includes('ya existe')) {
        errors.email = result.message
      } else {
        alert('Error al crear la cuenta: ' + result.message)
      }
    }
    
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    alert('Error de conexión. Intenta nuevamente.')
  } finally {
    isLoading.value = false
  }
}

// Cargar municipios al montar el componente
onMounted(() => {
  cargarMunicipios()
})
</script>

<style scoped>
/* Contenedor principal */
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* Header con logo */
.register-header {
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

.register-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.register-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* Contenedor del formulario */
.register-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 450px;
}

/* Formulario */
.register-form {
  padding: 2.5rem;
}

.register-form h2 {
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

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f7fafc;
}

.form-group select {
  cursor: pointer;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #e53e3e;
  background-color: #fed7d7;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Botón de registro */
.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
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

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-header h1 {
    font-size: 2rem;
  }
  
  .register-form {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .register-form-container {
    max-width: 100%;
  }
  
  .register-header h1 {
    font-size: 1.8rem;
  }
  
  .register-header p {
    font-size: 1rem;
  }
}
</style>
