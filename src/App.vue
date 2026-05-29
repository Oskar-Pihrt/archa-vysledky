<script setup>
import { ref, onMounted } from 'vue'
import { parseWorkbook } from './lib/parse.js'
import { decryptData } from './lib/crypto.js'
import { pageTitle, pageSubtitle, encryptedUrl } from './config.js'
import QuestionCard from './components/QuestionCard.vue'

const questions = ref([])
const responseCount = ref(0)
const unlocked = ref(false)

const encBuffer = ref(null) // raw encrypted bytes, fetched once
const fetchError = ref('') // data file missing / network problem
const password = ref('')
const gateError = ref('')
const busy = ref(false)

async function fetchEncrypted() {
  try {
    const url = import.meta.env.BASE_URL + encryptedUrl
    const res = await fetch(url)
    if (!res.ok) throw new Error('not found')
    encBuffer.value = await res.arrayBuffer()
  } catch (e) {
    fetchError.value =
      'Zašifrovaná data se nepodařilo načíst. Vytvoř je příkazem: node encrypt.mjs'
  }
}

async function unlock() {
  if (!password.value || busy.value || !encBuffer.value) return
  busy.value = true
  gateError.value = ''
  try {
    const decrypted = await decryptData(encBuffer.value, password.value)
    const result = parseWorkbook(decrypted)
    questions.value = result.questions
    responseCount.value = result.responseCount
    unlocked.value = true
    password.value = ''
  } catch (e) {
    gateError.value = 'Špatné heslo.'
  } finally {
    busy.value = false
  }
}

onMounted(fetchEncrypted)
</script>

<template>
  <!-- ── Password gate ─────────────────────────────────────────── -->
  <div v-if="!unlocked" class="gate-wrap">
    <form class="gate" @submit.prevent="unlock">
      <h1>{{ pageTitle }}</h1>
      <p class="gate-sub">{{ pageSubtitle }}</p>
      <p class="gate-hint">Pro zobrazení výsledků zadej heslo.</p>

      <input
        v-model="password"
        type="password"
        class="gate-input"
        placeholder="Heslo"
        autofocus
        :disabled="!!fetchError"
      />
      <button class="gate-btn" type="submit" :disabled="busy || !!fetchError">
        {{ busy ? 'Odemykám…' : 'Zobrazit výsledky' }}
      </button>

      <p v-if="gateError" class="gate-err">{{ gateError }}</p>
      <p v-if="fetchError" class="gate-err">{{ fetchError }}</p>
    </form>
  </div>

  <!-- ── Results ──────────────────────────────────────────────── -->
  <div v-else class="page">
    <header class="hero">
      <h1>{{ pageTitle }}</h1>
      <p class="subtitle">{{ pageSubtitle }}</p>
      <p v-if="responseCount" class="meta">
        {{ responseCount }} odpovědí · {{ questions.length }} otázek
      </p>
    </header>

    <main class="content">
      <QuestionCard v-for="(q, i) in questions" :key="i" :question="q" />
    </main>

    <footer class="foot">Vygenerováno z exportu Google Forms · ARCHA+</footer>
  </div>
</template>

<style scoped>
/* gate */
.gate-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.gate {
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.08);
  padding: 36px 32px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}
.gate h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #202124;
}
.gate-sub {
  color: #5f6368;
  margin: 4px 0 20px;
}
.gate-hint {
  color: #5f6368;
  font-size: 0.9rem;
  margin: 0 0 16px;
}
.gate-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid #dadce0;
  border-radius: 8px;
  margin-bottom: 12px;
}
.gate-input:focus {
  outline: none;
  border-color: #1a73e8;
}
.gate-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  color: #fff;
  background: #1a73e8;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.gate-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.gate-err {
  color: #c5221f;
  font-size: 0.88rem;
  margin: 14px 0 0;
}

/* results */
.page {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 16px 60px;
}
.hero {
  padding: 36px 0 24px;
}
.hero h1 {
  font-size: 2rem;
  margin: 0;
  color: #202124;
}
.subtitle {
  color: #5f6368;
  margin: 4px 0 0;
  font-size: 1.05rem;
}
.meta {
  color: #5f6368;
  font-size: 0.85rem;
  margin: 12px 0 0;
}
.foot {
  text-align: center;
  color: #9aa0a6;
  font-size: 0.8rem;
  margin-top: 30px;
}
</style>
