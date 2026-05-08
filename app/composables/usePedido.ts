import type { PedidoCreate, PedidoRead, PedidoTipo } from '~/types/api'
import { useCarrinhoStore } from '~/stores/carrinho'

export const usePedido = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const loading = ref(false)
  const error = ref<string | null>(null)
  const pedidoCriado = ref<PedidoRead | null>(null)

  async function enviarPedido(slug: string, dados: PedidoCreate): Promise<PedidoRead | null> {
    loading.value = true
    error.value = null
    pedidoCriado.value = null

    try {
      const data = await $fetch<PedidoRead>(
        `${apiBase}/api/v1/${slug}/pedido/`,
        {
          method: 'POST',
          body: dados
        }
      )
      pedidoCriado.value = data
      const carrinho = useCarrinhoStore()
      carrinho.limpar()
      return data
    } catch (e: any) {
      console.error('[usePedido] Erro ao enviar pedido:', e)
      const msg = e?.data?.detail || 'Erro ao enviar pedido. Tente novamente.'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
      return null
    } finally {
      loading.value = false
    }
  }

  function montarPayload(
    nomeCliente: string,
    numeroMesa: number,
    mesaToken?: string,
    obs?: string,
    tipo?: PedidoTipo,
    enderecoId?: number | null
  ): PedidoCreate {
    const carrinho = useCarrinhoStore()
    return {
      nome_cliente: nomeCliente,
      numero_mesa: numeroMesa,
      mesa_token: mesaToken,
      obs: obs || null,
      tipo: tipo || 'Local',
      endereco_id: enderecoId || null,
      itens: carrinho.itens.map(item => ({
        produto_id: item.produto.id,
        nome_produto: item.produto.nome,
        preco_unitario: item.produto.preco,
        quantidade: item.quantidade,
        adicionais: item.adicionaisSelecionados.map(a => ({
          id: a.id,
          nome: a.nome,
          preco: a.preco
        }))
      }))
    }
  }

  return { loading, error, pedidoCriado, enviarPedido, montarPayload }
}
