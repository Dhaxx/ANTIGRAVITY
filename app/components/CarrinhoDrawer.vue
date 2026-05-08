<script setup lang="ts">
import { useCarrinhoStore } from '~/stores/carrinho'
import { usePedido } from '~/composables/usePedido'
import type { PedidoTipo, EnderecoRead, ClienteRead, ClienteTokenResponse } from '~/types/api'

const props = defineProps<{ 
  slug: string
  mesaPreenchida?: number | null
  mesaToken?: string
  modoCardapioDigital?: boolean
  estabelecimento?: { auto_atendimento?: boolean; delivery?: boolean }
}>()

const emit = defineEmits<{
  (e: 'pedido-criado'): void
}>()

const config = useRuntimeConfig()
const carrinho = useCarrinhoStore()
const { loading, error, pedidoCriado, enviarPedido, montarPayload } = usePedido()

const nomeCliente = ref('')
const telefoneCliente = ref('')
const numeroMesa = ref<string>('')
const obs = ref('')
const sucesso = ref(false)
const tipoPedido = ref<PedidoTipo>('Local')
const selectedEnderecoId = ref<number | null>(null)
const clienteLogado = ref<ClienteRead | null>(null)
const enderecos = ref<EnderecoRead[]>([])
const loadingCliente = ref(false)
const showEnderecoModal = ref(false)
const editingEndereco = ref<EnderecoRead | null>(null)
const novoEndereco = ref({ logradouro: '', numero: '', cidade: '', bairro: '', complemento: '', cep: '' })
const autenticando = ref(false)
const authError = ref<string | null>(null)
const precisaCadastrar = ref(false)
const buscandoCep = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let cepDebounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.mesaPreenchida, (val) => {
  if (val) numeroMesa.value = String(val)
}, { immediate: true })

const mesaBloqueada = computed(() => !!props.mesaPreenchida)
const mostrarCampoMesa = computed(() => !props.mesaToken && tipoPedido.value === 'Local')

const validacaoAdicionais = computed(() => carrinho.validarAdicionais())

const hintMensagem = computed(() => {
  if (nomeCliente.value.trim().length < 2) return 'Preencha seu nome'
  if (tipoPedido.value === 'Local' && !numeroMesa.value) return 'Preencha o número da mesa'
  if (tipoPedido.value === 'Delivery' && telefoneCliente.value.trim().length < 10) return 'Preencha um telefone válido'
  if (tipoPedido.value === 'Delivery' && !selectedEnderecoId.value) return 'Selecione um endereço'
  return 'Preencha os dados para continuar'
})

const formValido = computed(() => {
  const nomeValido = nomeCliente.value.trim().length >= 2
  const mesaValida = tipoPedido.value === 'Local' ? Number(numeroMesa.value) > 0 : true
  const telefoneValido = tipoPedido.value === 'Delivery' ? telefoneCliente.value.trim().length >= 10 : true
  const enderecoValido = tipoPedido.value === 'Delivery' ? selectedEnderecoId.value !== null : true
  const temItens = carrinho.itens.length > 0
  const adicionaisValidos = validacaoAdicionais.value.valido
  const naoEstaCarregando = !loading.value
  return nomeValido && mesaValida && temItens && adicionaisValidos && naoEstaCarregando && telefoneValido && enderecoValido
})

const mostrarCamposDelivery = computed(() => tipoPedido.value === 'Delivery')
const mostrarCampoMesaLocal = computed(() => tipoPedido.value === 'Local' && !props.mesaToken)

const permiteLocal = computed(() => true) // sempre mostra Local como opção padrão
const permiteDelivery = computed(() => props.estabelecimento?.delivery)
const permiteRetirada = computed(() => props.estabelecimento?.delivery)

const tipoPedidoDefault = computed(() => {
  if (permiteDelivery.value) return 'Delivery'
  return 'Local'
})

watch(() => props.estabelecimento, (est) => {
  if (est && !tipoPedido.value) {
    tipoPedido.value = tipoPedidoDefault.value
  }
}, { immediate: true })

