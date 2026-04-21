<script setup lang="ts">
import type { ProdutoPublic, AdicionalSelecionado, AdicionalPublic, GrupoAdicional } from '~/types/api'
import { useCarrinhoStore } from '~/stores/carrinho'

const props = defineProps<{
  produto: ProdutoPublic | null
  aberto: boolean
  modoCardapioDigital?: boolean
}>()

const emit = defineEmits<{ (e: 'fechar'): void }>()

const carrinho = useCarrinhoStore()

const quantidade = ref(1)
const adicionaisSelecionados = ref<AdicionalSelecionado[]>([])

watch(() => props.aberto, (v) => {
  if (v) {
    quantidade.value = 1
    adicionaisSelecionados.value = []
  }
})

const precoTotal = computed(() => {
  if (!props.produto) return 0
  const precoAdicionais = adicionaisSelecionados.value.reduce((s, a) => s + a.preco, 0)
  return (props.produto.preco + precoAdicionais) * quantidade.value
})

const grupos = computed(() => {
  if (props.produto?.grupos_adicional?.length) {
    return props.produto.grupos_adicional
  }
  const adicionais = props.produto?.adicionais ?? []
  if (!adicionais.length) return []
  
  const gruposMap = new Map<number, GrupoAdicional>()
  for (const ad of adicionais) {
    const gid = ad.grupo_id ?? 0
    if (!gruposMap.has(gid)) {
      gruposMap.set(gid, {
        nome: ad.grupo_nome ?? 'Adicionais',
        max_selecoes: ad.max_selecoes ?? 99,
        min_selecoes: ad.min_selecoes ?? 0,
        produto_id: ad.grupo_id ?? 0,
        id: gid,
        adicionais: []
      })
    }
    gruposMap.get(gid)!.adicionais.push(ad)
  }
  return Array.from(gruposMap.values())
})

const podeSelecionar = (adicional: AdicionalPublic, grupo: GrupoAdicional) => {
  const count = adicionaisSelecionados.value.filter(a => a.grupo_id === grupo.id).length
  return count < grupo.max_selecoes
}

const validarMinimo = (): boolean => {
  for (const grupo of grupos.value) {
    const min = grupo.min_selecoes ?? 0
    const count = adicionaisSelecionados.value.filter(a => a.grupo_id === grupo.id).length
    if (count < min) return false
  }
  return true
}

const getMensagemMinimo = (): string => {
  for (const grupo of grupos.value) {
    const min = grupo.min_selecoes ?? 0
    const count = adicionaisSelecionados.value.filter(a => a.grupo_id === grupo.id).length
    if (count < min && min > 0) {
      return `Selecione ${min} opção em "${grupo.nome}"`
    }
  }
  return ''
}

function toggleAdicional(adicional: AdicionalPublic, grupo: GrupoAdicional) {
  const idx = adicionaisSelecionados.value.findIndex(a => a.id === adicional.id)
  if (idx !== -1) {
    adicionaisSelecionados.value.splice(idx, 1)
    return
  }
  if (!podeSelecionar(adicional, grupo)) return
  adicionaisSelecionados.value.push({ id: adicional.id, nome: adicional.nome, preco: adicional.preco, grupo_id: grupo.id })
}

function isAdicionalSelecionado(id: number) {
  return adicionaisSelecionados.value.some(a => a.id === id)
}

function toggleAdicionalOld(adicional: AdicionalPublic) {
  const idx = adicionaisSelecionados.value.findIndex(a => a.id === adicional.id)
  if (idx !== -1) {
    adicionaisSelecionados.value.splice(idx, 1)
    return
  }
  const max = adicional.max_selecoes ?? 99
  if (adicionaisSelecionados.value.length >= max) return
  adicionaisSelecionados.value.push({ id: adicional.id, nome: adicional.nome, preco: adicional.preco, grupo_id: adicional.grupo_id })
}

function adicionar() {
  if (!props.produto) return
  carrinho.adicionarItem(props.produto, quantidade.value, adicionaisSelecionados.value)
  emit('fechar')
}

