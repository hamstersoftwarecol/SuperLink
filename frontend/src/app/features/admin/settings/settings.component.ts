import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Configuración General</h1>
        <p class="text-xs text-slate-500 mt-1">
          Ajustes de la tienda, pasarelas de pago, fletes y plantillas de WhatsApp.
        </p>
      </div>

      @if (saved()) {
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="font-semibold">¡Ajustes actualizados correctamente!</span>
          </div>
          <button (click)="saved.set(false)" class="text-emerald-700 hover:text-emerald-900 text-xs font-bold">×</button>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8">
        <!-- Store Identity -->
        <div>
          <h2 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Identidad de la Tienda
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Nombre Comercial</label>
              <input
                type="text"
                [(ngModel)]="storeName"
                class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Slug de la Tienda (Subdominio)</label>
              <div class="mt-1 flex rounded-xl shadow-sm">
                <span class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono">
                  superlink.co/
                </span>
                <input
                  type="text"
                  [(ngModel)]="storeSlug"
                  class="flex-1 block w-full min-w-0 px-3.5 py-2.5 rounded-none rounded-r-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Moneda Principal</label>
              <select
                [(ngModel)]="currency"
                class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="COP">COP - Peso Colombiano ($)</option>
                <option value="USD">USD - Dólar Estadounidense ($)</option>
                <option value="MXN">MXN - Peso Mexicano ($)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Plan Actual de Suscripción</label>
              <div class="mt-1 flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50">
                <span class="text-xs font-bold text-blue-600 uppercase tracking-wide">Plan Pro ($29/mes)</span>
                <span class="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">Activo</span>
              </div>
            </div>
          </div>
        </div>

        <!-- COD Shipping Configuration -->
        <div>
          <h2 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Logística y Cobro Contra Entrega (COD)
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Costo de Envío Estándar (Flete)</label>
              <input
                type="number"
                [(ngModel)]="defaultShippingCost"
                class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-[11px] text-slate-400 mt-1 block">Se aplica automáticamente si no hay promoción de envío gratis.</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Envío Gratis a partir de</label>
              <input
                type="number"
                [(ngModel)]="freeShippingThreshold"
                class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-[11px] text-slate-400 mt-1 block">Pedidos con total superior tendrán flete bonificado.</span>
            </div>
          </div>
        </div>

        <!-- WhatsApp Templates -->
        <div>
          <h2 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Plantilla de Confirmación por WhatsApp
          </h2>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Mensaje predeterminado de confirmación</label>
            <textarea
              rows="3"
              [(ngModel)]="whatsappTemplate"
              class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans text-xs"
            ></textarea>
            <p class="text-[11px] text-slate-400 mt-1">
              Variables disponibles: &#123;nombre&#125;, &#123;pedido&#125;, &#123;total&#125;, &#123;ciudad&#125;.
            </p>
          </div>
        </div>

        <!-- Save Button -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            (click)="onSave()"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  storeName = 'Tienda Principal SuperLink';
  storeSlug = 'mitienda';
  currency = 'COP';
  defaultShippingCost = 12000;
  freeShippingThreshold = 250000;
  whatsappTemplate = 'Hola {nombre}, te escribimos de SuperLink para confirmar tu pedido #{pedido} por {total} con entrega en {ciudad}. ¿Confirmas el despacho?';

  readonly saved = signal<boolean>(false);

  onSave(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3500);
  }
}