async function autenticarPorTelefone(telefone: string) {
  if (telefone.replace(/\D/g, '').length < 10) return
  
  autenticando.value = true
  authError.value = null
  
  try {
    const data = await $fetch<ClienteTokenResponse>(
      `${config.public.apiBase}/api/v1/cliente/autenticacao/login`,
      {
        method: 'POST',
        params: { telefone: telefone.replace(/\D/g, '') }
      }
    )
    
    if (data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('qp_cliente_token', data.access_token)
      await buscarCliente()
    }
  } catch (e: any) {
    console.error('Erro na autenticação:', e)
    precisaCadastrar.value = true
    authError.value = null
    clienteLogado.value = null
    enderecos.value = []
    selectedEnderecoId.value = null
  } finally {
    autenticando.value = false
  }
}

function onTelefoneInput(telefone: string) {
  telefoneCliente.value = telefone
  authError.value = null
  
  if (debounceTimer) clearTimeout(debounceTimer)
  
  if (telefone.replace(/\D/g, '').length >= 10) {
    debounceTimer = setTimeout(() => {
      autenticarPorTelefone(telefone)
    }, 800)
  }
}

async function registrarCliente() {
  const telefone = telefoneCliente.value.replace(/\D/g, '')
  const nome = nomeCliente.value.trim()
  
  if (telefone.length < 10) return
  if (nome.length < 2) {
    authError.value = 'Preencha seu nome para se cadastrar'
    return
  }
  
  autenticando.value = true
  authError.value = null
  
  try {
    await $fetch<ClienteRead>(`${config.public.apiBase}/api/v1/cliente/autenticacao/registrar`, {
      method: 'POST',
      body: {
        telefone,
        nome
      }
    })
    
    precisaCadastrar.value = false
    await autenticarPorTelefone(telefoneCliente.value)
  } catch (e: any) {
    console.error('Erro ao registrar:', e)
    authError.value = 'Erro ao criar conta. Tente novamente.'
  } finally {
    autenticando.value = false
  }
}

async function buscarCliente() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('qp_cliente_token') : null
  if (!token) return
  loadingCliente.value = true
  try {
    const data = await $fetch<ClienteRead>(`${config.public.apiBase}/api/v1/cliente/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    clienteLogado.value = data
    enderecos.value = data.enderecos || []
    if (data.telefone) telefoneCliente.value = data.telefone
    if (data.nome) nomeCliente.value = data.nome
    const addrAtual = enderecos.value.find(e => e.atual)
    if (addrAtual) selectedEnderecoId.value = addrAtual.id
} catch (e) {
    console.error('Erro ao buscar cliente:', e)
  } finally {
    loadingCliente.value = false
  }
}

function onCepInput(cep: string) {
  const cepApenasNumeros = cep.replace(/\D/g, '')
  novoEndereco.value.cep = cepApenasNumeros.length > 8 ? cepApenasNumeros.slice(0, 9) : cep
  
  if (cepDebounceTimer) clearTimeout(cepDebounceTimer)
  
  if (cepApenasNumeros.length === 8) {
    cepDebounceTimer = setTimeout(() => buscarCep(cepApenasNumeros), 500)
  }
}

async function buscarCep(cep: string) {
  if (!cep || cep.length !== 8) return
  
  buscandoCep.value = true
  try {
    const data = await $fetch<{ error?: string; logradouro?: string; bairro?: string; cidade?: string; uf?: string }>(
      `${config.public.apiBase}/api/v1/cliente/endereco/buscar-cep/${cep}`
    )
    
    if (data.error) {
      console.error('CEP não encontrado:', data.error)
    } else {
      novoEndereco.value.logradouro = data.logradouro || ''
      novoEndereco.value.bairro = data.bairro || ''
      novoEndereco.value.cidade = data.cidade || ''
    }
  } catch (e) {
    console.error('Erro ao buscar CEP:', e)
  } finally {
    buscandoCep.value = false
  }
}

async function salvarEndereco() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('qp_cliente_token') : null
  if (!token) return
  
  const payload = { ...novoEndereco.value }
  try {
    if (editingEndereco.value) {
      const updated = await $fetch<EnderecoRead>(`${config.public.apiBase}/api/v1/cliente/endereco/${editingEndereco.value.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      })
      const idx = enderecos.value.findIndex(e => e.id === updated.id)
      if (idx >= 0) enderecos.value[idx] = updated
    } else {
      const created = await $fetch<EnderecoRead>(`${config.public.apiBase}/api/v1/cliente/endereco`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      })
      enderecos.value.push(created)
      selectedEnderecoId.value = created.id
    }
    showEnderecoModal.value = false
    editingEndereco.value = null
    novoEndereco.value = { logradouro: '', numero: '', cidade: '', bairro: '', complemento: '', cep: '' }
  } catch (e) {
    console.error('Erro ao salvar endereço:', e)
  }
}

