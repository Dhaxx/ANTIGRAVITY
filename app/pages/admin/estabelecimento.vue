<script setup lang="ts">
import { useAdminEstabelecimento } from '~/composables/useAdmin'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { estabelecimento, loading, saving, error, buscar, atualizar } = useAdminEstabelecimento()

const form = reactive({
  nome: '',
  endereco: '',
  telefone: '',
  email: '',
  logo_url: '',
})

onMounted(async () => {
  await buscar()
  if (estabelecimento.value) {
    form.nome = estabelecimento.value.nome ?? ''
    form.endereco = estabelecimento.value.endereco ?? ''
    form.telefone = estabelecimento.value.telefone ?? ''
    form.email = estabelecimento.value.email ?? ''
    form.logo_url = estabelecimento.value.logo_url ?? ''
  }
})

watch(estabelecimento, (val) => {
  if (val) {
    form.nome = val.nome ?? ''
    form.endereco = val.endereco ?? ''
    form.telefone = val.telefone ?? ''
    form.email = val.email ?? ''
    form.logo_url = val.logo_url ?? ''
  }
})

const salvo = ref(false)

async function salvar() {
  salvo.value = false
  try {
    await atualizar({
      nome: form.nome || undefined,
      endereco: form.endereco || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      logo_url: form.logo_url || undefined,
    })
    salvo.value = true
    setTimeout(() => salvo.value = false, 3000)
  } catch {}
}

useHead({ title: 'Estabelecimento — QuickPed Admin' })
</script>

<template>
  <div class="estabelecimento-page">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Estabelecimento</h1>
      <p class="admin-page-sub">Configure as informações do seu negócio</p>
    </div>

    <div v-if="loading" class="admin-card admin-loading">
      <div class="skeleton" style="height:52px;margin-bottom:12px;border-radius:10px;" />
      <div class="skeleton" style="height:52px;margin-bottom:12px;border-radius:10px;" />
      <div class="skeleton" style="height:52px;border-radius:10px;" />
    </div>

    <div v-else-if="error" class="admin-card admin-empty">{{ error }}</div>

    <div v-else class="admin-card">
      <div class="form-body">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input v-model="form.nome" class="form-input" placeholder="Ex: Lanchonete do Zé" />
        </div>

        <div class="form-group">
          <label class="form-label">Endereço</label>
          <input v-model="form.endereco" class="form-input" placeholder="Ex: Rua tal, 123 - Centro" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input v-model="form.telefone" class="form-input" placeholder="(11) 99999-9999" />
          </div>
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input v-model="form.email" class="form-input" type="email" placeholder="contato@exemplo.com" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL do Logo</label>
          <input v-model="form.logo_url" class="form-input" placeholder="https://..." />
        </div>

        <Transition name="fade">
          <p v-if="salvo" class="save-success">Alterações salvas com sucesso!</p>
        </Transition>

        <div class="form-actions">
          <button class="btn-primary" :disabled="saving" @click="salvar">
            {{ saving ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.estabelecimento-page { display: flex; flex-direction: column; gap: 20px; max-width: 560px; }
.admin-page-title { font-size: 22px; font-weight: 800; color: #1a1f17; }
.admin-page-sub { font-size: 14px; color: #6b7568; margin-top: 2px; }

.admin-card { background: #fff; border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.admin-loading { padding: 24px; }
.admin-empty { padding: 24px; color: #9ba898; font-size: 14px; text-align: center; }

.form-body { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #374151; }
.form-input {
  padding: 10px 14px;
  border: 1.5px solid #e8ede5;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1f17;
  background: #fff;
  transition: border-color 0.15s;
  outline: none;
}
.form-input:focus { border-color: var(--color-primary); }

.save-success {
  font-size: 13px; font-weight: 500;
  color: #16a34a; background: #dcfce7;
  padding: 10px 14px; border-radius: 10px;
  text-align: center;
}

.form-actions { margin-top: 4px; }
.btn-primary {
  padding: 11px 22px; border-radius: 10px;
  background: var(--color-primary); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
