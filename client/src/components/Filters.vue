<template>
  <div class="filters-container">
    <p>Choisis un filtre :</p>

    <div class="tag-list">
      <button
        class="btn-color"
        :class="{ active: localTag === '' }"
        @click="selectTag('')"
      >Tous</button>

      <button
        class="btn-color"
        v-for="tag in displayTags"
        :key="tag"
        :class="{ active: tag === localTag }"
        @click="selectTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <p>Choisis une couleur :</p>

    <div class="color-list">
      <div class="color-wrapper" :class="{ active: localColorName === '' }" @click="selectColor('')">
        <span class="color-label">Toutes</span>
      </div>

      <div
        v-for="c in colors"
        :key="c.name"
        class="color-wrapper"
        :class="{ active: localColorName === c.name }"
        @click="selectColor(c.name)"
        :title="`${c.name} (${c.hex})`"
      >
        <div class="color-circle" :style="{ backgroundColor: c.hex }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Filters",
  props: {
    modelTag: { type: String, default: "" },
    modelColorHex: { type: String, default: "" },
    availableTags: { type: Array, default: () => [] },
    tagsEndpoint: { type: String, default: "/api/tags" }
  },
  data() {
    return {
      localTag: "",
      localColorName: "",
      localHex: "",
      fetchedTags: [],
      colors: [
        { name: "rouge",  hex: "#cc0000" },
        { name: "jaune",  hex: "#f7d02e" },
        { name: "orange", hex: "#e67e22" },
        { name: "bleu",   hex: "#000080" },
        { name: "vert",   hex: "#008000" },
        { name: "violet", hex: "#9b59b6" },
        { name: "blanc",  hex: "#ffffff" },
        { name: "noir",   hex: "#000000" }
      ]
    };
  },
  computed: {
    colorMap() {
      const m = new Map();
      this.colors.forEach(c => m.set(c.name, c.hex.toLowerCase()));
      return m;
    },
    displayTags() {
      const raw = (this.availableTags && this.availableTags.length)
        ? this.availableTags
        : this.fetchedTags;

      const seen = new Set();
      return (raw || [])
        .map(t => String(t || "").trim())
        .filter(Boolean)
        .filter(t => {
          const key = t.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
    }
  },
  async mounted() {
    if (!this.availableTags || this.availableTags.length === 0) {
      try {
        const res = await fetch(this.tagsEndpoint, { headers: { "Accept": "application/json" } });
        const data = await res.json();
        this.fetchedTags = Array.isArray(data.data) ? data.data : [];
      } catch (e) {
        console.error("Impossible de charger les tags:", e);
      }
    }
  },
  methods: {
    selectTag(tag) {
      this.localTag = tag;
      this.$emit("filterChanged", { tag: this.localTag });
      this.$emit("filtersChanged", { tag: this.localTag, colorHex: this.localHex });
      this.$emit("update:modelTag", this.localTag);
    },
    selectColor(colorName) {
      this.localColorName = colorName;
      const hex = colorName ? (this.colorMap.get(colorName) || "") : "";
      this.localHex = hex;
      this.$emit("colorChanged", { colorHex: hex, color: hex });
      this.$emit("filtersChanged", { tag: this.localTag, colorHex: hex });
      this.$emit("update:modelColorHex", hex);
    }
  },
  watch: {
    modelTag: {
      immediate: true,
      handler(v) { this.localTag = v || ""; }
    },
    modelColorHex: {
      immediate: true,
      handler(v) {
        const hex = (v || "").toLowerCase();
        this.localHex = hex;
        if (!hex) { this.localColorName = ""; return; }
        const entry = this.colors.find(c => c.hex.toLowerCase() === hex);
        this.localColorName = entry ? entry.name : "";
      }
    }
  }
};
</script>

<style scoped>
.filters-container {
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}
.tag-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.color-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.btn-color {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #f4f4f4;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}
button:hover { background-color: #ddd; }
button.active { background-color: #81bb79; color: white; border-color: #5e995c; }

.color-wrapper {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.color-wrapper.active { border-color: #333; }
.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #aaa;
}
.color-label {
  font-size: 10px;
  color: #555;
}
</style>
