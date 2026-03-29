<script setup lang="ts">
import { useAdminCategorias, useAdminProdutos, useAdminAdicionalGrupos, useAdminAdicionais } from '~/composables/useAdmin'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuthStore()
const { categorias, loading: loadingCats, buscar: buscarCats, criar: criarCat, atualizar: atualizarCat, deletar: deletarCat, toggleAtivo: toggleCatAtivo } = useAdminCategorias()
const { produtos, loading: loadingProd, buscar: buscarProd, criar: criarProd, atualizar: atualizarProd, deletar: deletarProd, toggleAtivo: toggleProdAtivo } = useAdminProdutos()
const { grupos, loading: loadingGrupos, buscar: buscarGrupos, criar: criarGrupo, deletar: deletarGrupo } = useAdminAdicionalGrupos()
const { adicionais, loading: loadingAdicionais, buscar: buscarAdicionais, criar: criarAdicional, deletar: deletarAdicional } = useAdminAdicionais()

onMounted(async () => {
  await Promise.all([buscarCats(), buscarProd(), buscarGrupos(), buscarAdicionais()])
})

const tabAtiva = ref<'categorias' | 'produtos' | 'adicionais'>('produtos')

// ─── Categoria form ───────────────────────────────────────────────────────────
const showCatForm = ref(false)
const catEditando = ref<any | null>(null)
const catForm = reactive({ nome: '', icone: '' })
const catLoading = ref(false)

function abrirCatForm(cat?: any) {
  catEditando.value = cat ?? null
  catForm.nome = cat?.nome ?? ''
  catForm.icone = cat?.icone ?? ''
  showCatForm.value = true
}

async function salvarCat() {
  catLoading.value = true
  try {
    if (catEditando.value) {
      await atualizarCat(catEditando.value.id, { nome: catForm.nome, icone: catForm.icone || undefined })
    } else {
      await criarCat({
        nome: catForm.nome,
        icone: catForm.icone || undefined,
        estabelecimento_id: auth.estabelecimentoId!
      })
    }
    showCatForm.value = false
  } finally { catLoading.value = false }
}

// ─── Produto form ─────────────────────────────────────────────────────────────
const showProdForm = ref(false)
const prodEditando = ref<any | null>(null)
const prodForm = reactive({ nome: '', descricao: '', preco: '', imagem_url: '', categoria_id: '', grupo_adicional_ids: [] as number[] })
const prodLoading = ref(false)

function abrirProdForm(prod?: any) {
  prodEditando.value = prod ?? null
  prodForm.nome = prod?.nome ?? ''
  prodForm.descricao = prod?.descricao ?? ''
  prodForm.preco = prod?.preco ?? ''
  prodForm.imagem_url = prod?.imagem_url ?? ''
  prodForm.categoria_id = prod?.categoria_id?.toString() ?? ''
  prodForm.grupo_adicional_ids = prod?.grupo_adicional_ids ?? []
  showProdForm.value = true
}

async function salvarProd() {
  prodLoading.value = true
  try {
    const body: any = {
      nome: prodForm.nome,
      descricao: prodForm.descricao || null,
      preco: Number(prodForm.preco),
      imagem_url: prodForm.imagem_url || null,
      categoria_id: Number(prodForm.categoria_id),
      grupo_adicional_ids: prodForm.grupo_adicional_ids,
    }
    if (prodEditando.value) {
      await atualizarProd(prodEditando.value.id, body)
    } else {
      await criarProd(body)
    }
    showProdForm.value = false
  } finally { prodLoading.value = false }
}

async function toggleProdutoAtivo(produto: any) {
  await toggleProdAtivo(produto.id, !produto.ativo)
}

async function toggleCategoriaAtivo(cat: any) {
  await toggleCatAtivo(cat.id, !cat.ativo)
}

// ─── Grupo adicional form ─────────────────────────────────────────────────────
const showGrupoForm = ref(false)
const grupoForm = reactive({ nome: '', multiplo: false })
const grupoLoading = ref(false)

