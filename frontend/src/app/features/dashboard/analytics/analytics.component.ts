import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Analítica de Ventas y Rendimiento</h1>
        <p class="text-xs text-slate-500 mt-1">
          Métricas de conversión, entregas efectivas y rentabilidad de despachos contraentrega.
        </p>
      </div>

      <!-- Quick KPI strip -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <span class="text-xs font-semibold uppercase text-slate-400">Efectividad de Entrega</span>
          <div class="mt-2 text-2xl font-extrabold text-emerald-600">88.5%</div>
          <span class="text-[11px] text-slate-400">1.312 entregados de 1.482</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <span class="text-xs font-semibold uppercase text-slate-400">Tasa de Devolución</span>
          <div class="mt-2 text-2xl font-extrabold text-rose-600">7.2%</div>
          <span class="text-[11px] text-slate-400">107 paquetes no recibidos</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <span class="text-xs font-semibold uppercase text-slate-400">Costo Promedio Flete</span>
          <div class="mt-2 text-2xl font-extrabold text-slate-900">{{ 14200 | appCurrency }}</div>
          <span class="text-[11px] text-slate-400">Nacional multicourier</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <span class="text-xs font-semibold uppercase text-slate-400">Margen Neto Estimado</span>
          <div class="mt-2 text-2xl font-extrabold text-blue-600">32.4%</div>
          <span class="text-[11px] text-slate-400">Deducido producto + flete</span>
        </div>
      </div>

      <!-- Conversion Funnel & Payment methods -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Funnel -->
        <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h2 class="text-sm font-bold text-slate-900 mb-4">Embudo de Conversión de Pedidos</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>1. Visitas a Landing Pages</span>
                <span class="text-slate-900 font-bold">32.500 (100%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-blue-600 h-full w-full rounded-full"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>2. Formulario COD Iniciado</span>
                <span class="text-slate-900 font-bold">4.870 (15.0%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full w-[45%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>3. Pedidos Creados</span>
                <span class="text-slate-900 font-bold">1.482 (4.6%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full w-[30%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>4. Confirmados por WhatsApp</span>
                <span class="text-slate-900 font-bold">1.378 (93.0% de pedidos)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full w-[28%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span>5. Entregas Efectivas</span>
                <span class="text-slate-900 font-bold">1.312 (88.5% de confirmados)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-emerald-600 h-full w-[26%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment distribution -->
        <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <h2 class="text-sm font-bold text-slate-900 mb-4">Distribución por Método de Pago</h2>
          <div class="space-y-5">
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  💵
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Contra Entrega (COD)</h4>
                  <p class="text-[11px] text-slate-400">Efectivo en mano al repartidor</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-slate-900">78.4%</span>
                <span class="block text-[11px] text-slate-400">1.162 pedidos</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  💳
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Bold / Tarjeta de Crédito</h4>
                  <p class="text-[11px] text-slate-400">Pasarela online anticipada</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-slate-900">15.2%</span>
                <span class="block text-[11px] text-slate-400">225 pedidos</span>
              </div>
            </div>

            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  🏦
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Transferencia Bancaria / Nequi</h4>
                  <p class="text-[11px] text-slate-400">Comprobante validado manualmente</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-slate-900">6.4%</span>
                <span class="block text-[11px] text-slate-400">95 pedidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {}
