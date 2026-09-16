<template>
  <aside v-if="visible" class="form-modal-overlay" @click.self="$emit('close')">
    <section class="form-modal">
      <header class="form-header">
        <h2>Configurar uso</h2>
        <button class="close-btn" @click="$emit('close')">
          <span class="material-icons">close</span>
        </button>
      </header>
      <form @submit.prevent="onSubmit" class="form-body">
        <article class="form-group">
          <label>Dispositivo</label>
          <input :value="device?.title || ''" disabled />
        </article>
        <article class="form-group">
          <label>Descripción</label>
          <textarea :value="device?.description || ''" rows="2" disabled></textarea>
        </article>
        <article class="form-group">
          <label>Potencia (W)</label>
          <input v-model.number="local.potencia" type="number" min="0" disabled readonly />
          <small>Valor de potencia establecido por catálogo</small>
        </article>
        <article class="grid">
          <div class="form-group">
            <label>Cantidad</label>
            <input v-model.number="local.cantidad" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>Horas por día</label>
            <input v-model.number="local.horasUsoPorDia" type="number" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>Días por semana</label>
            <input v-model.number="local.diasUsoPorSemana" type="number" min="1" max="7" />
          </div>
        </article>
        <footer class="form-footer">
          <button type="submit" class="submit-btn">Guardar</button>
        </footer>
      </form>
    </section>
  </aside>
  
</template>

<script setup>
import { computed, reactive, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  device: { type: Object, default: null }
})

const emit = defineEmits(['close','save'])

const local = reactive({ cantidad: 1, horasUsoPorDia: 1, diasUsoPorSemana: 7, potencia: 0 })

watch(() => props.device, (d) => {
  if (!d) return;
  // Inicializar con valores existentes
  local.cantidad = d.cantidad ?? 1
  local.horasUsoPorDia = d.horasUsoPorDia ?? 1
  local.diasUsoPorSemana = d.diasUsoPorSemana ?? 7

  // Determinar potencia según el dispositivo (catálogo o descripción)
  let pot = d.potencia
  if ((!pot || typeof pot !== 'number') && typeof d.description === 'string') {
    const m = d.description.match(/Potencia:\s*(\d+)W/i) || d.description.match(/(\d+)\s*W/i)
    if (m) { pot = Number(m[1]); }
  }
  local.potencia = typeof pot === 'number' ? pot : 0
}, { immediate: true })

function onSubmit(){
  emit('save', { ...local })
}
</script>

<style scoped>
.form-modal-overlay {
  position: fixed; 
  inset: 0; 
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
  max-width: 800px;
  padding: 1.5rem;
}
.form-header { 
  display: flex; 
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 1rem; 
}
.close-btn {
  background: none;
  border: none; 
  font-size: 1.5rem; 
  cursor: pointer; 
  color: #666; 
}
.form-body { 
  display: flex; 
  flex-direction: column;
  gap: 0.8rem; 
}
.form-group {
  display: flex;
  flex-direction: column; 
  gap: 0.3rem; 
}
.form-group input, .form-group textarea { 
  border: 1px solid #ccc;
  border-radius: 8px; 
  padding: 0.5rem; 
  font-size: 1rem; 
}
.form-footer {
  display:flex; 
  justify-content: flex-end;
  margin-top: 0.5rem;
}
.submit-btn { 
  background: var(--primary, #4ec145);
  color: #fff; border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer; 
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  gap: 0.8rem; 
}
</style>



