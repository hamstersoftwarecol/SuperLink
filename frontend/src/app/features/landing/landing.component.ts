import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <!-- Navbar -->
      <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/25">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="font-bold text-xl tracking-tight text-slate-900">SuperLink</span>
          </div>

          <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" class="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#pricing" class="hover:text-blue-600 transition-colors">Planes y Precios</a>
            <a href="#integrations" class="hover:text-blue-600 transition-colors">Integraciones</a>
            <a href="#faq" class="hover:text-blue-600 transition-colors">Preguntas Frecuentes</a>
          </nav>

          <div class="flex items-center gap-3">
            <a
              routerLink="/login"
              class="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Iniciar sesión
            </a>
            <a
              routerLink="/register"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Prueba Gratis 14 Días
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <!-- Announcement pill -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-8 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            SuperLink 2.0 ya disponible con IA y Multicourier para LatAm
          </div>

          <!-- Hero Headline -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Vende, confirma y despacha en <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">un solo lugar</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            La plataforma todo-en-uno diseñada para tiendas de e-commerce y dropshipping contraentrega. Automatiza pedidos por WhatsApp, despachos con transportadoras y maximiza tu margen.
          </p>

          <!-- CTA Buttons -->
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              routerLink="/register"
              class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Comenzar Ahora Gratis</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
            <a
              routerLink="/dashboard"
              class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Ver Demo en Vivo</span>
            </a>
          </div>

          <!-- Social proof stats -->
          <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-200/60">
            <div>
              <div class="text-3xl font-extrabold text-slate-900">+1.5M</div>
              <div class="text-xs text-slate-500 mt-1 uppercase font-semibold">Pedidos Despachados</div>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-blue-600">89.4%</div>
              <div class="text-xs text-slate-500 mt-1 uppercase font-semibold">Efectividad de Entrega</div>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-slate-900">3x</div>
              <div class="text-xs text-slate-500 mt-1 uppercase font-semibold">Aceleración en WhatsApp</div>
            </div>
            <div>
              <div class="text-3xl font-extrabold text-emerald-600">99.9%</div>
              <div class="text-xs text-slate-500 mt-1 uppercase font-semibold">Uptime Cloudflare</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section (6 cards) -->
      <section id="features" class="py-24 bg-white border-t border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-xs font-bold uppercase tracking-widest text-blue-600">Todo en una sola suite</h2>
            <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Diseñado específicamente para el dropshipping y comercio electrónico moderno
            </p>
          </div>

          <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1: CRM -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">CRM de Pedidos y Clientes</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Centraliza todas tus órdenes de Shopify, WooCommerce o embudos directos. Gestiona estados, notas y llamadas en un panel unificado.
              </p>
            </div>

            <!-- Feature 2: Analytics -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Analítica en Tiempo Real</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Métricas financieras precisas: ROAS real, devoluciones deducidas, costo de fletes y beneficio neto en moneda local.
              </p>
            </div>

            <!-- Feature 3: WhatsApp -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Confirmación por WhatsApp</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Envío automático de mensajes con un clic para confirmar dirección y disponibilidad del comprador antes de despachar.
              </p>
            </div>

            <!-- Feature 4: Logistics -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Logística Multicourier</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Genera guías con las principales transportadoras (Coordinadora, Envía, Servientrega, InterRapidísimo, 99Minutos).
              </p>
            </div>

            <!-- Feature 5: Landing Pages -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Páginas de Producto Ultra Rápidas</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Páginas optimizadas para conversión con formulario contraentrega de 1 solo paso con autocompletado de ciudades.
              </p>
            </div>

            <!-- Feature 6: AI -->
            <div class="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900">Agente de IA Antifraude</h3>
              <p class="mt-3 text-sm text-slate-600 leading-relaxed">
                Detección automática de números telefónicos falsos, direcciones incompletas e historial de devoluciones previas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section (3 tiers with monthly/quarterly toggle) -->
      <section id="pricing" class="py-24 bg-slate-50 border-t border-slate-200/60">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-xs font-bold uppercase tracking-widest text-blue-600">Precios transparentes</h2>
            <p class="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Elige el plan ideal para escalar tus ventas
            </p>
            <p class="mt-4 text-slate-600">Sin comisiones ocultas por venta ni letra chica.</p>

            <!-- Toggle monthly/quarterly -->
            <div class="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-200/70 border border-slate-300/60">
              <button
                type="button"
                (click)="isQuarterly.set(false)"
                [class.bg-white]="!isQuarterly()"
                [class.shadow-sm]="!isQuarterly()"
                [class.text-slate-900]="!isQuarterly()"
                [class.text-slate-600]="isQuarterly()"
                class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150"
              >
                Facturación Mensual
              </button>
              <button
                type="button"
                (click)="isQuarterly.set(true)"
                [class.bg-white]="isQuarterly()"
                [class.shadow-sm]="isQuarterly()"
                [class.text-slate-900]="isQuarterly()"
                [class.text-slate-600]="!isQuarterly()"
                class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150 flex items-center gap-1.5"
              >
                <span>Trimestral</span>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Ahorra 20%</span>
              </button>
            </div>
          </div>

          <div class="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <!-- Starter Tier -->
            <div class="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <h3 class="mt-2 text-xl font-bold text-slate-900">Emprendedores</h3>
                <p class="mt-2 text-xs text-slate-500">Para quienes inician sus primeras campañas de dropshipping.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-4xl font-extrabold text-slate-900">\${{ isQuarterly() ? '12' : '15' }}</span>
                  <span class="text-xs text-slate-500">/ mes</span>
                </div>
                <ul class="mt-8 space-y-3.5 text-xs text-slate-600 font-medium">
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Hasta 300 pedidos mensuales
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    1 Usuario administrador
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Confirmación básica por WhatsApp
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Soporte por correo electrónico
                  </li>
                </ul>
              </div>
              <a
                routerLink="/register"
                class="mt-8 block w-full py-3 px-4 text-center rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Elegir Starter
              </a>
            </div>

            <!-- Pro Tier (Popular) -->
            <div class="bg-white rounded-2xl border-2 border-blue-600 p-8 flex flex-col justify-between shadow-xl relative scale-105 z-10">
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                Más Elegido
              </div>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Pro</span>
                <h3 class="mt-2 text-xl font-bold text-slate-900">Escalamiento</h3>
                <p class="mt-2 text-xs text-slate-500">Para marcas y dropshippers con ventas recurrentes diarias.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-4xl font-extrabold text-slate-900">\${{ isQuarterly() ? '24' : '29' }}</span>
                  <span class="text-xs text-slate-500">/ mes</span>
                </div>
                <ul class="mt-8 space-y-3.5 text-xs text-slate-600 font-medium">
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Hasta 2.500 pedidos mensuales
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Hasta 5 usuarios (roles por equipo)
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    WhatsApp automatizado con plantillas
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Multicourier e integración con transportadoras
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Analítica avanzada de rentabilidad y fletes
                  </li>
                </ul>
              </div>
              <a
                routerLink="/register"
                class="mt-8 block w-full py-3 px-4 text-center rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all duration-150"
              >
                Comenzar con Pro
              </a>
            </div>

            <!-- MAX Tier -->
            <div class="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">MAX</span>
                <h3 class="mt-2 text-xl font-bold text-slate-900">Alto Volumen</h3>
                <p class="mt-2 text-xs text-slate-500">Para agencias, bodegas y operaciones de gran escala.</p>
                <div class="mt-6 flex items-baseline gap-1">
                  <span class="text-4xl font-extrabold text-slate-900">\${{ isQuarterly() ? '39' : '49' }}</span>
                  <span class="text-xs text-slate-500">/ mes</span>
                </div>
                <ul class="mt-8 space-y-3.5 text-xs text-slate-600 font-medium">
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Pedidos ilimitados
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Usuarios y tiendas ilimitadas
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Motor de Inteligencia Artificial Antifraude
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    API Dedicada y Webhooks prioritarios
                  </li>
                  <li class="flex items-center gap-2.5">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Gerente de cuenta dedicado 24/7
                  </li>
                </ul>
              </div>
              <a
                routerLink="/register"
                class="mt-8 block w-full py-3 px-4 text-center rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Elegir MAX
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="mt-auto bg-slate-900 text-white py-16 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div class="flex items-center gap-2.5 mb-4">
                <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                  ⚡
                </div>
                <span class="font-bold text-lg text-white">SuperLink</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                El sistema operativo para tiendas de comercio electrónico y dropshipping en América Latina.
              </p>
            </div>
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Producto</h4>
              <ul class="space-y-2 text-xs text-slate-400">
                <li><a href="#features" class="hover:text-white transition-colors">CRM de Pedidos</a></li>
                <li><a href="#features" class="hover:text-white transition-colors">Confirmación WhatsApp</a></li>
                <li><a href="#features" class="hover:text-white transition-colors">Multicourier</a></li>
                <li><a href="#pricing" class="hover:text-white transition-colors">Planes</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Recursos</h4>
              <ul class="space-y-2 text-xs text-slate-400">
                <li><a routerLink="/login" class="hover:text-white transition-colors">Documentación</a></li>
                <li><a routerLink="/login" class="hover:text-white transition-colors">Guía de Envíos COD</a></li>
                <li><a routerLink="/login" class="hover:text-white transition-colors">Estado del Servicio</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Legal</h4>
              <ul class="space-y-2 text-xs text-slate-400">
                <li><span class="hover:text-white cursor-pointer">Términos de Servicio</span></li>
                <li><span class="hover:text-white cursor-pointer">Política de Privacidad</span></li>
                <li><span class="hover:text-white cursor-pointer">Seguridad</span></li>
              </ul>
            </div>
          </div>
          <div class="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2026 SuperLink Inc. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {
  readonly isQuarterly = signal<boolean>(false);
}
