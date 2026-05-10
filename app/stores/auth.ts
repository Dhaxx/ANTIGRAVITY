import { defineStore } from 'pinia'

export type PermissaoModulo = 'editar' | 'visualizar' | 'bloqueado'

export interface PermissoesRead {
  dashboard: PermissaoModulo
  pedidos: PermissaoModulo
  comandas: PermissaoModulo
  produtos: PermissaoModulo
  mesas: PermissaoModulo
  estabelecimento: PermissaoModulo
  usuarios: PermissaoModulo
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const usuarioId = ref<number | null>(null)
  const estabelecimentoId = ref<number | null>(null)
  const permissoes = ref<PermissoesRead | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function can(modulo: keyof PermissoesRead, acao: 'editar' | 'visualizar' = 'editar'): boolean {
    if (!permissoes.value) return false
    const p = permissoes.value[modulo]
    if (p === 'editar') return true
    if (p === 'visualizar' && acao === 'visualizar') return true
    return false
  }

  function setAuth(data: { access_token: string; usuario_id: number; estabelecimento_id: number; permissoes?: PermissoesRead }) {
    token.value = data.access_token
    usuarioId.value = data.usuario_id
    estabelecimentoId.value = data.estabelecimento_id
    permissoes.value = data.permissoes ?? null
    if (import.meta.client) {
      localStorage.setItem('qp_token', data.access_token)
      localStorage.setItem('qp_usuario_id', String(data.usuario_id))
      localStorage.setItem('qp_estabelecimento_id', String(data.estabelecimento_id))
      if (data.permissoes) {
        localStorage.setItem('qp_permissoes', JSON.stringify(data.permissoes))
      } else {
        localStorage.removeItem('qp_permissoes')
      }
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    const t = localStorage.getItem('qp_token')
    const u = localStorage.getItem('qp_usuario_id')
    const e = localStorage.getItem('qp_estabelecimento_id')
    const p = localStorage.getItem('qp_permissoes')
    if (t) {
      token.value = t
      usuarioId.value = u ? Number(u) : null
      estabelecimentoId.value = e ? Number(e) : null
      permissoes.value = p ? JSON.parse(p) : null
    }
  }

  function logout() {
    token.value = null
    usuarioId.value = null
    estabelecimentoId.value = null
    permissoes.value = null
    if (import.meta.client) {
      localStorage.removeItem('qp_token')
      localStorage.removeItem('qp_usuario_id')
      localStorage.removeItem('qp_estabelecimento_id')
      localStorage.removeItem('qp_permissoes')
    }
  }

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, usuarioId, estabelecimentoId, permissoes, isAuthenticated, can, setAuth, loadFromStorage, logout, authHeaders }
})
