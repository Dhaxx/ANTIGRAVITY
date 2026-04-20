<script setup lang="ts">
import type { ProdutoPublic, CardapioPublicResponse } from '~/types/api'

interface ComandaRead {
  id: number
  numero_mesa: number
  status: string
  total: string
  pedidos: Array<{
    id: number
    status: string
    total: string
    itens: Array<{
      id: number
      nome_produto: string
      preco_unitario: string
      quantidade: number
      adicionais?: Array<{ nome: string; preco: string | number }>
    }>
  }>
}

function formatarPreco(v: string | number) {
  const num = typeof v === 'string' ? parseFloat(v) : v
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

// Mock fallback caso a API falhe
const MOCK_CARDAPIO: CardapioPublicResponse = {
  estabelecimento: { nome: 'Aroma de Oliveira', aberto: true },
  categorias: [
    {
      id: 1,
      nome: 'Cafés',
      ordem: 0,
      produtos: [
        {
          id: 1,
          nome: 'Espresso',
          descricao: 'Café puro e intenso, extraído na hora',
          preco: 6.50,
          imagem_url: null,
          disponivel: true,
          adicionais: [
            { id: 1, nome: 'Chantilly', preco: 2.00 },
            { id: 2, nome: 'Canela', preco: 0.50 }
          ]
        },
        {
          id: 2,
          nome: 'Café Gelado',
          descricao: 'Espresso sobre gelo com leite',
          preco: 13.00,
          imagem_url: null,
          disponivel: true,
          adicionais: [
            { id: 1, nome: 'Chantilly', preco: 2.00 },
            { id: 3, nome: 'Calda de caramelo', preco: 1.50 }
          ]
        },
        {
          id: 3,
          nome: 'Cappuccino',
          descricao: 'Espresso, leite vaporizado e espuma cremosa',
          preco: 10.00,
          imagem_url: null,
          disponivel: true,
          adicionais: []
        },
        {
          id: 5,
          nome: 'Latte',
          descricao: 'Espresso suave com leite cremoso',
          preco: 11.50,
          imagem_url: null,
          disponivel: true,
          adicionais: [
            { id: 5, nome: 'Xarope de baunilha', preco: 1.50 }
          ]
        }
      ]
    },
    {
      id: 2,
      nome: 'Espetos',
      ordem: 1,
      produtos: [
        {
          id: 4,
          nome: 'Espeto de Frango',
          descricao: 'Frango temperado grelhado na brasa',
          preco: 18.00,
          imagem_url: null,
          disponivel: true,
          adicionais: [
            { id: 4, nome: 'Molho especial', preco: 2.00 }
          ]
        },
        {
          id: 6,
          nome: 'Espeto Misto',
          descricao: 'Carne bovina e frango na brasa',
          preco: 22.00,
          imagem_url: null,
          disponivel: true,
          adicionais: []
        }
      ]
    }
  ]
}

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => route.params.slug as string)

const mesaToken = computed(() => route.query.mesa as string | undefined)
const numeroMesaPreenchido = ref<number | null>(null)
const comandaAtual = ref<ComandaRead | null>(null)
const comandaModalAberto = ref(false)

async function buscarComanda() {
  if (!mesaToken.value || !slug.value) return
  try {
    const data = await $fetch<ComandaRead>(
      `${config.public.apiBase}/api/v1/${slug.value}/comanda/`,
      { params: { token: mesaToken.value } }
    )
    comandaAtual.value = data
  } catch (e) {
    console.warn('[cardapio] Não foi possível buscar a comanda:', e)
  }
}

async function buscarMesaPorToken() {
  if (!mesaToken.value || !slug.value) return
  try {
    const data = await $fetch<{ numero: number }>(
      `${config.public.apiBase}/api/v1/${slug.value}/mesa/${mesaToken.value}`
    )
    numeroMesaPreenchido.value = data.numero
  } catch (e) {
    console.warn('[cardapio] Não foi possível buscar dados da mesa:', e)
  }
}

onMounted(() => {
  if (mesaToken.value) {
    buscarMesaPorToken()
    buscarComanda()
  }
})

const usandoMock = ref(false)

const router = useRouter()

const { data: cardapio, pending: loading, refresh } = await useAsyncData(
  `cardapio-${slug.value}`,
  async () => {
    try {
      const data = await $fetch<CardapioPublicResponse>(
        `${config.public.apiBase}/api/v1/${slug.value}/cardapio/`,
        { timeout: 6000 }
      )
      usandoMock.value = false
      return data
} catch (e: any) {
      console.log('[cardapio] erro:', e, 'status:', e.response?.status)
      const status = e.response?.status ?? e.status
      if (status === 404) {
        await router.push('/')
        return
      }
      console.warn('[cardapio] API indisponível, usando mock.', e)
      usandoMock.value = true
      return MOCK_CARDAPIO
    }
  }
)

