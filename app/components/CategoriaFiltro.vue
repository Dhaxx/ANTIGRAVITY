<script setup lang="ts">
import type { CategoriaPublic } from '~/types/api'

defineProps<{
  categorias: CategoriaPublic[]
  categoriaAtiva: number | null
}>()

const emit = defineEmits<{
  (e: 'selecionar', id: number | null): void
}>()
</script>

<template>
  <div class="categoria-filtro">
    <div class="categoria-filtro__scroll">
      <button
        class="categoria-filtro__btn"
        :class="{ active: categoriaAtiva === null }"
        @click="emit('selecionar', null)"
      >
        Todos
      </button>
      <button
        v-for="cat in categorias"
        :key="cat.id"
        class="categoria-filtro__btn"
        :class="{ active: categoriaAtiva === cat.id }"
        @click="emit('selecionar', cat.id)"
      >
        {{ cat.icone}}
        {{ cat.nome }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.categoria-filtro {
  background: var(--color-surface);
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.categoria-filtro__scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.categoria-filtro__scroll::-webkit-scrollbar { display: none; }

.categoria-filtro__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-alt);
  border: 1.5px solid transparent;
  transition: all var(--transition);
  cursor: pointer;
  flex-shrink: 0;
}
.categoria-filtro__btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}
.categoria-filtro__btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  font-weight: 600;
}
</style>
