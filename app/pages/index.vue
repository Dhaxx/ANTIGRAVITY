<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const whatsappNumber = '5517996756534'
const whatsappMessage = encodeURIComponent('Olá! Tenho interesse no QuickPed e gostaria de saber mais informações.')
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

const features = [
  {
    icon: 'menu',
    title: 'Cardápio Digital Dinâmico',
    description: 'Crie e atualize seu cardápio em tempo real. Seus clientes sempre veem os itens mais recentes, com fotos e descrições que encantam.',
  },
  {
    icon: 'receipt',
    title: 'Gestão de Comandas',
    description: 'Controle total das comandas por mesa. Abra, adicione itens e feche com facilidade, sem perder nenhum pedido.',
  },
  {
    icon: 'orders',
    title: 'Pedidos em Tempo Real',
    description: 'Receba e gerencie pedidos instantaneamente. A cozinha e o salão sempre em sincronia para um serviço impecável.',
  },
  {
    icon: 'table',
    title: 'Controle de Mesas',
    description: 'Visualize o status de cada mesa em um mapa interativo. Saiba de relance quais estão livres, ocupadas ou aguardando.',
  },
  {
    icon: 'tenant',
    title: 'Multi-Estabelecimento',
    description: 'Gerencie múltiplos estabelecimentos em uma única plataforma. Ideal para redes, franquias ou empreendedores com mais de um negócio.',
  },
  {
    icon: 'reports',
    title: 'Dashboard & Relatórios',
    description: 'Acompanhe métricas essenciais do seu negócio. Tome decisões inteligentes com dados claros e atualizados.',
  },
]

const steps = [
  { number: '01', title: 'Cadastre seu estabelecimento', desc: 'Configure seu negócio em minutos: nome, logo, categorias e itens do cardápio.' },
  { number: '02', title: 'Compartilhe o cardápio', desc: 'Gere um link único para seus clientes acessarem o cardápio digital pelo celular.' },
  { number: '03', title: 'Gerencie tudo em um lugar', desc: 'Pedidos, mesas e comandas centralizados no painel admin para sua equipe.' },
]

const menuItemsIsometric = [
  { emoji: '🍔', label: 'X-Burguer Artesanal', price: '29,90', cat: 'Lanches' },
  { emoji: '🍕', label: 'Pizza Margherita', price: '42,00', cat: 'Pizzas' },
  { emoji: '🥗', label: 'Salada Caesar', price: '24,50', cat: 'Saladas' },
  { emoji: '🥤', label: 'Suco Natural', price: '12,00', cat: 'Bebidas' },
]

const isMenuOpen = ref(false)
</script>

