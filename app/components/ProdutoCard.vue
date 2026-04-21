<script setup lang="ts">
import type { ProdutoPublic } from '~/types/api'

defineProps<{
  produto: ProdutoPublic
  modoCardapioDigital?: boolean
}>()

const emit = defineEmits<{
  (e: 'abrir', produto: ProdutoPublic): void
}>()

function formatarPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div class="produto-card" @click="emit('abrir', produto)">
    <div class="produto-card__img-wrap">
      <img
        v-if="produto.imagem_url"
        :src="produto.imagem_url"
        :alt="produto.nome"
        class="produto-card__img"
      />
      <div v-else class="produto-card__img-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    </div>

    <div class="produto-card__body">
      <h3 class="produto-card__nome">{{ produto.nome }}</h3>
      <p v-if="produto.descricao" class="produto-card__desc">{{ produto.descricao }}</p>
      <div class="produto-card__footer">
        <span class="produto-card__preco">{{ formatarPreco(produto.preco) }}</span>
        <button v-if="!modoCardapioDigital" class="btn-icon produto-card__add" @click.stop="emit('abrir', produto)" :aria-label="`Adicionar ${produto.nome}`">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.produto-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: transform var(--transition), box-shadow var(--transition);
  display: flex;
  flex-direction: column;
}
.produto-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.produto-card:active {
  transform: translateY(0);
}

.produto-card__img-wrap {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: var(--color-surface-alt);
  flex-shrink: 0;
}
.produto-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.produto-card:hover .produto-card__img {
  transform: scale(1.05);
}
.produto-card__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8ede5, #f7f8f5);
}

.produto-card__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.produto-card__nome {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}
.produto-card__desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.produto-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.produto-card__preco {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
}
.produto-card__add {
  width: 32px;
  height: 32px;
  font-size: 22px;
  font-weight: 300;
}
</style>
