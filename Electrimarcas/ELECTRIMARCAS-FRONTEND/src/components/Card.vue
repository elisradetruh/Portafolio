<template>
  <section class="card" :style="{background: $backgroundColor1  }">
    <article class="card-imagen">
        <img v-if="image" :src="image" alt="Card Image" class="card-image" />
    </article>
    <article class="card-content">
      <h2 class="card-title">{{ title }}</h2>
      <p class="card-description">{{ description }}</p>
    </article>
    <section class="card-actions">
        <article class="card-boton" v-if="showConfigure">
            <button class="btn-configurar" @click="$emit('configurar')">Configurar</button>
        </article>
        <article class="boton" v-if="showDelete">
            <button class="boton-eliminar"@click="$emit('eliminar')">{{ buttonText }}</button>
        </article>
        <article class="card-boton" v-if="showAdd">
            <button class="btn-agregar" @click="$emit('agregar')">{{ buttonText }}</button>
        </article>
    </section>
  </section>
</template>

<script>
export default {
  name: "Card",
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    modelo: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    buttonText: {
      type: String,
      default: null
    },
    backgroundColor1:{
      type:String,
      default:"white"
    },
    showConfigure: {
      type: Boolean,
      default: false
    },
    showAdd: {
      type: Boolean,
      default: false
    },
    showDelete: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 10px;
  width: 100%;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  display: flex;
  max-width: 700px;
  border-left: 4px solid #4ec145;
}

.card-imagen{
  flex: 0 0 80px;
  max-width: 200px;
  padding: 10px;
  background-color: white;
  border-radius: 10px;
}

.card-content{
  width: 70%;
  margin-left: 1em;
}   

.card:hover {
  transform: scale(1.05);
}

.card-image {
  width: 100%;
  border-radius: 10px;
}
.card-title {
  font-size: 1.2rem;
  margin-top: 20px;
  margin-bottom: 2px;
  color: #2c3e50;
}
.card-description {
  font-size: 0.9rem;
  color: #2c3e50;
  width: 90%;

}
.card-actions {
  margin-top: 15px;
  text-align: right;
}
button {
  padding: 6px 12px;
  margin-top: 25%;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background: linear-gradient(135deg, #126831, #16a34a);
  
}

.boton-eliminar{
  background: red;
}

.boton-eliminar:hover{
  background: rgb(154, 3, 3);
}

</style>
