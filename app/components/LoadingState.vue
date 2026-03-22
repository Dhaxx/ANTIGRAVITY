<script setup lang="ts">
defineProps<{
  linhas?: number
}>()
</script>

<template>
  <div class="loading-state">
    <div class="loading-state__grid">
      <div v-for="i in (linhas ?? 6)" :key="i" class="loading-state__card">
        <div class="skeleton loading-state__img" />
        <div class="loading-state__body">
          <div class="skeleton loading-state__nome" />
          <div class="skeleton loading-state__desc" />
          <div class="skeleton loading-state__preco" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}
.loading-state__card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.loading-state__img {
  width: 100%;
  aspect-ratio: 4/3;
}
.loading-state__body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.loading-state__nome { height: 16px; width: 70%; }
.loading-state__desc { height: 12px; width: 90%; }
.loading-state__preco { height: 14px; width: 40%; }
</style>