const categoriaAtiva = ref<number | null>(null)
const produtoSelecionado = ref<ProdutoPublic | null>(null)
const modalAberto = ref(false)

const todasCategorias = computed(() => cardapio.value?.categorias ?? [])

const categoriasVisiveis = computed(() => {
  if (!cardapio.value) return []
  const cats = [...cardapio.value.categorias].sort((a, b) => a.ordem - b.ordem)
  if (categoriaAtiva.value === null) return cats
  return cats.filter(c => c.id === categoriaAtiva.value)
})

function abrirProduto(produto: ProdutoPublic) {
  produtoSelecionado.value = produto
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  setTimeout(() => { produtoSelecionado.value = null }, 350)
}

useHead({
  title: computed(() => cardapio.value?.estabelecimento.nome ?? 'Cardápio'),
  meta: [
    { name: 'description', content: 'Faça seu pedido pelo cardápio digital' }
  ]
})
</script>

<template>
  <div class="cardapio-page">
    <!-- Header -->
    <AppHeader 
      :nome-estabelecimento="cardapio?.estabelecimento?.nome" 
      :comanda-aberta="!!comandaAtual"
      @ver-comanda="comandaModalAberto = true"
    />

    <!-- Hero -->
    <Transition name="fade">
      <div v-if="cardapio" class="cardapio-hero">
        <div class="container">
          <div class="cardapio-hero__logo">
            <img
              v-if="cardapio?.estabelecimento.logo_url"
              :src="cardapio.estabelecimento.logo_url"
              :alt="cardapio.estabelecimento.nome"
              class="logo-img"
            />
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <h1 class="cardapio-hero__nome">{{ cardapio.estabelecimento.nome }}</h1>
          <p class="cardapio-hero__sub">Faça seu pedido pelo menu abaixo</p>
          <div class="cardapio-hero__status" :class="cardapio.estabelecimento.aberto ? 'aberto' : 'fechado'">
            <span class="dot" />
            {{ cardapio.estabelecimento.aberto ? 'Aberto agora' : 'Fechado no momento' }}
          </div>
          <div v-if="usandoMock" class="cardapio-hero__mock-banner">
            📋 Modo demonstração — conecte a API para ver dados reais
          </div>
        </div>
      </div>
    </Transition>

    <!-- Filtros de categoria -->
    <CategoriaFiltro
      v-if="todasCategorias.length > 0"
      :categorias="todasCategorias"
      :categoria-ativa="categoriaAtiva"
      @selecionar="categoriaAtiva = $event"
    />

    <!-- Loading skeleton -->
    <LoadingState v-if="loading" />

    <!-- Grade de produtos -->
    <div v-else-if="cardapio" class="cardapio-content container">
      <div
        v-for="categoria in categoriasVisiveis"
        :key="categoria.id"
        class="categoria-section"
      >
        <h2 class="categoria-section__titulo">{{ categoria.nome }}</h2>
        <div class="produtos-grid">
          <ProdutoCard
            v-for="produto in categoria.produtos.filter(p => p.disponivel)"
            :key="produto.id"
            :produto="produto"
            @abrir="abrirProduto"
          />
        </div>
        <div v-if="categoria.produtos.filter(p => p.disponivel).length === 0" class="cardapio-vazio">
          Nenhum produto disponível nesta categoria.
        </div>
      </div>
    </div>

    <!-- Modal de produto (bottom sheet) -->
    <ProdutoModal
      :produto="produtoSelecionado"
      :aberto="modalAberto"
      @fechar="fecharModal"
    />

    <!-- Modal da comanda -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="comandaModalAberto" class="comanda-overlay" @click="comandaModalAberto = false" />
      </Transition>
      <Transition name="slide">
        <div v-if="comandaModalAberto" class="comanda-sheet">
          <div class="comanda-sheet__header">
            <h2>Minha Comanda</h2>
            <button class="comanda-sheet__close" @click="comandaModalAberto = false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="comanda-sheet__content">
            <div v-if="comandaAtual" class="comanda-info">
              <div class="comanda-info__meta">
                <span class="comanda-info__mesa">Mesa {{ comandaAtual.numero_mesa }}</span>
                <span class="comanda-info__status">{{ comandaAtual.status }}</span>
              </div>
              <div v-if="comandaAtual.pedidos.length === 0" class="comanda-vazio">
                Nenhum pedido ainda
              </div>
              <div v-else class="comanda-pedidos">
                <div v-for="pedido in comandaAtual.pedidos" :key="pedido.id" class="comanda-pedido">
                  <div class="comanda-pedido__header">
                    <span>Pedido #{{ pedido.id }}</span>
                    <span class="comanda-pedido__status">{{ pedido.status }}</span>
                  </div>
                  <ul class="comanda-pedido__itens">
                    <li v-for="item in pedido.itens" :key="item.id">
                      <div class="item-info">
                        <span class="item-qtd">{{ item.quantidade }}x</span>
                        <span class="item-nome">{{ item.nome_produto }}</span>
                        <span class="item-unitario">({{ formatarPreco(item.preco_unitario) }} cada)</span>
                        <span v-if="item.adicionais?.length" class="item-adicionais">
                          + {{ item.adicionais.map((a: any) => a.nome).join(', ') }}
                          <span class="item-total-ad">({{ formatarPreco(item.adicionais.reduce((acc: number, a: any) => acc + Number(a.preco), 0)) }})</span>
                        </span>
                      </div>
                      <span class="item-preco">
                        {{ formatarPreco(Number(item.preco_unitario) * item.quantidade + (item.adicionais?.reduce((acc: number, a: any) => acc + Number(a.preco) * item.quantidade, 0) || 0)) }}
                      </span>
                    </li>
                  </ul>
                  <div class="comanda-pedido__total">
                    Total: R$ {{ pedido.total }}
                  </div>
                </div>
              </div>
              <div class="comanda-total">
                Total geral: R$ {{ comandaAtual.total }}
              </div>
            </div>
            <div v-else class="comanda-carregando">
              Carregando...
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Drawer do carrinho -->
    <CarrinhoDrawer 
      :slug="slug" 
      :mesa-preenchida="numeroMesaPreenchido"
      :mesa-token="mesaToken"
      @pedido-criado="buscarComanda"
    />
  </div>
