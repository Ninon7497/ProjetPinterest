<template>
    <div class="Header">

        <SearchBar id="Header__center" class="search" @searchChanged="handleSearchChanged" />

        <img class="create_logo" src="../images/create.svg" @click="showCreate = true"></img>

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

#Header__center {
    flex: 1;
    display: flex;
    justify-content: center;
}

.logo {
    color: yellowgreen;
    font-weight: bold;
}

.create_logo {
    width: 40px;
    opacity: 0.9;
    transition: 0.3s;
    cursor: pointer;
}

.create_logo:hover {
    opacity: 1;
}

@media (max-width: 600px) {
    .Header {
        flex-direction: column;
        align-items: flex-start;
        padding: 0.5rem;
    }

    .logo {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
    }
}
</style>
