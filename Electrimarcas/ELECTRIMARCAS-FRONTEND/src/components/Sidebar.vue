<template>
    <!-- Sidebar principal de la aplicación -->
    <aside :class="`${is_expanded && 'is-expanded'}`">
        <!-- Header con el logo de la aplicación -->
        <header class="logo">
            <img src="../assets/electrimarcas.png" alt="Electri Marcas Logo">
        </header>

        <!-- Botón para expandir/contraer el menú -->
        <nav class="menu-toggle-wrap">
            <button class="menu-toggle" @click="ToggleMenu">
                <span class="material-icons">dehaze</span>
            </button>
        </nav>

        <!-- Título de la sección de menú -->
        <h3>Menu</h3>
        
        <!-- Navegación principal con enlaces a las diferentes secciones -->
        <nav class="menu">
            <!-- Enlace a la página de inicio -->
            <router-link class="button" to="/Inicio">
                <span class="material-icons">home</span>
                <span class="text">Inicio</span>
            </router-link>

            <!-- Enlace a la sección de dispositivos del usuario -->
            <!-- <router-link class="button" to="/mis-dispositivos">
                <span class="material-icons">devices</span>
                <span class="text">Mis Dispositivos</span>
            </router-link> -->

            <!-- Enlace a información sobre la aplicación -->
            <router-link class="button" to="/estadisticas">
                <span class="material-icons">description</span>
                <span class="text">Estadisticas</span>
            </router-link>

           
            <router-link class="button" to="/Consejos-de-Ahorro">
                <span class="material-icons">group</span>
                <span class="text">Consejos de Ahorro</span>
            </router-link>

            
            <router-link class="button" to="/Acerca-de">
                <span class="material-icons">help_outline</span>
                <span class="text">Acerca de la app</span>
            </router-link>

            <!-- Botón para cerrar sesión -->
            <!-- (ÚNICO CAMBIO AQUÍ: usar openLogoutConfirm en lugar de cerrarSesion directo) -->
            <button class="button logout-btn" @click="openLogoutConfirm">
                <span class="material-icons">logout</span>
                <span class="text">Cerrar Sesión</span>
            </button>
        </nav>
    </aside>

    <!-- ====== AÑADIDO: Modal de confirmación de Cerrar sesión ====== -->
    <div v-if="showConfirmLogout" class="logout-modal-overlay" tabindex="-1" @keydown.esc="cancelLogout">
      <div class="logout-modal-card" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <h3 id="logout-title">Confirmar cierre de sesión</h3>
        <p>¿Deseas salir de tu cuenta ahora?<br>Podrás volver a iniciar sesión cuando quieras.</p>
        <div class="logout-modal-buttons">
          <button class="btn-cancel" @click="cancelLogout" autofocus>Cancelar</button>
          <button class="btn-logout" @click="confirmLogout">Cerrar sesión</button>
        </div>
      </div>
    </div>
</template>

<script setup>
	// Importamos funciones de Vue necesarias:
	// ref -> para crear variables reactivas
	// onMounted -> se ejecuta cuando el componente se monta en el DOM
	// onBeforeUnmount -> se ejecuta justo antes de desmontar el componente
	// watch -> observa cambios en variables reactivas
	import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
	import { useRouter } from 'vue-router'
	import authService from '../services/authService.js'

	// Variable reactiva que controla si el sidebar está expandido o no
	const is_expanded = ref(false)
	const router = useRouter()

	// Función que alterna el estado del sidebar (expandido <-> contraído)
	const ToggleMenu = () => {
		is_expanded.value = !is_expanded.value
	}

	// Función para cerrar sesión (SE MANTIENE IGUAL)
	const cerrarSesion = async () => {
		try {
			await authService.logout()
			router.push('/inicio-sesion')
		} catch (error) {
			console.error('Error al cerrar sesión:', error)
		}
	}

	/* ============================================================
	NUEVO BLOQUE:
	Esta función ajusta las clases del <body> según el estado del sidebar.
	Así logramos que el contenido principal se mueva a la derecha
	cuando el sidebar está fijo y visible.
	============================================================ */
	const applyBodySpacing = (expanded) => {
	// Agrega una clase base que indica que el body tiene un sidebar activo
	document.body.classList.add('with-sidebar')

	// Alterna la clase "sidebar-expanded" dependiendo del estado del menú:
	// - true  → el sidebar está abierto (ancho grande)
	// - false → el sidebar está cerrado (ancho pequeño)
	document.body.classList.toggle('sidebar-expanded', !!expanded)
	}

	// onMounted(): se ejecuta al montar el componente.
	// Llamamos a applyBodySpacing() para aplicar las clases iniciales
	// (por si el sidebar inicia expandido o no).
	onMounted(() => {
	applyBodySpacing(is_expanded.value)
	})

	// onBeforeUnmount(): se ejecuta antes de desmontar el componente.
	// Aquí eliminamos las clases del <body> para evitar que queden activas
	// si el componente se destruye (por ejemplo, al cambiar de página).
	onBeforeUnmount(() => {
	document.body.classList.remove('with-sidebar', 'sidebar-expanded')
	})

	// watch(): observa la variable reactiva is_expanded.
	// Cada vez que cambie su valor (por un clic en el botón),
	// vuelve a ejecutar applyBodySpacing() para actualizar el layout del body.
	watch(is_expanded, (v) => applyBodySpacing(v))

  // ====== AÑADIDO: Estado y handlers del modal de Cerrar sesión ======
  const showConfirmLogout = ref(false)

  const openLogoutConfirm = () => {
    showConfirmLogout.value = true
    // dar foco al overlay para que funcione ESC
    requestAnimationFrame(() => {
      document.querySelector('.logout-modal-overlay')?.focus()
    })
  }

  const cancelLogout = () => {
    showConfirmLogout.value = false
  }

  // Reutiliza tu cerrarSesion original cuando confirma
  const confirmLogout = async () => {
    await cerrarSesion()
    showConfirmLogout.value = false
  }
