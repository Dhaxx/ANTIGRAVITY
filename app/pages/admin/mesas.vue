<script setup lang="ts">
import { useAdminMesas, useAdminEstabelecimento } from '~/composables/useAdmin'
import QRCode from 'qrcode'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { mesas, loading, buscar, criar, atualizar, deletar } = useAdminMesas()
const { estabelecimento, buscar: buscarEstabelecimento } = useAdminEstabelecimento()
onMounted(async () => {
  await Promise.all([buscar(), buscarEstabelecimento()])
})

const showForm = ref(false)
const novoNumero = ref<string>('')
const novoNome = ref<string>('')
const formLoading = ref(false)
const editingNomeId = ref<number | null>(null)
const editingNomeValue = ref('')

function startEditNome(mesa: any) {
  editingNomeId.value = mesa.id
  editingNomeValue.value = mesa.nome || ''
}

function saveNome(mesaId: number) {
  atualizar(mesaId, { nome: editingNomeValue.value || null })
  editingNomeId.value = null
  editingNomeValue.value = ''
}

function cancelEditNome() {
  editingNomeId.value = null
  editingNomeValue.value = ''
}

async function adicionarMesa() {
  if (!novoNumero.value || Number(novoNumero.value) <= 0) return
  formLoading.value = true
  try {
    await criar(Number(novoNumero.value), novoNome.value || null)
    novoNumero.value = ''
    novoNome.value = ''
    showForm.value = false
  } finally { formLoading.value = false }
}

const mesasOrdenadas = computed(() =>
  [...mesas.value].sort((a: any, b: any) => a.numero - b.numero)
)
const mesasAtivas = computed(() => mesasOrdenadas.value.filter((m: any) => m.ativa))

const baseUrl = computed(() => {
  if (import.meta.client) return window.location.origin
  return ''
})

function linkMesa(token: string) {
  const slug = estabelecimento.value?.slug || 'estabelecimento'
  return `${baseUrl.value}/${slug}/cardapio?mesa=${token}`
}

const qrCodes = ref<Record<number, string>>({})

async function gerarQR(mesa: any) {
  if (qrCodes.value[mesa.id]) return
  const url = linkMesa(mesa.token)
  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, url, { width: 120, margin: 1, color: { dark: '#1a2332', light: '#ffffff' } })
  qrCodes.value[mesa.id] = canvas.toDataURL('image/png')
}

watch([mesasOrdenadas, () => estabelecimento.value], async ([novas]) => {
  if (!estabelecimento.value?.nome) return
  await nextTick()
  for (const mesa of novas) {
    if (mesa.token) {
      delete qrCodes.value[mesa.id]
      await gerarQR(mesa)
    }
  }
}, { immediate: true })

function copiarLink(token: string) {
  navigator.clipboard?.writeText(linkMesa(token))
}

function printQR(mesa: any) {
  const w = window.open('', '_blank')
  if (!w) return
  const nome = estabelecimento.value?.nome || 'Estabelecimento'
  const mesaNome = mesa.nome ? `<div class="mesa-nome">${mesa.nome}</div>` : ''
  w.document.write(`
    <html><head><title>QR Mesa ${mesa.numero}</title>
    <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;text-align:center}img{margin-bottom:16px;border-radius:8px}.mesa-num{font-size:28px;font-weight:800;margin-bottom:4px}.mesa-nome{font-size:18px;font-weight:600;color:var(--color-primary,#2e7d32);margin-bottom:8px}.estab{font-size:14px;color:#888}.qr-wrap{border:2px dashed #e0e0e0;border-radius:12px;padding:24px;display:inline-block}</style>
    </head><body>
    <div class="qr-wrap">
      <div class="mesa-num">Mesa ${mesa.numero}</div>
      ${mesaNome}
      <div class="estab">${nome}</div>
      <img src="${qrCodes.value[mesa.id]}" width="200" height="200" />
      <div class="estab">Escaneie para fazer seu pedido</div>
    </div>
    <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>
  `)
}

