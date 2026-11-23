import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { DashboardService } from '../../../core/services/dashboard.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { DashboardStats, Order, Product } from '../../../core/models';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatCardComponent,
    StatusBadgeComponent,
    CurrencyPipe,
    RelativeTimePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header with quick actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Panel Principal</h1>
          <p class="text-xs text-slate-500 mt-1">
            Resumen de actividad, ventas contraentrega y rendimiento de los últimos 7 días.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a
            routerLink="/dashboard/products/new"
            class="inline-flex items-center px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all"
          >
            + Producto
          </a>
          <a
            routerLink="/dashboard/orders"
            class="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
          >
            Ver Pedidos
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards Grid (4 cards) -->
      @if (stats(); as s) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            title="Total Pedidos"
            [value]="s.totalOrders"
            [change]="s.ordersChange"
          >
            <svg icon class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </app-stat-card>

          <app-stat-card
            title="Ingresos Totales"
            [value]="s.totalRevenue | appCurrency"
            [change]="s.revenueChange"
          >
            <svg icon class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </app-stat-card>

          <app-stat-card
            title="Tasa de Conversión"
            [value]="s.conversionRate + '%'"
            [change]="1.2"
          >
            <svg icon class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </app-stat-card>

          <app-stat-card
            title="Ticket Promedio"
            [value]="s.avgOrderValue | appCurrency"
            [change]="5.3"
          >
            <svg icon class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </app-stat-card>
        </div>
      }

      <!-- Chart Placeholder & Quick Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 7 Days Orders Line Chart Placeholder -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Tendencia de Pedidos (Últimos 7 días)</h2>
              <p class="text-xs text-slate-400">Total de despachos por día</p>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              +18.4% esta semana
            </span>
          </div>

          <!-- Clean SVG Line Chart Placeholder -->
          <div class="h-64 flex flex-col justify-between pt-4">
            <div class="h-44 relative w-full flex items-end justify-between px-4 pb-2 border-b border-slate-100">
              <!-- Grid background lines -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div class="border-b border-dashed border-slate-200 w-full"></div>
                <div class="border-b border-dashed border-slate-200 w-full"></div>
                <div class="border-b border-dashed border-slate-200 w-full"></div>
                <div class="border-b border-dashed border-slate-200 w-full"></div>
              </div>

              <!-- Bar visualizers -->
              @for (day of weeklyData; track day.day) {
                <div class="relative z-10 flex flex-col items-center group cursor-pointer w-10">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap shadow">
                    {{ day.orders }} pedidos
                  </div>
                  <div
                    class="w-7 rounded-t-lg bg-blue-600/90 group-hover:bg-blue-600 transition-all duration-300 shadow-sm"
                    [style.height.px]="day.orders * 0.45"
                  ></div>
                </div>
              }
            </div>
            <div class="flex justify-between px-4 text-xs font-semibold text-slate-400 mt-2">
              @for (day of weeklyData; track day.day) {
                <span class="w-10 text-center">{{ day.day }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Top Products List -->
        <div class="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-900">Productos Más Vendidos</h2>
            <a routerLink="/dashboard/products" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">
              Ver todos
            </a>
          </div>

          <div class="space-y-4">
            @for (product of topProducts(); track product.id) {
              <div class="flex items-center gap-3">
                <img
                  [src]="product.imageUrl"
                  [alt]="product.name"
                  class="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-slate-800 truncate">{{ product.name }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Stock: {{ product.stock }} un. disponibles</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-xs font-bold text-slate-900">{{ product.price | appCurrency }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Últimos Pedidos</h2>
            <p class="text-xs text-slate-400 mt-0.5">Órdenes recibidas recientemente pendientes de despacho o entrega</p>
          </div>
          <a routerLink="/dashboard/orders" class="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Ver todas las órdenes →
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
              <tr>
                <th class="px-5 py-3">ID Pedido</th>
                <th class="px-5 py-3">Cliente</th>
                <th class="px-5 py-3">Ciudad</th>
                <th class="px-5 py-3">Total</th>
                <th class="px-5 py-3">Estado</th>
                <th class="px-5 py-3">Pago</th>
                <th class="px-5 py-3">Fecha</th>
                <th class="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              @for (order of recentOrders(); track order.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="px-5 py-3.5 font-bold text-blue-600">
                    <a [routerLink]="['/dashboard/orders', order.id]">{{ order.id }}</a>
                  </td>
                  <td class="px-5 py-3.5">
                    <div class="font-semibold text-slate-800">{{ order.customerName }}</div>
                    <div class="text-[11px] text-slate-400">{{ order.customerPhone }}</div>
                  </td>
                  <td class="px-5 py-3.5 text-slate-700 font-medium">
                    {{ order.customerCity }}
                  </td>
                  <td class="px-5 py-3.5 font-bold text-slate-900">
                    {{ order.total | appCurrency }}
                  </td>
                  <td class="px-5 py-3.5">
                    <app-status-badge [status]="order.status" />
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {{ order.paymentMethod }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-slate-500">
                    {{ order.createdAt | relativeTime }}
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <a
                      [routerLink]="['/dashboard/orders', order.id]"
                      class="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      Detalles
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class OverviewComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly recentOrders = signal<Order[]>([]);
  readonly topProducts = signal<Product[]>([]);

  readonly weeklyData = [
    { day: 'Lun', orders: 182 },
    { day: 'Mar', orders: 215 },
    { day: 'Mié', orders: 198 },
    { day: 'Jue', orders: 245 },
    { day: 'Vie', orders: 290 },
    { day: 'Sáb', orders: 212 },
    { day: 'Dom', orders: 140 }
  ];

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe(stats => this.stats.set(stats));
    this.orderService.getOrders().subscribe(orders => this.recentOrders.set(orders.slice(0, 6)));
    this.productService.getProducts().subscribe(products => this.topProducts.set(products.slice(0, 4)));
  }
}
