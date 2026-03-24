<script setup lang="ts">
import { useAdminPedidos } from '~/composables/useAdmin'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { pedidos, loading, error, buscarPedidos, atualizarStatus, deletarPedido } = useAdminPedidos()

onMounted(() => {
  buscarPedidos()
  
  const interval = setInterval(() => {
    buscarPedidos()
  }, 5000)
  
  onUnmounted(() => clearInterval(interval))
})

const normalizarStatus = (s: string) => {
  const m: Record<string, string> = {
    'PENDENTE': 'Pendente',
    'PREPARACAO': 'Em Preparação',
    'PRONTO': 'Pronto',
    'ENTREGUE': 'Entregue',
    'CANCELADO': 'Cancelado',
  }
  return m[s?.toUpperCase() ?? ''] ?? s
}

const getStatusKey = (s: string) => {
  const normalized = normalizarStatus(s)
  const keyMap: Record<string, string> = {
    'Pendente': 'PENDENTE',
    'Em Preparação': 'PREPARACAO',
    'Pronto': 'PRONTO',
    'Entregue': 'ENTREGUE',
    'Cancelado': 'CANCELADO',
  }
  return keyMap[normalized] ?? s?.toUpperCase()
}

const STATUS_MAP: Record<string, { label: string; class: string; icon: string; next: string | null; prev: string | null }> = {
  PENDENTE:   { label: 'Pendente',   class: 'status-pending',   icon: '⏳', next: 'PREPARACAO',  prev: null },
  PREPARACAO: { label: 'Preparando', class: 'status-preparing', icon: '👨‍🍳', next: 'PRONTO',      prev: 'PENDENTE' },
  PRONTO:     { label: 'Pronto',     class: 'status-ready',     icon: '✅', next: 'ENTREGUE',    prev: 'PREPARACAO' },
  ENTREGUE:   { label: 'Entregue',   class: 'status-delivered', icon: '📦', next: null,          prev: 'PRONTO' },
  CANCELADO:  { label: 'Cancelado',  class: 'status-cancelled', icon: '❌', next: null,         prev: null },
}

