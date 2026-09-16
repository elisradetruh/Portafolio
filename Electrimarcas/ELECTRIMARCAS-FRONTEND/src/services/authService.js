// services/authService.js
const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
    console.log('🚀 AuthService initialized:', {
      hasToken: !!this.token,
      hasUser: !!this.user
    });
  }

  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token y datos del usuario
        this.token = data.data.token;
        this.user = data.data.user;
        
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.user));
        
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const hasToken = !!this.token;
    console.log('🔐 Auth Check:', {
      hasToken,
      token: this.token ? 'Present' : 'Missing',
      user: this.user ? 'Present' : 'Missing'
    });
    return hasToken;
  }

  /**
   * Refrescar el estado desde localStorage
   */
  refreshState() {
    this.token = localStorage.getItem('auth_token');
    this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
    console.log('🔄 AuthService refreshed:', {
      hasToken: !!this.token,
      hasUser: !!this.user
    });
  }

  /**
   * Obtener token de autorización
   */
  getAuthHeader() {
    return this.token ? `Bearer ${this.token}` : null;
  }

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Verificar token con el servidor
   */
  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        this.user = data.data.user;
        localStorage.setItem('user_data', JSON.stringify(this.user));
        return true;
      } else {
        // Token inválido, limpiar datos
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Hacer petición autenticada
   */
  async authenticatedRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }
}

// Crear instancia singleton
const authService = new AuthService();
export default authService;
