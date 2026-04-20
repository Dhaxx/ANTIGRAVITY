<script setup lang="ts">
import { useAdminCategorias, useAdminProdutos, useAdminAdicionalGrupos, useAdminAdicionais, useAdminUsuarios } from '~/composables/useAdmin'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuthStore()
const { categorias, loading: loadingCats, buscar: buscarCats, criar: criarCat, atualizar: atualizarCat, deletar: deletarCat, toggleAtivo: toggleCatAtivo } = useAdminCategorias()
const { produtos, loading: loadingProd, buscar: buscarProd, criar: criarProd, atualizar: atualizarProd, deletar: deletarProd, toggleAtivo: toggleProdAtivo } = useAdminProdutos()
const { grupos, loading: loadingGrupos, buscar: buscarGrupos, criar: criarGrupo, atualizar: atualizarGrupo, deletar: deletarGrupo } = useAdminAdicionalGrupos()
const { adicionais, loading: loadingAdicionais, buscar: buscarAdicionais, criar: criarAdicional, atualizar: atualizarAdicional, deletar: deletarAdicional } = useAdminAdicionais()
const { usuarios, loading: loadingUsuarios, buscar: buscarUsuarios } = useAdminUsuarios()

onMounted(async () => {
  await Promise.all([buscarCats(), buscarProd(), buscarUsuarios()])
})

const tabAtiva = ref<'categorias' | 'produtos'>('produtos')

// ─── Categoria form ───────────────────────────────────────────────────────────
const showCatForm = ref(false)
const catEditando = ref<any | null>(null)
const catForm = reactive({ nome: '', icone: '', produzido_por: '' })
const catLoading = ref(false)

function abrirCatForm(cat?: any) {
  catEditando.value = cat ?? null
  catForm.nome = cat?.nome ?? ''
  catForm.icone = cat?.icone ?? ''
  catForm.produzido_por = cat?.produzido_por?.toString() ?? ''
  showCatForm.value = true
}

async function salvarCat() {
  catLoading.value = true
  try {
    const payload: any = {
      nome: catForm.nome,
      icone: catForm.icone || undefined,
      produzido_por: catForm.produzido_por ? Number(catForm.produzido_por) : null
    }
    if (catEditando.value) {
      await atualizarCat(catEditando.value.id, payload)
    } else {
      await criarCat({
        ...payload,
        estabelecimento_id: auth.estabelecimentoId!
      })
    }
    showCatForm.value = false
  } finally { catLoading.value = false }
}

// ─── Produto form ─────────────────────────────────────────────────────────────
const showProdForm = ref(false)
const prodEditando = ref<any | null>(null)
const prodForm = reactive({ 
  nome: '', 
  descricao: '', 
  preco: '', 
  imagem_url: '', 
  categoria_id: '', 
  produzido_por: '' as string,
  grupo_adicional_ids: [] as number[],
  novosGrupos: [] as { nome: string; multiplo: boolean; adicionais: { nome: string; preco: string }[] }[]
})
const prodLoading = ref(false)
const showNovoGrupoForm = ref(false)
const novoGrupoForm = reactive({ nome: '', max_selecoes: 1 })
const novoGrupoAdicionais = ref<{ nome: string; preco: string; editando?: number }[]>([])
const erroNovoGrupo = ref('')

function abrirNovoGrupoForm() {
  novoGrupoForm.nome = ''
  novoGrupoForm.max_selecoes = 1
  novoGrupoAdicionais.value = []
  erroNovoGrupo.value = ''
  showNovoGrupoForm.value = true
}

function adicionarNovoAdicional() {
  novoGrupoAdicionais.value.push({ nome: '', preco: '0' })
}

function removerNovoAdicional(index: number) {
  novoGrupoAdicionais.value.splice(index, 1)
}

function editarNovoAdicional(index: number) {
  novoGrupoAdicionais.value[index].editando = (novoGrupoAdicionais.value[index].editando === index) ? -1 : index
}

