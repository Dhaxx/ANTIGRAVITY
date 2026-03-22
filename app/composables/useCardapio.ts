import type { CardapioPublicResponse } from '~/types/api'

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
        }
      ]
    }
  ]
}

export const useCardapio = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const cardapio = ref<CardapioPublicResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const usandoMock = ref(false)

  async function buscarCardapio(slug: string) {
    loading.value = true
    error.value = null
    usandoMock.value = false

    try {
      const data = await $fetch<CardapioPublicResponse>(
        `${apiBase}/api/v1/${slug}/cardapio/`,
        { timeout: 8000 }
      )
      cardapio.value = data
    } catch (e) {
      console.warn('[useCardapio] API indisponível, usando mock.', e)
      cardapio.value = MOCK_CARDAPIO
      usandoMock.value = true
    } finally {
      loading.value = false
    }
  }

  return { cardapio, loading, error, usandoMock, buscarCardapio }
}