function formatarPreco(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="aberto" class="modal-overlay" @click="emit('fechar')" />
    </Transition>

    <Transition name="slide-up">
      <div v-if="aberto && produto" class="produto-modal">
        <!-- Imagem -->
        <div class="produto-modal__img-wrap">
          <img
            v-if="produto.imagem_url"
            :src="produto.imagem_url"
            :alt="produto.nome"
            class="produto-modal__img"
          />
          <div v-else class="produto-modal__img-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <button class="produto-modal__close" @click="emit('fechar')" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Conteúdo scrollável -->
        <div class="produto-modal__body">
          <h2 class="produto-modal__nome">{{ produto.nome }}</h2>
          <p v-if="produto.descricao" class="produto-modal__desc">{{ produto.descricao }}</p>
          <p class="produto-modal__preco">{{ formatarPreco(produto.preco) }}</p>

          <!-- Adicionais (com grupos) -->
          <div v-if="grupos.length > 0" class="produto-modal__adicionais">
            <div v-for="grupo in grupos" :key="grupo.id" class="produto-modal__grupo">
              <p class="produto-modal__adicionais-label">
                {{ grupo.nome }}
                <span v-if="grupo.max_selecoes < 99" class="produto-modal__limite">
                  (máx: {{ grupo.max_selecoes }})
                </span>
              </p>
              <div class="produto-modal__adicionais-list">
                <button
                  v-for="ad in grupo.adicionais"
                  :key="ad.id"
                  class="adicional-btn"
                  :class="{ selected: isAdicionalSelecionado(ad.id) }"
                  :disabled="!isAdicionalSelecionado(ad.id) && !podeSelecionar(ad, grupo)"
                  @click="toggleAdicional(ad, grupo)"
                >
                  <span class="adicional-btn__nome">{{ ad.nome }}</span>
                  <span class="adicional-btn__preco">+ {{ formatarPreco(ad.preco) }}</span>
                  <span class="adicional-btn__check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <!-- Adicionais (estrutura antiga, com grupo_id/max_selecoes no adicional) -->
          <div v-else-if="produto.adicionais && produto.adicionais.length > 0" class="produto-modal__adicionais">
            <p class="produto-modal__adicionais-label">
              ADICIONAIS
              <span v-if="produto.adicionais[0]?.max_selecoes && produto.adicionais[0].max_selecoes < 99" class="produto-modal__limite">
                (máx: {{ produto.adicionais[0].max_selecoes }})
                <span v-if="produto.adicionais[0]?.min_selecoes > 0">, mín: {{ produto.adicionais[0].min_selecoes }}</span>
              </span>
            </p>
            <div class="produto-modal__adicionais-list">
              <button
                v-for="ad in produto.adicionais"
                :key="ad.id"
                class="adicional-btn"
                :class="{ selected: isAdicionalSelecionado(ad.id) }"
                :disabled="!isAdicionalSelecionado(ad.id) && ad.max_selecoes && adicionaisSelecionados.value.length >= ad.max_selecoes"
                @click="toggleAdicionalOld(ad)"
              >
                <span class="adicional-btn__nome">{{ ad.nome }}</span>
                <span class="adicional-btn__preco">+ {{ formatarPreco(ad.preco) }}</span>
                <span class="adicional-btn__check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <!-- Footer: quantidade + adicionar -->
          <div v-if="!props.modoCardapioDigital" class="produto-modal__footer">
            <div class="quantidade-ctrl">
              <button class="quantidade-ctrl__btn" @click="quantidade = Math.max(1, quantidade - 1)">−</button>
              <span class="quantidade-ctrl__val">{{ quantidade }}</span>
              <button class="quantidade-ctrl__btn" @click="quantidade++">+</button>
            </div>
            <p v-if="grupos.length > 0 && !validarMinimo()" class="produto-modal__erro-min">
              {{ getMensagemMinimo() }}
            </p>
            <button class="btn-primary produto-modal__cta" :disabled="!validarMinimo()" @click="adicionar">
              Adicionar — {{ formatarPreco(precoTotal) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  z-index: 200;
}

.produto-modal {
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
}

.produto-modal__img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  flex-shrink: 0;
  background: var(--color-surface-alt);
  overflow: hidden;
}
.produto-modal__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.produto-modal__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8ede5, #f7f8f5);
}

.produto-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: background var(--transition);
}
.produto-modal__close:hover { background: rgba(0,0,0,0.7); }

.produto-modal__body {
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
}

.produto-modal__nome {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}
.produto-modal__desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
.produto-modal__preco {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.produto-modal__adicionais { margin-top: 8px; }
.produto-modal__adicionais-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}
.produto-modal__limite { font-weight: 400; color: var(--color-text-muted); font-size: 10px; }
.produto-modal__adicionais-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.adicional-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-alt);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition);
}
.adicional-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.adicional-btn:disabled:hover { border-color: var(--color-border); }
.adicional-btn:hover { border-color: var(--color-primary); }
.adicional-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.adicional-btn__nome { font-weight: 500; }
.adicional-btn__preco { font-size: 12px; color: var(--color-text-muted); }
.adicional-btn__check {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.adicional-btn.selected .adicional-btn__check { display: flex; }

.produto-modal__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0 max(20px, env(safe-area-inset-bottom));
  margin-top: 8px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: var(--color-surface);
}

.quantidade-ctrl {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
}
.quantidade-ctrl__btn {
  width: 38px;
  height: 38px;
  font-size: 20px;
  font-weight: 300;
  color: var(--color-text);
  background: none;
  cursor: pointer;
  transition: background var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}
.quantidade-ctrl__btn:hover { background: var(--color-surface-alt); }
.quantidade-ctrl__val {
  min-width: 28px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
}

.produto-modal__cta { flex: 1; padding: 14px 16px; }
.produto-modal__cta:disabled { opacity: 0.5; cursor: not-allowed; }
.produto-modal__erro-min { font-size: 12px; color: var(--color-danger); text-align: center; margin-top: 4px; }
</style>
