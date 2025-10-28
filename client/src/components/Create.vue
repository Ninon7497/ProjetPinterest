<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>

      <h2 class="create-element">Créer un nouvel élément</h2>

      <form @submit.prevent="submitForm" class="create-form">
        <div>
          <label for="title">Titre :</label><br />
          <input id="title" v-model.trim="title" type="text" style="font-weight: bold;" required />
        </div>

        <div>
          <label for="author">Auteur :</label><br>
          <input id="author" v-model.trim="author" type="text" style="font-weight: bold;" />
        </div>

        <div>
          <label for="tags">Tags (séparés par des virgules) :</label><br />
          <input id="tags" v-model="tags" type="text" placeholder="ex: nature, affiche, logo" />
        </div>

        <div>
          <p>Choisis une couleur :</p>
          <div class="color-list">
            <div
              v-for="color in colors"
              :key="color.name"
              class="color-circle"
              :class="{ active: localColor === color.name }"
              @click="selectColor(color.name)"
              :title="`${color.name} (${color.hex})`"
            >
              <span class="color-circle-inner" :style="{ backgroundColor: color.hex }"></span>
            </div>
          </div>
        </div>

        <div>
          <label for="url">Lien URL de votre image :</label><br>
          <div class="url-with-preview">
            <input
              id="url"
              v-model.trim="url"
              type="url"
              placeholder="https://exemple.com/mon-image.jpg"
              @input="onUrlInput"
              aria-describedby="url-help"
              required
            />
            <div class="thumb">
              <div v-if="!validUrl" class="thumb-placeholder">Aperçu</div>

              <div v-else class="thumb-box">
                <img
                  v-show="previewStatus === 'ok'"
                  :src="previewSrc"
                  decoding="async"
                  referrerpolicy="no-referrer"
                  alt="Aperçu"
                  @load="onImgLoad"
                  @error="onImgError"
                />
                <div v-if="previewStatus === 'loading'" class="thumb-loading" aria-label="Chargement…">Chargement…</div>
                <div v-if="previewStatus === 'error'" class="thumb-error" aria-live="polite">Erreur</div>
              </div>
            </div>
          </div>
          <small id="url-help" class="help">Un aperçu s’affiche automatiquement si l’URL est valide et accessible.</small>
        </div>

        <div>
          <label for="source">Lien URL de la source :</label><br>
          <input
            id="source"
            v-model.trim="sourceUrl"
            type="url"
            placeholder="https://exemple.com/source"
          />
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <div class="form-actions">
          <button type="button" class="submit ghost" @click="$emit('close')">Annuler</button>
          <button class="submit" type="submit" :disabled="submitting">
            {{ submitting ? 'Envoi…' : 'Envoyer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export default {
  emits: ["close", "created"],
  data() {
    return {
      title: "",
      author: "",
      tags: "",
      localColor: "",
      colors: [
        { name: "rouge",  hex: "#cc0000" },
        { name: "jaune",  hex: "#f7d02e" },
        { name: "orange", hex: "#e67e22" },
        { name: "bleu",   hex: "#000080" },
        { name: "vert",   hex: "#008000" },
        { name: "violet", hex: "#9b59b6" },
        { name: "blanc",  hex: "#ffffff" },
        { name: "noir",   hex: "#000000" },
      ],
      url: "",
      sourceUrl: "",
      submitting: false,
      errorMsg: "",

      previewSrc: "",
      previewStatus: "idle", 
      debounceTimer: null
    }
  },
  computed: {
    colorMap() {
      const m = new Map()
      this.colors.forEach(c => m.set(c.name, c.hex.toLowerCase()))
      return m
    },
    selectedHex() {
      return this.localColor ? (this.colorMap.get(this.localColor) || "") : ""
    },
    validUrl() {
      return /^https?:\/\/.+/i.test(this.url)
    }
  },
  watch: {
    url(newVal) {
      if (!this.validUrl) {
        this.previewSrc = ""
        this.previewStatus = "idle"
        return
      }
      this.queuePreviewUpdate(newVal)
    }
  },
  methods: {
    selectColor(colorName) {
      this.localColor = colorName
    },

    onUrlInput() {
      if (!this.validUrl) {
        this.previewStatus = "idle"
      }
    },

    queuePreviewUpdate(src) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.previewStatus = "loading"
        this.previewSrc = src
      }, 250)
    },

    onImgLoad() {
      this.previewStatus = "ok"
    },

    onImgError() {
      this.previewStatus = "error"
    },

    async submitForm() {
      this.errorMsg = ""

      if (!this.title.trim()) {
        this.errorMsg = "Le titre est obligatoire."
        return
      }

      const urlRe = /^https?:\/\/.+/i
      if (!urlRe.test(this.url)) {
        this.errorMsg = "L’URL de l’image doit commencer par http(s)://"
        return
      }

      if (this.sourceUrl && !urlRe.test(this.sourceUrl)) {
        this.errorMsg = "L’URL de la source doit être valide (http ou https)."
        return
      }

      const payload = {
        title: this.title,
        author: this.author || "",
        imageUrl: this.url,
        sourceUrl: this.sourceUrl || undefined,
        tags: this.tags
          .split(",")
          .map(t => t.trim())
          .filter(t => t.length > 0),
        colors: this.selectedHex ? [this.selectedHex] : []
      }

      this.submitting = true

      try {
        const res = await fetch(`${API}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          this.errorMsg = err?.details?.[0]?.msg || err.error || res.statusText
          return
        }

        const created = await res.json()
        this.$emit("created", created)

        this.title = ""
        this.author = ""
        this.tags = ""
        this.localColor = ""
        this.url = ""
        this.sourceUrl = ""

        this.previewSrc = ""
        this.previewStatus = "idle"

        this.$emit("close")
      } catch (e) {
        console.error(e)
        this.errorMsg = "Erreur réseau lors de la création."
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.create-element { text-align: center; }

.modal-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
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
  color: #333;
}

.create-form label { font-weight: bold; }

.create-form input[type="text"],
.create-form input[type="url"] {
  width: 100%;
  padding: 0.4rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

/* URL + preview */
.url-with-preview {
  display: grid;
  grid-template-columns: 1fr 88px;
  gap: 10px;
  align-items: center;
}

.thumb {
  display: flex;
  justify-content: center;
  align-items: center;
}

.thumb-box,
.thumb-placeholder,
.thumb-loading,
.thumb-error {
  width: 88px;
  height: 88px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: 2px;
}

.thumb-placeholder { color: #888; background: #fafafa; }
.thumb-loading { color: #555; background: #f3f3f3; }
.thumb-error { color: #b00020; background: #fff3f3; }

.thumb-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-list {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.color-circle {
  cursor: pointer;
  padding: 4px;
  border-radius: 12px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
}

.color-circle.active { border-color: #333; }

.color-circle-inner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid #aaa;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.submit {
  border-radius: 20px;
  border: none;
  background-color: #81BB79;
  min-width: 110px;
  padding: 10px;
  color: white;
  opacity: 0.9;
  transition: 0.2s;
  cursor: pointer;
}
.submit.ghost {
  background: transparent;
  color: #333;
  border: 1px solid #ccc;
}
.submit:hover:not([disabled]) { opacity: 1; }
.submit[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #b00020;
  font-size: 12px;
  margin-top: -4px;
  margin-bottom: 8px;
}
.help {
  color: #666;
  font-size: 12px;
}
</style>
