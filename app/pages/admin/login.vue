<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const auth = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// Se já logado, vai pro dashboard
onMounted(() => {
  auth.loadFromStorage()
  if (auth.isAuthenticated) router.replace('/admin')
})

async function login() {
  if (!username.value || !password.value) {
    error.value = 'Preencha usuário e senha.'
    return
  }
  loading.value = true
  error.value = null
  try {
    const formData = new URLSearchParams()
    formData.append('username', username.value)
    formData.append('password', password.value)

    const data = await $fetch<{ access_token: string; usuario_id: number; estabelecimento_id: number; permissoes: any }>(
      `${config.public.apiBase}/api/v1/admin/autenticacao/login`,
      {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )
    auth.setAuth(data)
    await router.replace('/admin')
  } catch (e: any) {
    console.error('Erro login:', e?.data, e?.status)
    const detail = e?.data?.detail
    error.value = typeof detail === 'string' ? detail : 'Usuário ou senha incorretos.'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Login — QuickPed Admin' })
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      </div>
      <h1 class="login-title">QuickPed</h1>
      <p class="login-sub">Acesse o painel administrativo</p>

      <form class="login-form" @submit.prevent="login">
        <div class="form-group">
          <label class="form-label">Usuário</label>
          <input
            v-model="username"
            class="form-input"
            type="text"
            placeholder="seu_usuario"
            autocomplete="username"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <input
            v-model="password"
            class="form-input"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="loading"
            @keyup.enter="login"
          />
        </div>

        <Transition name="fade">
          <div v-if="error" class="login-error">{{ error }}</div>
        </Transition>

        <button type="submit" class="btn-primary login-btn" :disabled="loading">
          <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/>
          </svg>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  background: linear-gradient(135deg, #1a2332 0%, #243447 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.login-logo {
  width: 60px; height: 60px;
  background: var(--color-primary-bg);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary);
  margin: 0 auto 16px;
}

.login-title { font-size: 22px; font-weight: 800; color: var(--color-text); margin-bottom: 4px; }
.login-sub { font-size: 14px; color: var(--color-text-muted); margin-bottom: 28px; }

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.login-error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.login-btn {
  margin-top: 6px;
  gap: 8px;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>
