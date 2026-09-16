<template>
  <section class="Acercade">
    <h1>Acerca de la App</h1>
    <p>
      Esta aplicación está diseñada para ayudarte a conocer y controlar tu consumo eléctrico en el hogar.
    </p>

    <Card
      description="Fue creada para facilitar a los usuarios el cálculo del consumo eléctrico de sus aparatos domésticos. 
      A través de una interfaz sencilla, permite ingresar datos como potencia, tiempo de uso y tarifa eléctrica, 
      ofreciendo un estimado del consumo en kWh y del costo mensual aproximado. 

      El objetivo es ayudar a las familias a comprender mejor su gasto energético, identificar los dispositivos 
      que más consumen y fomentar hábitos de ahorro de energía.

      ⚠️ Nota: Los resultados son estimaciones y pueden variar de acuerdo con la compañía de electricidad y las condiciones reales de uso."
      :showConfigure="false"
      :showAdd="false"
      :showDelete="false"
      backgroundColor1="#e0f2fe"
    />
  </section>
</template>

<script>
import Card from "../components/Card.vue";
export default {
  name: "Acercade",
  components: { Card },
};
</script>

<style scoped>
.Acercade {
  max-width: 750px;
  width: 100%;
  padding: 2rem;
  text-align: left;
}

.Acercade h1 {
  margin-bottom: 0.5rem;
}

.Acercade p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

/* === Corrección visual SIN tocar el componente === */

/* Si no hay imagen, ocultamos el contenedor y eliminamos el hueco */
:deep(.card-imagen:empty) {
  display: none !important;
}

/* Asegura que el layout deje de reservar espacio lateral */
:deep(.card) {
  display: block !important;       /* en lugar de flex para evitar el gap */
  border-radius: 12px;
  box-sizing: border-box;
  padding-left: 63px;
}

/* Contenido ocupa todo el ancho sin margen izquierdo */
:deep(.card-content) {
  margin-left: 0 !important;
  width: 100% !important;
}

/* Texto de descripción con buena lectura y justificado */
:deep(.card-description) {
  font-size: 1.12rem;
  line-height: 1.7;
  color: #1e293b;
  text-align: justify;
  white-space: pre-line;
  font-weight: 500;
  margin: 0;
}

/* Espaciado antes de la nota */
:deep(.card-description)::after {
  content: "";
  display: block;
  margin-top: 1rem;
}
</style>
