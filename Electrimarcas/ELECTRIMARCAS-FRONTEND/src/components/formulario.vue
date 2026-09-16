

<template>
	<!-- Modal semántico para añadir dispositivo -->
	<aside v-if="visible" class="form-modal-overlay" @click.self="close">
		<section class="form-modal">
			<header class="form-header">
				<h2>Añadir Dispositivo</h2>
				<button class="close-btn" @click="close">
					<span class="material-icons">close</span>
				</button>
			</header>
			<form @submit.prevent="submitForm" class="form-body">
				<article class="form-group">
					<label for="nombre">Nombre del dispositivo *</label>
					<input v-model="form.nombre" id="nombre" type="text" required placeholder="Ej. Refrigerador" />
				</article>
				<article class="form-group">
					<label for="marca">Marca *</label>
					<input v-model="form.marca" id="marca" type="text" required placeholder="Ej. Samsung, LG, Whirlpool" />
				</article>
				<article class="form-group">
				<label for="modelo">Modelo *</label>
				<input v-model="form.modelo" id="modelo" type="text" required placeholder="Ej. RT35K5930SL" />
			</article>
			<article class="form-group">
					<label for="categoria">Categoría *</label>
					<select v-model="form.categoria" id="categoria" required>
						<option value="" disabled>Selecciona una categoría</option>
						<option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
					</select>
				</article>
				<article class="form-group">
					<label for="voltaje">Voltaje (V) *</label>
					<input v-model="form.voltaje" id="voltaje" type="number" min="0" required placeholder="Ej. 120 V" />
				</article>
				<article class="form-group">
					<label for="potencia">Potencia (W) *</label>
					<input v-model="form.potencia" id="potencia" type="number" min="0" required placeholder="Ej. 150 W" />
				</article>
				<article class="form-group">
					<label for="descripcion">Descripción (Opcional)</label>
					<textarea v-model="form.descripcion" id="descripcion" rows="2" placeholder="Información adicional del dispositivo"></textarea>
				</article>
				<footer class="form-footer">
					<button type="submit" class="submit-btn">Añadir</button>
				</footer>
			</form>
		</section>
	</aside>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	},
	categorias: {
		type: Array,
		default: () => [
			'Cocina',
			'Limpieza',
			'Entretenimiento',
			'Climatización',
			'Cuidado Personal'
		]
	}
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
	nombre: '',
	marca: '',
	modelo: '',
	categoria: '',
	voltaje: '',
	potencia: '',
	descripcion: ''
})

// Obtener el año actual para validación
const currentYear = new Date().getFullYear()

function resetForm() {
    form.nombre = ''
    form.marca = ''
    form.modelo = ''
    form.categoria = '' 
    form.voltaje = ''
    form.potencia = ''
    form.descripcion = ''
}

function close() {
	resetForm()
	emit('close')
}

function submitForm() {
	// Validación de campos requeridos
	if (!form.nombre || !form.marca || !form.modelo || !form.categoria || !form.voltaje || !form.potencia) {
		alert('Por favor completa todos los campos obligatorios (*)');
		return;
	}
	
	// Validar que voltaje y potencia sean números positivos
	if (form.voltaje <= 0 || form.potencia <= 0) {
		alert('El voltaje y la potencia deben ser valores mayores a 0');
		return;
	}
	
	emit('submit', { ...form })
	// Limpiar formulario
	form.nombre = ''
	form.marca = ''
	form.modelo = ''
	form.categoria = ''
	form.voltaje = ''
	form.potencia = ''
	form.descripcion = ''
	close()
}
</script>

<style scoped>
.form-modal-overlay {
	position: fixed;
	top: 0; left: 0; right: 0; bottom: 0;
	background: rgba(0,0,0,0.4);
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
}
.form-modal {
	background: #fff;
	border-radius: 1rem;
	box-shadow: 0 4px 24px rgba(0,0,0,0.18);
	width: 100%;
	max-width: 400px;
	padding: 2rem 1.5rem 1rem 1.5rem;
	position: relative;
	animation: fadeIn 0.2s;
}
@keyframes fadeIn {
	from { opacity: 0; transform: scale(0.95); }
	to { opacity: 1; transform: scale(1); }
}
.form-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}
.form-header h2 {
	font-size: 1.2rem;
	margin: 0;
}
.close-btn {
	background: none;
	border: none;
	color: #888;
	font-size: 1.5rem;
	cursor: pointer;
	border-radius: 50%;
	padding: 0.3rem;
	transition: background 0.2s;
}
.close-btn:hover {
	background: #eee;
}
.form-body {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.form-group {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
}
.form-group label {
	font-weight: 500;
	color: #333;
}
.form-group input,
.form-group select,
.form-group textarea {
	padding: 0.5rem;
	border-radius: 0.4rem;
	border: 1px solid #ccc;
	font-size: 1rem;
}
.form-footer {
	display: flex;
	justify-content: flex-end;
	margin-top: 1rem;
}
.submit-btn {
	background: var(--primary, #4ec145);
	color: #fff;
	border: none;
	border-radius: 0.5rem;
	padding: 0.6rem 1.2rem;
	font-size: 1rem;
	cursor: pointer;
	transition: background 0.2s;
}
.submit-btn:hover {
	background: #3ea832;
}
</style>
