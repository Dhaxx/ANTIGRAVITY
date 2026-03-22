import { useAuthStore } from '~/stores/auth'

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

  return { pedidos, loading, error, buscarPedidos, atualizarStatus, deletarPedido }
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

  async function criar(dados: { nome: string; icone?: string; estabelecimento_id: number }) {
    const result = await apiFetch('/api/v1/admin/categoria-produto/', { method: 'POST', body: dados })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { nome?: string; icone?: string; ativo?: boolean }) {
    const result = await apiFetch(`/api/v1/admin/categoria-produto/?categoria_produto_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/categoria-produto/${id}`, { method: 'DELETE' })
    await buscar()
  }

  return { categorias, loading, buscar, criar, atualizar, deletar }
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

  return { produtos, loading, buscar, criar, atualizar, deletar }
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

  async function criar(numero: number) {
    const result = await apiFetch('/api/v1/admin/mesa/', { method: 'POST', body: { numero } })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { numero?: number; ativa?: boolean }) {
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

  async function buscar() {
    loading.value = true
    try { comandas.value = await apiFetch('/api/v1/admin/comanda/') }
    catch { comandas.value = [] }
    finally { loading.value = false }
  }

  return { comandas, loading, buscar }
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

  async function atualizar(dados: { nome?: string; endereco?: string; telefone?: string; email?: string; logo_url?: string }) {
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

  const grupos = ref<any[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { grupos.value = await apiFetch('/api/v1/admin/grupo-adicional/') }
    catch { grupos.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: { nome: string; multiplo?: boolean; produto_id?: number }) {
    const result = await apiFetch('/api/v1/admin/grupo-adicional/', { method: 'POST', body: dados })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { nome?: string; multiplo?: boolean }) {
    const result = await apiFetch(`/api/v1/admin/grupo-adicional/?grupo_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/grupo-adicional/?grupo_id=${id}`, { method: 'DELETE' })
    await buscar()
  }

  return { grupos, loading, buscar, criar, atualizar, deletar }
}

// ─── Adicionais ───────────────────────────────────────────────────────────────
export const useAdminAdicionais = () => {
  const { apiFetch } = useAdminFetch()

  const adicionais = ref<any[]>([])
  const loading = ref(false)

  async function buscar() {
    loading.value = true
    try { adicionais.value = await apiFetch('/api/v1/admin/adicional/') }
    catch { adicionais.value = [] }
    finally { loading.value = false }
  }

  async function criar(dados: { nome: string; preco: number; grupo_id: number }) {
    const result = await apiFetch('/api/v1/admin/adicional/', { method: 'POST', body: dados })
    await buscar()
    return result
  }

  async function atualizar(id: number, dados: { nome?: string; preco?: number }) {
    const result = await apiFetch(`/api/v1/admin/adicional/?adicional_id=${id}`, { method: 'PUT', body: dados })
    await buscar()
    return result
  }

  async function deletar(id: number) {
    await apiFetch(`/api/v1/admin/adicional/?adicional_id=${id}`, { method: 'DELETE' })
    await buscar()
  }

  return { adicionais, loading, buscar, criar, atualizar, deletar }
}
