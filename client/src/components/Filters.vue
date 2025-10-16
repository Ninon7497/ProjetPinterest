<template>
    <div class="filters-container">
        <p>Choisis un filtre :</p>
        <div class="tag-list">
            <button class="btn-color" v-for="tag in tags" :key="tag" :class="{ active: tag === localTag }"
                @click="selectTag(tag)">
                {{ tag || "Tous" }}
            </button>
        </div>

        <p>Choisis une couleur :</p>

        <div class="color-list">
            <div class="color-wrapper" :class="{ active: localColor === '' }" @click="selectColor('')">
                <span class="color-label">Toutes</span>
            </div>

            <div v-for="color in colors" :key="color.name" class="color-wrapper"
                :class="{ active: localColor === color.name }" @click="selectColor(color.name)">
                <div class="color-circle" :style="{ backgroundColor: color.hex }"></div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: "Filters",
    data() {
        return {
            tags: ["", "nature", "night", "star", "sunset"],
            colors: [
                { name: "rouge", hex: "#cc0000" },
                { name: "jaune", hex: "#f7d02e" },
                { name: "orange", hex: "#e67e22" },
                { name: "bleu", hex: "#000080" },
                { name: "vert", hex: "#008000" },
                { name: "violet", hex: "#9b59b6" },
                { name: "blanc", hex: "#ffffff" },
                { name: "noir", hex: "#000000" },
            ],
            localTag: "",
            localColor: "",
        };
    },
    methods: {
        selectTag(tag) {
            this.localTag = tag;
            this.$emit("filterChanged", { tag: this.localTag });
        },
        selectColor(color) {
            this.localColor = color;
            this.$emit("colorChanged", { color: this.localColor });
        },
    },
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

/* Tag */
.btn-color {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: #f4f4f4;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background-color: #ddd;
}

button.active {
    background-color: #81bb79;
    color: white;
    border-color: #5e995c;
}

/* couleur */
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

/* couleurs */
.color-label {
    font-size: 10px;
    color: #555;
}
</style>