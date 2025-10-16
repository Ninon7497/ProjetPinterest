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
    width: 700px;
    height: 20px;
    padding: 10px;
    border-radius: 15px;
    border-style: solid;
    border-color: #81BB79;
    color: #81BB79;
}
</style>