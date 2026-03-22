import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Rotas públicas dentro de /admin
  if (to.path === '/admin/login') return

  // Só protege rotas dentro de /admin
  if (!to.path.startsWith('/admin')) return

  const auth = useAuthStore()

  // Carrega do localStorage no cliente
  if (import.meta.client) {
    auth.loadFromStorage()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/admin/login')
  }
})