function abrirEditarEndereco(end: EnderecoRead) {
  editingEndereco.value = end
  novoEndereco.value = {
    logradouro: end.logradouro,
    numero: end.numero || '',
    cidade: end.cidade,
    bairro: end.bairro,
    complemento: end.complemento || '',
    cep: end.cep || ''
  }
  showEnderecoModal.value = true
}

function abrirNovoEndereco() {
  editingEndereco.value = null
  novoEndereco.value = { logradouro: '', numero: '', cidade: '', bairro: '', complemento: '', cep: '' }
  showEnderecoModal.value = true
}

async function finalizar() {
  if (!formValido.value) return
  const payload = montarPayload(
    nomeCliente.value.trim(),
    tipoPedido.value === 'Local' ? Number(numeroMesa.value) : 1,
    props.mesaToken,
    obs.value,
    tipoPedido.value,
    tipoPedido.value === 'Delivery' ? selectedEnderecoId.value : null
  )
  const result = await enviarPedido(props.slug, payload)
  if (result) {
    sucesso.value = true
    nomeCliente.value = ''
    telefoneCliente.value = ''
    numeroMesa.value = ''
    obs.value = ''
    selectedEnderecoId.value = null
    emit('pedido-criado')
    setTimeout(() => { sucesso.value = false; carrinho.fecharCarrinho() }, 3500)
  }
}

function formatarPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function numeroBonito(s: string) {
  return s.replace(/[^0-9]/g, '')
}

function onMesaInput(e: Event) {
  if (mostrarCampoMesaLocal.value) {
    const target = e.target as HTMLInputElement
    numeroMesa.value = numeroBonito(target.value)
  }
}

