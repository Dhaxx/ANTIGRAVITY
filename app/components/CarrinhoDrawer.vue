<script setup lang="ts">
import { useCarrinhoStore } from '~/stores/carrinho'
import { usePedido } from '~/composables/usePedido'

const props = defineProps<{ slug: string; mesaPreenchida?: number | null }>()

const emit = defineEmits<{
  (e: 'pedido-criado'): void
}>()

const carrinho = useCarrinhoStore()
const { loading, error, pedidoCriado, enviarPedido, montarPayload } = usePedido()

const nomeCliente = ref('')
const numeroMesa = ref<string>('')
const obs = ref('')
const sucesso = ref(false)

watch(() => props.mesaPreenchida, (val) => {
  if (val) numeroMesa.value = String(val)
}, { immediate: true })

const formValido = computed(() =>
  nomeCliente.value.trim().length >= 2 && Number(numeroMesa.value) > 0 && carrinho.itens.length > 0
)

async function finalizar() {
  if (!formValido.value) return
  const payload = montarPayload(nomeCliente.value.trim(), Number(numeroMesa.value), obs.value)
  const result = await enviarPedido(props.slug, payload)
  if (result) {
    sucesso.value = true
    nomeCliente.value = ''
    numeroMesa.value = ''
    obs.value = ''
    emit('pedido-criado')
    setTimeout(() => { sucesso.value = false; carrinho.fecharCarrinho() }, 3500)
  }
}

function formatarPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function numeroBonito(s: string) {
  // remove non-numeric
  return s.replace(/[^0-9]/g, '')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="carrinho.aberto" class="drawer-overlay" @click="carrinho.fecharCarrinho()" />
    </Transition>

    <Transition name="slide-up">
      <div v-if="carrinho.aberto" class="carrinho-drawer">
        <!-- Header -->
        <div class="carrinho-drawer__header">
          <div class="carrinho-drawer__titulo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Seu Pedido</span>
          </div>
          <button class="carrinho-drawer__close" @click="carrinho.fecharCarrinho()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="carrinho-drawer__body">
          <!-- Sucesso -->
          <Transition name="fade">
            <div v-if="sucesso" class="carrinho-drawer__sucesso">
              <div class="sucesso-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Pedido enviado!</h3>
              <p>Seu pedido foi recebido e está sendo preparado. 🎉</p>
            </div>
          </Transition>

          <!-- Carrinho vazio -->
          <div v-if="!sucesso && carrinho.itens.length === 0" class="carrinho-drawer__vazio">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Seu carrinho está vazio</p>
            <span>Adicione itens do cardápio</span>
          </div>

          <!-- Itens -->
          <div v-if="!sucesso && carrinho.itens.length > 0" class="carrinho-drawer__itens">
            <TransitionGroup name="fade" tag="div" class="carrinho-itens-list">
              <div v-for="item in carrinho.itens" :key="item.uid" class="carrinho-item">
                <div class="carrinho-item__img">
                  <img v-if="item.produto.imagem_url" :src="item.produto.imagem_url" :alt="item.produto.nome" />
                  <div v-else class="carrinho-item__img-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                </div>
                <div class="carrinho-item__info">
                  <p class="carrinho-item__nome">{{ item.produto.nome }}</p>
                  <p v-if="item.adicionaisSelecionados.length" class="carrinho-item__adicionais">
                    + {{ item.adicionaisSelecionados.map(a => a.nome).join(', ') }}
                  </p>
                  <p class="carrinho-item__preco">{{ formatarPreco(item.produto.preco) }}</p>
                </div>
                <div class="carrinho-item__ctrl">
                  <button class="carrinho-item__del" @click="carrinho.removerItem(item.uid)" aria-label="Remover">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                  <button class="carrinho-item__qty-btn" @click="carrinho.atualizarQuantidade(item.uid, -1)">−</button>
                  <span class="carrinho-item__qty">{{ item.quantidade }}</span>
                  <button class="carrinho-item__qty-btn" @click="carrinho.atualizarQuantidade(item.uid, 1)">+</button>
                </div>
              </div>
            </TransitionGroup>

            <!-- Formulário -->
            <div class="carrinho-drawer__form">
              <div class="carrinho-form-row">
                <div class="form-group">
                  <label class="form-label">Seu nome *</label>
                  <input
                    v-model="nomeCliente"
                    class="form-input"
                    :class="{ error: nomeCliente.length > 0 && nomeCliente.trim().length < 2 }"
                    placeholder="Nome"
                    maxlength="60"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Mesa *</label>
                  <input
                    v-model="numeroMesa"
                    class="form-input"
                    placeholder="Nº"
                    inputmode="numeric"
                    maxlength="4"
                    @input="numeroMesa = numeroBonito(numeroMesa)"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea
                  v-model="obs"
                  class="form-input carrinho-obs"
                  placeholder="Alguma observação geral?"
                  rows="3"
                />
              </div>
            </div>

            <!-- Erro -->
            <Transition name="fade">
              <div v-if="error" class="carrinho-drawer__error">{{ error }}</div>
            </Transition>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!sucesso && carrinho.itens.length > 0" class="carrinho-drawer__footer">
          <div class="carrinho-drawer__total">
            <span>Total</span>
            <strong>{{ formatarPreco(carrinho.totalPreco) }}</strong>
          </div>
          <button
            class="btn-primary"
            :disabled="!formValido || loading"
            @click="finalizar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span v-if="loading">Enviando...</span>
            <span v-else>Finalizar Pedido</span>
          </button>
          <p v-if="!formValido" class="carrinho-drawer__hint">
            Preencha nome e mesa para continuar
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 200;
}

.carrinho-drawer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  z-index: 201;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.carrinho-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.carrinho-drawer__titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}
.carrinho-drawer__close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-surface-alt);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background var(--transition);
}
.carrinho-drawer__close:hover { background: var(--color-border); }

.carrinho-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Vazio */
.carrinho-drawer__vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  text-align: center;
}
.carrinho-drawer__vazio p {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}
.carrinho-drawer__vazio span {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Itens */
.carrinho-itens-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.carrinho-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-md);
  padding: 12px;
}
.carrinho-item__img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-border);
}
.carrinho-item__img img { width: 100%; height: 100%; object-fit: cover; }
.carrinho-item__img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #e8ede5, #edf1eb);
}
.carrinho-item__info { flex: 1; min-width: 0; }
.carrinho-item__nome {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.carrinho-item__adicionais {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.carrinho-item__preco {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  margin-top: 2px;
}
.carrinho-item__ctrl {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.carrinho-item__del {
  color: var(--color-danger);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition);
  margin-right: 4px;
}
.carrinho-item__del:hover { background: var(--color-danger-bg); }

.carrinho-item__qty-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  font-size: 16px;
  color: var(--color-text);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
}
.carrinho-item__qty-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.carrinho-item__qty {
  min-width: 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
}

/* Form */
.carrinho-drawer__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
.carrinho-form-row {
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 10px;
}
.carrinho-obs { resize: none; }

/* Erro */
.carrinho-drawer__error {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
}

/* Footer */
.carrinho-drawer__footer {
  padding: 16px 20px max(16px, env(safe-area-inset-bottom));
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  background: var(--color-surface);
}
.carrinho-drawer__total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.carrinho-drawer__total strong {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}
.carrinho-drawer__hint {
  font-size: 12px;
  color: var(--color-primary);
  text-align: center;
  font-weight: 500;
}

/* Sucesso */
.carrinho-drawer__sucesso {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  text-align: center;
}
.sucesso-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.carrinho-drawer__sucesso h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}
.carrinho-drawer__sucesso p {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
