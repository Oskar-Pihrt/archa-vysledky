<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { colorAt } from '../lib/palette.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  options: { type: Array, required: true },
  // multi-select percentages are relative to respondents and can exceed 100
  respondents: { type: Number, default: 0 },
})

const chartData = computed(() => ({
  labels: props.options.map((o) => o.label),
  datasets: [
    {
      data: props.options.map((o) => o.count),
      backgroundColor: props.options.map((_, i) => colorAt(i)),
      borderRadius: 3,
      maxBarThickness: 38,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const opt = props.options[ctx.dataIndex]
          return ` ${ctx.parsed.x} (${opt.pct.toFixed(1)}%)`
        },
      },
    },
  },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { ticks: { font: { size: 13 }, autoSkip: false } },
  },
}))

// height scales with number of bars
const height = computed(() => Math.max(160, props.options.length * 42 + 40))
</script>

<template>
  <div class="chart-box" :style="{ height: height + 'px' }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
  width: 100%;
}
</style>
