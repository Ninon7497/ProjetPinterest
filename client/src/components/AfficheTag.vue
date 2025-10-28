<template>
    <div class="tag-list">
        <button class="btn-tags" :class="{ active: localTag === '' }" @click="selectTag('')">Tous</button>

        <button class="btn-tags" v-for="tag in displayTags" :key="tag" :class="{ active: tag === localTag }"
            @click="selectTag(tag)">
            {{ tag }}
        </button>


    </div>
    <!-- <button class="tags-swip">
        <img src="../images/swip.svg"></img>
    </button> -->
</template>

<script>
export default {
    name: "Tags",
    props: {
        modelTag: { type: String, default: "" },
        availableTags: { type: Array, default: () => [] },
        tagsEndpoint: { type: String, default: "/api/tags" }
    },
    data() {
        return {
            localTag: "",
            fetchedTags: [],
        };
    },
    computed: {
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
            this.$emit("update:modelTag", this.localTag);
            this.$emit("tagSelected", this.localTag);
        }
    },
    watch: {
        modelTag: {
            immediate: true,
            handler(v) { this.localTag = v || ""; }
        }
    }
};
</script>

<style scoped>
.tag-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;
    scroll-behavior: smooth;
}

/* .tags-swip {
    border: none;
    background-color: transparent;
    opacity: 0.4;
    transition: 0.5s;
    cursor: pointer;
} */

.tags-swip:hover {
    opacity: 1;
    background-color: transparent;
}

.btn-tags {
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
</style>