<template>
  <Bar
    id="my-chart-id"
    :options="chartOptions"
    :data="chartData"
  />
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: { Bar },
  // 1. Definir los props que recibirá del componente padre (Vista)
  props: {
    chartData: {
      type: Object,
      required: true // El componente principal debe enviar estos datos
    },
    chartOptions: {
      type: Object,
      default: () => ({ responsive: true, maintainAspectRatio: false })
    }
  }
  
}
</script>