watch(() => tipoPedido.value, (newTipo) => {
  if (newTipo === 'Delivery') {
    buscarCliente()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="carrinho.aberto && !props.modoCardapioDigital" class="drawer-overlay" @click="carrinho.fecharCarrinho()" />
    </Transition>

    <Transition name="slide-up">
      <div v-if="carrinho.aberto && !props.modoCardapioDigital" class="carrinho-drawer">
        <!-- Header -->
        <div class="carrinho-drawer__header">
          <div class="carrinho-drawer__titulo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Seu Pedido</span>
          </div>
          <button class="carrinho-drawer__close" @click="carrinho.fecharCarrinho()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="carrinho-drawer__body">
          <!-- Sucesso -->
          <Transition name="fade">
            <div v-if="sucesso" class="carrinho-drawer__sucesso">
              <div class="sucesso-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Pedido enviado!</h3>
              <p>Seu pedido foi recebido e está sendo preparado. 🎉</p>
            </div>
          </Transition>

          <!-- Carrinho vazio -->
          <div v-if="!sucesso && carrinho.itens.length === 0" class="carrinho-drawer__vazio">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Seu carrinho está vazio</p>
            <span>Adicione itens do cardápio</span>
          </div>

          <!-- Itens -->
          <div v-if="!sucesso && carrinho.itens.length > 0" class="carrinho-drawer__itens">
            <TransitionGroup name="fade" tag="div" class="carrinho-itens-list">
              <div v-for="item in carrinho.itens" :key="item.uid" class="carrinho-item">
                <div class="carrinho-item__img">
                  <img v-if="item.produto.imagem_url" :src="item.produto.imagem_url" :alt="item.produto.nome" />
                  <div v-else class="carrinho-item__img-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                </div>
                <div class="carrinho-item__info">
                  <p class="carrinho-item__nome">{{ item.produto.nome }}</p>
                  <p v-if="item.adicionaisSelecionados.length" class="carrinho-item__adicionais">
                    + {{ item.adicionaisSelecionados.map(a => a.nome).join(', ') }}
                  </p>
                  <p class="carrinho-item__preco">{{ formatarPreco(item.produto.preco) }}</p>
                </div>
                <div class="carrinho-item__ctrl">
                  <button class="carrinho-item__del" @click="carrinho.removerItem(item.uid)" aria-label="Remover">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                  <button class="carrinho-item__qty-btn" @click="carrinho.atualizarQuantidade(item.uid, -1)">−</button>
                  <span class="carrinho-item__qty">{{ item.quantidade }}</span>
                  <button class="carrinho-item__qty-btn" @click="carrinho.atualizarQuantidade(item.uid, 1)">+</button>
                </div>
              </div>
            </TransitionGroup>

            <!-- Formulário -->
            <div class="carrinho-drawer__form">
              <!-- Tipo de Pedido -->
              <div class="form-group" v-if="permiteLocal || permiteDelivery">
                <label class="form-label">Tipo de pedido</label>
                <div class="tipo-pedido-selector">
                  <button
                    v-if="permiteLocal"
                    type="button"
                    class="tipo-btn"
                    :class="{ 'tipo-btn--active': tipoPedido === 'Local' }"
                    @click="tipoPedido = 'Local'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Local
                  </button>
                  <button
                    v-if="permiteDelivery"
                    type="button"
                    class="tipo-btn"
                    :class="{ 'tipo-btn--active': tipoPedido === 'Delivery' }"
                    @click="tipoPedido = 'Delivery'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Delivery
                  </button>
                  <button
                    v-if="permiteRetirada"
                    type="button"
                    class="tipo-btn"
                    :class="{ 'tipo-btn--active': tipoPedido === 'Retirada' }"
                    @click="tipoPedido = 'Retirada'"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    Retirada
                  </button>
                </div>
              </div>

              <!-- Campos Delivery -->
              <template v-if="mostrarCamposDelivery">
                <div class="form-group">
                  <label class="form-label">Telefone *</label>
                  <input
                    :value="telefoneCliente"
                    class="form-input"
                    :class="{ 'form-input--loading': autenticando }"
                    placeholder="(00) 00000-0000"
                    maxlength="15"
                    @input="onTelefoneInput(($event.target as HTMLInputElement).value)"
                  />
                  <div v-if="autenticando" class="input-status">Verificando...</div>
                  <div v-else-if="precisaCadastrar" class="input-status input-status--error">
                    Telefone não cadastrado
                  </div>
                  <div v-else-if="authError" class="input-status input-status--error">{{ authError }}</div>
                  <div v-else-if="clienteLogado" class="input-status input-status--success">✓ Cliente autenticado</div>
                </div>
                
                <!-- Nome (obrigatório para cadastro) -->
                <div v-if="precisaCadastrar" class="form-group">
                  <label class="form-label">Seu nome *</label>
                  <input
                    v-model="nomeCliente"
                    class="form-input"
                    :class="{ error: nomeCliente.length > 0 && nomeCliente.trim().length < 2 }"
                    placeholder="Seu nome completo"
                    maxlength="60"
                  />
                  <button 
                    type="button" 
                    class="btn-primary btn-sm" 
                    :disabled="nomeCliente.trim().length < 2 || autenticando"
                    @click="registrarCliente"
                  >
                    {{ autenticando ? 'Cadastrando...' : 'Cadastrar' }}
                  </button>
                </div>
                
                <div v-if="clienteLogado" class="form-group">
                  <div class="endereco-header">
                    <label class="form-label">Endereço de entrega *</label>
                    <button type="button" class="btn-link" @click="abrirNovoEndereco">+ Novo</button>
                  </div>
                  <div v-if="loadingCliente" class="endereco-loading">Carregando...</div>
                  <div v-else-if="enderecos.length === 0" class="endereco-empty">
                    <p>Nenhum endereço cadastrado</p>
                    <button type="button" class="btn-secondary btn-sm" @click="abrirNovoEndereco">Adicionar endereço</button>
                  </div>
                  <div v-else class="endereco-list">
                    <label
                      v-for="end in enderecos"
                      :key="end.id"
                      class="endereco-option"
                      :class="{ 'endereco-option--selected': selectedEnderecoId === end.id }"
                    >
                      <input
                        type="radio"
                        :value="end.id"
                        v-model="selectedEnderecoId"
                        class="endereco-radio"
                      />
                      <div class="endereco-info">
                        <span class="endereco-logr">{{ end.logradouro }}, {{ end.numero }}</span>
                        <span class="endereco-bairro">{{ end.bairro }} - {{ end.cidade }}</span>
                      </div>
                      <button type="button" class="btn-edit-endereco" @click.stop="abrirEditarEndereco(end)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </label>
                  </div>
                </div>
              </template>

              <!-- Campos Retirada (só nome) -->
              <template v-else>
                <div class="carrinho-form-row">
                  <div class="form-group" :class="{ 'form-group--full': !mostrarCampoMesaLocal }">
                    <label class="form-label">Seu nome *</label>
                    <input
                      v-model="nomeCliente"
                      class="form-input"
                      :class="{ error: nomeCliente.length > 0 && nomeCliente.trim().length < 2 }"
                      placeholder="Nome"
                      maxlength="60"
                    />
                  </div>
                  <div v-if="mostrarCampoMesaLocal" class="form-group">
                    <label class="form-label">Mesa *</label>
                    <input
                      v-model="numeroMesa"
                      class="form-input"
                      :class="{ 'form-input--bloqueado': mesaBloqueada }"
                      :placeholder="mesaBloqueada ? '' : 'Nº'"
                      :disabled="mesaBloqueada"
                      inputmode="numeric"
                      maxlength="4"
                      @input="onMesaInput"
                    />
                    <span v-if="mesaBloqueada" class="mesa-bloqueada-hint">Definido pelo QR</span>
                  </div>
                </div>
              </template>

              <!-- Observações (só para Local) -->
              <div v-if="tipoPedido === 'Local'" class="form-group">
                <label class="form-label">Observações</label>
                <textarea
                  v-model="obs"
                  class="form-input carrinho-obs"
                  placeholder="Alguma observação geral?"
                  rows="3"
                />
              </div>
            </div>

            <!-- Modal de Endereço -->
            <Transition name="fade">
              <div v-if="showEnderecoModal" class="modal-overlay" @click.self="showEnderecoModal = false">
                <div class="modal-content">
                  <div class="modal-header">
                    <h3>{{ editingEndereco ? 'Editar Endereço' : 'Novo Endereço' }}</h3>
                    <button class="modal-close" @click="showEnderecoModal = false">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                      <label class="form-label">CEP</label>
                      <div class="cep-input-wrapper">
                        <input 
                          :value="novoEndereco.cep" 
                          class="form-input" 
                          placeholder="00000-000" 
                          maxlength="9"
                          @input="onCepInput(($event.target as HTMLInputElement).value)"
                        />
                        <span v-if="buscandoCep" class="cep-loading">Buscando...</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Rua/Avenida *</label>
                      <input v-model="novoEndereco.logradouro" class="form-input" placeholder="Rua/Avenida" />
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Número *</label>
                        <input v-model="novoEndereco.numero" class="form-input" placeholder="Nº" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Bairro *</label>
                        <input v-model="novoEndereco.bairro" class="form-input" placeholder="Bairro" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Cidade *</label>
                      <input v-model="novoEndereco.cidade" class="form-input" placeholder="Cidade" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Complemento</label>
                      <input v-model="novoEndereco.complemento" class="form-input" placeholder="Apto, bloco, referência..." />
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn-secondary" @click="showEnderecoModal = false">Cancelar</button>
                    <button 
                      type="button" 
                      class="btn-primary"
                      :disabled="!novoEndereco.logradouro || !novoEndereco.bairro || !novoEndereco.cidade"
                      @click="salvarEndereco"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Erro -->
            <Transition name="fade">
              <div v-if="error" class="carrinho-drawer__error">{{ error }}</div>
            </Transition>
            <Transition name="fade">
              <div v-if="!validacaoAdicionais.valido" class="carrinho-drawer__error">
                {{ validacaoAdicionais.erros[0] }}
              </div>
            </Transition>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!sucesso && carrinho.itens.length > 0" class="carrinho-drawer__footer">
          <div class="carrinho-drawer__total">
            <span>Total</span>
            <strong>{{ formatarPreco(carrinho.totalPreco) }}</strong>
          </div>
          <button
            class="btn-primary"
            :disabled="!formValido || loading"
            @click="finalizar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span v-if="loading">Enviando...</span>
            <span v-else>Finalizar Pedido</span>
          </button>
          <p v-if="!formValido" class="carrinho-drawer__hint">
            {{ hintMensagem }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 200;
}

.carrinho-drawer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  z-index: 201;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.carrinho-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.carrinho-drawer__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}
.carrinho-drawer__close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background var(--transition);
}
.carrinho-drawer__close:hover { background: var(--color-border); }

.carrinho-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Vazio */
.carrinho-drawer__vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  text-align: center;
}
.carrinho-drawer__vazio p {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}
.carrinho-drawer__vazio span {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Itens */
.carrinho-itens-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.carrinho-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  padding: 12px;
}
.carrinho-item__img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-border);
}
.carrinho-item__img img { width: 100%; height: 100%; object-fit: cover; }
.carrinho-item__img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e8ede5, #edf1eb);
}
.carrinho-item__info { flex: 1; min-width: 0; }
.carrinho-item__nome {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.carrinho-item__adicionais {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.carrinho-item__preco {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  margin-top: 2px;
}
.carrinho-item__ctrl {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.carrinho-item__del {
  color: var(--color-danger);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
  margin-right: 4px;
}
.carrinho-item__del:hover { background: var(--color-danger-bg); }

.carrinho-item__qty-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  font-size: 16px;
  color: var(--color-text);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}
.carrinho-item__qty-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.carrinho-item__qty {
  min-width: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}

/* Form */
.carrinho-drawer__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
.carrinho-form-row {
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 10px;
}
.carrinho-obs { resize: none; }
.form-input--bloqueado {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 700;
  border-color: var(--color-primary);
  cursor: not-allowed;
}
.mesa-bloqueada-hint {
  display: block;
  font-size: 11px;
  color: var(--color-primary);
  margin-top: 4px;
  font-weight: 500;
}

/* Erro */
.carrinho-drawer__error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
}

/* Footer */
.carrinho-drawer__footer {
  padding: 16px 20px max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  background: var(--color-surface);
}
.carrinho-drawer__total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.carrinho-drawer__total strong {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}
.carrinho-drawer__hint {
  font-size: 12px;
  color: var(--color-primary);
  text-align: center;
  font-weight: 500;
}

/* Sucesso */
.carrinho-drawer__sucesso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  text-align: center;
}
.sucesso-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.carrinho-drawer__sucesso h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}
.carrinho-drawer__sucesso p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Tipo de Pedido Selector */
.tipo-pedido-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.tipo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}
.tipo-btn:hover {
  border-color: var(--color-primary);
}
.tipo-btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

