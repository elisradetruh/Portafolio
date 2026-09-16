<template>
  <div class="buscador">
    <input
      type="text"
      v-model="query"
      :placeholder="placeholder"
      class="input-buscar"
    />
  </div>
</template>

<script>
export default {
  name: "Buscador",
  props: {
    placeholder: {
      type: String,
      default: "Escribe para buscar..."
    },
    modelValue: {
      type: String,
      default: ""
    }
  },
  computed: {
    query: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit("update:modelValue", value)
      }
    }
  }
}
</script>

<style scoped>
.input-buscar {
  width: 780px;
  max-height: 50vh;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom:20px;
}
</style>
