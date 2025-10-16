<!-- <template>
    <div class="filters-container">
        <p>Choisis un tag :</p>
        <div class="tag-list">
            <button class="btn-tag" v-for="tag in tags" :key="tag" :class="{ active: tag === localTag }"
                @click="selectTag(tag)">
                {{ tag || "Tous" }}
            </button>
            <button class="reset-btn" @click="resetTag">Réinitialiser</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "Filters",
    data() {
        return {
            tags: ["", "stars", "night", "mountain"],
            localTag: "",
        };
    },
    methods: {
        selectTag(tag) {
            this.localTag = tag;
            this.$emit("filterChanged", { tag: this.localTag });
        },
        resetTag() {
            this.localTag = "";
            this.$emit("filterChanged", { tag: this.localTag });
        },
    },
};
</script>

<style scoped>
.filters-container {
    padding: 1rem;
    background: transparent;
    border-radius: 8px;
}

.tag-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.btn-tag {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: #fffefe;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.6s;
}

.btn-tag:hover {
    background-color: #e9e8e8be;
}

.btn-tag.active {
    background-color: #81bb79;
    color: white;
    border-color: #5e995c;
}

.reset-btn {
    background-color: #ccc;
    border: none;
    color: #333;
    cursor: pointer;
}

.reset-btn:hover {
    background-color: #bbb;

}
</style> -->