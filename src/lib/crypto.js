// Password-based decryption for the bundled, encrypted data file.
// Mirrors encrypt.mjs exactly: PBKDF2(SHA-256, 200k) → AES-256-GCM.
// File layout: [salt:16][iv:12][ciphertext...].

const PBKDF2_ITERATIONS = 200000
const SALT_LEN = 16
const IV_LEN = 12

async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

// Returns the decrypted ArrayBuffer, or throws if the password is wrong
// (AES-GCM authentication fails on a bad key).
export async function decryptData(encryptedBuffer, password) {
  const bytes = new Uint8Array(encryptedBuffer)
  const salt = bytes.slice(0, SALT_LEN)
  const iv = bytes.slice(SALT_LEN, SALT_LEN + IV_LEN)
  const ciphertext = bytes.slice(SALT_LEN + IV_LEN)
  const key = await deriveKey(password, salt)
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
}
