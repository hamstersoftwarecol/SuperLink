import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { OrderService } from '../../../../core/services/order.service';
import { Order, StatusHistoryEntry } from '../../../../core/models';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
};

const PIPELINE_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  returned: [],
  cancelled: [],
};

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    RelativeTimePipe,
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
                Creado {{ o.createdAt | relativeTime }} · Método: {{ o.paymentMethod | uppercase }}
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
              WhatsApp
            </a>

            @for (action of nextActions(); track action.status) {
              <button
                type="button"
                (click)="openStatusModal(action.status)"
                [class]="action.classes"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                {{ action.label }}
              </button>
            }
          </div>
        </div>

        <!-- Pipeline Progress Bar -->
        <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            @for (step of pipelineSteps; track step; let i = $index; let last = $last) {
              <div class="flex items-center" [class.flex-1]="!last">
                <div class="flex flex-col items-center">
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                    [class]="getStepClasses(step)"
                  >
                    @if (isStepCompleted(step)) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    } @else {
                      {{ i + 1 }}
                    }
                  </div>
                  <span class="text-[10px] font-semibold mt-1.5" [class]="isStepCompleted(step) || isStepCurrent(step) ? 'text-slate-900' : 'text-slate-400'">
                    {{ stepLabels[step] }}
                  </span>
                </div>
                @if (!last) {
                  <div
                    class="flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all"
                    [class]="isStepCompleted(step) ? 'bg-blue-500' : 'bg-slate-200'"
                  ></div>
                }
              </div>
            }
          </div>
          @if (o.status === 'cancelled' || o.status === 'returned') {
            <div class="mt-3 px-3 py-2 rounded-lg text-xs font-semibold" [class]="o.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-orange-50 text-orange-700'">
              {{ o.status === 'cancelled' ? 'Pedido cancelado' : 'Pedido devuelto' }} — pipeline detenido
            </div>
          }
        </div>

        <!-- Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left 2 Cols: Items, Timeline -->
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

            <!-- Status Timeline -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-4">Historial del Pedido</h2>
              @if (history().length === 0) {
                <div class="text-xs text-slate-400 py-4 text-center">
                  El historial de estados se registrará conforme avance el pipeline.
                </div>
              } @else {
                <div class="relative pl-6 space-y-4">
                  <div class="absolute left-[9px] top-1 bottom-1 w-0.5 bg-slate-200"></div>
                  @for (entry of history(); track entry.id; let last = $last) {
                    <div class="relative flex items-start gap-3">
                      <div
                        class="absolute left-[-15px] w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white"
                        [class]="getTimelineDotClasses(entry.status)"
                      >
                        <div class="w-2 h-2 rounded-full" [class]="getTimelineInnerDot(entry.status)"></div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-slate-900">{{ getStatusLabel(entry.status) }}</span>
                          <span class="text-[10px] text-slate-400">{{ entry.createdAt | relativeTime }}</span>
                        </div>
                        @if (entry.changedByName) {
                          <p class="text-[11px] text-slate-500">por {{ entry.changedByName }}</p>
                        }
                        @if (entry.notes) {
                          <p class="text-[11px] text-slate-600 mt-0.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            {{ entry.notes }}
                          </p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
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
                  <span class="text-slate-900 font-semibold">{{ o.customerAddress || 'No especificada' }}</span>
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

            <!-- Payment Status Card -->
            <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <h2 class="text-sm font-bold text-slate-900 mb-4">Estado del Pago</h2>
              <div class="flex items-center gap-3">
                <app-status-badge [status]="o.paymentStatus" />
                <span class="text-xs text-slate-500">{{ o.paymentMethod | uppercase }}</span>
              </div>
              @if (o.status === 'delivered' && o.paymentStatus === 'paid') {
                <div class="mt-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Pago recaudado en entrega
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Status Change Modal -->
      @if (showStatusModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/40" (click)="closeStatusModal()"></div>
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-900">
              Cambiar estado a: {{ getStatusLabel(pendingStatus()!) }}
            </h3>

            @if (pendingStatus() === 'shipped') {
              <div>
                <label class="text-xs font-semibold text-slate-700 block mb-1">Número de Guía (opcional)</label>
                <input
                  type="text"
                  [(ngModel)]="modalTrackingCode"
                  placeholder="ENV-CO-123456"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            }

            <div>
              <label class="text-xs font-semibold text-slate-700 block mb-1">Notas (opcional)</label>
              <textarea
                [(ngModel)]="modalNotes"
                rows="3"
                placeholder="Ej: Cliente confirmó por WhatsApp, envío con Servientrega..."
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="closeStatusModal()"
                class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmStatusChange()"
                [disabled]="updatingStatus()"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {{ updatingStatus() ? 'Actualizando...' : 'Confirmar' }}
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly history = signal<StatusHistoryEntry[]>([]);
  readonly showStatusModal = signal(false);
  readonly pendingStatus = signal<Order['status'] | null>(null);
  readonly updatingStatus = signal(false);

  modalNotes = '';
  modalTrackingCode = '';

  readonly pipelineSteps = PIPELINE_STEPS;
  readonly stepLabels = STATUS_LABELS;

  readonly nextActions = computed(() => {
    const o = this.order();
    if (!o) return [];
    const allowed = VALID_TRANSITIONS[o.status] ?? [];
    return allowed.map((s) => ({
      status: s as Order['status'],
      label: this.getActionLabel(s),
      classes: this.getActionClasses(s),
    }));
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (res) => {
          this.order.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      this.orderService.getOrderHistory(id).subscribe({
        next: (res) => this.history.set(res),
      });
    }
  }

  openStatusModal(status: Order['status']): void {
    this.pendingStatus.set(status);
    this.modalNotes = '';
    this.modalTrackingCode = '';
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
    this.pendingStatus.set(null);
  }

  confirmStatusChange(): void {
    const current = this.order();
    const newStatus = this.pendingStatus();
    if (!current || !newStatus) return;

    this.updatingStatus.set(true);
    this.orderService
      .updateOrderStatus(current.id, newStatus, {
        notes: this.modalNotes || undefined,
        tracking_code: this.modalTrackingCode || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.order.set({ ...current, ...updated, items: current.items });
          this.updatingStatus.set(false);
          this.closeStatusModal();
          this.orderService.getOrderHistory(current.id).subscribe({
            next: (res) => this.history.set(res),
          });
        },
        error: () => this.updatingStatus.set(false),
      });
  }

  isStepCompleted(step: string): boolean {
    const o = this.order();
    if (!o) return false;
    const idx = PIPELINE_STEPS.indexOf(step as any);
    const currentIdx = PIPELINE_STEPS.indexOf(o.status as any);
    if (currentIdx === -1) return false;
    return idx < currentIdx;
  }

  isStepCurrent(step: string): boolean {
    return this.order()?.status === step;
  }

  getStepClasses(step: string): string {
    if (this.isStepCompleted(step)) return 'bg-blue-600 border-blue-600 text-white';
    if (this.isStepCurrent(step)) return 'bg-blue-50 border-blue-600 text-blue-700';
    return 'bg-white border-slate-200 text-slate-400';
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getTimelineDotClasses(status: string): string {
    switch (status) {
      case 'confirmed': return 'border-blue-400';
      case 'shipped': return 'border-purple-400';
      case 'delivered': return 'border-emerald-400';
      case 'returned': return 'border-orange-400';
      case 'cancelled': return 'border-rose-400';
      default: return 'border-amber-400';
    }
  }

  getTimelineInnerDot(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-emerald-500';
      case 'returned': return 'bg-orange-500';
      case 'cancelled': return 'bg-rose-500';
      default: return 'bg-amber-500';
    }
  }

  getWhatsAppUrl(order: Order): string {
    const phone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${order.customerName}, te escribimos de SuperLink para confirmar tu pedido #${order.id} por valor de $${order.total.toLocaleString()} con entrega en ${order.customerCity}. ¿Confirmas el envío?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  private getActionLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmar Pedido';
      case 'shipped': return 'Despachar / Generar Guía';
      case 'delivered': return 'Marcar Entregado';
      case 'returned': return 'Marcar Devolución';
      case 'cancelled': return 'Cancelar Pedido';
      default: return STATUS_LABELS[status] ?? status;
    }
  }

  private getActionClasses(status: string): string {
    switch (status) {
      case 'confirmed': return 'text-white bg-blue-600 hover:bg-blue-700';
      case 'shipped': return 'text-white bg-purple-600 hover:bg-purple-700';
      case 'delivered': return 'text-white bg-emerald-600 hover:bg-emerald-700';
      case 'returned': return 'text-amber-700 bg-amber-50 hover:bg-amber-100';
      case 'cancelled': return 'text-rose-700 bg-rose-50 hover:bg-rose-100';
      default: return 'text-slate-700 bg-slate-100 hover:bg-slate-200';
    }
  }
}