<template>
  <div class="lp-root">
    <!-- ═══════════════════════════════════════════
         NAVBAR
    ═══════════════════════════════════════════ -->
    <nav class="lp-nav">
      <div class="lp-nav__inner lp-container">
        <div class="lp-logo">
          <div class="lp-logo__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <span class="lp-logo__name">QuickPed</span>
        </div>

        <!-- desktop links -->
        <div class="lp-nav__links">
          <a href="#features" class="lp-nav__link">Funcionalidades</a>
          <a href="#how" class="lp-nav__link">Como funciona</a>
          <a :href="whatsappLink" target="_blank" rel="noopener" class="lp-nav__cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488"/></svg>
            Falar no WhatsApp
          </a>
        </div>

        <!-- mobile burger -->
        <button class="lp-nav__burger" @click="isMenuOpen = !isMenuOpen" aria-label="Menu">
          <span :class="{ open: isMenuOpen }"></span>
        </button>
      </div>

      <!-- mobile dropdown -->
      <Transition name="mobile-nav">
        <div v-if="isMenuOpen" class="lp-nav__mobile">
          <a href="#features" class="lp-nav__mobile-link" @click="isMenuOpen = false">Funcionalidades</a>
          <a href="#how" class="lp-nav__mobile-link" @click="isMenuOpen = false">Como funciona</a>
          <a :href="whatsappLink" target="_blank" rel="noopener" class="lp-nav__mobile-cta" @click="isMenuOpen = false">
            Falar no WhatsApp
          </a>
        </div>
      </Transition>
    </nav>

    <!-- ═══════════════════════════════════════════
         HERO
    ═══════════════════════════════════════════ -->
    <section class="lp-hero">
      <div class="lp-hero__bg-orbs">
        <div class="orb orb--1"></div>
        <div class="orb orb--2"></div>
        <div class="orb orb--3"></div>
      </div>

      <div class="lp-container lp-hero__inner">
        <div class="lp-hero__content">
          <div class="lp-hero__badge">
            <span class="lp-hero__badge-dot"></span>
            Gestão alimentícia moderna
          </div>

          <h1 class="lp-hero__title">
            Gerencie seu<br>
            <em>estabelecimento</em> com<br>
            <span class="lp-hero__title-highlight">inteligência e agilidade</span>
          </h1>

          <p class="lp-hero__sub">
            Do cardápio digital às comandas, mesas e pedidos — tudo em uma plataforma
            web multi-tenant pensada para restaurantes, lanchonetes e bares.
          </p>

          <div class="lp-hero__actions">
            <a :href="whatsappLink" target="_blank" rel="noopener" id="hero-whatsapp-cta" class="lp-btn lp-btn--primary lp-btn--lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488"/></svg>
              Quero conhecer o QuickPed
            </a>
            <a href="#features" id="hero-learn-more" class="lp-btn lp-btn--ghost lp-btn--lg">
              Ver funcionalidades
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div class="lp-hero__stats">
            <div class="lp-stat">
              <span class="lp-stat__number">100%</span>
              <span class="lp-stat__label">Web & Mobile</span>
            </div>
            <div class="lp-stat__divider"></div>
            <div class="lp-stat">
              <span class="lp-stat__number">Multi</span>
              <span class="lp-stat__label">Estabelecimentos</span>
            </div>
            <div class="lp-stat__divider"></div>
            <div class="lp-stat">
              <span class="lp-stat__number">Real-time</span>
              <span class="lp-stat__label">Pedidos ao vivo</span>
            </div>
          </div>
        </div>

        <!-- ── MOCK UI ILLUSTRATION ── -->
        <div class="lp-hero__visual" aria-hidden="true">
          <div class="lp-mock">
            <!-- mock nav -->
            <div class="lp-mock__bar">
              <div class="lp-mock__dots">
                <span></span><span></span><span></span>
              </div>
              <div class="lp-mock__url">quickped.app/cardapio</div>
            </div>

            <!-- mock header -->
            <div class="lp-mock__body">
              <div class="lp-mock__header">
                <div class="lp-mock__logo-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                </div>
                <div>
                  <div class="lp-mock__store-name">Restaurante Exemplo</div>
                  <div class="lp-mock__store-sub">Mesa 04 · Aberta</div>
                </div>
                <div class="lp-mock__badge-cart">3</div>
              </div>

              <!-- categories pills -->
              <div class="lp-mock__cats">
                <span class="lp-mock__cat active">Todos</span>
                <span class="lp-mock__cat">Lanches</span>
                <span class="lp-mock__cat">Pizzas</span>
                <span class="lp-mock__cat">Bebidas</span>
              </div>

              <!-- items -->
              <div class="lp-mock__items">
                <div v-for="item in menuItemsIsometric" :key="item.label" class="lp-mock__item">
                  <div class="lp-mock__item-emoji">{{ item.emoji }}</div>
                  <div class="lp-mock__item-info">
                    <span class="lp-mock__item-name">{{ item.label }}</span>
                    <span class="lp-mock__item-cat">{{ item.cat }}</span>
                  </div>
                  <div class="lp-mock__item-right">
                    <span class="lp-mock__item-price">R$&nbsp;{{ item.price }}</span>
                    <button class="lp-mock__add">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- floating notification -->
            <div class="lp-mock__notif">
              <span class="lp-mock__notif-icon">🔔</span>
              <div>
                <div class="lp-mock__notif-title">Novo pedido · Mesa 07</div>
                <div class="lp-mock__notif-sub">X-Burguer + Suco Natural</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         FEATURES
    ═══════════════════════════════════════════ -->
    <section id="features" class="lp-features">
      <div class="lp-container">
        <div class="lp-section-header">
          <span class="lp-eyebrow">Funcionalidades</span>
          <h2 class="lp-section-title">Tudo que seu negócio precisa</h2>
          <p class="lp-section-sub">Uma plataforma completa para otimizar cada etapa do atendimento, da cozinha ao cliente.</p>
        </div>

        <div class="lp-features__grid">
          <div v-for="feat in features" :key="feat.title" class="lp-feat-card">
            <div class="lp-feat-card__icon">
              <!-- menu icon -->
              <svg v-if="feat.icon === 'menu'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 2l.5 3M5 9a7 7 0 0 0 14 0M8.5 2l.5 3M14 2l.5 3M19.5 2l.5 3M8 9h8"/><rect x="5" y="16" width="14" height="5" rx="1"/>
              </svg>
              <!-- receipt icon -->
              <svg v-if="feat.icon === 'receipt'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              </svg>
              <!-- orders icon -->
              <svg v-if="feat.icon === 'orders'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <!-- table icon -->
              <svg v-if="feat.icon === 'table'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              <!-- tenant icon -->
              <svg v-if="feat.icon === 'tenant'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <!-- reports icon -->
              <svg v-if="feat.icon === 'reports'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            </div>
            <h3 class="lp-feat-card__title">{{ feat.title }}</h3>
            <p class="lp-feat-card__desc">{{ feat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         HOW IT WORKS
    ═══════════════════════════════════════════ -->
    <section id="how" class="lp-how">
      <div class="lp-container">
        <div class="lp-section-header">
          <span class="lp-eyebrow">Como funciona</span>
          <h2 class="lp-section-title">Simples de começar, poderoso no dia a dia</h2>
          <p class="lp-section-sub">Em poucos passos, seu estabelecimento está operando com tecnologia de ponta.</p>
        </div>

        <div class="lp-how__steps">
          <div v-for="(step, i) in steps" :key="step.number" class="lp-step">
            <div class="lp-step__number">{{ step.number }}</div>
            <div class="lp-step__connector" v-if="i < steps.length - 1"></div>
            <h3 class="lp-step__title">{{ step.title }}</h3>
            <p class="lp-step__desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         HIGHLIGHT BAND
    ═══════════════════════════════════════════ -->
    <section class="lp-band">
      <div class="lp-container lp-band__inner" style="padding-bottom: 15px;">
        <div class="lp-band__pills">
          <span>🍽️ Cardápio digital</span>
          <span>🧾 Comandas inteligentes</span>
          <span>📊 Dashboard unificado</span>
          <span>🪑 Gestão de mesas</span>
          <span>⚡ Pedidos em tempo real</span>
          <span>🏪 Multi-tenant</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         CTA FINAL
    ═══════════════════════════════════════════ -->
    <section class="lp-cta">
      <div class="lp-cta__bg-orbs">
        <div class="orb orb--4"></div>
        <div class="orb orb--5"></div>
      </div>
      <div class="lp-container lp-cta__inner">
        <div class="lp-cta__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <h2 class="lp-cta__title">Pronto para modernizar<br>seu estabelecimento?</h2>
        <p class="lp-cta__sub">Entre em contato pelo WhatsApp e descubra como o QuickPed pode transformar a operação do seu negócio.</p>
        <a :href="whatsappLink" target="_blank" rel="noopener" id="cta-whatsapp-final" class="lp-btn lp-btn--white lp-btn--lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488"/></svg>
          Falar com nossa equipe
        </a>
        <p class="lp-cta__hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3.2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l.83-.83a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.7 17.3l.22-.38z"/></svg>
          (17) 99675-6534 — Atendimento rápido e personalizado
        </p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         FOOTER
    ═══════════════════════════════════════════ -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer__inner">
        <div class="lp-logo">
          <div class="lp-logo__icon lp-logo__icon--sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <span class="lp-logo__name lp-logo__name--sm">QuickPed</span>
        </div>
        <p class="lp-footer__copy">© {{ new Date().getFullYear() }} QuickPed · Sistema de gestão alimentícia</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Tokens are defined in main.css global stylesheet */

/* ─── RESET ──────────────────────────────────────────────────────────────── */
.lp-root *, .lp-root *::before, .lp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lp-root {
  font-family: var(--lp-font);
  color: var(--lp-dark);
  background: var(--lp-cream);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  line-height: 1.55;
}

/* ─── CONTAINER ──────────────────────────────────────────────────────────── */
.lp-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 28px;
}

/* ─── BUTTONS ────────────────────────────────────────────────────────────── */
.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--lp-font);
  font-weight: 600;
  border-radius: var(--lp-radius-full);
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all var(--lp-transition);
  white-space: nowrap;
}
.lp-btn--lg {
  padding: 15px 28px;
  font-size: 15px;
}
.lp-btn--primary {
  background: var(--lp-sage-deeper);
  color: var(--lp-white);
  box-shadow: 0 4px 20px rgba(93,112,85,0.35);
}
.lp-btn--primary:hover {
  background: var(--lp-dark-2);
  box-shadow: 0 8px 28px rgba(93,112,85,0.45);
  transform: translateY(-2px);
}
.lp-btn--ghost {
  background: transparent;
  color: var(--lp-sage-deeper);
  border: 2px solid var(--lp-sage-light);
}
.lp-btn--ghost:hover {
  background: var(--lp-sage-xlight);
  border-color: var(--lp-sage);
  transform: translateY(-2px);
}
.lp-btn--white {
  background: var(--lp-white);
  color: var(--lp-sage-deeper);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}