</script>
    
<style lang="scss" scoped>
    /* ===========================================
       CONTENEDOR PRINCIPAL DEL SIDEBAR
       =========================================== */
		aside {
			/* Layout flexbox vertical para organizar elementos */
			display: flex;
			flex-direction: column;
			
			/* Colores de fondo y texto */
			background-color: var(--dark);
			color: var(--light);
			
			/* Ancho inicial del sidebar (contraído) */
			width: calc(2rem + 32px);
			
			/* Ocultar contenido que se desborde */
			overflow: hidden;
			
			/* Altura mínima de toda la pantalla */
			min-height: 100vh;
			
			/* Espaciado interno */
			padding: 1rem;
			
			/* Transición suave para el cambio de ancho */
			transition: width 0.2s ease-in-out;
			
			/* ===========================================
			   SIDEBAR
			   ===========================================*/

			/* Mantiene el sidebar SIEMPRE visible aunque hagas scroll */
			position: fixed;   /* Fixed sirve para 

			/* Lo “pega” al borde superior de la ventana */
			top: 0;

			/* Lo “pega” al borde izquierdo de la ventana */
			left: 0;

			/* Hace que el sidebar quede por encima del contenido general
			(evita que otros elementos lo tapen) */
			z-index: 99;

			/* Asegura que cubra toda la altura de la pantalla */
			height: 100vh;


			/* Estado expandido del sidebar */
			&.is-expanded {
				width: var(--sidebar-width);
			}

			/* ===========================================
			   RESPONSIVE DESIGN - TABLETS
			   =========================================== */
			@media (max-width: 1024px) {
				/* En tablets, el sidebar se vuelve fijo */
				position: fixed;
				top: 0;
				left: 0;
				z-index: 99;
				height: 100vh;
				width: calc(2rem + 32px);
				
				/* Estado expandido en tablets */
				&.is-expanded {
					width: var(--sidebar-width);
					/* Sombra para dar profundidad */
					box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
				}
			}
			
			/* ===========================================
			   RESPONSIVE DESIGN - MÓVILES GRANDES
			   =========================================== */
			@media (max-width: 768px) {
				&.is-expanded {
					width: 280px;
				}
			}
			
			/* ===========================================
			   RESPONSIVE DESIGN - MÓVILES PEQUEÑOS
			   =========================================== */
			@media (max-width: 480px) {
				&.is-expanded {
					/* En móviles pequeños, ocupa toda la pantalla */
					width: 100vw;
				}
			}
			/* ===========================================
			   ELEMENTOS FLEXIBLES
			   =========================================== */
			.flex {
				/* Permite que el elemento crezca y se contraiga */
				flex: 1 1 0%;
			}

			/* ===========================================
			   LOGO DEL SIDEBAR
			   =========================================== */
			.logo {
				/* Espacio inferior para separar del siguiente elemento */
				margin-bottom: 1rem;

				img {
					/* Tamaño fijo para el logo */
					width: 2rem;
				}
			}

			/* ===========================================
			   BOTÓN DE TOGGLE (EXPANDIR/CONTRAR)
			   =========================================== */
			.menu-toggle-wrap {
				/* Layout flexbox para alinear el botón a la derecha */
				display: flex;
				justify-content: flex-end;
				margin-bottom: 1rem;

				/* Posicionamiento relativo para animaciones */
				position: relative;
				top: 0;
				transition: 0.2s ease-in-out;

				.menu-toggle {
					/* Transición suave para el botón */
					transition: 0.2s ease-in-out;
					
					.material-icons {
						/* Estilos para el icono de doble flecha */
						font-size: 2rem;
						color: var(--light);
						transition: 0.2s ease-out;
					}
					
					/* Efecto hover: cambia color y se mueve */
					&:hover {
						.material-icons {
							color: var(--primary);
							transform: translateX(0.5rem);
						}
					}
				}
			}

			/* ===========================================
			   TÍTULO Y TEXTO DE LOS BOTONES
			   =========================================== */
			h3, .button .text {
				/* Inicialmente ocultos (se muestran al expandir) */
				opacity: 0;
				transition: opacity 0.3s ease-in-out;
			}

			h3 {
				/* Estilos para el título "Menu" */
				color: var(--grey);
				font-size: 0.875rem;
				margin-bottom: 0.5rem;
				text-transform: uppercase;
			}

			/* ===========================================
			   MENÚ DE NAVEGACIÓN
			   =========================================== */
			.menu {
				/* Margen negativo para que los botones toquen los bordes */
				margin: 0 -1rem;

				.button {
					/* Layout flexbox para alinear icono y texto */
					display: flex;
					align-items: center;
					text-decoration: none;

					/* Transición suave para todos los cambios */
					transition: 0.2s ease-in-out;
					padding: 0.5rem 1rem;

					.material-icons {
						/* Estilos para los iconos de Material Design */
						font-size: 2rem;
						color: var(--light);
						transition: 0.2s ease-in-out;
					}
					
					.text {
						/* Estilos para el texto de los botones */
						color: var(--light);
						transition: 0.2s ease-in-out;
						font-size: 1rem;
					}

					/* Efecto hover: cambia fondo y colores */
					&:hover {
						background-color: var(--dark-alt);

						.material-icons, .text {
							color: var(--primary);
						}
					}

					/* Estado activo: indica la página actual */
					&.router-link-exact-active {
						background-color: var(--dark-alt);
						border-right: 5px solid var(--primary);

						.material-icons, .text {
							color: var(--primary);
						}
					}
				}

				/* Estilos específicos para el botón de cerrar sesión */
				.button.logout-btn {
					width: 100%;
					border: 0;
					background: transparent;
					text-align: left;
					cursor: pointer;
				}

				.button.logout-btn:hover {
					background: var(--dark-alt);    
				}

				.button.logout-btn:hover .material-icons,
				.button.logout-btn:hover .text {
					color: var(--primary);              
				}

				/* Estado activo: indica la página actual */
				&.router-link-exact-active {
					background-color: var(--dark-alt);
					border-right: 5px solid var(--primary);

					.material-icons, .text {
						color: var(--primary);
					}
				}
			}
			
			

			/* ===========================================
			   FOOTER (NO UTILIZADO ACTUALMENTE)
			   =========================================== */
			.footer {
				/* Oculto por defecto */
				opacity: 0;
				transition: opacity 0.3s ease-in-out;

				p {
					font-size: 0.875rem;
					color: var(--grey);
				}
			}

			/* ===========================================
			   ESTADOS ESPECIALES DEL SIDEBAR EXPANDIDO
			   =========================================== */
			&.is-expanded {
				/* Ancho completo cuando está expandido */
				width: var(--sidebar-width);

				.menu-toggle-wrap {
					/* Mueve el botón hacia arriba */
					top: -3rem;
					
					.menu-toggle {
						/* Rota el icono 180 grados */
						transform: rotate(-180deg);
					}
				}

				/* Muestra el título y texto de los botones */
				h3, .button .text {
					opacity: 1;
				}

				.button {
					.material-icons {
						/* Añade margen derecho para separar icono del texto */
						margin-right: 1rem;
					}
				}

				.footer {
					/* Mantiene el footer oculto */
					opacity: 0;
				}
			}

			
		}
	
