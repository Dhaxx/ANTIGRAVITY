<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAdminEstabelecimento } from '~/composables/useAdmin'

const auth = useAuthStore()
const { estabelecimento, buscar: buscarEstabelecimento } = useAdminEstabelecimento()
const route = useRoute()
const router = useRouter()

// Carrega token persistido do localStorage ao montar
onMounted(async () => {
  auth.loadFromStorage()
  if (!auth.isAuthenticated) {
    router.replace('/admin/login')
  } else {
    await buscarEstabelecimento()
  }
})

const navLinks = computed(() => {
  const all = [
    { label: 'Dashboard', icon: 'grid', to: '/admin', modulo: 'dashboard' },
    { label: 'Pedidos', icon: 'list', to: '/admin/pedidos', modulo: 'pedidos' },
    { label: 'Comandas', icon: 'receipt', to: '/admin/comandas', modulo: 'comandas' },
    { label: 'Produtos', icon: 'package', to: '/admin/produtos', modulo: 'produtos' },
    { label: 'Mesas', icon: 'layout', to: '/admin/mesas', modulo: 'mesas' },
    { label: 'Estabelecimento', icon: 'store', to: '/admin/estabelecimento', modulo: 'estabelecimento' },
    { label: 'Usuários', icon: 'users', to: '/admin/registrar', modulo: 'usuarios' },
  ]
  return all.filter(link => auth.can(link.modulo as any, 'visualizar'))
})

const mobileMenuOpen = ref(false)

function handleLogout() {
  auth.logout()
  router.replace('/admin/login')
}

const activeRoute = computed(() => route.path)
</script>

<template>
  <div class="admin-shell">
    <!-- Sidebar desktop -->
    <aside class="admin-sidebar" :class="{ open: mobileMenuOpen }">
      <div class="admin-sidebar__brand">
        <div class="admin-sidebar__logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <div>
          <p class="admin-sidebar__brand-name">{{ estabelecimento?.nome || 'QuickPed' }}</p>
          <p class="admin-sidebar__brand-sub">Painel Admin</p>
        </div>
      </div>

      <nav class="admin-sidebar__nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="admin-nav-item"
          :class="{ active: activeRoute === link.to }"
          @click="mobileMenuOpen = false"
        >
          <!-- grid icon -->
          <svg v-if="link.icon === 'grid'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <!-- list icon -->
          <svg v-if="link.icon === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/>
            <circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
          </svg>
          <!-- package icon -->
          <svg v-if="link.icon === 'package'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <!-- layout icon -->
          <svg v-if="link.icon === 'layout'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <!-- receipt icon -->
          <svg v-if="link.icon === 'receipt'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2"/>
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
            <path d="M12 17V7"/>
          </svg>
          <!-- store icon -->
          <svg v-if="link.icon === 'store'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <!-- users icon -->
          <svg v-if="link.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="admin-sidebar__footer">
        <button class="admin-logout-btn" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>

    <!-- Overlay mobile -->
    <Transition name="overlay">
      <div v-if="mobileMenuOpen" class="admin-overlay" @click="mobileMenuOpen = false" />
    </Transition>

    <!-- Conteúdo -->
    <div class="admin-main">
      <!-- Topbar mobile -->
      <header class="admin-topbar">
        <button class="admin-topbar__menu" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span class="admin-topbar__title">
          {{ navLinks.find(l => l.to === activeRoute)?.label ?? 'Admin' }}
        </span>
        <button class="admin-topbar__logout" @click="handleLogout" title="Sair">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100dvh;
  background: #f4f6f8;
  font-family: var(--font);
}

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
.admin-sidebar {
  width: 230px;
  flex-shrink: 0;
  background: #1a2332;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 300;
  transition: transform 0.3s cubic-bezier(0.32,0.72,0,1);
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.admin-sidebar__logo {
  width: 38px; height: 38px;
  background: var(--color-primary);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.admin-sidebar__brand-name {
  font-size: 15px; font-weight: 700; color: #fff;
}
.admin-sidebar__brand-sub {
  font-size: 11px; color: rgba(255,255,255,0.4);
}

.admin-sidebar__nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255,255,255,0.55);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.18s ease;
}
.admin-nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: #fff;
}
.admin-nav-item.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.admin-sidebar__footer {
  padding: 12px 10px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.admin-logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255,255,255,0.45);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
}
.admin-logout-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }

/* ─── Main ─────────────────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  margin-left: 230px;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

/* ─── Topbar (mobile) ──────────────────────────────────────────────────── */
.admin-topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 54px;
  background: #fff;
  border-bottom: 1px solid #e8ede5;
  position: sticky; top: 0; z-index: 50;
}
.admin-topbar__menu, .admin-topbar__logout {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.15s;
}
.admin-topbar__menu:hover, .admin-topbar__logout:hover { background: #f3f4f6; }
.admin-topbar__title { flex: 1; font-size: 15px; font-weight: 600; color: #1a1f17; }
.admin-topbar__logout { margin-left: auto; }

/* ─── Content ─────────────────────────────────────────────────────────── */
.admin-content {
  flex: 1;
  padding: 28px 28px;
}

/* ─── Overlay mobile ─────────────────────────────────────────────────── */
.admin-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 299;
}

/* ─── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  .admin-sidebar.open {
    transform: translateX(0);
  }
  .admin-main {
    margin-left: 0;
  }
  .admin-topbar {
    display: flex;
  }
  .admin-content {
    padding: 16px;
  }
  .admin-overlay {
    display: block;
  }
}
</style>
