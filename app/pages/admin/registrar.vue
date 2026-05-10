<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAdminUsuarios } from '~/composables/useAdmin'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const auth = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

const { usuarios, loading: loadingUsuarios, buscar: buscarUsuarios } = useAdminUsuarios()

const form = reactive({
  usuario: '',
  senha: '',
  confirmarSenha: ''
})

const loading = ref(false)
const error = ref('')
const sucesso = ref(false)

onMounted(() => {
  buscarUsuarios()
})

async function registrar() {
  error.value = ''
  
  if (!form.usuario?.trim()) {
    error.value = 'Usuário é obrigatório'
    return
  }
  if (!form.senha || form.senha.length < 4) {
    error.value = 'Senha deve ter pelo menos 4 caracteres'
    return
  }
  if (form.senha !== form.confirmarSenha) {
    error.value = 'As senhas não coincidem'
    return
  }
  
  loading.value = true
  try {
    await $fetch(`${config.public.apiBase}/api/v1/admin/autenticacao/registrar`, {
      method: 'POST',
      body: {
        usuario: form.usuario,
        senha: form.senha,
        estabelecimento_id: auth.estabelecimentoId
      },
      headers: auth.authHeaders()
    })
    sucesso.value = true
    form.usuario = ''
    form.senha = ''
    form.confirmarSenha = ''
    await buscarUsuarios()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erro ao criar usuário'
  } finally {
    loading.value = false
  }
}

useHead({ title: 'Novo Usuário — QuickPed Admin' })
</script>

<template>
  <div class="registrar-page">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Novo Usuário</h1>
      <p class="admin-page-sub">Crie um novo usuário para o seu estabelecimento</p>
    </div>

    <div class="admin-card">
      <form class="registrar-form" @submit.prevent="registrar">
        <div class="form-group">
          <label class="form-label">Usuário *</label>
          <input 
            v-model="form.usuario" 
            class="form-input" 
            type="text" 
            placeholder="Ex: garçom1, caixa, admin"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Senha *</label>
          <input 
            v-model="form.senha" 
            class="form-input" 
            type="password" 
            placeholder="Mínimo 4 caracteres"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Confirmar Senha *</label>
          <input 
            v-model="form.confirmarSenha" 
            class="form-input" 
            type="password" 
            placeholder="Repita a senha"
            :disabled="loading"
          />
        </div>

        <Transition name="fade">
          <div v-if="error" class="form-error">{{ error }}</div>
        </Transition>

        <Transition name="fade">
          <div v-if="sucesso" class="form-success">
            Usuário criado com sucesso!
          </div>
        </Transition>

        <div v-if="auth.can('usuarios', 'editar')" class="form-actions">
          <NuxtLink to="/admin" class="btn-cancel">Voltar</NuxtLink>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Criando...' : 'Criar Usuário' }}
          </button>
        </div>
        <div v-else class="form-readonly-msg">
          Você não tem permissão para criar usuários.
        </div>
      </form>
    </div>

    <div v-if="usuarios.length > 0" class="admin-card">
      <h3 class="usuarios-title">Usuários do estabelecimento ({{ usuarios.length }})</h3>
      <div class="usuarios-list">
        <div v-for="u in usuarios" :key="u.id" class="usuario-item">
          <span class="usuario-nome">{{ u.usuario }}</span>
          <div class="usuario-badges">
            <span v-if="u.admin" class="badge badge--admin">Admin</span>
            <span v-if="!u.ativo" class="badge badge--inativo">Inativo</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.registrar-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}

.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.admin-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  padding: 24px;
}

.registrar-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 10px 14px;
  border: 1.5px solid #e8ede5;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1f17;
  background: #fff;
  outline: none;
  transition: border-color .15s;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.form-error {
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 8px;
}

.form-success {
  color: #16a34a;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-cancel {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7568;
  background: #f3f4f6;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-primary {
  flex: 1;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--color-primary);
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.usuarios-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1f17;
  margin-bottom: 16px;
}

.usuarios-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.usuario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

.usuario-nome {
  font-size: 14px;
  font-weight: 600;
  color: #1a1f17;
}

.usuario-badges {
  display: flex;
  gap: 6px;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge--admin {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge--inativo {
  background: #fee2e2;
  color: #dc2626;
}

.form-readonly-msg {
  padding: 10px 14px;
  background: #f7f8f5;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7568;
  text-align: center;
}
</style>
