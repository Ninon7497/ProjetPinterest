<template>
  <!-- Header + barre de recherche -->
  <Header @searchChanged="onSearchChanged" />

  <div class="app-container">
    <!-- Bouton filtre -->
    <button class="btn-filters" @click="toggleFilters" title="Filtres">
      <img src="/src/images/filters_menu.svg" alt="Filtres" />
    </button>

    <!-- Filtres -->
    <Filters
      v-if="showFilters"
      :availableTags="availableTags"
      :modelTag="filters.tag"
      :modelColorHex="filters.colorHex"
      @filtersChanged="onFiltersChanged"
    />
  </div>

  <!-- Grille des images filtrées -->
  <Grille :filters="filters" />
</template>

<script>
import Header from './components/Headers.vue'
import Filters from './components/Filters.vue'
import Grille from './components/GrilleMasonry.vue'

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default {
  name: 'App',
  components: {
    Header,
    Filters,
    Grille
  },
  data() {
    return {
      showFilters: false,
      filters: {
        search: '',
        tag: '',
        color: '',
        colorHex: ''
      },
      availableTags: []
    };
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },

    onSearchChanged(payload) {
      this.filters.search = payload.search || '';
    },

    onFiltersChanged({ tag, colorHex }) {
      this.filters.tag = tag || '';
      this.filters.colorHex = colorHex || '';
      this.filters.color = this.filters.colorHex || '';
    },

    async fetchAvailableTags() {
      try {
        const res = await fetch(`${API}/tags`, { headers: { "Accept": "application/json" } });
        const json = await res.json();
        this.availableTags = Array.isArray(json.data) ? json.data : [];
      } catch (e) {
        console.error('Erreur lors du chargement des tags:', e);
        this.availableTags = [];
      }
    }
  },
  mounted() {
    this.fetchAvailableTags();
  }
};
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
