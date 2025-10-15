import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Serveur en ligne ✅" });
});
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ITEMS_PATH = path.join(__dirname, "data", "items.json");

// --- Route /api/items ---
app.get("/api/items", async (req, res) => {
  try {
    const data = await fs.readFile(ITEMS_PATH, "utf-8");
    const items = JSON.parse(data);
    res.json({ data: items, total: items.length });
  } catch (err) {
    console.error("Erreur lecture JSON:", err);
    res.status(500).json({ error: "Impossible de lire items.json" });
  }
});


app.listen(3000, () => {
  console.log("✅ API en ligne sur http://localhost:3000");
});
