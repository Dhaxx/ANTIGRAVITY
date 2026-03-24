<script setup lang="ts">
import type { ProdutoPublic, CardapioPublicResponse } from '~/types/api'

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
  }
})

const usandoMock = ref(false)

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
    } catch (e) {
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
    <AppHeader :nome-estabelecimento="cardapio?.estabelecimento?.nome" />

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

    <!-- Drawer do carrinho -->
    <CarrinhoDrawer :slug="slug" :mesa-preenchida="numeroMesaPreenchido" />
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
</style>
