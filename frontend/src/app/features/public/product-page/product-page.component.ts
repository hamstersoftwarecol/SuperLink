import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PublicProduct, CodOrderRequest, CodOrderResponse } from '../../../core/models';
import { DEPARTMENTS, Department } from '../../../core/data/colombia';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Loading -->
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-sm text-slate-500">Cargando producto...</p>
        </div>
      </div>
    }

    <!-- Error -->
    @if (error()) {
      <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900">Producto no encontrado</h2>
          <p class="mt-2 text-sm text-slate-500">Este producto no está disponible o el enlace es incorrecto.</p>
        </div>
      </div>
    }

    <!-- Product Page -->
    @if (data()) {
      <div class="min-h-screen bg-white">
        <!-- Top bar -->
        <header class="bg-white border-b border-slate-100 py-3 px-4 sticky top-0 z-30">
          <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="font-semibold text-sm text-slate-700">{{ data()!.store.name }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Tienda verificada
            </div>
          </div>
        </header>

        <main class="max-w-4xl mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Product Info -->
            <div>
              <!-- Image -->
              <div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                @if (data()!.product.image_url) {
                  <img
                    [src]="data()!.product.image_url"
                    [alt]="data()!.product.name"
                    class="w-full h-full object-cover"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                }
              </div>

              <!-- Product details (desktop) -->
              <div class="hidden lg:block mt-6">
                <h1 class="text-2xl font-bold text-slate-900">{{ data()!.product.name }}</h1>
                <div class="mt-3 flex items-baseline gap-3">
                  <span class="text-3xl font-extrabold text-slate-900">
                    {{ formatPrice(data()!.product.price) }}
                  </span>
                  @if (data()!.product.compare_price) {
                    <span class="text-lg text-slate-400 line-through">
                      {{ formatPrice(data()!.product.compare_price!) }}
                    </span>
                    <span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      -{{ discount() }}%
                    </span>
                  }
                </div>
                @if (data()!.product.description) {
                  <p class="mt-4 text-sm text-slate-600 leading-relaxed">{{ data()!.product.description }}</p>
                }

                <!-- Trust signals -->
                <div class="mt-6 grid grid-cols-2 gap-3">
                  <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-xs text-slate-600 font-medium">Pago contraentrega</span>
                  </div>
                  <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                    </svg>
                    <span class="text-xs text-slate-600 font-medium">Envío a toda Colombia</span>
                  </div>
                  <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-xs text-slate-600 font-medium">Entrega 2-5 días hábiles</span>
                  </div>
                  <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                    <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span class="text-xs text-slate-600 font-medium">Compra segura</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Form -->
            <div>
              <!-- Product details (mobile) -->
              <div class="lg:hidden mb-6">
                <h1 class="text-xl font-bold text-slate-900">{{ data()!.product.name }}</h1>
                <div class="mt-2 flex items-baseline gap-2">
                  <span class="text-2xl font-extrabold text-slate-900">
                    {{ formatPrice(data()!.product.price) }}
                  </span>
                  @if (data()!.product.compare_price) {
                    <span class="text-base text-slate-400 line-through">
                      {{ formatPrice(data()!.product.compare_price!) }}
                    </span>
                    <span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      -{{ discount() }}%
                    </span>
                  }
                </div>
                @if (data()!.product.description) {
                  <p class="mt-3 text-sm text-slate-600">{{ data()!.product.description }}</p>
                }
              </div>

              <!-- Form Card -->
              <div class="bg-white lg:bg-slate-50 lg:border lg:border-slate-200 rounded-2xl lg:p-6">
                <h2 class="text-lg font-bold text-slate-900 mb-1">Pedir ahora — Paga al recibir</h2>
                <p class="text-xs text-slate-500 mb-5">Completa tus datos y te confirmamos por WhatsApp</p>

                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                  <!-- Name -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre completo *</label>
                    <input
                      formControlName="customer_name"
                      type="text"
                      placeholder="Ej: María López"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                      [class.border-slate-200]="!isInvalid('customer_name')"
                      [class.border-red-400]="isInvalid('customer_name')"
                      [class.focus:border-blue-500]="!isInvalid('customer_name')"
                    />
                    @if (isInvalid('customer_name')) {
                      <p class="mt-1 text-xs text-red-500">Ingresa tu nombre</p>
                    }
                  </div>

                  <!-- Phone -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Celular / WhatsApp *</label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-sm text-slate-500 font-medium">+57</span>
                      <input
                        formControlName="customer_phone"
                        type="tel"
                        placeholder="300 123 4567"
                        class="w-full px-3.5 py-2.5 rounded-r-xl border text-sm transition-colors outline-none"
                        [class.border-slate-200]="!isInvalid('customer_phone')"
                        [class.border-red-400]="isInvalid('customer_phone')"
                      />
                    </div>
                    @if (isInvalid('customer_phone')) {
                      <p class="mt-1 text-xs text-red-500">Ingresa un número de celular válido</p>
                    }
                  </div>

                  <!-- Department -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Departamento *</label>
                    <select
                      formControlName="customer_department"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none appearance-none bg-white"
                      [class.border-slate-200]="!isInvalid('customer_department')"
                      [class.border-red-400]="isInvalid('customer_department')"
                    >
                      <option value="">Selecciona departamento</option>
                      @for (dept of departments; track dept.name) {
                        <option [value]="dept.name">{{ dept.name }}</option>
                      }
                    </select>
                    @if (isInvalid('customer_department')) {
                      <p class="mt-1 text-xs text-red-500">Selecciona tu departamento</p>
                    }
                  </div>

                  <!-- City -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Ciudad *</label>
                    <select
                      formControlName="customer_city"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none appearance-none bg-white"
                      [class.border-slate-200]="!isInvalid('customer_city')"
                      [class.border-red-400]="isInvalid('customer_city')"
                      [attr.disabled]="!selectedDepartment() ? '' : null"
                    >
                      <option value="">Selecciona ciudad</option>
                      @for (city of filteredCities(); track city) {
                        <option [value]="city">{{ city }}</option>
                      }
                    </select>
                    @if (isInvalid('customer_city')) {
                      <p class="mt-1 text-xs text-red-500">Selecciona tu ciudad</p>
                    }
                  </div>

                  <!-- Address -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Dirección de entrega *</label>
                    <input
                      formControlName="customer_address"
                      type="text"
                      placeholder="Calle 10 #25-30, Barrio Centro"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                      [class.border-slate-200]="!isInvalid('customer_address')"
                      [class.border-red-400]="isInvalid('customer_address')"
                    />
                    @if (isInvalid('customer_address')) {
                      <p class="mt-1 text-xs text-red-500">Ingresa tu dirección completa</p>
                    }
                  </div>

                  <!-- Quantity -->
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        (click)="changeQty(-1)"
                        class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        [class.opacity-50]="quantity() <= 1"
                      >−</button>
                      <span class="text-lg font-bold text-slate-900 w-8 text-center">{{ quantity() }}</span>
                      <button
                        type="button"
                        (click)="changeQty(1)"
                        class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        [class.opacity-50]="quantity() >= maxQty()"
                      >+</button>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <span class="text-sm font-medium text-slate-700">Total a pagar al recibir:</span>
                    <span class="text-xl font-extrabold text-blue-700">{{ formatPrice(total()) }}</span>
                  </div>

                  <!-- Submit -->
                  <button
                    type="submit"
                    [disabled]="submitting()"
                    class="w-full py-3.5 rounded-xl text-base font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    @if (submitting()) {
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Confirmar Pedido
                    }
                  </button>

                  @if (submitError()) {
                    <p class="text-sm text-red-600 text-center bg-red-50 p-3 rounded-xl">{{ submitError() }}</p>
                  }
                </form>
              </div>

              <!-- Mobile trust signals -->
              <div class="lg:hidden mt-6 grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-[11px] text-slate-600 font-medium">Pago contraentrega</span>
                </div>
                <div class="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                  </svg>
                  <span class="text-[11px] text-slate-600 font-medium">Envío nacional</span>
                </div>
                <div class="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-[11px] text-slate-600 font-medium">Entrega 2-5 días</span>
                </div>
                <div class="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                  <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span class="text-[11px] text-slate-600 font-medium">Compra segura</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="border-t border-slate-100 py-6 px-4 text-center">
          <p class="text-xs text-slate-400">
            Tienda de {{ data()!.store.name }} · Powered by
            <span class="font-semibold text-slate-500">SuperLink</span>
          </p>
        </footer>
      </div>
    }
  `,
})
export class ProductPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly departments = DEPARTMENTS;
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<PublicProduct | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal('');
  readonly quantity = signal(1);

  readonly selectedDepartment = signal<string>('');

  readonly filteredCities = computed(() => {
    const dept = this.departments.find((d) => d.name === this.selectedDepartment());
    return dept?.cities ?? [];
  });

  readonly discount = computed(() => {
    const p = this.data()?.product;
    if (!p?.compare_price || p.compare_price <= p.price) return 0;
    return Math.round(((p.compare_price - p.price) / p.compare_price) * 100);
  });

  readonly maxQty = computed(() => {
    const stock = this.data()?.product?.stock ?? 0;
    return Math.min(stock, 10);
  });

  readonly total = computed(() => {
    const price = this.data()?.product?.price ?? 0;
    return price * this.quantity();
  });

  form: FormGroup = this.fb.group({
    customer_name: ['', [Validators.required, Validators.minLength(3)]],
    customer_phone: ['', [Validators.required, Validators.pattern(/^\d{10,12}$/)]],
    customer_department: ['', Validators.required],
    customer_city: ['', Validators.required],
    customer_address: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    // Watch department changes to filter cities
    this.form.get('customer_department')?.valueChanges.subscribe((dept: string) => {
      this.selectedDepartment.set(dept);
      this.form.get('customer_city')?.setValue('');
    });

    const tenantSlug = this.route.snapshot.paramMap.get('tenantSlug');
    const productSlug = this.route.snapshot.paramMap.get('productSlug');

    if (!tenantSlug || !productSlug) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.api.get<PublicProduct>(`/public/${tenantSlug}/products/${productSlug}`).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  changeQty(delta: number): void {
    const next = this.quantity() + delta;
    if (next >= 1 && next <= this.maxQty()) {
      this.quantity.set(next);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.data()) return;

    this.submitting.set(true);
    this.submitError.set('');

    const tenantSlug = this.route.snapshot.paramMap.get('tenantSlug')!;
    const payload: CodOrderRequest = {
      product_id: this.data()!.product.id,
      quantity: this.quantity(),
      ...this.form.value,
    };

    this.api.post<CodOrderResponse>(`/public/${tenantSlug}/orders`, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/t', tenantSlug, this.data()!.product.slug, 'gracias'], {
          queryParams: { order: res.order_id, total: res.total },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.error || 'Error al procesar tu pedido. Intenta de nuevo.');
      },
    });
  }
}