/* ===== Modal confirmación Cerrar Sesión (AÑADIDO) ===== */
.logout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  outline: none;
}

.logout-modal-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  text-align: center;
  animation: fadeIn 0.25s ease;
}

.logout-modal-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.logout-modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-logout {
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

/* Cancelar resaltado para retención */
.btn-cancel {
//   background-color: #ffffff;
  background-color: var(--primary);
//   color: #2c3e50;
  color: #fff;
  border: 2px solid var(--primary);
  font-weight: 600;
  box-shadow: 0 0 4px rgba(0,0,0,0.05);
}
.btn-cancel:hover {
  background-color: var(--primary);
  color: #fff;
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
}

.btn-logout {
  background-color: #ffffff;
  color: #2c3e50;
  border: 2px solid #c0392b; 
  font-weight: 600;
  box-shadow: 0 0 4px rgba(0,0,0,0.05);	
}
.btn-logout:hover {
  background-color: #c0392b;
  color: #fff; 
  box-shadow: 0 0 8px rgba(0,0,0,0.5);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
</style>

<style>
	:root {
	/* usa tu mismo ancho expandido ya definido en el SCSS */
	--sidebar-width: var(--sidebar-width);
	/* ancho cuando el sidebar está contraído (el que ya usas en aside) */
	--sidebar-collapsed-width: calc(2rem + 32px);
	}

	/* Reserva de espacio para TODO el contenido cuando existe sidebar */
	body.with-sidebar {
	margin-left: var(--sidebar-collapsed-width);
	transition: margin-left .2s ease-in-out;
	}

	/* Cuando se expande el sidebar, aumenta el margen del contenido */
	body.with-sidebar.sidebar-expanded {
	margin-left: var(--sidebar-width);
	}
</style>