function abrirGrupoForm() {
  grupoForm.nome = ''
  grupoForm.multiplo = false
  showGrupoForm.value = true
}

async function salvarGrupo() {
  if (!grupoForm.nome) return
  grupoLoading.value = true
  try {
    await criarGrupo({ nome: grupoForm.nome, multiplo: grupoForm.multiplo })
    showGrupoForm.value = false
  } finally { grupoLoading.value = false }
}

// ─── Adicional form ──────────────────────────────────────────────────────────
const showAdicionalForm = ref(false)
const grupoSelecionado = ref<number | null>(null)
const adicionalForm = reactive({ nome: '', preco: '' })
const adicionalLoading = ref(false)

function abrirAdicionalForm(grupoId: number) {
  grupoSelecionado.value = grupoId
  adicionalForm.nome = ''
  adicionalForm.preco = ''
  showAdicionalForm.value = true
}

async function salvarAdicional() {
  if (!adicionalForm.nome || !adicionalForm.preco || !grupoSelecionado.value) return
  adicionalLoading.value = true
  try {
    await criarAdicional({ nome: adicionalForm.nome, preco: Number(adicionalForm.preco), grupo_id: grupoSelecionado.value })
    showAdicionalForm.value = false
  } finally { adicionalLoading.value = false }
}

function adicionaisDoGrupo(grupoId: number) {
  return computed(() => adicionais.value.filter((a: any) => a.grupo_id === grupoId))
}

