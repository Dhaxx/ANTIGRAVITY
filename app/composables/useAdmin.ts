import { useAuthStore } from '~/stores/auth'
import type { UsuarioRead } from '~/types/api'

export const useAdminFetch = () => {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  async function apiFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}${path}`, {
      ...opts,
      headers: {
        ...auth.authHeaders(),
        ...(opts.headers as Record<string, string> ?? {})
      }
    })
  }

  return { apiFetch }
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────
export const useAdminPedidos = () => {
  const { apiFetch } = useAdminFetch()

  const pedidos = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function buscarPedidos() {
    loading.value = true
    error.value = null
    try {
      pedidos.value = await apiFetch('/api/v1/admin/pedido/')
    } catch (e: any) {
      error.value = e?.data?.detail ?? 'Erro ao buscar pedidos'
      pedidos.value = []
    } finally {
      loading.value = false
    }
  }

  async function atualizarStatus(pedidoId: number, status: string) {
    return apiFetch(`/api/v1/admin/pedido/?Pedido_id=${pedidoId}`, {
      method: 'PUT',
      body: { status }
    })
  }

  async function deletarPedido(pedidoId: number) {
    await apiFetch(`/api/v1/admin/pedido/?Pedido_id=${pedidoId}`, { method: 'DELETE' })
    await buscarPedidos()
  }

  async function imprimirPedido(pedidoId: number) {
    return apiFetch(`/api/v1/admin/Impressao/pedido/${pedidoId}`, { method: 'POST' })
  }

  return { pedidos, loading, error, buscarPedidos, atualizarStatus, deletarPedido, imprimirPedido }
}

// ─── Categorias ───────────────────────────────────────────────────────────────
export const useAdminCategorias = () => {
  const { apiFetch } = useAdminFetch()

  const categorias = ref<any[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { categorias.value = await apiFetch('/api/v1/admin/categoria-produto/') }
    catch { categorias.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: { nome: string; icone?: string; estabelecimento_id: number; produzido_por?: number | null }) {
    const result = await apiFetch('/api/v1/admin/categoria-produto/', { method: 'POST', body: dados })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { nome?: string; icone?: string; ativo?: boolean; produzido_por?: number | null }) {
    const result = await apiFetch(`/api/v1/admin/categoria-produto/?categoria_produto_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/categoria-produto/${id}`, { method: 'DELETE' })
    await buscar()
  }

  async function toggleAtivo(id: number, ativo: boolean) {
    await apiFetch(`/api/v1/admin/categoria-produto/?categoria_produto_id=${id}`, {
      method: 'PUT',
      body: { ativo }
    })
    await buscar()
  }

  return { categorias, loading, buscar, criar, atualizar, deletar, toggleAtivo }
}

// ─── Produtos ─────────────────────────────────────────────────────────────────
export const useAdminProdutos = () => {
  const { apiFetch } = useAdminFetch()

  const produtos = ref<any[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { produtos.value = await apiFetch('/api/v1/admin/produto/') }
    catch { produtos.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: object) {
    const result = await apiFetch('/api/v1/admin/produto/', { method: 'POST', body: dados })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: object) {
    const result = await apiFetch(`/api/v1/admin/produto/?produto_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/produto/?produto_id=${id}`, { method: 'DELETE' })
    await buscar()
  }

  async function toggleAtivo(id: number, ativo: boolean) {
    await apiFetch(`/api/v1/admin/produto/?produto_id=${id}`, {
      method: 'PUT',
      body: { ativo }
    })
    await buscar()
  }

  return { produtos, loading, buscar, criar, atualizar, deletar, toggleAtivo }
}

// ─── Mesas ────────────────────────────────────────────────────────────────────
export const useAdminMesas = () => {
  const { apiFetch } = useAdminFetch()

  const mesas = ref<any[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { mesas.value = await apiFetch('/api/v1/admin/mesa/') }
    catch { mesas.value = [] }
    finally { loading.value = false }
  }

  async function criar(numero: number, nome: string | null = null) {
    const result = await apiFetch('/api/v1/admin/mesa/', { method: 'POST', body: { numero, nome } })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { numero?: number; nome?: string | null; ativa?: boolean }) {
    const result = await apiFetch(`/api/v1/admin/mesa/?mesa_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/mesa/?mesa_id=${id}`, { method: 'DELETE' })
    await buscar()
  }

  return { mesas, loading, buscar, criar, atualizar, deletar }
}

// ─── Comandas ─────────────────────────────────────────────────────────────────
export const useAdminComandas = () => {
  const { apiFetch } = useAdminFetch()

  const comandas = ref<any[]>([])
  const loading = ref(false)

  async function buscar(status?: string) {
    loading.value = true
    try {
      const query = status ? `?status=${status}` : ''
      comandas.value = await apiFetch(`/api/v1/admin/comanda/${query}`)
    }
    catch { comandas.value = [] }
    finally { loading.value = false }
  }

  async function fecharComanda(comandaId: number) {
    return apiFetch(`/api/v1/admin/comanda/?comanda_id=${comandaId}`, {
      method: 'PUT',
      body: { status: 'fechada' }
    })
  }

  return { comandas, loading, buscar, fecharComanda }
}

// ─── Estabelecimento ──────────────────────────────────────────────────────────
export const useAdminEstabelecimento = () => {
  const { apiFetch } = useAdminFetch()

  const estabelecimento = ref<any | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function buscar() {
    loading.value = true
    error.value = null
    try {
      estabelecimento.value = await apiFetch('/api/v1/admin/estabelecimento/')
    } catch (e: any) {
      error.value = e?.data?.detail ?? 'Erro ao buscar estabelecimento'
    } finally {
      loading.value = false
    }
  }

  async function atualizar(dados: { nome?: string; endereco?: string; telefone?: string; email?: string; logo_url?: string; esta_aberto?: boolean | null }) {
    saving.value = true
    error.value = null
    try {
      await apiFetch('/api/v1/admin/estabelecimento/', { method: 'PUT', body: dados })
      await buscar()
    } catch (e: any) {
      error.value = e?.data?.detail ?? 'Erro ao salvar'
      throw e
    } finally {
      saving.value = false
    }
  }

  return { estabelecimento, loading, saving, error, buscar, atualizar }
}

// ─── Grupos de Adicionais ─────────────────────────────────────────────────────
export const useAdminAdicionalGrupos = () => {
  const { apiFetch } = useAdminFetch()
  const auth = useAuthStore()

  const grupos = ref<any[]>([])
  const loading = ref(false)

  async function buscar(produtoId: number) {
    loading.value = true
    try { 
      grupos.value = await apiFetch(`/api/v1/admin/produto/grupo-adicional/?produto_id=${produtoId}`)
    }
    catch { grupos.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: { nome: string; max_selecoes?: number; produto_id?: number; adicionais?: { nome: string; preco: number }[] }) {
    const payload = { 
      ...dados, 
      produto_id: dados.produto_id ?? auth.estabelecimentoId 
    }
    const result = await apiFetch('/api/v1/admin/produto/grupo-adicional/', { 
      method: 'POST', 
      body: payload
    })
    if (dados.produto_id) {
      await buscar(dados.produto_id)
    }
    return result
  }

  async function atualizar(produtoId: number, id: number, dados: { nome?: string; max_selecoes?: number }) {
    const result = await apiFetch(`/api/v1/admin/produto/grupo-adicional/?grupo_id=${id}`, { method: 'PUT', body: dados })
    await buscar(produtoId)
    return result
  }

  async function deletar(produtoId: number, id: number) {
    await apiFetch(`/api/v1/admin/produto/grupo-adicional/?grupo_id=${id}`, { method: 'DELETE' })
    await buscar(produtoId)
  }

  return { grupos, loading, buscar, criar, atualizar, deletar }
}

const useAdminGrupos = useAdminAdicionalGrupos

// ─── Adicionais ───────────────────────────────────────────────────────────────
export const useAdminAdicionais = () => {
  const { apiFetch } = useAdminFetch()

  const adicionais = ref<any[]>([])
  const loading = ref(false)

  async function buscar(grupoId: number) {
    loading.value = true
    try { 
      adicionais.value = await apiFetch(`/api/v1/admin/produto/adicional/?grupo_id=${grupoId}`)
    }
    catch { adicionais.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: { nome: string; preco: number; grupo_id: number }) {
    const result = await apiFetch('/api/v1/admin/produto/adicional/', { method: 'POST', body: dados })
    if (dados.grupo_id) {
      await buscar(dados.grupo_id)
    }
    return result
  }

  async function atualizar(grupoId: number, id: number, dados: { nome?: string; preco?: number }) {
    const result = await apiFetch(`/api/v1/admin/produto/adicional/?adicional_id=${id}`, { method: 'PUT', body: dados })
    await buscar(grupoId)
    return result
  }

  async function deletar(grupoId: number, id: number) {
    await apiFetch(`/api/v1/admin/produto/adicional/?adicional_id=${id}`, { method: 'DELETE' })
    await buscar(grupoId)
  }

  return { adicionais, loading, buscar, criar, atualizar, deletar }
}

// ─── Usuários ────────────────────────────────────────────────────────────────
export const useAdminUsuarios = () => {
  const { apiFetch } = useAdminFetch()

  const usuarios = ref<UsuarioRead[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { 
      usuarios.value = await apiFetch<UsuarioRead[]>('/api/v1/admin/autenticacao/usuarios')
    }
    catch { usuarios.value = [] }
    finally { loading.value = false }
  }

  return { usuarios, loading, buscar }
}
