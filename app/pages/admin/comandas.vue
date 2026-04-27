<script setup lang="ts">
import { useAdminComandas } from '~/composables/useAdmin'
import { useSanitize } from '~/composables/useSanitize'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { comandas, loading, buscar, fecharComanda, imprimirComanda } = useAdminComandas()

onMounted(async () => {
  await buscar()
})

const tab = ref<'abertas' | 'fechadas'>('abertas')

watch(tab, async () => {
  const status = tab.value === 'abertas' ? 'aberta' : 'fechada'
  await buscar(status)
})

const comandasAbertas = computed(() =>
  comandas.value.filter((c: any) => c.status === 'aberta')
)

const comandasFechadas = computed(() =>
  comandas.value.filter((c: any) => c.status === 'fechada')
)

const busca = ref('')
const { escapeHtml } = useSanitize()

const expandedComanda = ref<number | null>(null)

const currentComandas = computed(() => {
  return tab.value === 'abertas' ? comandasAbertas.value : comandasFechadas.value
})

const comandasFiltradas = computed(() => {
  const term = busca.value.toLowerCase().trim()
  if (!term) return currentComandas.value
  return currentComandas.value.filter((c: any) => {
    const nomeCliente = c.pedidos?.some((p: any) => p.nome_cliente?.toLowerCase().includes(term))
    return String(c.numero_mesa).includes(term) || nomeCliente
  })
})

function toggleExpand(id: number) {
  expandedComanda.value = expandedComanda.value === id ? null : id
}

