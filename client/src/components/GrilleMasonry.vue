<template>
    <div class="grille-container">
        <div v-for="item in filteredItems" :key="item.id" class="grille-item" @click="openPopup(item)">
            <div class="item-card">
                <img :src="item.image" alt="Affiche" />
                <h3>{{ item.titre }}</h3>
                <p>{{ item.auteur }}</p>
                <div class="tags">
                    <span v-for="tag in item.tags" :key="tag" class="tag">#{{ tag }}</span>
                </div>
            </div>
        </div>

        <!-- Pop-up -->
        <AfficheItem v-if="selectedItem" :item="selectedItem" @close="selectedItem = null" />

        <!-- Si aucune affiche -->
        <p v-if="!filteredItems.length" class="no-items">Aucune affiche trouvée.</p>
    </div>
</template>

<script>
import AfficheItem from "./AfficheItem.vue";

export default {
    name: "Grille",
    components: { AfficheItem },
    props: {
        filters: { type: Object, required: true },
    },
    data() {
        return {
            items: [
                {
                    id: 1,
                    titre: "Affiche Sunset",
                    auteur: "Jean Dupont",
                    image: "https://via.placeholder.com/200x300?text=Affiche+1",
                    tags: ["nature", "sunset"],
                    couleur: "orange",
                },
                {
                    id: 2,
                    titre: "Affiche Nuit",
                    auteur: "Marie Claire",
                    image: "https://via.placeholder.com/200x300?text=Affiche+2",
                    tags: ["night", "stars"],
                    couleur: "bleu",
                },
                {
                    id: 3,
                    titre: "Affiche Montagne",
                    auteur: "Paul Martin",
                    image: "https://via.placeholder.com/200x300?text=Affiche+3",
                    tags: ["mountain", "nature"],
                    couleur: "vert",
                },
                {
                    id: 4,
                    titre: "Affiche ",
                    auteur: "Janne",
                    image: "https://via.placeholder.com/200x300?text=Affiche+1",
                    tags: ["nature", "sunset"],
                    couleur: "bleu",
                },
            ],
            selectedItem: null,
        };
    },
    computed: {
        filteredItems() {
            const { search, tag, color } = this.filters;

            return this.items.filter((item) => {
                const matchesSearch =
                    !search || item.titre.toLowerCase().includes(search.toLowerCase());
                const matchesTag = !tag || item.tags.includes(tag);
                const matchesColor = !color || item.couleur === color;
                return matchesSearch && matchesTag && matchesColor;
            });
        },
    },
    methods: {
        openPopup(item) {
            this.selectedItem = item;
        },
        async fetchItems() {
            try {
                const response = await fetch("/api/affiches");
                this.items = await response.json();
            } catch (error) {
                console.error("Erreur lors du chargement des affiches :", error);
            }
        },
    },
    mounted() {
        // this.fetchItems();
    },
};
</script>

<style scoped>
.grille-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.grille-item {
    width: 200px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.grille-item:hover {
    transform: scale(1.05);
}

.item-card {
    background: white;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.item-card img {
    width: 100%;
    height: auto;
    border-radius: 4px;
}

.tags {
    margin-top: 8px;
}

.tag {
    background-color: #eee;
    padding: 2px 6px;
    margin: 2px;
    font-size: 12px;
    border-radius: 4px;
    display: inline-block;
}

.no-items {
    text-align: center;
    color: #888;
    margin-top: 40px;
}
</style>