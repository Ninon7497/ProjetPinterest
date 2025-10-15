import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', 'data')
const ITEMS_PATH = path.join(DATA_DIR, 'items.json')

// On sérialise les écritures pour éviter les collisions
let writing = Promise.resolve()

async function readJSON(p, fallback) {
  try { return JSON.parse(await fs.readFile(p, 'utf-8')) }
  catch { return fallback }
}

async function writeJSON(p, data) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tmp = p + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmp, p) // “commit” atomique
}

export const DB = {
  async all() { return readJSON(ITEMS_PATH, []) },
  enqueueWrite(fn) {
    writing = writing.then(async () => {
      const current = await DB.all()
      const next = await fn(current)
      await writeJSON(ITEMS_PATH, next)
    })
    return writing
  }
}