function formatarPreco(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function categoriaNome(id: number) {
  return categorias.value.find((c: any) => c.id === id)?.nome ?? '–'
}

useHead({ title: 'Produtos — QuickPed Admin' })
</script>

<template>
  <div class="produtos-page">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Cardápio</h1>
      <p class="admin-page-sub">Gerencie categorias, produtos e adicionais</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: tabAtiva === 'produtos' }" @click="tabAtiva = 'produtos'">Produtos</button>
      <button class="tab-btn" :class="{ active: tabAtiva === 'categorias' }" @click="tabAtiva = 'categorias'">Categorias</button>
      <button class="tab-btn" :class="{ active: tabAtiva === 'adicionais' }" @click="tabAtiva = 'adicionais'">Adicionais</button>
    </div>

    <!-- ── PRODUTOS ── -->
    <div v-if="tabAtiva === 'produtos'" class="admin-card">
      <div class="admin-card__header">
        <h2 class="admin-card__title">Produtos ({{ produtos.length }})</h2>
        <button class="btn-add" @click="abrirProdForm()">+ Novo produto</button>
      </div>

      <div v-if="loadingProd" class="admin-loading">
        <div class="skeleton" style="height:48px;margin-bottom:8px;border-radius:8px;" v-for="i in 4" :key="i" />
      </div>

      <div v-else-if="produtos.length === 0" class="admin-empty">Nenhum produto cadastrado.</div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Ativo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="p in produtos" :key="p.id">
              <td class="td-nome">{{ p.nome }}<span v-if="p.descricao" class="td-desc">{{ p.descricao }}</span></td>
              <td>{{ categoriaNome(p.categoria_id) }}</td>
              <td class="td-preco">{{ formatarPreco(p.preco) }}</td>
              <td>
                <span class="pill" :class="p.ativo ? 'pill--green' : 'pill--gray'">
                  {{ p.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-actions">
                <button class="btn-icon-sm" title="Editar" @click="abrirProdForm(p)">✏️</button>
                <button 
                  class="toggle-btn" 
                  :class="{ on: p.ativo }"
                  :title="p.ativo ? 'Desativar' : 'Ativar'" 
                  @click="toggleProdutoAtivo(p)"
                >
                  <span class="toggle-thumb"></span>
                </button>
                <button class="btn-icon-sm danger" title="Excluir" @click="deletarProd(p.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── CATEGORIAS ── -->
    <div v-if="tabAtiva === 'categorias'" class="admin-card">
      <div class="admin-card__header">
        <h2 class="admin-card__title">Categorias ({{ categorias.length }})</h2>
        <button class="btn-add" @click="abrirCatForm()">+ Nova categoria</button>
      </div>

      <div v-if="loadingCats" class="admin-loading">
        <div class="skeleton" style="height:48px;margin-bottom:8px;border-radius:8px;" v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="categorias.length === 0" class="admin-empty">Nenhuma categoria cadastrada.</div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Ícone</th><th>Ordem</th><th>Ativo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="c in categorias" :key="c.id">
              <td class="td-nome">{{ c.nome }}</td>
              <td>{{ c.icone ?? '—' }}</td>
              <td>{{ c.ordem }}</td>
              <td>
                <span class="pill" :class="c.ativo ? 'pill--green' : 'pill--gray'">
                  {{ c.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-actions">
                <button class="btn-icon-sm" title="Editar" @click="abrirCatForm(c)">✏️</button>
                <button 
                  class="toggle-btn" 
                  :class="{ on: c.ativo }"
                  :title="c.ativo ? 'Desativar' : 'Ativar'" 
                  @click="toggleCategoriaAtivo(c)"
                >
                  <span class="toggle-thumb"></span>
                </button>
                <button class="btn-icon-sm danger" title="Excluir" @click="deletarCat(c.id)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── ADICIONAIS ── -->
    <div v-if="tabAtiva === 'adicionais'" class="admin-card">
      <div class="admin-card__header">
        <h2 class="admin-card__title">Grupos de adicionais ({{ grupos.length }})</h2>
        <button class="btn-add" @click="abrirGrupoForm()">+ Novo grupo</button>
      </div>

      <div v-if="loadingGrupos" class="admin-loading">
        <div class="skeleton" style="height:52px;margin-bottom:8px;border-radius:8px;" v-for="i in 3" :key="i" />
      </div>

      <div v-else-if="grupos.length === 0" class="admin-empty">Nenhum grupo cadastrado. Crie um grupo para adicionar adicionais.</div>

      <div v-else class="adicional-grupos">
        <div v-for="g in grupos" :key="g.id" class="grupo-card">
          <div class="grupo-card__header">
            <div class="grupo-info">
              <span class="grupo-nome">{{ g.nome }}</span>
              <span v-if="g.multiplo" class="pill pill--blue">Múltipla escolha</span>
            </div>
            <div class="grupo-actions">
              <button class="btn-sm" @click="abrirAdicionalForm(g.id)">+ Adicional</button>
              <button class="btn-icon-sm danger" title="Excluir grupo" @click="deletarGrupo(g.id)">🗑️</button>
            </div>
          </div>
          <div class="grupo-adicionais">
            <div v-if="adicionaisDoGrupo(g.id).value.length === 0" class="grupo-empty">Nenhum adicional neste grupo</div>
            <div v-for="a in adicionaisDoGrupo(g.id).value" :key="a.id" class="adicional-item">
              <span class="adicional-nome">{{ a.nome }}</span>
              <span class="adicional-preco">{{ formatarPreco(a.preco) }}</span>
              <button class="btn-icon-sm danger" @click="deletarAdicional(a.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL PRODUTO ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showProdForm" class="modal-bg" @click.self="showProdForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showProdForm" class="modal-box modal-box--wide">
          <div class="modal-header">
            <h3>{{ prodEditando ? 'Editar produto' : 'Novo produto' }}</h3>
            <button class="modal-close" @click="showProdForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome *</label>
              <input v-model="prodForm.nome" class="form-input" placeholder="Ex: Espresso" />
            </div>
            <div class="form-group">
              <label class="form-label">Categoria *</label>
              <select v-model="prodForm.categoria_id" class="form-input">
                <option value="" disabled>Selecione...</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id.toString()">{{ c.nome }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Preço (R$) *</label>
              <input v-model="prodForm.preco" class="form-input" type="number" step="0.01" min="0" placeholder="0,00" />
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea v-model="prodForm.descricao" class="form-input" rows="2" placeholder="Descrição breve..." />
            </div>
            <div class="form-group">
              <label class="form-label">URL da imagem</label>
              <input v-model="prodForm.imagem_url" class="form-input" placeholder="https://..." />
            </div>
            <div class="form-group">
              <label class="form-label">Grupos de adicionais</label>
              <div class="checkbox-grid">
                <label v-for="g in grupos" :key="g.id" class="checkbox-item">
                  <input
                    type="checkbox"
                    :value="g.id"
                    v-model="prodForm.grupo_adicional_ids"
                  />
                  {{ g.nome }}
                  <span v-if="g.multiplo" class="text-muted">(múltiplo)</span>
                </label>
              </div>
              <p v-if="grupos.length === 0" class="form-hint">Nenhum grupo criado. Crie grupos na aba "Adicionais".</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showProdForm = false">Cancelar</button>
            <button class="btn-primary modal-save" :disabled="prodLoading || !prodForm.nome || !prodForm.preco || !prodForm.categoria_id" @click="salvarProd">
              {{ prodLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL CATEGORIA ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showCatForm" class="modal-bg" @click.self="showCatForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showCatForm" class="modal-box">
          <div class="modal-header">
            <h3>{{ catEditando ? 'Editar categoria' : 'Nova categoria' }}</h3>
            <button class="modal-close" @click="showCatForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome *</label>
              <input v-model="catForm.nome" class="form-input" placeholder="Ex: Cafés" />
            </div>
            <div class="form-group">
              <label class="form-label">Ícone (emoji ou texto)</label>
              <input v-model="catForm.icone" class="form-input" placeholder="Ex: ☕" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showCatForm = false">Cancelar</button>
            <button class="btn-primary modal-save" :disabled="catLoading || !catForm.nome" @click="salvarCat">
              {{ catLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL GRUPO ADICIONAL ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showGrupoForm" class="modal-bg" @click.self="showGrupoForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showGrupoForm" class="modal-box">
          <div class="modal-header">
            <h3>Novo grupo de adicionais</h3>
            <button class="modal-close" @click="showGrupoForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome do grupo *</label>
              <input v-model="grupoForm.nome" class="form-input" placeholder="Ex: Tamanho, Extras..." />
            </div>
            <div class="form-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="grupoForm.multiplo" />
                Permite múltiplas escolhas
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showGrupoForm = false">Cancelar</button>
            <button class="btn-primary modal-save" :disabled="grupoLoading || !grupoForm.nome" @click="salvarGrupo">
              {{ grupoLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL ADICIONAL ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showAdicionalForm" class="modal-bg" @click.self="showAdicionalForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showAdicionalForm" class="modal-box">
          <div class="modal-header">
            <h3>Novo adicional</h3>
            <button class="modal-close" @click="showAdicionalForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome *</label>
              <input v-model="adicionalForm.nome" class="form-input" placeholder="Ex: Grande, Com chantily..." />
            </div>
            <div class="form-group">
              <label class="form-label">Preço (R$) *</label>
              <input v-model="adicionalForm.preco" class="form-input" type="number" step="0.01" min="0" placeholder="0,00" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showAdicionalForm = false">Cancelar</button>
            <button class="btn-primary modal-save" :disabled="adicionalLoading || !adicionalForm.nome || !adicionalForm.preco" @click="salvarAdicional">
              {{ adicionalLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.produtos-page { display: flex; flex-direction: column; gap: 16px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.tabs { display: flex; gap: 4px; background: #fff; border-radius: 12px; padding: 4px; width: fit-content; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.tab-btn { padding: 8px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #6b7568; cursor: pointer; transition: all .15s; }
.tab-btn.active { background: var(--color-primary); color: #fff; }

.admin-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); overflow: hidden; }
.admin-card__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e8ede5; }
.admin-card__title { font-size: 15px; font-weight: 700; color: #1a1f17; }
.admin-loading, .admin-empty { padding: 20px; color: #9ba898; font-size: 14px; text-align: center; }

.btn-add {
  padding: 8px 16px; border-radius: 10px;
  background: var(--color-primary); color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-add:hover { background: var(--color-primary-dark); }

.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { padding: 10px 16px; text-align: left; background: #f7f8f5; color: #6b7568; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f1ee; color: #1a1f17; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafbf9; }

.td-nome { font-weight: 600; }
.td-desc { display: block; font-size: 12px; color: #9ba898; font-weight: 400; margin-top: 2px; }
.td-preco { font-weight: 700; color: var(--color-primary); }
.td-actions { display: flex; gap: 6px; align-items: center; }

.btn-icon-sm { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 14px; cursor: pointer; transition: background .15s; }
.btn-icon-sm:hover { background: #f3f4f6; }
.btn-icon-sm.danger:hover { background: #fce4ec; }
.btn-icon-sm.pill--green { background: #e8f5e9; }
.btn-icon-sm.pill--gray { background: #f3f4f6; }

.pill { display: inline-flex; padding: 2px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }

.toggle-btn {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #e5e7eb;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}
.toggle-btn.on { background: #22c55e; }
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}
.toggle-btn.on .toggle-thumb { transform: translateX(18px); }
.pill--green { background: #e8f5e9; color: #2e7d32; }
.pill--gray { background: #f3f4f6; color: #9ba898; }
.pill--blue { background: #dbeafe; color: #1d4ed8; }

/* Grupos de adicionais */
.adicional-grupos { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.grupo-card { background: #f9fafb; border-radius: 12px; padding: 14px; }
.grupo-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.grupo-info { display: flex; align-items: center; gap: 8px; }
.grupo-nome { font-size: 14px; font-weight: 700; color: #1a1f17; }
.grupo-actions { display: flex; gap: 6px; align-items: center; }
.btn-sm { padding: 5px 12px; border-radius: 7px; background: var(--color-primary); color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.grupo-adicionais { display: flex; flex-direction: column; gap: 4px; }
.grupo-empty { font-size: 12px; color: #9ba898; padding: 4px 0; }
.adicional-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #fff; border-radius: 8px; }
.adicional-nome { flex: 1; font-size: 13px; }
.adicional-preco { font-size: 13px; font-weight: 700; color: var(--color-primary); }

/* Modal */
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(2px); z-index: 500; }
.modal-box {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: #fff; border-radius: 20px; width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25); z-index: 501; overflow: hidden;
}
.modal-box--wide { max-width: 540px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #e8ede5; }
.modal-header h3 { font-size: 16px; font-weight: 700; }
.modal-close { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: background .15s; }
.modal-close:hover { background: #f3f4f6; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 60vh; overflow-y: auto; }
.modal-footer { padding: 14px 20px; border-top: 1px solid #e8ede5; display: flex; gap: 10px; justify-content: flex-end; }
.btn-cancel { padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; color: #6b7568; background: #f3f4f6; cursor: pointer; }
.btn-cancel:hover { background: #e5e7eb; }
.modal-save { width: auto; padding: 10px 22px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.form-input {
  padding: 10px 14px;
  border: 1.5px solid #e8ede5;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1f17;
  background: #fff;
  transition: border-color .15s;
  outline: none;
}
.form-input:focus { border-color: var(--color-primary); }
textarea.form-input { resize: vertical; min-height: 60px; }

.checkbox-grid { display: flex; flex-direction: column; gap: 8px; max-height: 160px; overflow-y: auto; padding: 4px 0; }
.checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1a1f17; cursor: pointer; }
.checkbox-item input { width: 16px; height: 16px; accent-color: var(--color-primary); }
.text-muted { font-size: 12px; color: #9ba898; }
.form-hint { font-size: 12px; color: #9ba898; }
</style>
