import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PublicProduct, CodOrderRequest, CodOrderResponse } from '../../../core/models';
import { DEPARTMENTS } from '../../../core/data/colombia';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (loading()) {
      <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    }

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

    @if (data()) {
      <div class="min-h-screen bg-white" [style.--brand]="data()!.store.brand_color">
        <!-- Sticky header -->
        <header class="bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3 px-4 sticky top-0 z-30">
          <div class="max-w-5xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-2">
              @if (data()!.store.logo_url) {
                <img [src]="data()!.store.logo_url" [alt]="data()!.store.name" class="w-8 h-8 rounded-lg object-cover"/>
              } @else {
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" [style.background]="data()!.store.brand_color">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              }
              <span class="font-semibold text-sm text-slate-700">{{ data()!.store.name }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Tienda verificada
            </div>
          </div>
        </header>

        <!-- Announcement bar -->
        <div class="text-white text-center py-2 px-4 text-xs font-medium" [style.background]="data()!.store.brand_color">
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
            </svg>
            Envio GRATIS a toda Colombia · Paga al recibir
          </span>
        </div>

        <main class="max-w-5xl mx-auto">
          <!-- Hero: Image gallery + product info -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 lg:px-4 lg:py-8">
            <!-- Image gallery -->
            <div class="relative">
              <div class="aspect-square bg-slate-100 overflow-hidden lg:rounded-2xl">
                @if (allImages().length > 0) {
                  <img
                    [src]="allImages()[currentImage()]"
                    [alt]="data()!.product.name"
                    class="w-full h-full object-cover transition-opacity duration-300"
                  />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                }
              </div>

              @if (discount() > 0) {
                <div class="absolute top-3 left-3 lg:top-4 lg:left-4 px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-lg" [style.background]="data()!.store.brand_color">
                  -{{ discount() }}% OFF
                </div>
              }

              @if (allImages().length > 1) {
                <div class="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                  @for (img of allImages(); track $index) {
                    <button
                      (click)="currentImage.set($index)"
                      class="w-2 h-2 rounded-full transition-all"
                      [class]="currentImage() === $index ? 'w-6 bg-white shadow-md' : 'bg-white/60'"
                    ></button>
                  }
                </div>
                <div class="hidden lg:flex gap-2 mt-3">
                  @for (img of allImages(); track $index) {
                    <button
                      (click)="currentImage.set($index)"
                      class="w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                      [class]="currentImage() === $index ? 'border-[var(--brand)] ring-1 ring-[var(--brand)]' : 'border-transparent opacity-60 hover:opacity-100'"
                    >
                      <img [src]="img" [alt]="'Imagen ' + ($index + 1)" class="w-full h-full object-cover"/>
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Product info + urgency -->
            <div class="px-4 lg:px-0 pt-5 lg:pt-0">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  {{ viewers() }} personas viendo este producto
                </span>
              </div>

              <h1 class="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">{{ data()!.product.name }}</h1>

              <div class="mt-3 flex items-baseline gap-3">
                <span class="text-3xl lg:text-4xl font-black" [style.color]="data()!.store.brand_color">
                  {{ formatPrice(data()!.product.price) }}
                </span>
                @if (data()!.product.compare_price) {
                  <span class="text-lg text-slate-400 line-through">
                    {{ formatPrice(data()!.product.compare_price!) }}
                  </span>
                }
              </div>

              @if (discount() > 0) {
                <div class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                  </svg>
                  Oferta termina pronto
                </div>
              }

              @if (data()!.product.stock > 0 && data()!.product.stock <= 20) {
                <div class="mt-3 flex items-center gap-2">
                  <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      [style.width.%]="Math.min((data()!.product.stock / 20) * 100, 100)"
                      [style.background]="data()!.product.stock <= 5 ? '#ef4444' : data()!.product.stock <= 10 ? '#f97316' : '#eab308'"
                    ></div>
                  </div>
                  <span class="text-xs font-bold whitespace-nowrap"
                    [class]="data()!.product.stock <= 5 ? 'text-red-600' : 'text-orange-600'">
                    @if (data()!.product.stock <= 5) {
                      Ultimas {{ data()!.product.stock }} unidades!
                    } @else {
                      Quedan {{ data()!.product.stock }} unidades
                    }
                  </span>
                </div>
              }

              @if (data()!.product.description) {
                <p class="mt-4 text-sm text-slate-600 leading-relaxed">{{ data()!.product.description }}</p>
              }

              @if (data()!.product.features.length > 0) {
                <ul class="mt-5 space-y-2.5">
                  @for (feature of data()!.product.features; track $index) {
                    <li class="flex items-start gap-2.5">
                      <svg class="w-5 h-5 shrink-0 mt-0.5" [style.color]="data()!.store.brand_color" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-sm text-slate-700">{{ feature }}</span>
                    </li>
                  }
                </ul>
              }

              <div class="mt-6 grid grid-cols-3 gap-2">
                <div class="text-center p-3 bg-slate-50 rounded-xl">
                  <svg class="w-6 h-6 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span class="block text-[10px] font-semibold text-slate-600 mt-1">Compra segura</span>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-xl">
                  <svg class="w-6 h-6 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span class="block text-[10px] font-semibold text-slate-600 mt-1">Pago contraentrega</span>
                </div>
                <div class="text-center p-3 bg-slate-50 rounded-xl">
                  <svg class="w-6 h-6 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                  </svg>
                  <span class="block text-[10px] font-semibold text-slate-600 mt-1">Envio gratis</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order form section -->
          <div class="px-4 lg:px-4 py-8" id="order-form">
            <div class="max-w-lg mx-auto">
              <div class="text-center mb-6">
                <h2 class="text-xl font-extrabold text-slate-900">Pedir ahora — Paga al recibir</h2>
                <p class="mt-1 text-sm text-slate-500">Completa tus datos y te confirmamos por WhatsApp</p>
              </div>

              <div class="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm">
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre completo *</label>
                    <input
                      formControlName="customer_name"
                      type="text"
                      placeholder="Ej: Maria Lopez"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                      [class.border-slate-200]="!isInvalid('customer_name')"
                      [class.border-red-400]="isInvalid('customer_name')"
                      [class.focus:border-blue-500]="!isInvalid('customer_name')"
                    />
                    @if (isInvalid('customer_name')) {
                      <p class="mt-1 text-xs text-red-500">Ingresa tu nombre</p>
                    }
                  </div>

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
                      <p class="mt-1 text-xs text-red-500">Ingresa un numero de celular valido</p>
                    }
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">Departamento *</label>
                      <select
                        formControlName="customer_department"
                        class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none appearance-none bg-white"
                        [class.border-slate-200]="!isInvalid('customer_department')"
                        [class.border-red-400]="isInvalid('customer_department')"
                      >
                        <option value="">Selecciona</option>
                        @for (dept of departments; track dept.name) {
                          <option [value]="dept.name">{{ dept.name }}</option>
                        }
                      </select>
                      @if (isInvalid('customer_department')) {
                        <p class="mt-1 text-xs text-red-500">Requerido</p>
                      }
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1">Ciudad *</label>
                      <select
                        formControlName="customer_city"
                        class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none appearance-none bg-white"
                        [class.border-slate-200]="!isInvalid('customer_city')"
                        [class.border-red-400]="isInvalid('customer_city')"
                        [attr.disabled]="!selectedDepartment() ? '' : null"
                      >
                        <option value="">Selecciona</option>
                        @for (city of filteredCities(); track city) {
                          <option [value]="city">{{ city }}</option>
                        }
                      </select>
                      @if (isInvalid('customer_city')) {
                        <p class="mt-1 text-xs text-red-500">Requerido</p>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Direccion de entrega *</label>
                    <input
                      formControlName="customer_address"
                      type="text"
                      placeholder="Calle 10 #25-30, Barrio Centro"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none"
                      [class.border-slate-200]="!isInvalid('customer_address')"
                      [class.border-red-400]="isInvalid('customer_address')"
                    />
                    @if (isInvalid('customer_address')) {
                      <p class="mt-1 text-xs text-red-500">Ingresa tu direccion completa</p>
                    }
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        (click)="changeQty(-1)"
                        class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        [class.opacity-50]="quantity() <= 1"
                      >-</button>
                      <span class="text-lg font-bold text-slate-900 w-8 text-center">{{ quantity() }}</span>
                      <button
                        type="button"
                        (click)="changeQty(1)"
                        class="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        [class.opacity-50]="quantity() >= maxQty()"
                      >+</button>
                    </div>
                  </div>

                  <div class="rounded-xl p-4 flex items-center justify-between" [style.background]="data()!.store.brand_color + '10'" [style.border]="'1px solid ' + data()!.store.brand_color + '30'">
                    <span class="text-sm font-medium text-slate-700">Total a pagar al recibir:</span>
                    <span class="text-xl font-extrabold" [style.color]="data()!.store.brand_color">{{ formatPrice(total()) }}</span>
                  </div>

                  <button
                    type="submit"
                    [disabled]="submitting()"
                    class="w-full py-4 rounded-xl text-base font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    [style.background]="data()!.store.brand_color"
                    [style.box-shadow]="'0 10px 25px -5px ' + data()!.store.brand_color + '40'"
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
            </div>
          </div>

          <!-- Social proof: testimonials -->
          <div class="px-4 lg:px-4 py-8 bg-slate-50">
            <div class="max-w-3xl mx-auto">
              <h3 class="text-center text-lg font-extrabold text-slate-900 mb-6">Lo que dicen nuestros clientes</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @for (review of reviews; track review.name) {
                  <div class="bg-white rounded-xl p-4 border border-slate-100">
                    <div class="flex items-center gap-0.5 mb-2">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      }
                    </div>
                    <p class="text-sm text-slate-600 leading-relaxed">{{ review.text }}</p>
                    <div class="mt-3 flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.background]="data()!.store.brand_color">
                        {{ review.name[0] }}
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-slate-700">{{ review.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ review.city }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Guarantee + delivery info -->
          <div class="px-4 lg:px-4 py-8">
            <div class="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-5 rounded-2xl border border-slate-100">
                <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 class="font-bold text-sm text-slate-900">Garantia de satisfaccion</h4>
                <p class="mt-1 text-xs text-slate-500">Si no estas satisfecho, te devolvemos tu dinero</p>
              </div>
              <div class="text-center p-5 rounded-2xl border border-slate-100">
                <div class="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                  </svg>
                </div>
                <h4 class="font-bold text-sm text-slate-900">Entrega 2-5 dias habiles</h4>
                <p class="mt-1 text-xs text-slate-500">Envio con seguimiento a toda Colombia</p>
              </div>
              <div class="text-center p-5 rounded-2xl border border-slate-100">
                <div class="w-12 h-12 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h4 class="font-bold text-sm text-slate-900">Paga al recibir</h4>
                <p class="mt-1 text-xs text-slate-500">Sin riesgos. Paga solo cuando tengas tu producto</p>
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div class="px-4 lg:px-4 py-8 bg-slate-50">
            <div class="max-w-2xl mx-auto">
              <h3 class="text-center text-lg font-extrabold text-slate-900 mb-6">Preguntas frecuentes</h3>
              <div class="space-y-3">
                @for (faq of faqs; track faq.q) {
                  <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <button
                      (click)="toggleFaq($index)"
                      class="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    >
                      <span class="text-sm font-semibold text-slate-800">{{ faq.q }}</span>
                      <svg
                        class="w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform"
                        [class.rotate-180]="openFaq() === $index"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    @if (openFaq() === $index) {
                      <div class="px-4 pb-3.5 text-sm text-slate-600 leading-relaxed">{{ faq.a }}</div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </main>

        <!-- WhatsApp FAB -->
        @if (data()!.store.whatsapp) {
          <a
            [href]="'https://wa.me/' + data()!.store.whatsapp + '?text=Hola, tengo una pregunta sobre ' + data()!.product.name"
            target="_blank"
            class="fixed bottom-20 lg:bottom-6 right-4 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors z-30"
          >
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        }

        <!-- Sticky CTA bar (mobile) -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-500 truncate">{{ data()!.product.name }}</p>
              <p class="text-lg font-extrabold" [style.color]="data()!.store.brand_color">{{ formatPrice(data()!.product.price) }}</p>
            </div>
            <button
              (click)="scrollToForm()"
              class="px-6 py-3 rounded-xl text-sm font-bold text-white shrink-0"
              [style.background]="data()!.store.brand_color"
            >
              Pedir ahora
            </button>
          </div>
        </div>

        <!-- Footer -->
        <footer class="border-t border-slate-100 py-6 px-4 text-center mb-16 lg:mb-0">
          <p class="text-xs text-slate-400">
            Tienda de {{ data()!.store.name }} · Powered by
            <span class="font-semibold text-slate-500">SuperLink</span>
          </p>
        </footer>
      </div>
    }
  `,
})
export class ProductPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private viewerInterval: ReturnType<typeof setInterval> | null = null;

  readonly Math = Math;
  readonly departments = DEPARTMENTS;
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly data = signal<PublicProduct | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal('');
  readonly quantity = signal(1);
  readonly currentImage = signal(0);
  readonly viewers = signal(0);
  readonly openFaq = signal<number | null>(null);
  readonly selectedDepartment = signal<string>('');

  readonly filteredCities = computed(() => {
    const dept = this.departments.find((d) => d.name === this.selectedDepartment());
    return dept?.cities ?? [];
  });

  readonly allImages = computed(() => {
    const p = this.data()?.product;
    if (!p) return [];
    const imgs = [...(p.images ?? [])];
    if (p.image_url && !imgs.includes(p.image_url)) imgs.unshift(p.image_url);
    return imgs.length > 0 ? imgs : [];
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

  readonly reviews = [
    { name: 'Carolina M.', city: 'Bogota', text: 'Excelente producto, llego en 3 dias. Muy buena calidad, justo como en la descripcion.' },
    { name: 'Andres F.', city: 'Medellin', text: 'Al principio dude por ser contraentrega pero todo perfecto. 100% recomendado.' },
    { name: 'Valentina R.', city: 'Cali', text: 'Ya es mi segunda compra en esta tienda. Envio rapido y producto original.' },
  ];

  readonly faqs = [
    { q: 'Como funciona el pago contraentrega?', a: 'Pagas en efectivo al momento de recibir tu pedido en la puerta de tu casa. No necesitas tarjeta de credito ni hacer transferencias previas.' },
    { q: 'Cuanto tarda en llegar mi pedido?', a: 'El tiempo de entrega es de 2 a 5 dias habiles a cualquier ciudad de Colombia. Recibiras un codigo de seguimiento para rastrear tu envio.' },
    { q: 'Que pasa si no me gusta el producto?', a: 'Tienes garantia de satisfaccion. Si el producto no cumple tus expectativas, puedes solicitar la devolucion de tu dinero.' },
    { q: 'El envio tiene costo?', a: 'El envio es completamente GRATIS a toda Colombia. No hay costos ocultos.' },
  ];

  form: FormGroup = this.fb.group({
    customer_name: ['', [Validators.required, Validators.minLength(3)]],
    customer_phone: ['', [Validators.required, Validators.pattern(/^\d{10,12}$/)]],
    customer_department: ['', Validators.required],
    customer_city: ['', Validators.required],
    customer_address: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.form.get('customer_department')?.valueChanges.subscribe((dept: string) => {
      this.selectedDepartment.set(dept);
      this.form.get('customer_city')?.setValue('');
    });

    this.viewers.set(Math.floor(Math.random() * 15) + 8);
    this.viewerInterval = setInterval(() => {
      this.viewers.update(v => v + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);

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

  ngOnDestroy(): void {
    if (this.viewerInterval) clearInterval(this.viewerInterval);
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

  toggleFaq(index: number): void {
    this.openFaq.set(this.openFaq() === index ? null : index);
  }

  scrollToForm(): void {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
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
