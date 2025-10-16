<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <button class="close-btn" @click="$emit('close')">×</button>

            <h2 class="create-element">Créer un nouvel élément</h2>

            <form @submit.prevent="submitForm">
                <div>
                    <label for="title">Titre :</label><br />
                    <input id="title" v-model="title" type="text" style="font-weight: bold;" required />
                </div>

                <div>
                    <label for="author">Auteur :</label><br>
                    <input id="author" v-model="author" type="text" style="font-weight: bold;" required />
                </div>

                <br></br>

                <div>
                    <label for="tags">Tags (séparés par des virgules) :</label><br />
                    <input id="tags" v-model="tags" type="text" placeholder="ex: nature, voyage, été" />
                </div>

                <div>
                    <p>Choisis une couleur :</p>
                    <div class="color-list">
                        <div class="color-circle" :class="{ active: localColor === '' }" @click="selectColor('')">
                            <span class="color-label">Toutes</span>
                        </div>
                        <div v-for="color in colors" :key="color.name" class="color-circle"
                            :class="{ active: localColor === color.name }" @click="selectColor(color.name)">
                            <span class="color-circle-inner" :style="{ backgroundColor: color.hex }"></span>
                        </div>
                    </div>
                </div>

                <!-- Date en back -->
                <!-- <div>
                    <label for="date">Date :</label><br />
                    <input id="date" v-model="date" type="date" />
                </div> -->

                <br>

                <div>
                    <label for="url">Lien url de votre imge:</label><br>
                    <input id="url" v-model="url" type="url" placeholder="https://exemple.com"></input>
                </div>

                <br></br>

                <button class="submit" type="submit">Envoyer</button>
            </form>
        </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            title: '',
            author: '',
            tags: '',
            localColor: '',
            colors: [
                { name: "rouge", hex: "#cc0000" },
                { name: "jaune", hex: "#f7d02e" },
                { name: "orange", hex: "#e67e22" },
                { name: "bleu", hex: "#000080" },
                { name: "vert", hex: "#008000" },
                { name: "violet", hex: "#9b59b6" },
                { name: "blanc", hex: "#ffffff" },
                { name: "noir", hex: "#000000" },
            ],
            date: '',
            url: ''
        }
    },
    methods: {
        selectColor(colorName) {
            this.localColor = colorName
        },

        submitForm() {
            const data = {
                title: this.title,
                author: this.author,
                tags: this.tags.split(',').map(tag => tag.trim()).filter(tag => tag.lengh > 0),
                color: this.localColor,
                date: this.date,
                url: this.url
            }

            console.log('Form submitted', data)

            this.title = ''
            this.author = ''
            this.tag = ''
            this.localColor = ''
            this.date = ''
            this.url = ''

            this.$emit('close')

        }
    }
}
</script>

<style scoped>
.create-element {
    text-align: center;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    max-height: 90vh;
    overflow-y: auto;
}

.close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: none;
    font-size: 1.8rem;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
    color: #333;
}

.create-form label {
    font-weight: bold;
}

.create-form input[type="text"],
.create-form input[type="url"],
.create-form input[type="date"] {
    width: 100%;
    padding: 0.3rem;
    margin-bottom: 0.7rem;
}

.create-form button[type="submit"] {
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.color-list {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
}

.color-circle {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 12px;
    border: 2px solid transparent;
    display: flex;
    align-items: center;
    user-select: none;
}

.color-circle.active {
    border-color: #333;
}

.color-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.color-circle-inner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-block;
    border: 1px solid #aaa;
}

.submit {
    border-radius: 20px;
    border-color: transparent;
    background-color: #81BB79;
    width: 20%;
    padding: 10px;
    color: white;
    opacity: 0.8;
    transition: 0.3s;
    cursor: pointer;
}

.submit:hover {
    opacity: 1;
}
</style>