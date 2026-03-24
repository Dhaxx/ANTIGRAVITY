<script setup lang="ts">
import { useCarrinhoStore } from '~/stores/carrinho'

const carrinho = useCarrinhoStore()

const props = defineProps<{
  nomeEstabelecimento?: string
  comandaAberta?: boolean
}>()

const emit = defineEmits<{
  (e: 'ver-comanda'): void
}>()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner container">
      <div class="app-header__brand">
        <div class="app-header__logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <div>
          <p class="app-header__name">{{ nomeEstabelecimento || 'Cardápio' }}</p>
          <p class="app-header__subtitle">Faça seu pedido</p>
        </div>
      </div>

      <div class="app-header__actions">
        <button v-if="comandaAberta" class="app-header__comanda" @click="emit('ver-comanda')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Ver comanda
        </button>

        <button class="app-header__cart" @click="carrinho.abrirCarrinho()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span class="app-header__cart-price">{{ formatarPreco(carrinho.totalPreco) }}</span>
          <Transition name="pop">
            <span v-if="carrinho.totalItens > 0" class="badge">{{ carrinho.totalItens }}</span>
          </Transition>
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
function formatarPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header__logo {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-header__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.app-header__subtitle {
  font-size: 11px;
  color: var(--color-text-muted);
}

.app-header__cart {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface-alt);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 8px 14px 8px 12px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  position: relative;
  transition: all var(--transition);
  cursor: pointer;
}
.app-header__cart:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.app-header__cart-price {
  font-size: 13px;
  font-weight: 600;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header__comanda {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-surface-alt);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 8px 12px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}
.app-header__comanda:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
.pop-enter-active { animation: pop 0.25s ease; }
.pop-leave-active { transition: all 0.15s ease; }
.pop-leave-to { transform: scale(0); opacity: 0; }
</style>
