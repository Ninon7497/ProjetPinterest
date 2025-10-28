<template>
  <div class="overlay" @click.self="close">
    <div class="popup">
      <button class="close-btn" @click="close">✕</button>

      <div v-if="!editMode" class="view-mode">
        <img :src="img" :alt="title" class="affiche-img" />
        <br />
        <h2>{{ title }}</h2>
        <p><strong>Auteur :</strong> {{ author || "—" }}</p>

        <a
          class="btn_source"
          :title="hasSource ? safeSourceUrl : 'Aucune source'"
          :href="safeSourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click.prevent.stop="openSource"
        >
          Voir la source
        </a>

        <div class="tags" v-if="tags?.length">
          <span v-for="tag in tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
      </div>

      <div v-if="!editMode" class="logo">
        <button class="icon-btn delete_logo" @click="deleteItem" title="Supprimer">
          <img src="../images/delete.svg" alt="Supprimer" />
        </button>
        <button class="icon-btn edit_logo" @click="toggleEdit" title="Modifier">
          <img src="../images/edit.svg" alt="Modifier" />
        </button>
      </div>

      <form v-if="editMode" class="form" @submit.prevent="saveUpdate">
        <h2>Modifier l’item</h2>

        <label style="font-weight: bold; font-size: large;">
          Titre
          <input v-model.trim="form.title" type="text" required />
        </label>

        <label style="font-weight: bold; font-size: large;">
          Auteur
          <input v-model.trim="form.author" type="text" />
        </label>

        <label style="font-weight: bold; font-size: large;">
          Tags (séparés par des virgules)
          <input v-model="form.tagsText" type="text" placeholder="affiche, illustration" />
        </label>

        <div class="form-actions">
          <button type="button" class="btn ghost" @click="toggleEdit">Annuler</button>
          <button type="submit" class="btn primary">Enregistrer</button>
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script>
const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default {
  name: "AfficheItem",
  props: { item: { type: Object, required: true } },
  emits: ["close", "deleted", "updated"],

  data() {
    return {
      editMode: false,
      form: {
        title: "",
        author: "",
        tagsText: ""
      },
      errorMsg: ""
    };
  },

  computed: {
    id() { return this.item.id; },
    title() { return this.item.title ?? this.item.titre ?? ""; },
    author() { return this.item.author ?? this.item.auteur ?? ""; },
    img() { return this.item.imageUrl ?? this.item.image ?? ""; },
    tags() { return this.item.tags ?? []; },

    sourceUrlRaw() {
      return this.item.sourceUrl ?? this.item.source ?? this.item.url ?? "";
    },
    hasSource() {
      return String(this.sourceUrlRaw || "").trim().length > 0;
    },
    safeSourceUrl() {
      const raw = String(this.sourceUrlRaw || "").trim();
      if (!raw) return "#";
      return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    }
  },

  methods: {
    close() { this.$emit("close"); },

    toggleEdit() {
      this.errorMsg = "";
      this.editMode = !this.editMode;
      if (this.editMode) {
        Object.assign(this.form, {
          title: this.title,
          author: this.author,
          tagsText: (this.tags || []).join(", ")
        });
      }
    },

    async deleteItem() {
      if (!this.id) return alert("ID manquant");
      if (!confirm("Supprimer cet item ?")) return;

      try {
        const res = await fetch(`${API}/items/${this.id}`, { method: "DELETE" });
        if (res.status === 204) {
          this.$emit("deleted", { id: this.id });
          this.close();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(`Échec suppression: ${err.error || res.statusText}`);
        }
      } catch (e) {
        console.error(e);
        alert("Erreur réseau lors de la suppression");
      }
    },

    async saveUpdate() {
      this.errorMsg = "";
      if (!this.id) return (this.errorMsg = "ID manquant");

      const payload = {
        title: this.form.title,
        author: this.form.author,
        tags: this.form.tagsText.split(",").map(s => s.trim()).filter(Boolean)
      };

      try {
        const res = await fetch(`${API}/items/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          this.errorMsg = err.error || res.statusText;
          return;
        }

        const updated = await res.json();
        this.$emit("updated", updated);
        Object.assign(this.item, updated);
        this.editMode = false;
      } catch (e) {
        console.error(e);
        this.errorMsg = "Erreur réseau lors de la mise à jour";
      }
    },

    openSource() {
      if (!this.hasSource) return;
      try {
        window.open(this.safeSourceUrl, "_blank", "noopener");
      } catch {
        location.href = this.safeSourceUrl;
      }
    }
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
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
  max-width: 360px;
  width: 90%;
  text-align: center;
  position: relative;
}

.affiche-img {
  width: 70%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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

/* Lien "Voir la source" */
.btn_source {
  display: inline-block;
  margin-top: 10px;
  border-radius: 20px;
  border: none;
  padding: 10px 16px;
  background-color: #81BB79;
  color: white;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  opacity: 0.95;
  transition: 0.3s;
}
.btn_source:hover {
  opacity: 1;
  transform: scale(1.03);
}

.tags { margin-top: 10px; }
.tag {
  background-color: #eee;
  padding: 4px 8px;
  margin: 2px;
  font-size: 12px;
  border-radius: 4px;
  display: inline-block;
}

.logo {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.75;
  transition: 0.2s;
}
.icon-btn img { width: 30px; height: 30px; display: flex; }
.icon-btn:hover { opacity: 1; transform: scale(1.05); cursor: pointer; }

.form {
  text-align: left;
  margin-top: 10px;
  display: grid;
  gap: 8px;
}
.form h2 { margin-bottom: 6px; text-align: center; }
.form label { display: grid; gap: 4px; font-size: 13px; }
.form input { padding: 7px 9px; border: 1px solid #ddd; border-radius: 6px; }

.form-actions {
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;
}

.btn { padding: 7px 10px; border-radius: 6px; border: 1px solid #ccc; cursor: pointer; }
.btn.primary {
  border-radius: 20px; border: none; background-color: #81BB79;
  min-width: 110px; padding: 10px; color: white; opacity: 0.9; transition: 0.2s;
}
.btn.primary:hover { opacity: 1; }
.btn.ghost { background: transparent; border-radius: 20px; color: #333; border: 1px solid #ccc; transition: 0.2s; }
.btn.ghost:hover { border-color: black; }

.error { color: #b00020; font-size: 12px; text-align: center; }
</style>