async function salvarNovoGrupo() {
  erroNovoGrupo.value = ''
  
  if (!novoGrupoForm.nome?.trim()) {
    erroNovoGrupo.value = 'Nome do grupo é obrigatório'
    return
  }
  if (!novoGrupoForm.max_selecoes || novoGrupoForm.max_selecoes < 1) {
    erroNovoGrupo.value = 'Máximo de escolhas deve ser maior que 0'
    return
  }
  
  const invalidAdicional = novoGrupoAdicionais.value.findIndex(a => !a.nome?.trim() || a.preco === '' || a.preco === null)
  if (invalidAdicional !== -1) {
    erroNovoGrupo.value = `Adicional ${invalidAdicional + 1}: nome e preço são obrigatórios`
    return
  }
  
  const produtoId = prodEditando.value?.id
  
  const adicionaisPayload = novoGrupoAdicionais.value
    .filter(a => a.nome && a.preco !== '' && a.preco !== null)
    .map(a => ({
      nome: a.nome,
      preco: Number(a.preco) || 0
    }))
  
  const grupo = await criarGrupo({ 
    nome: novoGrupoForm.nome, 
    max_selecoes: novoGrupoForm.max_selecoes,
    produto_id: produtoId,
    adicionais: adicionaisPayload
  })
  
  if (produtoId) {
    await buscarGrupos(produtoId)
  } else {
    grupos.value.push(grupo)
  }
  prodForm.grupo_adicional_ids.push(grupo.id)
  showNovoGrupoForm.value = false
}

async function abrirProdForm(prod?: any) {
  prodEditando.value = prod ?? null
  prodForm.nome = prod?.nome ?? ''
  prodForm.descricao = prod?.descricao ?? ''
  prodForm.preco = prod?.preco ?? ''
  prodForm.imagem_url = prod?.imagem_url ?? ''
  prodForm.categoria_id = prod?.categoria_id?.toString() ?? ''
  prodForm.produzido_por = prod?.produzido_por?.toString() ?? ''
  prodForm.grupo_adicional_ids = prod?.grupo_adicional_ids ?? []
  
  if (prod?.id) {
    await buscarGrupos(prod.id)
  } else {
    grupos.value = []
  }
  
  showProdForm.value = true
}

const showEditarGrupoForm = ref(false)
const grupoEditando = ref<any | null>(null)
const grupoEditForm = reactive({ nome: '', max_selecoes: 1 })
const grupoEditAdicionais = ref<any[]>([])
const erroEditarGrupo = ref('')

async function abrirEditarGrupo(grupo: any) {
  grupoEditando.value = grupo
  grupoEditForm.nome = grupo.nome
  grupoEditForm.max_selecoes = grupo.max_selecoes || 1
  grupoEditAdicionais.value = grupo.adicionais?.map((a: any) => ({ ...a, editando: -1 })) || []
  erroEditarGrupo.value = ''
  showEditarGrupoForm.value = true
}

async function salvarEditarGrupo() {
  erroEditarGrupo.value = ''
  
  if (!grupoEditForm.nome?.trim()) {
    erroEditarGrupo.value = 'Nome do grupo é obrigatório'
    return
  }
  if (!grupoEditForm.max_selecoes || grupoEditForm.max_selecoes < 1) {
    erroEditarGrupo.value = 'Máximo de escolhas deve ser maior que 0'
    return
  }
  
  const invalidAdicional = grupoEditAdicionais.value.findIndex((a: any) => !a.nome?.trim() || a.preco === '' || a.preco === null)
  if (invalidAdicional !== -1) {
    erroEditarGrupo.value = `Adicional ${invalidAdicional + 1}: nome e preço são obrigatórios`
    return
  }
  
  const produtoId = prodEditando.value?.id
  
  await atualizarGrupo(produtoId!, grupoEditando.value.id, {
    nome: grupoEditForm.nome,
    max_selecoes: grupoEditForm.max_selecoes
  })
  
  for (const adicional of grupoEditAdicionais.value) {
    if (adicional.id) {
      await atualizarAdicional(produtoId!, adicional.id, {
        nome: adicional.nome,
        preco: Number(adicional.preco)
      })
    } else {
      await criarAdicional({
        nome: adicional.nome,
        preco: Number(adicional.preco),
        grupo_id: grupoEditando.value.id
      })
    }
  }
  
  await buscarGrupos(produtoId!)
  showEditarGrupoForm.value = false
}

