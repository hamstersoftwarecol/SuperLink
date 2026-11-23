import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    RelativeTimePipe
  ],
  template: `
    @if (loading()) {
      <app-loading-spinner message="Cargando detalles del pedido..." />
    } @else if (!order()) {
      <div class="text-center py-12">
        <h3 class="text-base font-bold text-slate-800">Pedido no encontrado</h3>
        <p class="text-xs text-slate-500 mt-1">El identificador solicitado no existe en la base de datos.</p>
        <a routerLink="/dashboard/orders" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          ← Volver al listado
        </a>
      </div>
    } @else {
      @let o = order()!;
      <div class="space-y-6">
        <!-- Top Navigation & Action Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
              routerLink="/dashboard/orders"
              class="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </a>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold tracking-tight text-slate-900">{{ o.id }}</h1>
                <app-status-badge [status]="o.status" />
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Creado {{ o.createdAt | relativeTime }} • Método: {{ o.paymentMethod | uppercase }}
              </p>
            </div>
          </div>

          <!-- Status Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <a
              [href]="getWhatsAppUrl(o)"
              target="_blank"
              class="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.288.043.088.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
              </svg>
              Chat WhatsApp
            </a>

            @if (o.status === 'pending') {
              <button
                type="button"
                (click)="updateStatus('confirmed')"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Confirmar Pedido
              </button>
            }
            @if (o.status === 'confirmed') {
              <button
                type="button"
                (click)="updateStatus('shipped')"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Generar Guía / Despachar
              </button>
            }
            @if (o.status === 'shipped') {
              <button
                type="button"
                (click)="updateStatus('delivered')"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Marcar Entregado
              </button>
              <button
                type="button"
                (click)="updateStatus('returned')"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Marcar Devolución
              </button>
            }
          </div>
        </div>

        <!-- Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left 2 Cols: Order Items & Payment -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Items Card -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-4">Productos en la Orden</h2>
              <div class="divide-y divide-slate-100">
                @for (item of o.items; track item.id) {
                  <div class="py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                        📦
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-slate-900">{{ item.productName || 'Producto' }}</p>
                        <p class="text-[11px] text-slate-400">Cantidad: {{ item.quantity }} × {{ item.unitPrice | appCurrency }}</p>
                      </div>
                    </div>
                    <div class="text-xs font-bold text-slate-900">
                      {{ (item.quantity * item.unitPrice) | appCurrency }}
                    </div>
                  </div>
                }
              </div>

              <!-- Price Breakdown -->
              <div class="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{{ o.subtotal | appCurrency }}</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Costo de Envío (Flete)</span>
                  <span>{{ o.shippingCost | appCurrency }}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total a Cobrar</span>
                  <span class="text-blue-600 font-extrabold">{{ o.total | appCurrency }}</span>
                </div>
              </div>
            </div>

            <!-- Notes & Tracking -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-3">Notas y Guía de Transporte</h2>
              <p class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {{ o.notes || 'Sin notas especiales para este pedido.' }}
              </p>

              <div class="mt-4 flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div class="flex items-center gap-2">
                  <span class="text-base">🚚</span>
                  <div>
                    <span class="text-xs font-semibold text-blue-900">Número de Guía</span>
                    <p class="text-xs text-blue-700 font-mono">{{ o.trackingCode || 'Guía pendiente de generación' }}</p>
                  </div>
                </div>
                @if (!o.trackingCode) {
                  <button
                    type="button"
                    (click)="generateMockTracking()"
                    class="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generar Guía
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Right Col: Customer & Shipping info -->
          <div class="space-y-6">
            <!-- Customer Card -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-4">Información del Cliente</h2>
              <div class="space-y-3 text-xs">
                <div>
                  <span class="text-slate-400 block font-medium">Nombre</span>
                  <span class="text-slate-900 font-semibold">{{ o.customerName }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Teléfono / WhatsApp</span>
                  <span class="text-slate-900 font-semibold font-mono">{{ o.customerPhone || 'No registrado' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Correo Electrónico</span>
                  <span class="text-slate-900 font-semibold">{{ o.customerEmail || 'No registrado' }}</span>
                </div>
              </div>
            </div>

            <!-- Destination Card -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-4">Dirección de Envío</h2>
              <div class="space-y-3 text-xs">
                <div>
                  <span class="text-slate-400 block font-medium">Dirección</span>
                  <span class="text-slate-900 font-semibold">{{ o.customerAddress || 'Dirección no especificada' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Ciudad / Departamento</span>
                  <span class="text-slate-900 font-semibold">{{ o.customerCity }}, {{ o.customerDepartment }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Modalidad</span>
                  <span class="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] mt-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Cobro Contra Entrega (COD)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal<boolean>(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (res) => {
          this.order.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  updateStatus(newStatus: Order['status']): void {
    const current = this.order();
    if (!current) return;
    this.orderService.updateOrderStatus(current.id, newStatus).subscribe(() => {
      this.order.set({ ...current, status: newStatus });
    });
  }

  generateMockTracking(): void {
    const current = this.order();
    if (!current) return;
    const tracking = 'ENV-CO-' + Math.floor(100000 + Math.random() * 900000);
    this.orderService.updateOrder(current.id, { trackingCode: tracking, status: 'shipped' }).subscribe(() => {
      this.order.set({ ...current, trackingCode: tracking, status: 'shipped' });
    });
  }

  getWhatsAppUrl(order: Order): string {
    const phone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${order.customerName}, te escribimos de SuperLink para confirmar tu pedido #${order.id} por valor de $${order.total.toLocaleString()} con entrega en ${order.customerCity}. ¿Confirmas el envío?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }
}
