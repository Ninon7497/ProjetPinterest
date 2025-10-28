<template>
  <div class="filters-container">
    <p>Choisis une couleur :</p>

    <div class="color-list">
      <div class="color-wrapper" :class="{ active: localColorName === '' }" @click="selectColor('')">
        <span class="color-label">Toutes</span>
      </div>

      <div v-for="c in colors" :key="c.name" class="color-wrapper" :class="{ active: localColorName === c.name }"
        @click="selectColor(c.name)" :title="`${c.name} (${c.hex})`">
        <div class="color-circle" :style="{ backgroundColor: c.hex }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Tags from './AfficheTag.vue';

export default {
  name: "Filters",
  components: { Tags },
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
      colors: [
        { name: "rouge", hex: "#cc0000" },
        { name: "jaune", hex: "#f7d02e" },
        { name: "orange", hex: "#e67e22" },
        { name: "bleu", hex: "#000080" },
        { name: "vert", hex: "#008000" },
        { name: "violet", hex: "#9b59b6" },
        { name: "blanc", hex: "#ffffff" },
        { name: "noir", hex: "#000000" }
      ]
    };
  },
  computed: {
    colorMap() {
      const m = new Map();
      this.colors.forEach(c => m.set(c.name, c.hex.toLowerCase()));
      return m;
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

.color-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

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

.color-wrapper.active {
  border-color: #333;
}

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