.lp-btn--white:hover {
  background: var(--lp-sage-xlight);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

/* ─── SECTION HEADERS ────────────────────────────────────────────────────── */
.lp-section-header {
  text-align: center;
  margin-bottom: 56px;
}
.lp-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-sage-deeper);
  background: var(--lp-sage-xlight);
  padding: 6px 14px;
  border-radius: var(--lp-radius-full);
  margin-bottom: 16px;
}
.lp-section-title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800;
  color: var(--lp-dark);
  line-height: 1.2;
  margin-bottom: 14px;
}
.lp-section-sub {
  font-size: 17px;
  color: #6b7a65;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.65;
}

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(250, 249, 246, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(159,171,151,0.2);
}
.lp-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.lp-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.lp-logo__icon {
  width: 40px;
  height: 40px;
  background: var(--lp-sage-deeper);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lp-white);
  flex-shrink: 0;
}
.lp-logo__icon--sm {
  width: 32px;
  height: 32px;
  border-radius: 9px;
}
.lp-logo__name {
  font-size: 18px;
  font-weight: 800;
  color: var(--lp-dark);
  letter-spacing: -0.02em;
}
.lp-logo__name--sm {
  font-size: 15px;
}
.lp-nav__links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lp-nav__link {
  font-size: 14px;
  font-weight: 500;
  color: #6b7a65;
  text-decoration: none;
  padding: 7px 14px;
  border-radius: var(--lp-radius-full);
  transition: all var(--lp-transition);
}
.lp-nav__link:hover {
  color: var(--lp-dark);
  background: var(--lp-sage-xlight);
}
.lp-nav__cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: var(--lp-wp-green);
  text-decoration: none;
  background: rgba(37, 211, 102, 0.1);
  padding: 8px 16px;
  border-radius: var(--lp-radius-full);
  margin-left: 8px;
  transition: all var(--lp-transition);
}
.lp-nav__cta:hover {
  background: rgba(37, 211, 102, 0.18);
  transform: translateY(-1px);
}
.lp-nav__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.lp-nav__burger span,
.lp-nav__burger span::before,
.lp-nav__burger span::after {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--lp-dark);
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
}
.lp-nav__burger span::before,
.lp-nav__burger span::after {
  content: '';
  position: absolute;
}
.lp-nav__burger span::before { top: -7px; }
.lp-nav__burger span::after { top: 7px; }
.lp-nav__burger span.open { background: transparent; }
.lp-nav__burger span.open::before { transform: rotate(45deg); top: 0; }
.lp-nav__burger span.open::after { transform: rotate(-45deg); top: 0; }

