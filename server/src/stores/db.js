import { promises as fs } from "fs"; 
import path from "path"; 
import { fileURLToPath } from "url"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const ITEMS_PATH = path.join(DATA_DIR, "items.json");
let writing = Promise.resolve();


async function readJSON(p, fallback) {
  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}


async function writeJSON(p, data) {
  await fs.mkdir(DATA_DIR, { recursive: true }); 
  const tmp = p + ".tmp"; 
  const payload = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, payload, "utf-8");
  await fs.rename(tmp, p);
}


export const DB = {
    async all() {
    return readJSON(ITEMS_PATH, []);
  },

  async getById(id) {
    const all = await DB.all();
    return all.find((i) => i.id === id) || null;
  },

  enqueueWrite(fn) {
    writing = writing.then(async () => {
      const current = await DB.all(); 
      const next = await fn(current); 
      await writeJSON(ITEMS_PATH, next); 
    });
    return writing;
  },
};