/* Endereço */
.endereco-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.btn-link:hover { text-decoration: underline; }
.endereco-loading, .endereco-empty {
  text-align: center;
  padding: 16px;
  color: var(--color-text-muted);
  font-size: 13px;
}
.endereco-empty p { margin-bottom: 8px; }
.btn-secondary {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
.btn-sm {
  padding: 6px 10px;
  font-size: 12px;
}
.endereco-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.endereco-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition);
}
.endereco-option:hover { border-color: var(--color-primary); }
.endereco-option--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
}
.endereco-radio { display: none; }
.endereco-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.endereco-logr {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}
.endereco-bairro {
  font-size: 12px;
  color: var(--color-text-muted);
}
.btn-edit-endereco {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.btn-edit-endereco:hover { color: var(--color-primary); }
.form-input--loading { opacity: 0.7; }
.input-status {
  font-size: 12px;
  margin-top: 4px;
  color: var(--color-text-muted);
}
.input-status--error { color: var(--color-danger); }
.input-status--success { color: var(--color-primary); }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 300;
}
.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}
.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
}
.modal-body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}
.modal-footer .btn-secondary {
  flex: 1;
}
.modal-footer .btn-primary {
  flex: 1;
}
.cep-input-wrapper {
  position: relative;
}
.cep-loading {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
