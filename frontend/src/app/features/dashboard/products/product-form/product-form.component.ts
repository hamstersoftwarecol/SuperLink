import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a
            routerLink="/dashboard/products"
            class="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </a>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              {{ isEditMode() ? 'Editar Producto' : 'Crear Nuevo Producto' }}
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
              Configura los detalles de tu producto para landing pages y órdenes contraentrega.
            </p>
          </div>
        </div>
      </div>

      @if (initialLoading()) {
        <app-loading-spinner message="Cargando información del producto..." />
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <!-- Basic Info -->
          <div>
            <h2 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Información General</h2>
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-xs font-semibold text-slate-700">Nombre del Producto *</label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Ej. Mini Proyector Smart HD"
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label for="description" class="block text-xs font-semibold text-slate-700">Descripción de Venta</label>
                <textarea
                  id="description"
                  rows="3"
                  formControlName="description"
                  placeholder="Describe beneficios, características y qué incluye el paquete..."
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label for="imageUrl" class="block text-xs font-semibold text-slate-700">URL de Imagen Principal</label>
                <input
                  id="imageUrl"
                  type="url"
                  formControlName="imageUrl"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Pricing & Stock -->
          <div>
            <h2 class="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Precios e Inventario</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="price" class="block text-xs font-semibold text-slate-700">Precio de Venta (COP) *</label>
                <input
                  id="price"
                  type="number"
                  formControlName="price"
                  placeholder="149000"
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label for="comparePrice" class="block text-xs font-semibold text-slate-700">Precio Tachado / Antes</label>
                <input
                  id="comparePrice"
                  type="number"
                  formControlName="comparePrice"
                  placeholder="199000"
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label for="stock" class="block text-xs font-semibold text-slate-700">Unidades en Stock *</label>
                <input
                  id="stock"
                  type="number"
                  formControlName="stock"
                  placeholder="25"
                  class="mt-1 block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Status toggle -->
          <div class="pt-2 flex items-center">
            <input
              id="isActive"
              type="checkbox"
              formControlName="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label for="isActive" class="ml-2 block text-xs font-semibold text-slate-700">
              Producto activo para la venta y pedidos
            </label>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <a
              routerLink="/dashboard/products"
              class="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </a>
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {{ saving() ? 'Guardando...' : (isEditMode() ? 'Actualizar Producto' : 'Crear Producto') }}
            </button>
          </div>
        </form>
      }
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  readonly isEditMode = signal<boolean>(false);
  readonly initialLoading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  private productId: string | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    comparePrice: [null as number | null],
    imageUrl: [''],
    stock: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode.set(true);
      this.initialLoading.set(true);
      this.productService.getProductById(this.productId).subscribe({
        next: (p) => {
          if (p) {
            this.form.patchValue({
              name: p.name,
              description: p.description || '',
              price: p.price,
              comparePrice: p.comparePrice || null,
              imageUrl: p.imageUrl || '',
              stock: p.stock,
              isActive: p.isActive
            });
          }
          this.initialLoading.set(false);
        },
        error: () => this.initialLoading.set(false)
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.value;

    if (this.isEditMode() && this.productId) {
      this.productService.updateProduct(this.productId, formValue as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/dashboard/products']);
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.productService.createProduct(formValue as any).subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/dashboard/products']);
        },
        error: () => this.saving.set(false)
      });
    }
  }
}
