<template>
    <div class="Header">
        <p class="logo">Logo</p>
        <SearchBar @searchChanged="handleSearchChanged" />

        <p @click="showCreate = true" style="cursor: pointer;">Crée ton post </p>

        <Create v-if="showCreate" @close="closeCreate"></Create>
    </div>
</template>

<script>
import Create from './Create.vue';
import SearchBar from './SearchBar.vue'

export default {
    components: { SearchBar, Create },
    data() {
        return {
            showCreate: false
        }
    },
    methods: {
        handleSearchChanged(payload) {
            this.$emit('searchChanged', payload)
        },
        openCreate() {
            this.showCreate = true
        },
        closeCreate() {
            this.showCreate = false
        }
    }
}
</script>

<style>
.Header {
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.logo {
    color: yellowgreen;
    font-weight: bold;
}
</style>
