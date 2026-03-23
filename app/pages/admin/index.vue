<script setup lang="ts">
import { useAdminPedidos, useAdminMesas, useAdminComandas } from '~/composables/useAdmin'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { pedidos, loading: loadingPedidos, buscarPedidos, atualizarStatus } = useAdminPedidos()
const { mesas, loading: loadingMesas, buscar: buscarMesas } = useAdminMesas()
const { comandas, loading: loadingComandas, buscar: buscarComandas } = useAdminComandas()

onMounted(async () => {
  await Promise.all([buscarPedidos(), buscarMesas(), buscarComandas()])
})

// Estatísticas do dashboard
const pedidosPendentes = computed(() =>
  pedidos.value.filter((p: any) => p.status === 'pendente').length
)
const pedidosHoje = computed(() => pedidos.value.length)
const mesasAtivas = computed(() => mesas.value.filter((m: any) => m.ativa).length)
const comandasAbertas = computed(() => comandas.value.filter((c: any) => c.status === 'aberta').length)

const pedidosRecentes = computed(() =>
  [...pedidos.value]
    .sort((a: any, b: any) => new Date(b.criado_em ?? 0).getTime() - new Date(a.criado_em ?? 0).getTime())
    .slice(0, 8)
)

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  PENDENTE:   { label: 'Pendente',   class: 'status-pending' },
  PREPARACAO: { label: 'Preparando', class: 'status-preparing' },
  PRONTO:     { label: 'Pronto',     class: 'status-ready' },
  ENTREGUE:   { label: 'Entregue',   class: 'status-delivered' },
  CANCELADO:  { label: 'Cancelado',  class: 'status-cancelled' },
}

function getStatus(s: string) {
  return STATUS_LABEL[s] ?? { label: s, class: '' }
}

async function avancarStatus(pedido: any) {
  const fluxo = ['PENDENTE', 'PREPARACAO', 'PRONTO', 'ENTREGUE']
  const idx = fluxo.indexOf(pedido.status)
  if (idx < 0 || idx >= fluxo.length - 1) return
  await atualizarStatus(pedido.id, fluxo[idx + 1])
  await buscarPedidos()
}

function formatarPreco(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

useHead({ title: 'Dashboard — QuickPed Admin' })
</script>

<template>
  <div class="dashboard">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Dashboard</h1>
      <p class="admin-page-sub">Visão geral em tempo real</p>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-card--primary">
        <div class="kpi-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <div class="kpi-card__info">
          <p class="kpi-card__label">Pedidos hoje</p>
          <p class="kpi-card__value">{{ loadingPedidos ? '–' : pedidosHoje }}</p>
        </div>
      </div>

      <div class="kpi-card kpi-card--warning">
        <div class="kpi-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="kpi-card__info">
          <p class="kpi-card__label">Aguardando</p>
          <p class="kpi-card__value">{{ loadingPedidos ? '–' : pedidosPendentes }}</p>
        </div>
      </div>

      <div class="kpi-card kpi-card--success">
        <div class="kpi-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
        </div>
        <div class="kpi-card__info">
          <p class="kpi-card__label">Mesas ativas</p>
          <p class="kpi-card__value">{{ loadingMesas ? '–' : mesasAtivas }}</p>
        </div>
      </div>

      <div class="kpi-card kpi-card--info">
        <div class="kpi-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="kpi-card__info">
          <p class="kpi-card__label">Comandas abertas</p>
          <p class="kpi-card__value">{{ loadingComandas ? '–' : comandasAbertas }}</p>
        </div>
      </div>
    </div>

    <!-- Pedidos recentes -->
    <div class="admin-card">
      <div class="admin-card__header">
        <h2 class="admin-card__title">Pedidos recentes</h2>
        <NuxtLink to="/admin/pedidos" class="admin-link">Ver todos →</NuxtLink>
      </div>

      <div v-if="loadingPedidos" class="admin-loading">
        <div class="skeleton" style="height:40px; margin-bottom:8px; border-radius:8px;" v-for="i in 5" :key="i" />
      </div>

      <div v-else-if="pedidosRecentes.length === 0" class="admin-empty">
        Nenhum pedido registrado ainda.
      </div>

      <div v-else class="pedidos-table-wrap">
        <table class="pedidos-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pedidosRecentes" :key="p.id">
              <td class="td-id">#{{ p.id }}</td>
              <td>{{ p.nome_cliente }}</td>
              <td>Mesa {{ p.numero_mesa }}</td>
              <td class="td-preco">{{ formatarPreco(p.total) }}</td>
              <td>
                <span class="status-badge" :class="getStatus(p.status).class">
                  {{ getStatus(p.status).label }}
                </span>
              </td>
              <td>
                <button
                  v-if="p.status !== 'ENTREGUE' && p.status !== 'CANCELADO'"
                  class="btn-avançar"
                  @click="avancarStatus(p)"
                >
                  Avançar →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

.admin-page-header { margin-bottom: 4px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.kpi-card__icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-card--primary .kpi-card__icon { background: #e8f5e9; color: #2e7d32; }
.kpi-card--warning .kpi-card__icon { background: #fff3e0; color: #e65100; }
.kpi-card--success .kpi-card__icon { background: #e3f2fd; color: #1565c0; }
.kpi-card--info .kpi-card__icon { background: #f3e5f5; color: #6a1b9a; }
.kpi-card__label { font-size: 12px; color: #6b7568; font-weight: 500; }
.kpi-card__value { font-size: 26px; font-weight: 800; color: #1a1f17; line-height: 1.1; }

/* Card */
.admin-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.admin-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid #e8ede5;
}
.admin-card__title { font-size: 15px; font-weight: 700; color: #1a1f17; }
.admin-link { font-size: 13px; color: var(--color-primary); font-weight: 600; text-decoration: none; }
.admin-link:hover { text-decoration: underline; }

.admin-loading, .admin-empty {
  padding: 20px;
  color: #9ba898; font-size: 14px; text-align: center;
}

/* Tabela */
.pedidos-table-wrap { overflow-x: auto; }
.pedidos-table {
  width: 100%; border-collapse: collapse;
  font-size: 14px;
}
.pedidos-table th {
  padding: 10px 16px;
  text-align: left; background: #f7f8f5;
  color: #6b7568; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.pedidos-table td {
  padding: 12px 16px; border-bottom: 1px solid #f0f1ee;
  color: #1a1f17;
}
.pedidos-table tr:last-child td { border-bottom: none; }
.pedidos-table tr:hover td { background: #fafbf9; }
.td-id { color: #9ba898; font-size: 13px; }
.td-preco { font-weight: 700; color: var(--color-primary); }

.status-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
}
.status-pending   { background: #fff3e0; color: #e65100; }
.status-preparing { background: #fff9c4; color: #f57f17; }
.status-ready     { background: #e8f5e9; color: #2e7d32; }
.status-delivered { background: #e3f2fd; color: #1565c0; }
.status-cancelled { background: #fce4ec; color: #c62828; }

.btn-avançar {
  padding: 5px 12px; border-radius: 8px;
  background: var(--color-primary-bg); color: var(--color-primary);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s ease;
}
.btn-avançar:hover { background: var(--color-primary); color: #fff; }
</style>
