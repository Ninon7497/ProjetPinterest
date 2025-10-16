<template>
    <div class="search-bar">
        <input type="text" placeholder="Rechercher vos inspirations" v-model="searchText" @input="emitSearch" />
    </div>
</template>

<script>

export default {
    name: "SearchBar",
    data() {
        return {
            searchText: ""
        };
    },
    methods: {
        emitSearch() {
            this.$emit("searchChanged", { search: this.searchText });
        }
    }
}

</script>

<style scoped>
.search-bar input {
    padding: 0.5rem;
    width: 100%;
    max-width: 400px;
}
</style>