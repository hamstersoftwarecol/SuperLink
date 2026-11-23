import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div class="max-w-md w-full text-center">
        <!-- Success animation -->
        <div class="relative mx-auto w-24 h-24 mb-8">
          <div class="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30"></div>
          <div class="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        </div>

        <h1 class="text-2xl font-extrabold text-slate-900">¡Pedido recibido!</h1>
        <p class="mt-3 text-slate-600 text-sm leading-relaxed">
          Tu pedido ha sido registrado exitosamente. Te contactaremos por WhatsApp para confirmar los detalles de envío.
        </p>

        <!-- Order details card -->
        <div class="mt-8 bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Número de pedido</span>
              <span class="text-sm font-mono font-bold text-slate-900">{{ orderId().slice(0, 8).toUpperCase() }}</span>
            </div>
            <div class="border-t border-slate-100"></div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Total a pagar</span>
              <span class="text-lg font-extrabold text-emerald-600">{{ formatPrice(total()) }}</span>
            </div>
            <div class="border-t border-slate-100"></div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Método de pago</span>
              <span class="text-sm font-semibold text-slate-700">Contraentrega (COD)</span>
            </div>
            <div class="border-t border-slate-100"></div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Estado</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Pendiente de confirmación
              </span>
            </div>
          </div>
        </div>

        <!-- Next steps -->
        <div class="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left">
          <h3 class="text-sm font-bold text-blue-900 mb-3">¿Qué sigue?</h3>
          <ol class="space-y-2.5">
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
              <span class="text-xs text-blue-800">Te contactaremos por WhatsApp para confirmar tu dirección y disponibilidad</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
              <span class="text-xs text-blue-800">Tu pedido será despachado con la transportadora más cercana</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
              <span class="text-xs text-blue-800">Pagas al recibir tu pedido — sin anticipos</span>
            </li>
          </ol>
        </div>

        <!-- Footer -->
        <p class="mt-8 text-xs text-slate-400">
          Powered by <span class="font-semibold text-slate-500">SuperLink</span>
        </p>
      </div>
    </div>
  `,
})
export class OrderSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly orderId = signal('');
  readonly total = signal(0);

  ngOnInit(): void {
    this.orderId.set(this.route.snapshot.queryParamMap.get('order') ?? '');
    this.total.set(Number(this.route.snapshot.queryParamMap.get('total') ?? 0));
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
