import express from "express";
import cors from "cors";
import crypto from "crypto";
import { DB } from "./stores/db.js";
import { body, query, param, validationResult } from "express-validator";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const uid = (p = "itm_") => p + crypto.randomBytes(4).toString("hex");
const nowISO = () => new Date().toISOString();
const HEX = /^#([0-9a-f]{6})$/i;

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    error: "validation_error",
    details: errors.array().map((e) => ({
      field: e.path,
      msg: e.msg,
      location: e.location,
    })),
  });
}

function normalizeItemPayload(body, partial = false) {
  const out = {};
  if (!partial || body.title !== undefined) out.title = String(body.title || "").trim();
  if (!partial || body.author !== undefined) out.author = String(body.author || "").trim();
  if (!partial || body.imageUrl !== undefined) out.imageUrl = String(body.imageUrl || "").trim();
  if (!partial || body.sourceUrl !== undefined) out.sourceUrl = String(body.sourceUrl || "").trim();

  if (!partial || body.tags !== undefined) {
    out.tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];
  }
  if (!partial || body.colors !== undefined) {
    const colors = Array.isArray(body.colors) ? body.colors : [];
    out.colors = colors.map((c) => String(c).toLowerCase());
  }
  return out;
}

/**
 * GET /api/items
 * Recherche (q), filtres (tags/couleurs), tri, pagination
 */
app.get(
  "/api/items",
  [
    query("q").optional().isString(),
    query("tags").optional().isString(),
    query("colors").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const q = String(req.query.q || "").toLowerCase();
      const tags = String(req.query.tags || "")
        .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const colors = String(req.query.colors || "")
        .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));

      const all = await DB.all();

      const filtered = all
        .filter((i) => {
          const text = (
            (i.title || "") + " " + (i.author || "") + " " +
            (Array.isArray(i.tags) ? i.tags.join(" ") : "")
          ).toLowerCase();
          const itemTags = (i.tags || []).map((x) => String(x).toLowerCase());
          const itemColors = (i.colors || []).map((x) => String(x).toLowerCase());

          const okQ = !q || text.includes(q);
          const okTags = tags.length === 0 || tags.every((t) => itemTags.includes(t));
          const okColors = colors.length === 0 || colors.some((c) => itemColors.includes(c));
          return okQ && okTags && okColors;
        })
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

      const start = (page - 1) * limit;
      res.json({ data: filtered.slice(start, start + limit), page, limit, total: filtered.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to read data" });
    }
  }
);

/** GET /api/items/:id */
app.get(
  "/api/items/:id",
  [param("id").isString().notEmpty().withMessage("id is required")],
  validateRequest,
  async (req, res) => {
    try {
      const it = await DB.getById(req.params.id);
      if (!it) return res.status(404).json({ error: "not found" });
      res.json(it);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to read data" });
    }
  }
);

/** POST /api/items (create) */
app.post(
  "/api/items",
  [
    body("title").isString().trim().notEmpty().withMessage("title is required"),
    body("imageUrl")
      .isString().trim().notEmpty().withMessage("imageUrl is required")
      .bail()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("imageUrl must be a valid URL"),
    body("author").optional().isString(),
    body("sourceUrl").optional().isString().bail()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("sourceUrl must be a valid URL"),
    body("tags").optional().isArray().withMessage("tags must be an array of strings"),
    body("tags.*").optional().isString().trim().notEmpty(),
    body("colors").optional().isArray().withMessage("colors must be an array of hex codes"),
    body("colors.*").optional().matches(HEX).withMessage("each color must be hex like #aabbcc"),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const input = normalizeItemPayload(req.body, false);
      const item = {
        id: uid(),
        title: input.title,
        author: input.author || "",
        tags: input.tags || [],
        colors: (input.colors || []).map((c) => c.toLowerCase()),
        sourceUrl: input.sourceUrl || "",
        imageUrl: input.imageUrl,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      await DB.enqueueWrite(async (current) => [item, ...current]); 
      res.status(201).json(item);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to create item" });
    }
  }
);

