<template>
  <div class="test">
    <h1>TEST</h1>
    <div class="app-container">
      <h1>Médiathèque d’inspirations visuelles</h1>

      Barre de recherche / filtres
      <SearchBar @filterChanged="updateFilters" />

      <br>
      Liste des affiches filtrée
      <AfficheList :filters="filters" />

      Formulaire d’ajout / édition
      <AfficheForm @itemAdded="addItem" />
    </div>
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
import AfficheList from './components/AfficheList.vue'
import AfficheForm from './components/AfficheForm.vue'

export default {
  name: 'App',
  components: {
    SearchBar,
    AfficheList,
    AfficheForm
  },
  data() {
    return {
      filters: {},
      items: []
    }
  },
  methods: {
    updateFilters(newFilters) {
      this.filters = newFilters
    },
    addItem(newItem) {
      this.items.push(newItem)
    }
  }
}
</script>

<style>
body {
  background-color: black;
}

.app-container {
  background-color: gray;

}
</style>
