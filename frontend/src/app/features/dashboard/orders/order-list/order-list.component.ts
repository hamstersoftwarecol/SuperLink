import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
    RelativeTimePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Title & CTA -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Gestión de Pedidos</h1>
          <p class="text-xs text-slate-500 mt-1">
            Administra órdenes, confirma llamadas, genera guías y monitorea entregas COD.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="exportOrders()"
            class="inline-flex items-center px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <svg class="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Exportar CSV
          </button>
          <button
            type="button"
            (click)="createNewDemoOrder()"
            class="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Pedido
          </button>
        </div>
      </div>

      <!-- Status Count Pills -->
      <div class="flex flex-wrap items-center gap-2">
        @for (pill of statusPills(); track pill.value) {
          <button
            type="button"
            (click)="selectedStatus.set(pill.value); currentPage.set(1)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
            [class]="selectedStatus() === pill.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'"
          >
            {{ pill.label }}
            <span
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1"
              [class]="selectedStatus() === pill.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'"
            >
              {{ pill.count }}
            </span>
          </button>
        }
      </div>

      <!-- Filters Toolbar -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por cliente, teléfono, ciudad..."
            class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <!-- Payment Method Filter -->
          <select
            [(ngModel)]="selectedPaymentMethod"
            class="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los pagos</option>
            <option value="cod">Contraentrega (COD)</option>
            <option value="bold">Tarjeta / Bold</option>
            <option value="transfer">Transferencia</option>
          </select>

          <!-- Clear Filters -->
          @if (searchQuery() || selectedStatus() !== 'all' || selectedPaymentMethod() !== 'all') {
            <button
              type="button"
              (click)="resetFilters()"
              class="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          }
        </div>
      </div>

      <!-- Orders Table -->
      @if (loading()) {
        <app-loading-spinner message="Cargando pedidos..." />
      } @else if (filteredOrders().length === 0) {
        <app-empty-state
          title="No hay pedidos que coincidan con los filtros"
          description="Intenta cambiar los parámetros de búsqueda o crea una nueva orden de prueba."
          actionLabel="Crear Pedido de Prueba"
          (actionClicked)="createNewDemoOrder()"
        />
      } @else {
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                <tr>
                  <th class="px-5 py-3.5 cursor-pointer hover:text-slate-800" (click)="toggleSort('id')">
                    ID Pedido
                  </th>
                  <th class="px-5 py-3.5 cursor-pointer hover:text-slate-800" (click)="toggleSort('customerName')">
                    Cliente / Destino
                  </th>
                  <th class="px-5 py-3.5">Productos</th>
                  <th class="px-5 py-3.5 cursor-pointer hover:text-slate-800" (click)="toggleSort('total')">
                    Total
                  </th>
                  <th class="px-5 py-3.5">Estado</th>
                  <th class="px-5 py-3.5">Pago</th>
                  <th class="px-5 py-3.5 cursor-pointer hover:text-slate-800" (click)="toggleSort('createdAt')">
                    Fecha
                  </th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (order of paginatedOrders(); track order.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="px-5 py-4 font-bold text-blue-600 whitespace-nowrap">
                      <a [routerLink]="['/dashboard/orders', order.id]" class="hover:underline">
                        {{ order.id }}
                      </a>
                      @if (order.trackingCode) {
                        <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                          {{ order.trackingCode }}
                        </div>
                      }
                    </td>

                    <td class="px-5 py-4">
                      <div class="font-semibold text-slate-900">{{ order.customerName }}</div>
                      <div class="text-slate-500 text-[11px]">{{ order.customerCity }}, {{ order.customerDepartment }}</div>
                      <div class="text-slate-400 text-[10px]">{{ order.customerPhone }}</div>
                    </td>

                    <td class="px-5 py-4">
                      @for (item of order.items; track item.id) {
                        <div class="text-slate-700 font-medium">
                          {{ item.quantity }}x {{ item.productName || 'Producto' }}
                        </div>
                      }
                    </td>

                    <td class="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                      {{ order.total | appCurrency }}
                    </td>

                    <td class="px-5 py-4 whitespace-nowrap">
                      <app-status-badge [status]="order.status" />
                    </td>

                    <td class="px-5 py-4 whitespace-nowrap">
                      <span class="inline-flex uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {{ order.paymentMethod }}
                      </span>
                    </td>

                    <td class="px-5 py-4 whitespace-nowrap text-slate-500">
                      {{ order.createdAt | relativeTime }}
                    </td>

                    <td class="px-5 py-4 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-1.5">
                        <a
                          [routerLink]="['/dashboard/orders', order.id]"
                          class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Ver
                        </a>
                        @if (getNextStatus(order)) {
                          <button
                            type="button"
                            (click)="quickAdvanceStatus(order)"
                            class="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            {{ getNextLabel(order) }} →
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs">
            <span class="text-slate-500">
              Mostrando
              <span class="font-semibold text-slate-800">{{ (currentPage() - 1) * pageSize + 1 }}</span>
              a
              <span class="font-semibold text-slate-800">{{ Math.min(currentPage() * pageSize, filteredOrders().length) }}</span>
              de
              <span class="font-semibold text-slate-800">{{ filteredOrders().length }}</span>
              pedidos
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                [disabled]="currentPage() === 1"
                (click)="currentPage.set(currentPage() - 1)"
                class="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                [disabled]="currentPage() >= totalPages()"
                (click)="currentPage.set(currentPage() + 1)"
                class="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly Math = Math;

  readonly orders = signal<Order[]>([]);
  readonly loading = signal<boolean>(true);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('all');
  readonly selectedPaymentMethod = signal<string>('all');

  readonly sortColumn = signal<keyof Order>('createdAt');
  readonly sortAsc = signal<boolean>(false);

  readonly currentPage = signal<number>(1);
  readonly pageSize = 8;

  readonly statusPills = computed(() => {
    const all = this.orders();
    const counts: Record<string, number> = { all: all.length, pending: 0, confirmed: 0, shipped: 0, delivered: 0, returned: 0, cancelled: 0 };
    for (const o of all) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return [
      { value: 'all', label: 'Todos', count: counts['all'] },
      { value: 'pending', label: 'Pendientes', count: counts['pending'] },
      { value: 'confirmed', label: 'Confirmados', count: counts['confirmed'] },
      { value: 'shipped', label: 'Enviados', count: counts['shipped'] },
      { value: 'delivered', label: 'Entregados', count: counts['delivered'] },
      { value: 'returned', label: 'Devueltos', count: counts['returned'] },
      { value: 'cancelled', label: 'Cancelados', count: counts['cancelled'] },
    ];
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly filteredOrders = computed(() => {
    let list = this.orders();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const payment = this.selectedPaymentMethod();

    if (query) {
      list = list.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerCity?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query)
      );
    }

    if (status !== 'all') {
      list = list.filter(o => o.status === status);
    }

    if (payment !== 'all') {
      list = list.filter(o => o.paymentMethod === payment);
    }

    // Sort
    const col = this.sortColumn();
    const asc = this.sortAsc();
    return [...list].sort((a: any, b: any) => {
      const valA = a[col];
      const valB = b[col];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize))
  );

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredOrders().slice(start, start + this.pageSize);
  });

  toggleSort(column: keyof Order): void {
    if (this.sortColumn() === column) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortColumn.set(column);
      this.sortAsc.set(true);
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('all');
    this.selectedPaymentMethod.set('all');
    this.currentPage.set(1);
  }

  private readonly validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: [],
    returned: [],
    cancelled: [],
  };

  getNextStatus(order: Order): Order['status'] | null {
    const allowed = this.validTransitions[order.status];
    return (allowed?.[0] as Order['status']) ?? null;
  }

  getNextLabel(order: Order): string {
    const labels: Record<string, string> = {
      confirmed: 'Confirmar',
      shipped: 'Despachar',
      delivered: 'Entregado',
    };
    const next = this.getNextStatus(order);
    return next ? (labels[next] ?? next) : '';
  }

  quickAdvanceStatus(order: Order): void {
    const nextStatus = this.getNextStatus(order);
    if (!nextStatus) return;
    this.orderService.updateOrderStatus(order.id, nextStatus).subscribe(() => {
      this.orders.update(all =>
        all.map(o => o.id === order.id ? { ...o, status: nextStatus } : o)
      );
    });
  }

  createNewDemoOrder(): void {
    const randomCities = ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira'];
    const randomNames = ['María Camila Santos', 'Juan David Gómez', 'Daniela Restrepo', 'Felipe Castro'];
    const city = randomCities[Math.floor(Math.random() * randomCities.length)];
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];

    this.orderService.createOrder({
      customerName: name,
      customerCity: city,
      customerPhone: '+57 311 ' + Math.floor(1000000 + Math.random() * 9000000),
      status: 'pending',
      paymentMethod: 'cod',
      subtotal: 189000,
      shippingCost: 12000,
      total: 201000,
      items: [
        {
          id: 'item-' + Date.now(),
          productId: 'prod-1',
          productName: 'Depiladora Láser IPL Pro',
          quantity: 1,
          unitPrice: 189000
        }
      ]
    }).subscribe(newOrder => {
      this.orders.update(prev => [newOrder, ...prev]);
    });
  }

  exportOrders(): void {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Cliente,Ciudad,Total,Estado,MetodoPago,Fecha']
        .concat(this.filteredOrders().map(o => `${o.id},"${o.customerName}","${o.customerCity || ''}",${o.total},${o.status},${o.paymentMethod},${o.createdAt}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `superlink_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
