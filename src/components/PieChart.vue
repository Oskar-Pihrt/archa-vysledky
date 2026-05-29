<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { colorAt } from '../lib/palette.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({ options: { type: Array, required: true } })

const chartData = computed(() => ({
  labels: props.options.map((o) => o.label),
  datasets: [
    {
      data: props.options.map((o) => o.count),
      backgroundColor: props.options.map((_, i) => colorAt(i)),
      borderColor: '#fff',
      borderWidth: 1,
    },
  ],
}))

const total = computed(() => props.options.reduce((s, o) => s + o.count, 0))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { boxWidth: 14, font: { size: 13 }, padding: 12 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed
          const pct = total.value ? ((val / total.value) * 100).toFixed(1) : 0
          return ` ${ctx.label}: ${val} (${pct}%)`
        },
      },
    },
  },
}
</script>

<template>
  <div class="chart-box">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
  height: 280px;
  width: 100%;
}
</style>
