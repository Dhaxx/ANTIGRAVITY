<script setup lang="ts">
defineProps<{
  mensagem?: string
}>()

const emit = defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <div class="error-state">
    <div class="error-state__icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <p class="error-state__msg">{{ mensagem || 'Não foi possível carregar o cardápio.' }}</p>
    <p class="error-state__hint">Usando cardápio de demonstração.</p>
    <button class="error-state__btn" @click="emit('retry')">Tentar novamente</button>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}
.error-state__icon { color: var(--color-primary); opacity: 0.5; }
.error-state__msg { font-size: 15px; font-weight: 600; color: var(--color-text); }
.error-state__hint { font-size: 13px; color: var(--color-text-muted); }
.error-state__btn {
  margin-top: 8px;
  padding: 10px 20px;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition);
  cursor: pointer;
}
.error-state__btn:hover { background: var(--color-primary); color: #fff; }
</style>
