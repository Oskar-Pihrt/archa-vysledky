<script setup>
import PieChart from './PieChart.vue'
import BarChart from './BarChart.vue'

defineProps({ question: { type: Object, required: true } })
</script>

<template>
  <section class="card">
    <h2 class="q-title">{{ question.title }}</h2>
    <p class="q-count">{{ question.responses }} responses</p>

    <PieChart v-if="question.type === 'pie'" :options="question.options" />

    <BarChart
      v-else-if="question.type === 'bar' || question.type === 'multi'"
      :options="question.options"
      :respondents="question.responses"
    />

    <ul v-else class="answer-list">
      <li v-for="(a, i) in question.answers" :key="i" class="answer-item">
        {{ a }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  padding: 24px;
  margin: 0 0 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.q-title {
  font-size: 1rem;
  font-weight: 500;
  color: #202124;
  margin: 0 0 4px;
}
.q-count {
  font-size: 0.8rem;
  color: #5f6368;
  margin: 0 0 18px;
}
.answer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.answer-item {
  background: #f1f3f4;
  border-radius: 4px;
  padding: 12px 14px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #202124;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
