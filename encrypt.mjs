// Encrypts an .xlsx into public/data.enc, protected by a password.
//
//   node encrypt.mjs                 → prompts for the file & password
//   node encrypt.mjs "<file.xlsx>"   → prompts for the password only
//
// Output layout: [salt:16][iv:12][ciphertext...]  (AES-256-GCM, PBKDF2 200k).
// Decrypted in the browser by src/lib/crypto.js with the same parameters.

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { webcrypto as crypto } from 'crypto'
import { createInterface } from 'readline'
import { stdin, stdout } from 'process'

const PBKDF2_ITERATIONS = 200000
const OUT = 'public/data.enc'

function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: stdin, output: stdout })
  return new Promise((resolve) => {
    if (hidden) {
      // mask typed characters
      const onData = () => (rl.output.write('\x1b[2K\r' + question), 0)
      rl._writeToOutput = () => onData()
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) stdout.write('\n')
      resolve(answer)
    })
  })
}

const argFile = process.argv[2]
let file = argFile
if (!file) {
  const candidates = readdirSync('.').filter((f) => /\.xlsx?$/i.test(f))
  if (candidates.length === 1) {
    file = candidates[0]
    console.log('Soubor:', file)
  } else {
    console.log('Nalezené soubory:', candidates.join(', ') || '(žádné)')
    file = await ask('Cesta k .xlsx souboru: ')
  }
}

// Non-interactive: PW=... node encrypt.mjs "file.xlsx"  (handy for scripts/CI)
let password = process.env.PW
if (password) {
  console.log('Heslo načteno z proměnné PW.')
} else {
  password = await ask('Heslo: ', { hidden: true })
  if (!password) {
    console.error('Prázdné heslo — končím.')
    process.exit(1)
  }
  const confirm = await ask('Heslo znovu: ', { hidden: true })
  if (password !== confirm) {
    console.error('Hesla se neshodují — končím.')
    process.exit(1)
  }
}

const data = readFileSync(file)
const enc = new TextEncoder()
const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
const salt = crypto.getRandomValues(new Uint8Array(16))
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
)
const iv = crypto.getRandomValues(new Uint8Array(12))
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

const out = Buffer.concat([Buffer.from(salt), Buffer.from(iv), Buffer.from(ciphertext)])
writeFileSync(OUT, out)
console.log(`\n✔ Zašifrováno → ${OUT} (${out.length} B). Původní .xlsx se NEnasazuje.`)