function adicionarEditAdicional() {
  grupoEditAdicionais.value.push({ nome: '', preco: '0', editando: -1 })
}

function removerEditAdicional(index: number) {
  const adic = grupoEditAdicionais.value[index]
  if (adic.id) {
    deletarAdicional(prodEditando.value!.id, adic.id)
  }
  grupoEditAdicionais.value.splice(index, 1)
}

async function deletarGrupoExistente(grupoId: number) {
  if (!confirm('Tem certeza que deseja excluir este grupo e todos os seus adicionais?')) return
  await deletarGrupo(prodEditando.value!.id, grupoId)
  prodForm.grupo_adicional_ids = prodForm.grupo_adicional_ids.filter((id: number) => id !== grupoId)
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
      produzido_por: prodForm.produzido_por ? Number(prodForm.produzido_por) : null,
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

function adicionaisDoGrupo(grupoId: number) {
  return computed(() => adicionais.value.filter((a: any) => a.grupo_id === grupoId))
}

function formatarPreco(v: string | number) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function categoriaNome(id: number) {
  return categorias.value.find((c: any) => c.id === id)?.nome ?? '–'
}

function usuarioNome(id: number) {
  return usuarios.value.find((u: any) => u.id === id)?.usuario ?? '–'
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
          <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Produção</th><th>Ativo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="p in produtos" :key="p.id">
              <td class="td-nome">{{ p.nome }}<span v-if="p.descricao" class="td-desc">{{ p.descricao }}</span></td>
              <td>{{ categoriaNome(p.categoria_id) }}</td>
              <td class="td-preco">{{ formatarPreco(p.preco) }}</td>
              <td>{{ p.produzido_por ? usuarioNome(p.produzido_por) : '—' }}</td>
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
          <thead><tr><th>Nome</th><th>Ícone</th><th>Ordem</th><th>Produção</th><th>Ativo</th><th></th></tr></thead>
          <tbody>
            <tr v-for="c in categorias" :key="c.id">
              <td class="td-nome">{{ c.nome }}</td>
              <td>{{ c.icone ?? '—' }}</td>
              <td>{{ c.ordem }}</td>
              <td>{{ c.produzido_por ? usuarioNome(c.produzido_por) : '—' }}</td>
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
              <label class="form-label">Produzido por</label>
              <select v-model="prodForm.produzido_por" class="form-input">
                <option value="">Ninguém</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id.toString()">{{ u.usuario }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Grupos de adicionais</label>
              <div class="checkbox-grid grupos-list">
                <div v-for="g in grupos" :key="g.id" class="grupo-item">
                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      :value="g.id"
                      v-model="prodForm.grupo_adicional_ids"
                    />
                    {{ g.nome }}
                    <span v-if="g.max_selecoes > 1" class="text-muted">(máx: {{ g.max_selecoes }})</span>
                  </label>
                  <div class="grupo-actions">
                    <button type="button" class="btn-icon-sm" title="Editar grupo" @click="abrirEditarGrupo(g)">✏️</button>
                    <button type="button" class="btn-icon-sm danger" title="Excluir grupo" @click="deletarGrupoExistente(g.id)">🗑️</button>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-link" @click="abrirNovoGrupoForm">+ Criar novo grupo</button>
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

    <!-- ── MODAL NOVO GRUPO DE ADICIONAIS ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showNovoGrupoForm" class="modal-bg" @click.self="showNovoGrupoForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showNovoGrupoForm" class="modal-box modal-box--wide">
          <div class="modal-header">
            <h3>Novo grupo de adicionais</h3>
            <button class="modal-close" @click="showNovoGrupoForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome do grupo *</label>
              <input v-model="novoGrupoForm.nome" class="form-input" placeholder="Ex: Tamanho, Extras..." />
            </div>
            <div class="form-group">
              <label class="form-label">Máximo de escolhas *</label>
              <input 
                v-model.number="novoGrupoForm.max_selecoes" 
                class="form-input" 
                type="number" 
                min="1" 
                placeholder="Ex: 1, 2, 3..." 
              />
              <p class="form-hint">Quantos adicionais o cliente pode escolher. Use 1 para escolha única.</p>
            </div>
            <div class="form-group">
              <label class="form-label">Adicionais</label>
              <div v-for="(adic, index) in novoGrupoAdicionais" :key="index" class="adicional-input-row">
                <input v-model="adic.nome" class="form-input" placeholder="Nome" :class="{ 'input-error': !adic.nome?.trim() }" />
                <input v-model="adic.preco" class="form-input" type="number" step="0.01" placeholder="Preço" style="width: 100px;" :class="{ 'input-error': adic.preco === '' || adic.preco === null }" />
                <button type="button" class="btn-icon-sm" title="Remover" @click="removerNovoAdicional(index)">🗑️</button>
              </div>
              <button type="button" class="btn-link" @click="adicionarNovoAdicional">+ Adicionar adicional</button>
            </div>
            <div v-if="erroNovoGrupo" class="form-error">{{ erroNovoGrupo }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showNovoGrupoForm = false">Cancelar</button>
            <button class="btn-primary modal-save" :disabled="!novoGrupoForm.nome" @click="salvarNovoGrupo">Criar grupo</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL EDITAR GRUPO DE ADICIONAIS ── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="showEditarGrupoForm" class="modal-bg" @click.self="showEditarGrupoForm = false" />
      </Transition>
      <Transition name="fade">
        <div v-if="showEditarGrupoForm" class="modal-box modal-box--wide">
          <div class="modal-header">
            <h3>Editar grupo de adicionais</h3>
            <button class="modal-close" @click="showEditarGrupoForm = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome do grupo *</label>
              <input v-model="grupoEditForm.nome" class="form-input" placeholder="Ex: Tamanho, Extras..." />
            </div>
            <div class="form-group">
              <label class="form-label">Máximo de escolhas *</label>
              <input 
                v-model.number="grupoEditForm.max_selecoes" 
                class="form-input" 
                type="number" 
                min="1" 
                placeholder="Ex: 1, 2, 3..." 
              />
            </div>
            <div class="form-group">
              <label class="form-label">Adicionais</label>
              <div v-for="(adic, index) in grupoEditAdicionais" :key="index" class="adicional-input-row">
                <input v-model="adic.nome" class="form-input" placeholder="Nome" :class="{ 'input-error': !adic.nome?.trim() }" />
                <input v-model="adic.preco" class="form-input" type="number" step="0.01" placeholder="Preço" style="width: 100px;" :class="{ 'input-error': adic.preco === '' || adic.preco === null }" />
                <button type="button" class="btn-icon-sm danger" title="Remover" @click="removerEditAdicional(index)">🗑️</button>
              </div>
              <button type="button" class="btn-link" @click="adicionarEditAdicional">+ Adicionar adicional</button>
            </div>
            <div v-if="erroEditarGrupo" class="form-error">{{ erroEditarGrupo }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showEditarGrupoForm = false">Cancelar</button>
            <button class="btn-primary modal-save" @click="salvarEditarGrupo">Salvar</button>
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
            <div class="form-group">
              <label class="form-label">Produzido por</label>
              <select v-model="catForm.produzido_por" class="form-input">
                <option value="">Ninguém</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id.toString()">{{ u.usuario }}</option>
              </select>
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

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
.btn-link:hover { color: var(--color-primary-dark); }

.adicional-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.adicional-input-row .form-input { flex: 1; }
.text-muted { font-size: 12px; color: #9ba898; }
.form-hint { font-size: 12px; color: #9ba898; }
.form-error { color: #dc2626; font-size: 13px; font-weight: 600; padding: 8px 12px; background: #fef2f2; border-radius: 8px; margin-top: 8px; }
.input-error { border-color: #dc2626 !important; }

.grupos-list { display: flex; flex-direction: column; gap: 8px; }
.grupo-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f9fafb; border-radius: 8px; }
.grupo-item .checkbox-item { flex: 1; }
</style>