/* mobile menu */
.lp-nav__mobile {
  display: flex;
  flex-direction: column;
  padding: 12px 20px 20px;
  gap: 4px;
  border-top: 1px solid var(--lp-sage-xlight);
}
.lp-nav__mobile-link {
  font-size: 15px;
  font-weight: 500;
  color: var(--lp-dark);
  text-decoration: none;
  padding: 10px 12px;
  border-radius: var(--lp-radius-sm);
  transition: background var(--lp-transition);
}
.lp-nav__mobile-link:hover { background: var(--lp-sage-xlight); }
.lp-nav__mobile-cta {
  margin-top: 8px;
  background: var(--lp-wp-green);
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: var(--lp-radius-full);
  text-align: center;
  transition: opacity var(--lp-transition);
}
.lp-nav__mobile-cta:hover { opacity: 0.9; }

/* mobile nav transition */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.25s ease;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ─── HERO ───────────────────────────────────────────────────────────────── */
.lp-hero {
  position: relative;
  padding: 80px 0 100px;
  overflow: hidden;
}
.lp-hero__bg-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}
.orb--1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, #c5d0bf, transparent 70%);
  top: -200px; right: -100px;
}
.orb--2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #9FAB97, transparent 70%);
  bottom: -100px; left: -150px;
}
.orb--3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #e8f0e3, transparent 70%);
  top: 50%; left: 40%;
}
.lp-hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.lp-hero__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.lp-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--lp-sage-deeper);
  background: var(--lp-sage-xlight);
  border: 1px solid var(--lp-sage-light);
  padding: 7px 14px;
  border-radius: var(--lp-radius-full);
  width: fit-content;
}
.lp-hero__badge-dot {
  width: 7px;
  height: 7px;
  background: var(--lp-sage-darker, #5d7055);
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.lp-hero__title {
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.12;
  color: var(--lp-dark);
  letter-spacing: -0.03em;
}
.lp-hero__title em {
  font-style: italic;
  color: var(--lp-sage-darker, #5d7055);
}
.lp-hero__title-highlight {
  position: relative;
  color: var(--lp-sage-darker, #5d7055);
}
.lp-hero__title-highlight::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--lp-sage), var(--lp-sage-light));
  border-radius: 2px;
  opacity: 0.5;
}
.lp-hero__sub {
  font-size: 17px;
  color: #6b7a65;
  line-height: 1.65;
  max-width: 480px;
}
.lp-hero__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.lp-hero__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}
.lp-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lp-stat__number {
  font-size: 18px;
  font-weight: 800;
  color: var(--lp-dark);
  letter-spacing: -0.02em;
}
.lp-stat__label {
  font-size: 12px;
  color: #8a9a85;
  font-weight: 500;
}
.lp-stat__divider {
  width: 1px;
  height: 36px;
  background: var(--lp-sage-light);
  opacity: 0.6;
}