function printAllQRCodes() {
  const w = window.open('', '_blank')
  if (!w) return
  const nome = estabelecimento.value?.nome || 'Estabelecimento'
  const ativos = mesasAtivas.value.filter(m => qrCodes.value[m.id])
  let cards = ativos.map(m => {
    const mesaNome = m.nome ? `<div class="mesa-nome">${m.nome}</div>` : ''
    return `
    <div class="mesa-card">
      <div class="mesa-num">Mesa ${m.numero}</div>
      ${mesaNome}
      <div class="estab">${nome}</div>
      <img src="${qrCodes.value[m.id]}" width="140" height="140" />
      <div class="estab">Escaneie para fazer seu pedido</div>
    </div>
  `}).join('')
  w.document.write(`
    <html><head><title>QR Mesas</title>
    <style>body{font-family:sans-serif;padding:20px;margin:0;display:flex;flex-wrap:wrap;gap:16px;justify-content:center}img{border-radius:8px}.mesa-card{text-align:center;border:2px dashed #e0e0e0;border-radius:12px;padding:16px;display:inline-flex;flex-direction:column;align-items:center;gap:4px}.mesa-num{font-size:22px;font-weight:800}.mesa-nome{font-size:14px;font-weight:600;color:#2e7d32;margin-bottom:4px}.estab{font-size:12px;color:#888}@media print{body{display:flex!important;flex-wrap:wrap!important}}@page{size:A4;margin:8mm}</style>
    </head><body>${cards}
    <script>window.onload=function(){window.print();window.close();}<\/script>
    </body></html>
  `)
}

useHead({ title: 'Mesas — QuickPed Admin' })
</script>

<template>
  <div class="mesas-page">
    <div class="admin-page-header row">
      <div>
        <h1 class="admin-page-title">Mesas</h1>
        <p class="admin-page-sub">Gerencie e monitore as mesas do estabelecimento</p>
      </div>
      <div class="header-actions">
        <button v-if="mesasAtivas.length > 0" class="btn-print-all" @click="printAllQRCodes">
          🖨️ Imprimir todos ({{ mesasAtivas.length }})
        </button>
        <button class="btn-add" @click="showForm = !showForm">+ Nova mesa</button>
      </div>
    </div>

    <!-- Form nova mesa inline -->
    <Transition name="fade">
      <div v-if="showForm" class="nova-mesa-form">
        <div class="form-group" style="max-width: 160px">
          <label class="form-label">Número da mesa</label>
          <input
            v-model="novoNumero"
            class="form-input"
            type="number"
            min="1"
            placeholder="Ex: 5"
            @keyup.enter="adicionarMesa"
          />
        </div>
        <div class="form-group" style="max-width: 200px">
          <label class="form-label">Nome (opcional)</label>
          <input
            v-model="novoNome"
            class="form-input"
            type="text"
            placeholder="Ex: Varanda"
            @keyup.enter="adicionarMesa"
          />
        </div>
        <div class="nova-mesa-actions">
          <button class="btn-primary nova-mesa-btn" :disabled="formLoading || !novoNumero" @click="adicionarMesa">
            {{ formLoading ? 'Criando...' : 'Criar mesa' }}
          </button>
          <button class="btn-cancel" @click="showForm = false">Cancelar</button>
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="mesas-grid">
      <div class="skeleton mesa-card-skeleton" v-for="i in 6" :key="i" />
    </div>

    <!-- Grid de mesas -->
    <div v-else-if="mesasOrdenadas.length === 0" class="admin-card admin-empty">
      Nenhuma mesa cadastrada. Crie a primeira acima.
    </div>

    <div v-else class="mesas-grid">
      <div
        v-for="mesa in mesasOrdenadas"
        :key="mesa.id"
        class="mesa-card"
        :class="{ 'mesa-card--inativa': !mesa.ativa }"
      >
        <div class="mesa-card__top">
          <div class="mesa-card__numero">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            <template v-if="editingNomeId === mesa.id">
              <input
                v-model="editingNomeValue"
                class="form-input"
                style="width: 100px; padding: 4px 8px; font-size: 14px;"
                placeholder="Nome"
                @keyup.enter="saveNome(mesa.id)"
                @keyup.escape="cancelEditNome"
                @blur="saveNome(mesa.id)"
              />
            </template>
            <template v-else>
              <span @click="startEditNome(mesa)" style="cursor: pointer;" title="Clique para editar o nome">
                Mesa {{ mesa.numero }}<span v-if="mesa.nome" style="font-weight: 400; color: #6b7568;"> — {{ mesa.nome }}</span>
              </span>
            </template>
          </div>
          <span class="status-pill" :class="mesa.ativa ? 'pill--green' : 'pill--gray'">
            {{ mesa.ativa ? 'Ativa' : 'Inativa' }}
          </span>
        </div>

        <div class="mesa-card__qr">
          <img v-if="qrCodes[mesa.id]" :src="qrCodes[mesa.id]" alt="QR Mesa {{ mesa.numero }}" class="qr-img" />
          <div v-else class="qr-loading">
            <div class="qr-spinner" />
          </div>
        </div>

        <div class="mesa-card__actions">
          <button
            class="mesa-action-btn"
            :title="mesa.ativa ? 'Desativar mesa' : 'Ativar mesa'"
            @click="atualizar(mesa.id, { ativa: !mesa.ativa })"
          >
            {{ mesa.ativa ? '🚫 Desativar' : '✅ Ativar' }}
          </button>
          <button class="mesa-action-btn" title="Copiar link" @click="copiarLink(mesa.token)">
            🔗 Copiar
          </button>
          <button class="mesa-action-btn" title="Imprimir QR" @click="printQR(mesa)">
            🖨️ Imprimir
          </button>
          <button class="mesa-action-btn danger" title="Excluir" @click="deletar(mesa.id)">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mesas-page { display: flex; flex-direction: column; gap: 16px; }
