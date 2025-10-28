<template>
    <div class="loading-scroll" @scroll="handleScroll">
        <div class="grille-container">

            <div v-for="(item, index) in items" :key="item.id" class="grille-item" @click="openPopup(item)"
                :style="getItemStyle(index)">
                <div class="item-card">
                    <img :src="item.image" :alt="item.titre" />
                    <!-- <h3>{{ item.titre }}</h3>
        <p>{{ item.auteur }}</p>
        <div class="tags">
          <span v-for="tag in item.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div> -->
                </div>
            </div>

            <AfficheItem v-if="selectedItem" :item="selectedItem" @close="selectedItem = null" />

            <p v-if="loading" class="no-items">Chargement…</p>
            <p v-if="!loading && !items.length" class="no-items">Aucune affiche trouvée.</p>

            <!-- <div class="util-flex gap-2">
                <button class="btn--ghost" :disabled="page === 1" @click="changePage(page - 1)"><img
                        src="../images/previous.svg"></img> </button>
                <span class="card__meta" style="color: white;">Page {{ page }} / {{ totalPages }}</span>
                <button class="btn--ghost" :disabled="page * limit >= total" @click="changePage(page + 1)"><img
                        src="../images/next.svg"></img> </button>
            </div> -->
        </div>

    </div>
</template>

<script>
// import { computed } from "vue";
import AfficheItem from "./AfficheItem.vue";

const API = import.meta.env?.VITE_API_URL || "http://localhost:3000/api";

export default {
    name: "Grille",
    components: { AfficheItem },
    props: {
        filters: { type: Object, required: true },
    },
    data() {
        return {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            loading: false,
            selectedItem: null,
            _t: null,
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.total / this.limit)
        }
    },
    watch: {
        filters: {
            deep: true,
            handler() {
                clearTimeout(this._t);
                this.page = 1;
                this._t = setTimeout(() => this.fetchItems(), 300);
            },
        },
    },
    methods: {
        openPopup(item) { this.selectedItem = item; },

        changePage(p) {
            this.page = p;
            this.fetchItems();
        },

        async fetchItems(append = false) {
            this.loading = true;

            try {
                const params = new URLSearchParams();
                if (this.filters?.search) params.set("q", this.filters.search);
                if (this.filters?.tag) params.set("tags", this.filters.tag);
                if (this.filters?.colorHex) params.set("colors", this.filters.colorHex);
                params.set("page", String(this.page));
                params.set("limit", String(this.limit));

                const res = await fetch(`${API}/items?${params.toString()}`);
                const json = await res.json();
                const newItems = (json.data || []).map(i => ({
                    id: i.id ?? i._id ?? null,
                    titre: i.title,
                    auteur: i.author || "",
                    image: i.imageUrl,
                    tags: i.tags || [],
                    couleurHex: (i.colors || [])[0] || null
                }));
                if (append) {
                    this.items.push(...newItems)

                } else {
                    this.items = newItems
                }

                this.total = json.total || this.items.length;
            } catch (error) {
                console.error("Erreur lors du chargement des affiches :", error);
                this.items = [];
                this.total = 0;
            } finally {
                this.loading = false;
            }
        },
        handleScroll(event) {
            const el = event.target;
            if (this.loading) return;
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
            const hasMore = this.page * this.limit < this.total;

            if (nearBottom && hasMore) {
                this.page++;
                this.fetchItems(true);
            }

        },
        getItemStyle(index) {
            const offset = (index % 5) * 2;
            return {
                position: 'relative',
                top: `${-offset}px`
            }
        },
    },
    mounted() {
        this.fetchItems();
    },
};
</script>

<style scoped>
.grille-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    width: 100%;
}

.util-flex {
    position: relative;
    min-height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 20px;
    padding: 8px 16px;
    border-radius: 8px;
    z-index: 100;
    gap: 10px;
}


.btn--ghost {
    background-color: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.8;
    transition: 0.3s;
    justify-content: center;
    align-items: center;
    display: flex;
    padding: 5px;
}

.btn--ghost img {
    width: 60px;
    height: 60px;
}

.btn--ghost:hover {
    opacity: 1;

}

.grille-item {
    width: 300px;
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

.loading-scroll {
    overflow-y: auto;
}
</style>
