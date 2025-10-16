<template>
  <!-- Header + search bar -->
  <Header @searchChanged="onSearchChanged" />

  <div class="app-container">

    <!-- Bouton filtre -->
    <button class="btn-filters" @click="toggleFilters">
      <img src="./images/filters_menu.svg" />
    </button>

    <!-- Filtres -->
    <Filters v-if="showFilters" @filterChanged="onFilterChanged" />

    <!-- Affichage des tags sélectionnés -->

    <AfficheTag :filters="filters" />

  </div>

  <!-- Grille avec les filtres  -->
  <Grille :filters="filters" />
</template>


<script>
import Header from './components/Headers.vue'
import Filters from './components/Filters.vue'
// import AfficheTag from './components/AfficheTag.vue'
import Grille from './components/GrilleMasonry.vue'

export default {
  name: 'App',
  components: {
    Header,
    Filters,
    // AfficheTag,
    Grille
  },
  data() {
    return {
      showFilters: false,
      filters: {
        search: '',
        tag: '',
        color: ''
      }
    }
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    onSearchChanged(payload) {
      this.filters.search = payload.search
    },
    onFilterChanged(payload) {
      this.filters.tag = payload.tag
      this.filters.color = payload.color
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #81BB79;
}

.app-container {
  margin: 2%;
  background-color: transparent;
  padding: 1rem;
}

.btn-filters {
  background-color: transparent;
  border: none;
  border-radius: 40%;
  cursor: pointer;
  opacity: 0.8;
  transition: 0.5s;
}

button:hover {
  opacity: 1;
}
</style>