/* ─── MOCK UI ────────────────────────────────────────────────────────────── */
.lp-hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
}
.lp-mock {
  width: 320px;
  background: var(--lp-white);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(159,171,151,0.2),
    0 24px 80px rgba(90,115,80,0.2);
  position: relative;
  animation: float 5s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
.lp-mock__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--lp-sage-xlight);
}
.lp-mock__dots {
  display: flex;
  gap: 5px;
}
.lp-mock__dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--lp-sage-xlight);
}
.lp-mock__dots span:nth-child(1) { background: #f4a97e; }
.lp-mock__dots span:nth-child(2) { background: #f4d07e; }
.lp-mock__dots span:nth-child(3) { background: #8fc577; }
.lp-mock__url {
  font-size: 11px;
  color: #aab5a5;
  background: var(--lp-sage-bg);
  padding: 3px 10px;
  border-radius: 6px;
  flex: 1;
  text-align: center;
}
.lp-mock__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lp-mock__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-mock__logo-chip {
  width: 36px;
  height: 36px;
  background: var(--lp-sage-deeper);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.lp-mock__store-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--lp-dark);
}
.lp-mock__store-sub {
  font-size: 11px;
  color: #8a9a85;
}
.lp-mock__badge-cart {
  margin-left: auto;
  width: 26px;
  height: 26px;
  background: var(--lp-sage-deeper);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lp-mock__cats {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.lp-mock__cat {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--lp-radius-full);
  background: var(--lp-sage-xlight);
  color: #6b7a65;
  flex-shrink: 0;
  cursor: default;
}
.lp-mock__cat.active {
  background: var(--lp-sage-deeper);
  color: #fff;
}
.lp-mock__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lp-mock__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--lp-sage-bg);
  border-radius: 12px;
}
.lp-mock__item-emoji {
  font-size: 22px;
  width: 36px;
  height: 36px;
  background: var(--lp-white);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-mock__item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.lp-mock__item-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--lp-dark);
}
.lp-mock__item-cat {
  font-size: 10px;
  color: #8a9a85;
}
.lp-mock__item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.lp-mock__item-price {
  font-size: 12px;
  font-weight: 700;
  color: var(--lp-sage-deeper);
}
.lp-mock__add {
  width: 24px;
  height: 24px;
  background: var(--lp-sage-deeper);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* floating notification */
.lp-mock__notif {
  position: absolute;
  bottom: -24px;
  right: -20px;
  background: var(--lp-white);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 32px rgba(90,115,80,0.18);
  border: 1px solid rgba(159,171,151,0.2);
  animation: float-notif 5s ease-in-out infinite;
  animation-delay: 0.5s;
}
@keyframes float-notif {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
.lp-mock__notif-icon {
  font-size: 20px;
}
.lp-mock__notif-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--lp-dark);
}
.lp-mock__notif-sub {
  font-size: 11px;
  color: #8a9a85;
}