</template>

<style scoped>
.cardapio-page {
  min-height: 100dvh;
  background: var(--color-surface-alt);
  padding-bottom: 60px;
}

/* Hero */
.cardapio-hero {
  background: linear-gradient(160deg, var(--color-primary-bg) 0%, #f0f5ed 100%);
  padding: 28px 0 24px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}
.cardapio-hero__logo {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cardapio-hero__nome {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 4px;
}
.cardapio-hero__sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}
.cardapio-hero__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
.cardapio-hero__status.aberto {
  background: #e8f5e9;
  color: #2e7d32;
}
.cardapio-hero__status.fechado {
  background: #fff3e0;
  color: #e65100;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: currentColor;
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.cardapio-hero__mock-banner {
  margin-top: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: rgba(0,0,0,0.05);
  border-radius: var(--radius-full);
  padding: 4px 14px;
  display: inline-block;
}

/* Conteúdo */
.cardapio-content {
  padding-top: 16px;
}
.categoria-section {
  margin-bottom: 28px;
}
.categoria-section__titulo {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-primary-bg);
}
.produtos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.cardapio-vazio {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

/* Modal Comanda */
.comanda-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}
.comanda-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  max-height: 80dvh;
  z-index: 201;
  display: flex;
  flex-direction: column;
}
.comanda-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}
.comanda-sheet__header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.comanda-sheet__close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}
.comanda-sheet__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.comanda-info__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.comanda-info__mesa {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}
.comanda-info__status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  text-transform: capitalize;
}
.comanda-vazio {
  text-align: center;
  padding: 32px 0;
  color: var(--color-text-muted);
}
.comanda-pedidos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.comanda-pedido {
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  padding: 12px;
}
.comanda-pedido__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}
.comanda-pedido__status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  text-transform: capitalize;
}
.comanda-pedido__itens {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
}
.comanda-pedido__itens li {
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 6px 0;
}
.item-qtd {
  font-weight: 600;
  color: var(--color-text);
  min-width: 24px;
}
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-nome {
  flex: 1;
}
.item-unitario {
  font-size: 11px;
  color: var(--color-text-muted);
}
.item-adicionais {
  font-size: 11px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.item-total-ad {
  font-size: 11px;
  color: var(--color-text-muted);
}
.item-preco {
  font-weight: 500;
  white-space: nowrap;
}
.comanda-pedido__total {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  text-align: right;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
.comanda-total {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary);
  text-align: center;
}
.comanda-carregando {
  text-align: center;
  padding: 32px 0;
  color: var(--color-text-muted);
}

.overlay-enter-active, .overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from, .overlay-leave-to {
  opacity: 0;
}
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateY(100%);
}
</style>
