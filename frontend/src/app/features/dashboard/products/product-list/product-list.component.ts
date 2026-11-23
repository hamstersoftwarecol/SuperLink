import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    CurrencyPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Title & CTA -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Catálogo de Productos</h1>
          <p class="text-xs text-slate-500 mt-1">
            Gestiona tu inventario, precios comparativos y páginas de oferta.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a
            routerLink="/dashboard/products/new"
            class="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nuevo Producto
          </a>
        </div>
      </div>

      <!-- Filters & View Switch -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div class="relative w-full sm:w-80">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombre de producto..."
            class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <!-- View mode toggle -->
          <div class="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              type="button"
              (click)="viewMode.set('grid')"
              [class.bg-white]="viewMode() === 'grid'"
              [class.shadow-sm]="viewMode() === 'grid'"
              [class.text-blue-600]="viewMode() === 'grid'"
              [class.text-slate-500]="viewMode() !== 'grid'"
              class="p-1.5 rounded-md transition-all"
              title="Vista Cuadrícula"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              type="button"
              (click)="viewMode.set('list')"
              [class.bg-white]="viewMode() === 'list'"
              [class.shadow-sm]="viewMode() === 'list'"
              [class.text-blue-600]="viewMode() === 'list'"
              [class.text-slate-500]="viewMode() !== 'list'"
              class="p-1.5 rounded-md transition-all"
              title="Vista Lista"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Products Display -->
      @if (loading()) {
        <app-loading-spinner message="Cargando catálogo..." />
      } @else if (filteredProducts().length === 0) {
        <app-empty-state
          title="No se encontraron productos"
          description="Agrega tu primer producto ganador para empezar a recibir pedidos contraentrega."
          actionLabel="Crear Producto"
          (actionClicked)="createNewDemoProduct()"
        />
      } @else if (viewMode() === 'grid') {
        <!-- Grid View -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (p of filteredProducts(); track p.id) {
            <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div class="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <img
                  [src]="p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'"
                  [alt]="p.name"
                  class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div class="absolute top-2.5 right-2.5">
                  <app-status-badge [status]="p.isActive ? 'active' : 'inactive'" />
                </div>
              </div>

              <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-900 line-clamp-1">{{ p.name }}</h3>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ p.description || 'Sin descripción' }}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100">
                  <div class="flex items-baseline justify-between">
                    <div>
                      <span class="text-base font-extrabold text-slate-900">{{ p.price | appCurrency }}</span>
                      @if (p.comparePrice) {
                        <span class="ml-1.5 text-xs text-slate-400 line-through">{{ p.comparePrice | appCurrency }}</span>
                      }
                    </div>
                    <span class="text-xs text-slate-500 font-medium">Stock: {{ p.stock }}</span>
                  </div>

                  <div class="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      (click)="toggleActive(p)"
                      class="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      {{ p.isActive ? 'Desactivar' : 'Activar' }}
                    </button>
                    <a
                      [routerLink]="['/dashboard/products', p.id, 'edit']"
                      class="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      Editar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- List View -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-semibold text-slate-500">
                <tr>
                  <th class="px-5 py-3.5">Producto</th>
                  <th class="px-5 py-3.5">Precio de Venta</th>
                  <th class="px-5 py-3.5">Precio Tachado</th>
                  <th class="px-5 py-3.5">Stock</th>
                  <th class="px-5 py-3.5">Estado</th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (p of filteredProducts(); track p.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="px-5 py-3.5 flex items-center gap-3">
                      <img
                        [src]="p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'"
                        [alt]="p.name"
                        class="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div>
                        <div class="font-bold text-slate-900">{{ p.name }}</div>
                        <div class="text-[11px] text-slate-400 max-w-xs truncate">{{ p.description }}</div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {{ p.price | appCurrency }}
                    </td>
                    <td class="px-5 py-3.5 text-slate-400 line-through whitespace-nowrap">
                      {{ p.comparePrice ? (p.comparePrice | appCurrency) : '—' }}
                    </td>
                    <td class="px-5 py-3.5 font-semibold text-slate-800">
                      {{ p.stock }} un.
                    </td>
                    <td class="px-5 py-3.5">
                      <app-status-badge [status]="p.isActive ? 'active' : 'inactive'" />
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-2">
                        <button
                          type="button"
                          (click)="toggleActive(p)"
                          class="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          {{ p.isActive ? 'Pausar' : 'Reactivar' }}
                        </button>
                        <a
                          [routerLink]="['/dashboard/products', p.id, 'edit']"
                          class="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          Editar
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal<boolean>(true);
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly searchQuery = signal<string>('');

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  });

  toggleActive(p: Product): void {
    this.productService.updateProduct(p.id, { isActive: !p.isActive }).subscribe(updated => {
      this.products.update(prev => prev.map(item => item.id === p.id ? { ...item, isActive: !p.isActive } : item));
    });
  }

  createNewDemoProduct(): void {
    this.productService.createProduct({
      name: 'Nuevo Gadget Inteligente 2026',
      description: 'Producto viral con alto margen comercial para ventas contra entrega.',
      price: 129000,
      comparePrice: 199000,
      stock: 50,
      isActive: true
    }).subscribe(newP => {
      this.products.update(prev => [newP, ...prev]);
    });
  }
}
