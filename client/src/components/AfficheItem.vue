```
<template>
    <div class="overlay" @click.self="close">
        <div class="popup">
            <button class="close-btn" @click="close">✕</button>
            <img :src="item.image" alt="Affiche" />
            <h2>{{ item.titre }}</h2>
            <p><strong>Auteur :</strong> {{ item.auteur }}</p>
            <div class="tags">
                <span v-for="tag in item.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AfficheItem",
    props: {
        item: { type: Object, required: true },
    },
    emits: ["close"],
    methods: {
        close() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup {
    background: white;
    padding: 20px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    position: relative;
}

.popup img {
    width: 100%;
    border-radius: 8px;
}

.close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
}

.tags {
    margin-top: 10px;
}

.tag {
    background-color: #eee;
    padding: 4px 8px;
    margin: 2px;
    font-size: 12px;
    border-radius: 4px;
    display: inline-block;
}
</style>
```