app.put(
  "/api/items/:id",
  [
    param("id").isString().notEmpty(),
    body("title").optional().isString(),
    body("author").optional().isString(),
    body("imageUrl").optional().isString().bail()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("imageUrl must be a valid URL"),
    body("sourceUrl").optional().isString().bail()
      .isURL({ protocols: ["http", "https"], require_protocol: true })
      .withMessage("sourceUrl must be a valid URL"),
    body("tags").optional().isArray(),
    body("tags.*").optional().isString().trim(),
    body("colors").optional().isArray(),
    body("colors.*").optional().matches(HEX).withMessage("each color must be hex like #aabbcc"),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const updates = normalizeItemPayload(req.body, true);
      let result = null;

      await DB.enqueueWrite(async (current) => {
        const idx = current.findIndex((i) => i.id === req.params.id);
        if (idx === -1) return current;

        const next = [...current];
        const merged = { ...next[idx], ...updates, updatedAt: nowISO() };
        if (updates.tags !== undefined) merged.tags = updates.tags;
        if (updates.colors !== undefined) merged.colors = updates.colors.map((c) => c.toLowerCase());
        next[idx] = merged;
        result = merged;
        return next;
      });

      if (!result) return res.status(404).json({ error: "not found" });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to update item" });
    }
  }
);

app.delete(
  "/api/items/:id",
  [param("id").isString().notEmpty()],
  validateRequest,
  async (req, res) => {
    try {
      let existed = false;
      await DB.enqueueWrite(async (current) => {
        const next = current.filter((i) => {
          const keep = i.id !== req.params.id;
          if (!keep) existed = true;
          return keep;
        });
        return next;
      });
      if (!existed) return res.status(404).json({ error: "not found" });
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to delete item" });
    }
  }
);


function aggregateTags(items, { withCounts = false } = {}) {
  const seen = new Map();
  for (const it of items) {
    for (const raw of (it.tags || [])) {
      const label = String(raw || "").trim();
      if (!label) continue;
      const key = label.toLowerCase();
      if (!seen.has(key)) seen.set(key, { label, count: 0 });
      seen.get(key).count += 1;
    }
  }
  const arr = [...seen.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
  );
  return withCounts ? arr.map(t => ({ tag: t.label, count: t.count })) : arr.map(t => t.label);
}

function aggregateColors(items, { withCounts = false } = {}) {
  const counts = new Map();
  for (const it of items) {
    for (const c of (it.colors || [])) {
      const hex = String(c || "").toLowerCase();
      if (!hex) continue;
      counts.set(hex, (counts.get(hex) || 0) + 1);
    }
  }
  const arr = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return withCounts ? arr.map(([colorHex, count]) => ({ colorHex, count })) : arr.map(([hex]) => hex);
}

app.get(
  "/api/tags",
  [
    query("counts").optional().isInt({ min: 0, max: 1 }),
    query("minCount").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 500 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const withCounts = String(req.query.counts || "0") === "1";
      const minCount = parseInt(String(req.query.minCount || "1"), 10);
      const limit = parseInt(String(req.query.limit || "500"), 10);

      const all = await DB.all();
      let data = aggregateTags(all, { withCounts });

      if (withCounts) {
        data = data.filter(t => t.count >= minCount).slice(0, limit);
      } else {
        data = data.slice(0, limit);
      }

      res.json({ data, total: data.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to aggregate tags" });
    }
  }
);

app.get(
  "/api/colors",
  [
    query("counts").optional().isInt({ min: 0, max: 1 }),
    query("limit").optional().isInt({ min: 1, max: 500 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const withCounts = String(req.query.counts || "0") === "1";
      const limit = parseInt(String(req.query.limit || "500"), 10);
      const all = await DB.all();
      let data = aggregateColors(all, { withCounts });
      data = data.slice(0, limit);
      res.json({ data, total: data.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "failed to aggregate colors" });
    }
  }
);


app.listen(3000, () => {
  console.log("✅ API en ligne sur http://localhost:3000");
});