/* ─── FEATURES ───────────────────────────────────────────────────────────── */
.lp-features {
  padding: 100px 0;
  background: var(--lp-white);
}
.lp-features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.lp-feat-card {
  background: var(--lp-cream);
  border: 1px solid var(--lp-sage-xlight);
  border-radius: var(--lp-radius-lg);
  padding: 32px 28px;
  transition: all var(--lp-transition);
  cursor: default;
}
.lp-feat-card:hover {
  border-color: var(--lp-sage);
  box-shadow: var(--lp-shadow-md);
  transform: translateY(-4px);
}
.lp-feat-card__icon {
  width: 48px;
  height: 48px;
  background: var(--lp-sage-xlight);
  border-radius: var(--lp-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lp-sage-deeper);
  margin-bottom: 20px;
  transition: background var(--lp-transition);
}
.lp-feat-card:hover .lp-feat-card__icon {
  background: var(--lp-sage-deeper);
  color: #fff;
}
.lp-feat-card__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--lp-dark);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}
.lp-feat-card__desc {
  font-size: 14px;
  color: #6b7a65;
  line-height: 1.65;
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────────────── */
.lp-how {
  padding: 100px 0;
  background: var(--lp-sage-bg);
}
.lp-how__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  position: relative;
}
.lp-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}
.lp-step__number {
  width: 52px;
  height: 52px;
  background: var(--lp-sage-deeper);
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  border-radius: var(--lp-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.lp-step__connector {
  position: absolute;
  top: 26px;
  left: calc(100% + 8px);
  width: calc(100% - 68px);
  height: 2px;
  background: linear-gradient(90deg, var(--lp-sage), var(--lp-sage-xlight));
  border-radius: 2px;
}
.lp-step__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--lp-dark);
  letter-spacing: -0.01em;
}
.lp-step__desc {
  font-size: 14px;
  color: #6b7a65;
  line-height: 1.65;
}

/* ─── BAND ───────────────────────────────────────────────────────────────── */
.lp-band {
  background: var(--lp-sage-deeper);
  padding: 20px 0;
  overflow: hidden;
}
.lp-band__inner {
  overflow-x: auto;
}
.lp-band__pills {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: center;
  min-width: max-content;
  padding: 0 8px;
}
.lp-band__pills span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.12);
  padding: 8px 18px;
  border-radius: var(--lp-radius-full);
  border: 1px solid rgba(255,255,255,0.15);
  white-space: nowrap;
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
.lp-cta {
  position: relative;
  background: var(--lp-dark-2);
  padding: 100px 0;
  overflow: hidden;
}
.lp-cta__bg-orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.orb--4 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(159,171,151,0.2), transparent 70%);
  top: -200px; right: -100px;
}
.orb--5 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(159,171,151,0.15), transparent 70%);
  bottom: -100px; left: -100px;
}
.lp-cta__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
}
.lp-cta__icon {
  width: 72px;
  height: 72px;
  background: rgba(159,171,151,0.15);
  border: 1px solid rgba(159,171,151,0.3);
  border-radius: var(--lp-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lp-sage);
}
.lp-cta__title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  color: var(--lp-white);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.lp-cta__sub {
  font-size: 17px;
  color: rgba(255,255,255,0.6);
  max-width: 520px;
  line-height: 1.65;
}
.lp-cta__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255,255,255,0.45);
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
.lp-footer {
  background: var(--lp-dark);
  padding: 28px 0;
}
.lp-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.lp-footer__copy {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
}

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .lp-features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .lp-how__steps {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .lp-step__connector {
    display: none;
  }
}

@media (max-width: 768px) {
  .lp-hero__inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .lp-hero__visual {
    display: none;
  }
  .lp-nav__links {
    display: none;
  }
  .lp-nav__burger {
    display: flex;
  }
  .lp-features__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .lp-hero {
    padding: 60px 0 80px;
  }
  .lp-features,
  .lp-how,
  .lp-cta {
    padding: 72px 0;
  }
  .lp-hero__actions {
    flex-direction: column;
  }
  .lp-btn--lg {
    justify-content: center;
  }
  .lp-footer__inner {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .lp-container {
    padding: 0 20px;
  }
  .lp-band__pills {
    justify-content: flex-start;
  }
}
</style>