.admin-page-header.row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.header-actions { display: flex; gap: 10px; align-items: center; }

.btn-print-all {
  padding: 8px 16px; border-radius: 10px;
  background: #1a2332; color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-print-all:hover { background: #243447; }

.btn-add {
  padding: 8px 18px; border-radius: 10px;
  background: var(--color-primary); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-add:hover { background: var(--color-primary-dark); }

.nova-mesa-form {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap;
}
.nova-mesa-actions { display: flex; gap: 10px; align-items: center; }
.nova-mesa-btn { width: auto; padding: 10px 20px; }
.btn-cancel { padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #6b7568; background: #f3f4f6; cursor: pointer; }
.btn-cancel:hover { background: #e5e7eb; }

.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}
.mesa-card-skeleton { height: 220px; border-radius: 14px; }

.mesa-card {
  background: #fff; border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
  border: 2px solid transparent;
  transition: border-color .15s;
}
.mesa-card:hover { border-color: var(--color-border); }
.mesa-card--inativa { opacity: 0.6; }

.mesa-card__top { display: flex; align-items: center; justify-content: space-between; }
.mesa-card__numero {
  display: flex; align-items: center; gap: 6px;
  font-size: 15px; font-weight: 800; color: #1a1f17;
}
.status-pill { display: inline-flex; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.pill--green { background: #e8f5e9; color: #2e7d32; }
.pill--gray { background: #f3f4f6; color: #9ba898; }

.mesa-card__qr {
  display: flex; align-items: center; justify-content: center;
  background: #f7f8f5; border-radius: 10px; padding: 8px;
  min-height: 130px;
}
.qr-img { width: 110px; height: 110px; border-radius: 6px; }
.qr-loading { display: flex; align-items: center; justify-content: center; width: 110px; height: 110px; }
@keyframes spin { to { transform: rotate(360deg); } }
.qr-spinner { width: 24px; height: 24px; border: 3px solid #e8ede5; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }

.mesa-card__actions { display: flex; gap: 5px; flex-wrap: wrap; }
.mesa-action-btn {
  flex: 1; padding: 6px 8px; border-radius: 8px;
  font-size: 11px; font-weight: 600; cursor: pointer;
  background: #f7f8f5; color: #1a1f17; text-align: center; white-space: nowrap;
  transition: background .15s; min-width: 60px;
}
.mesa-action-btn:hover { background: #e8ede5; }
.mesa-action-btn.danger { background: #fce4ec; color: #c62828; flex: 0; padding: 6px 10px; }
.mesa-action-btn.danger:hover { background: #c62828; color: #fff; }

.admin-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.admin-empty { padding: 32px; color: #9ba898; font-size: 14px; text-align: center; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: #374151; }
.form-input {
  padding: 8px 12px;
  border: 1.5px solid #e8ede5;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1f17;
  background: #fff;
  transition: border-color .15s;
  outline: none;
}
.form-input:focus { border-color: var(--color-primary); }
</style>
