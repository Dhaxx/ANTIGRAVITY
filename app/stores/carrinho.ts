import { defineStore } from 'pinia'
import type {
  CarrinhoItem,
  ProdutoPublic,
  AdicionalSelecionado
} from '~/types/api'

export const useCarrinhoStore = defineStore('carrinho', () => {
  const itens = ref<CarrinhoItem[]>([])
  const aberto = ref(false)

  const totalItens = computed(() =>
    itens.value.reduce((acc, item) => acc + item.quantidade, 0)
  )

  const totalPreco = computed(() =>
    itens.value.reduce((acc, item) => acc + item.precoTotal, 0)
  )

  function calcularPrecoTotal(
    produto: ProdutoPublic,
    quantidade: number,
    adicionais: AdicionalSelecionado[]
  ): number {
    const precoAdicionais = adicionais.reduce((s, a) => s + a.preco, 0)
    return (produto.preco + precoAdicionais) * quantidade
  }

  function adicionarItem(
    produto: ProdutoPublic,
    quantidade: number,
    adicionaisSelecionados: AdicionalSelecionado[] = [],
    obs?: string
  ) {
    const uid = `${produto.id}-${Date.now()}`
    const precoTotal = calcularPrecoTotal(produto, quantidade, adicionaisSelecionados)
    itens.value.push({ uid, produto, quantidade, adicionaisSelecionados, obs, precoTotal })
  }

  function atualizarQuantidade(uid: string, delta: number) {
    const item = itens.value.find(i => i.uid === uid)
    if (!item) return
    const novaQtd = item.quantidade + delta
    if (novaQtd <= 0) {
      removerItem(uid)
    } else {
      item.quantidade = novaQtd
      item.precoTotal = calcularPrecoTotal(item.produto, novaQtd, item.adicionaisSelecionados)
    }
  }

  function removerItem(uid: string) {
    const idx = itens.value.findIndex(i => i.uid === uid)
    if (idx !== -1) itens.value.splice(idx, 1)
  }

  function limpar() {
    itens.value = []
  }

  function abrirCarrinho() { aberto.value = true }
  function fecharCarrinho() { aberto.value = false }

  return {
    itens,
    aberto,
    totalItens,
    totalPreco,
    adicionarItem,
    atualizarQuantidade,
    removerItem,
    limpar,
    abrirCarrinho,
    fecharCarrinho
  }
})
