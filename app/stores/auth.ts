import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const usuarioId = ref<number | null>(null)
  const estabelecimentoId = ref<number | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(data: { access_token: string; usuario_id: number; estabelecimento_id: number }) {
    token.value = data.access_token
    usuarioId.value = data.usuario_id
    estabelecimentoId.value = data.estabelecimento_id
    if (import.meta.client) {
      localStorage.setItem('qp_token', data.access_token)
      localStorage.setItem('qp_usuario_id', String(data.usuario_id))
      localStorage.setItem('qp_estabelecimento_id', String(data.estabelecimento_id))
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    const t = localStorage.getItem('qp_token')
    const u = localStorage.getItem('qp_usuario_id')
    const e = localStorage.getItem('qp_estabelecimento_id')
    if (t) {
      token.value = t
      usuarioId.value = u ? Number(u) : null
      estabelecimentoId.value = e ? Number(e) : null
    }
  }

  function logout() {
    token.value = null
    usuarioId.value = null
    estabelecimentoId.value = null
    if (import.meta.client) {
      localStorage.removeItem('qp_token')
      localStorage.removeItem('qp_usuario_id')
      localStorage.removeItem('qp_estabelecimento_id')
    }
  }

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, usuarioId, estabelecimentoId, isAuthenticated, setAuth, loadFromStorage, logout, authHeaders }
})