const filtroStatus = ref('todos')
const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Em Preparação', label: 'Preparando' },
  { value: 'Pronto', label: 'Pronto' },
  { value: 'Entregue', label: 'Entregue' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const pedidosFiltrados = computed(() => {
  const lista = [...pedidos.value].sort((a: any, b: any) =>
    new Date(b.criado_em ?? 0).getTime() - new Date(a.criado_em ?? 0).getTime()
  )
  if (filtroStatus.value === 'todos') return lista
  console.log('Filtro:', filtroStatus.value, '| Pedidos status:', lista.map((p: any) => p.status))
  return lista.filter((p: any) => normalizarStatus(p.status) === filtroStatus.value)
})

const pedidoExpandido = ref<number | null>(null)

async function avancar(p: any) {
  const currentStatus = getStatusKey(p.status)
  const next = STATUS_MAP[currentStatus]?.next
  if (!next) return
  await atualizarStatus(p.id, next)
  await buscarPedidos()
}

async function voltar(p: any) {
  const currentStatus = getStatusKey(p.status)
  const prev = STATUS_MAP[currentStatus]?.prev
  if (!prev) return
  await atualizarStatus(p.id, prev)
  await buscarPedidos()
}

async function cancelar(p: any) {
  await atualizarStatus(p.id, 'CANCELADO')
  await buscarPedidos()
}

function formatarPreco(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(dt: string) {
  if (!dt) return '–'
  return new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

useHead({ title: 'Pedidos — QuickPed Admin' })
</script>

<template>
  <div class="pedidos-page">
    <div class="admin-page-header row">
      <div>
        <h1 class="admin-page-title">Pedidos</h1>
        <p class="admin-page-sub">Gerencie e acompanhe os pedidos</p>
      </div>
      <button class="btn-refresh" @click="buscarPedidos" :disabled="loading">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ spin: loading }">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Atualizar
      </button>
    </div>

    <!-- Filtros status -->
    <div class="status-filtros">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="status-filtro-btn"
        :class="{ active: filtroStatus === opt.value }"
        @click="filtroStatus = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="admin-card">
      <div class="admin-loading">
        <div class="skeleton" style="height:52px; margin-bottom:8px; border-radius:10px;" v-for="i in 5" :key="i" />
      </div>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="admin-card admin-empty">{{ error }}</div>

    <!-- Lista -->
    <div v-else class="pedidos-list">
      <div v-if="pedidosFiltrados.length === 0" class="admin-card admin-empty">
        Nenhum pedido encontrado.
      </div>

      <div
        v-for="p in pedidosFiltrados"
        :key="p.id"
        class="pedido-card"
      >
        <div class="pedido-card__header" @click="pedidoExpandido = pedidoExpandido === p.id ? null : p.id">
          <div class="pedido-card__meta">
            <span class="pedido-card__id">#{{ p.id }}</span>
            <span class="pedido-card__cliente">{{ p.nome_cliente }}</span>
            <span class="pedido-card__mesa">Mesa {{ p.numero_mesa }}</span>
          </div>
          <div class="pedido-card__right">
            <span class="status-badge" :class="STATUS_MAP[getStatusKey(p.status)]?.class ?? ''">
              <span v-if="STATUS_MAP[getStatusKey(p.status)]?.icon">{{ STATUS_MAP[getStatusKey(p.status)]?.icon }} </span>{{ STATUS_MAP[getStatusKey(p.status)]?.label ?? p.status }}
            </span>
            <span class="pedido-card__total">{{ formatarPreco(p.total) }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              :style="{ transform: pedidoExpandido === p.id ? 'rotate(180deg)' : '', transition: '0.2s' }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- Expandido: itens + ações -->
        <Transition name="fade">
          <div v-if="pedidoExpandido === p.id" class="pedido-card__body">
            <p v-if="p.criado_em" class="pedido-meta-time">{{ formatarData(p.criado_em) }}</p>
            <p v-if="p.obs" class="pedido-obs">📝 {{ p.obs }}</p>

            <ul class="pedido-itens">
              <li v-for="item in p.itens" :key="item.produto_id" class="pedido-item">
                <div class="pedido-item__info">
                  <span class="pedido-item__qty">{{ item.quantidade }}×</span>
                  <span class="pedido-item__nome">{{ item.nome_produto }}</span>
                  <span class="pedido-item__preco-unit">({{ formatarPreco(item.preco_unitario) }} cada)</span>
                  <span v-if="item.adicionais?.length" class="pedido-item__adicionais">
                    + {{ item.adicionais.map((a: any) => a.nome).join(', ') }}
                    <span class="pedido-item__total-adicionais">
                      (+{{ formatarPreco(item.adicionais.reduce((acc: number, a: any) => acc + Number(a.preco), 0)) }} em adicionais)
                    </span>
                  </span>
                </div>
                <span class="pedido-item__total">
                  {{ formatarPreco(Number(item.preco_unitario) * item.quantidade + item.adicionais.reduce((acc: number, a: any) => acc + Number(a.preco) * item.quantidade, 0)) }}
                </span>
              </li>
            </ul>

            <div class="pedido-card__actions">
              <button
                v-if="STATUS_MAP[getStatusKey(p.status)]?.prev"
                class="btn-acao btn-acao--secondary"
                @click="voltar(p)"
              >
                ← Voltar para: {{ STATUS_MAP[STATUS_MAP[getStatusKey(p.status)]?.prev!]?.label }}
              </button>
              <button
                v-if="STATUS_MAP[getStatusKey(p.status)]?.next"
                class="btn-acao btn-acao--primary"
                @click="avancar(p)"
              >
                Avançar para: {{ STATUS_MAP[STATUS_MAP[getStatusKey(p.status)]?.next!]?.label }} →
              </button>
              <button
                v-if="p.status?.toUpperCase() !== 'CANCELADO' && p.status?.toUpperCase() !== 'ENTREGUE'"
                class="btn-acao btn-acao--danger"
                @click="cancelar(p)"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pedidos-page { display: flex; flex-direction: column; gap: 16px; }
.admin-page-header.row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.btn-refresh {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px;
  background: #fff; border: 1.5px solid #e8ede5;
  font-size: 13px; font-weight: 600; color: #1a1f17;
  cursor: pointer; transition: all 0.15s;
}
.btn-refresh:hover { border-color: var(--color-primary); color: var(--color-primary); }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

/* Filtros */
.status-filtros {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.status-filtro-btn {
  padding: 6px 14px; border-radius: 99px;
  font-size: 13px; font-weight: 500;
  background: #fff; border: 1.5px solid #e8ede5;
  color: #6b7568; cursor: pointer; transition: all 0.15s;
}
.status-filtro-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.status-filtro-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* Cards */
.pedidos-list { display: flex; flex-direction: column; gap: 10px; }
.pedido-card {
  background: #fff; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.pedido-card__header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 14px 18px; cursor: pointer;
  gap: 12px; flex-wrap: wrap;
}
.pedido-card__header:hover { background: #fafbf9; }
.pedido-card__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pedido-card__id { font-size: 12px; color: #9ba898; font-weight: 600; }
.pedido-card__cliente { font-size: 14px; font-weight: 700; color: #1a1f17; }
.pedido-card__mesa { font-size: 13px; color: #6b7568; }
.pedido-card__right { display: flex; align-items: center; gap: 10px; }
.pedido-card__total { font-size: 14px; font-weight: 800; color: var(--color-primary); }

.pedido-card__body {
  padding: 0 18px 16px; border-top: 1px solid #f0f1ee;
  display: flex; flex-direction: column; gap: 10px;
}
.pedido-meta-time { font-size: 12px; color: #9ba898; padding-top: 12px; }
.pedido-obs { font-size: 13px; color: #6b7568; background: #f7f8f5; padding: 8px 12px; border-radius: 8px; }

.pedido-itens { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.pedido-item {
  display: flex; align-items: flex-start; justify-content: space-between;
  font-size: 13px; gap: 12px;
}
.pedido-item__info { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; flex: 1; }
.pedido-item__qty { font-weight: 700; color: var(--color-primary); flex-shrink: 0; }
.pedido-item__nome { font-weight: 600; }
.pedido-item__preco-unit { font-size: 11px; color: #9ba898; }
.pedido-item__adicionais { font-size: 12px; color: #6b7568; display: flex; flex-direction: column; gap: 2px; }
.pedido-item__total-adicionais { font-size: 11px; color: #9ba898; }
.pedido-item__total { font-weight: 700; color: #1a1f17; flex-shrink: 0; }

.pedido-card__actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.btn-acao {
  padding: 8px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.btn-acao--primary { background: var(--color-primary-bg); color: var(--color-primary); }
.btn-acao--primary:hover { background: var(--color-primary); color: #fff; }
.btn-acao--secondary { background: #f3f4f6; color: #6b7568; }
.btn-acao--secondary:hover { background: #e5e7eb; color: #1a1f17; }
.btn-acao--danger { background: #fce4ec; color: #c62828; }
.btn-acao--danger:hover { background: #c62828; color: #fff; }

.admin-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.admin-loading, .admin-empty { padding: 24px; color: #9ba898; font-size: 14px; text-align: center; }

.status-badge {
  display: inline-flex; padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
}
.status-pending   { background: #fff3e0; color: #e65100; }
.status-preparing { background: #fff9c4; color: #f57f17; }
.status-ready     { background: #e8f5e9; color: #2e7d32; }
.status-delivered { background: #e3f2fd; color: #1565c0; }
.status-cancelled { background: #fce4ec; color: #c62828; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.7s linear infinite; }
</style>