function formatarPreco(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const closingComanda = ref<number | null>(null)
const printingComanda = ref<number | null>(null)
const formaPagamentoSelecionada = ref<Record<number, string>>({})

async function handleFecharComanda(comandaId: number) {
  const comanda = comandas.value.find((c: any) => c.id === comandaId)
  const pedidosEmAberto = comanda?.pedidos?.filter((p: any) => p.status === 'Pendente' || p.status === 'Em Preparação' || p.status === 'Pronto')
  
  let forcar = false
  if (pedidosEmAberto?.length) {
    if (!confirm(`Esta comanda tem ${pedidosEmAberto.length} pedido(s) em aberto.\nDeseja fechar mesmo assim? Os pedidos em aberto serão marcados como entregados.`)) {
      return
    }
    forcar = true
  } else {
    if (!confirm('Tem certeza que deseja fechar esta comanda?\nO pagamento foi recebido fora do sistema?')) {
      return
    }
  }
  closingComanda.value = comandaId
  try {
    await fecharComanda(comandaId, forcar, formaPagamentoSelecionada.value[comandaId] || null)
    await buscar()
    expandedComanda.value = null
    delete formaPagamentoSelecionada.value[comandaId]
  } catch (e: any) {
    const msg = e?.data?.detail || e?.message || 'Erro ao fechar comanda'
    alert(msg)
  } finally {
    closingComanda.value = null
  }
}

async function handleImprimirComanda(comandaId: number) {
  printingComanda.value = comandaId
  try {
    await imprimirComanda(comandaId)
  } catch (e: any) {
    const msg = e?.data?.detail || e?.message || 'Erro ao enviar para impressão'
    alert(msg)
  } finally {
    printingComanda.value = null
  }
}

useHead({ title: 'Comandas — QuickPed Admin' })
</script>

<template>
  <div class="comandas-page">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Comandas</h1>
      <p class="admin-page-sub">Gerencie as comandas</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'abertas' }" @click="tab = 'abertas'">
        Abertas
      </button>
      <button class="tab" :class="{ active: tab === 'fechadas' }" @click="tab = 'fechadas'">
        Fechadas
      </button>
    </div>

    <div class="search-box">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input
        v-model="busca"
        type="text"
        placeholder="Buscar por nº da mesa ou nome do cliente..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="admin-loading">
      <div class="skeleton" style="height:80px; margin-bottom:12px; border-radius:12px;" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="comandasFiltradas.length === 0" class="admin-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <path d="M12 17V7"/>
      </svg>
      <p>{{ busca ? 'Nenhuma comanda encontrada para a busca' : 'Nenhuma comanda aberta no momento' }}</p>
    </div>

    <div v-else class="comandas-grid">
      <div
        v-for="comanda in comandasFiltradas"
        :key="comanda.id"
        class="comanda-card"
        :class="{ expanded: expandedComanda === comanda.id }"
      >
        <div class="comanda-card__header" @click="toggleExpand(comanda.id)">
          <div class="comanda-card__info">
            <span class="comanda-card__mesa">Mesa {{ comanda.numero_mesa }}</span>
            <span class="comanda-card__id">#{{ comanda.id }}</span>
          </div>
          <div class="comanda-card__status">
            <span :class="'status-comanda-' + comanda.status">{{ comanda.status === 'aberta' ? 'Aberta' : 'Fechada' }}</span>
          </div>
          <div class="comanda-card__total">
            {{ formatarPreco(comanda.total) }}
          </div>
          <svg
            class="comanda-card__arrow"
            :class="{ rotated: expandedComanda === comanda.id }"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <Transition name="expand">
          <div v-if="expandedComanda === comanda.id" class="comanda-card__body">
            <div v-if="comanda.pedidos?.length" class="pedidos-list">
              <div v-for="pedido in comanda.pedidos" :key="pedido.id" class="pedido-item">
                <div class="pedido-item__header">
                  <div>
                    <span class="pedido-item__id">Pedido #{{ pedido.id }}</span>
                    <span v-if="pedido.nome_cliente" class="pedido-item__cliente">{{ escapeHtml(pedido.nome_cliente) }}</span>
                  </div>
                  <span class="pedido-item__status" :class="'status-' + pedido.status.toLowerCase()">
                    {{ pedido.status }}
                  </span>
                </div>
                <div class="pedido-item__itens">
                  <div v-for="(item, idx) in pedido.itens" :key="idx" class="item-row">
                    <div class="item-info">
                      <span class="item-qtd">{{ item.quantidade }}x</span>
                      <span class="item-nome">{{ item.nome_produto }}</span>
                      <span class="item-preco-unit">({{ formatarPreco(item.preco_unitario) }} cada)</span>
                      <span v-if="item.adicionais?.length" class="item-adicionais">
                        + {{ item.adicionais.map((a: any) => a.nome).join(', ') }}
                        <span class="item-total-adicionais">
                          (+{{ formatarPreco(item.adicionais.reduce((acc: number, a: any) => acc + Number(a.preco), 0)) }})
                        </span>
                      </span>
                    </div>
                    <span class="item-preco">
                      {{ formatarPreco(Number(item.preco_unitario) * item.quantidade + (item.adicionais?.reduce((acc: number, a: any) => acc + Number(a.preco) * item.quantidade, 0) || 0)) }}
                    </span>
                  </div>
                </div>
                <div class="pedido-item__total">
                  Total: {{ formatarPreco(pedido.total) }}
                </div>
              </div>
            </div>
            <div v-else class="sem-pedidos">
              Nenhum pedido nesta comanda
            </div>
            <div v-if="comanda.status === 'aberta'" class="comanda-card__actions">
              <select
                v-model="formaPagamentoSelecionada[comanda.id]"
                class="forma-pagamento-select"
              >
                <option :value="undefined">Pagamento</option>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CREDITO">Crédito</option>
                <option value="DEBITO">Débito</option>
              </select>
              <button
                class="btn-imprimir"
                :disabled="printingComanda === comanda.id"
                @click="handleImprimirComanda(comanda.id)"
              >
                <svg v-if="printingComanda === comanda.id" class="spinner" width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                {{ printingComanda === comanda.id ? 'Enviando...' : 'Imprimir' }}
              </button>
              <button
                class="btn-fechar"
                :disabled="closingComanda === comanda.id"
                @click="handleFecharComanda(comanda.id)"
              >
                <svg v-if="closingComanda === comanda.id" class="spinner" width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="30 70"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {{ closingComanda === comanda.id ? 'Fechando...' : 'Fechar Comanda' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comandas-page { display: flex; flex-direction: column; gap: 24px; }

.admin-page-header { margin-bottom: 4px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.tabs {
  display: flex; gap: 8px;
  margin-bottom: 16px;
}
.tab {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e8ede5;
  background: #fff;
  color: #6b7568;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.tab:hover { background: #fafbf9; }
.tab.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ba898;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid #e8ede5;
  border-radius: 10px;
  font-size: 14px;
  background: #fff;
  color: #1a1f17;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(34, 91, 33, 0.1);
}
.search-input::placeholder { color: #9ba898; }

.admin-loading { display: flex; flex-direction: column; gap: 12px; }
.skeleton { background: linear-gradient(90deg, #e8ede5 25%, #f4f6f3 50%, #e8ede5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.admin-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; color: #9ba898;
}
.admin-empty-state svg { margin-bottom: 16px; opacity: 0.5; }
.admin-empty-state p { font-size: 15px; }

.comandas-grid {
  display: flex; flex-direction: column; gap: 12px;
}

.comanda-card {
  background: #fff; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.comanda-card.expanded { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.comanda-card__header {
  display: flex; align-items: center; padding: 18px 20px;
  cursor: pointer; user-select: none;
}
.comanda-card__header:hover { background: #fafbf9; }

.comanda-card__info { display: flex; flex-direction: column; gap: 2px; }
.comanda-card__mesa { font-size: 16px; font-weight: 700; color: #1a1f17; }
.comanda-card__id { font-size: 12px; color: #9ba898; }

.comanda-card__status {
  margin-left: 12px;
}
.comanda-card__status span {
  font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
}
.status-comanda-aberta { background: #e8f5e9; color: #2e7d32; }
.status-comanda-fechada { background: #eceff1; color: #546e7a; }

.comanda-card__total {
  margin-left: auto; margin-right: 12px;
  font-size: 18px; font-weight: 800; color: var(--color-primary);
}

.comanda-card__arrow {
  color: #9ba898; transition: transform 0.2s;
}
.comanda-card__arrow.rotated { transform: rotate(180deg); }

.comanda-card__body {
  border-top: 1px solid #f0f1ee;
  padding: 16px 20px;
  background: #fafbf9;
}

.pedidos-list {
  display: flex; flex-direction: column; gap: 12px;
}

.pedido-item {
  background: #fff; border-radius: 10px; padding: 14px;
  border: 1px solid #e8ede5;
}

.pedido-item__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px;
}
.pedido-item__id { font-size: 13px; font-weight: 600; color: #1a1f17; }
.pedido-item__cliente { display: block; font-size: 12px; color: #6b7568; margin-top: 2px; }
.pedido-item__status {
  font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
  text-transform: uppercase;
}
.status-pendente { background: #fff3e0; color: #e65100; }
.status-preparacao { background: #fff9c4; color: #f57f17; }
.status-pronto { background: #e8f5e9; color: #2e7d32; }
.status-entregue { background: #e3f2fd; color: #1565c0; }
.status-cancelado { background: #fce4ec; color: #c62828; }

.pedido-item__itens { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.item-row { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; }
.item-qtd { color: #9ba898; font-weight: 600; min-width: 24px; }
.item-nome { flex: 1; color: #1a1f17; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-preco-unit { font-size: 11px; color: #9ba898; }
.item-adicionais { font-size: 11px; color: #6b7568; display: flex; flex-direction: column; gap: 1px; }
.item-total-adicionais { font-size: 11px; color: #6b7568; }
.item-preco { font-weight: 600; color: #1a1f17; white-space: nowrap; }

.pedido-item__total {
  font-size: 14px; font-weight: 700; color: var(--color-primary);
  text-align: right;
  padding-top: 10px; border-top: 1px dashed #e8ede5;
}

.sem-pedidos { color: #9ba898; font-size: 14px; text-align: center; padding: 20px; }

.comanda-card__actions {
  margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px; align-items: center;
}

.forma-pagamento-select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e8ede5;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #1a1f17;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.forma-pagamento-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(34, 91, 33, 0.1);
}

.btn-imprimir {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 10px;
  background: #2563eb; color: #fff;
  font-size: 14px; font-weight: 600;
  cursor: pointer; border: none;
  transition: all 0.15s;
}
.btn-imprimir:hover:not(:disabled) { background: #1d4ed8; }
.btn-imprimir:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-fechar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 10px;
  background: #ef4444; color: #fff;
  font-size: 14px; font-weight: 600;
  cursor: pointer; border: none;
  transition: all 0.15s;
}
.btn-fechar:hover:not(:disabled) { background: #dc2626; }
.btn-fechar:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 500px; }
</style>