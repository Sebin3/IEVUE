/**
 * Copia frontend.css al CRM extrayendo los PNG embebidos en base64 a archivos
 * reales en public/img/. frontend.css pesa 426 KB de los cuales 267 KB (62%)
 * son 2 texturas duplicadas dos veces cada una.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = resolve(here, '../../frontend/dist/frontend.css')
const OUT_CSS = resolve(here, '../src/assets/styles/frontend.css')
const OUT_IMG = resolve(here, '../public/img')

mkdirSync(OUT_IMG, { recursive: true })

const original = readFileSync(SRC, 'utf8')

// Nombres estables por contenido: la misma textura reusada no se duplica.
const seen = new Map()
const names = ['noise-light.png', 'noise-dark.png']
let extracted = 0

const cleaned = original.replace(
  /url\(data:image\/png;base64,([A-Za-z0-9+/=]+)\)/g,
  (_match, b64) => {
    let name = seen.get(b64)
    if (!name) {
      name = names[seen.size] || `texture-${seen.size + 1}.png`
      seen.set(b64, name)
      writeFileSync(resolve(OUT_IMG, name), Buffer.from(b64, 'base64'))
      extracted++
    }
    return `url(/img/${name})`
  },
)

writeFileSync(OUT_CSS, cleaned)

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`
console.log(`frontend.css: ${kb(original)} -> ${kb(cleaned)}`)
console.log(`imagenes extraidas: ${extracted} (${seen.size} unicas)`)
for (const [b64, name] of seen) {
  console.log(`  ${name}: ${(b64.length * 0.75 / 1024).toFixed(1)} KB`)
}
