import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);

  private mockProducts: Product[] = [
    {
      id: 'prod-1',
      tenantId: 'ten-superlink',
      name: 'Depiladora Láser IPL Pro',
      description: 'Dispositivo de depilación definitiva indolora con 999.000 pulsos.',
      price: 189000,
      comparePrice: 280000,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
      stock: 45,
      isActive: true,
      createdAt: '2026-02-01T10:00:00Z'
    },
    {
      id: 'prod-2',
      tenantId: 'ten-superlink',
      name: 'Mini Proyector Portátil Smart 4K',
      description: 'Proyector con Android TV integrado, WiFi 6 y Bluetooth.',
      price: 349900,
      comparePrice: 499900,
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      stock: 18,
      isActive: true,
      createdAt: '2026-02-05T12:30:00Z'
    },
    {
      id: 'prod-3',
      tenantId: 'ten-superlink',
      name: 'Humidificador Ultrasónico Antigravedad',
      description: 'Difusor de aromas con efecto levitación de gotas de agua y luz LED.',
      price: 119000,
      comparePrice: 169000,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
      stock: 62,
      isActive: true,
      createdAt: '2026-02-10T14:15:00Z'
    },
    {
      id: 'prod-4',
      tenantId: 'ten-superlink',
      name: 'Smartwatch Ultra Pro Max 2.0',
      description: 'Reloj inteligente con monitor cardíaco, llamadas bluetooth y GPS.',
      price: 145000,
      comparePrice: 220000,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      stock: 8,
      isActive: true,
      createdAt: '2026-02-12T09:00:00Z'
    },
    {
      id: 'prod-5',
      tenantId: 'ten-superlink',
      name: 'Cepillo Secador y Voluminizador 5 en 1',
      description: 'Set estilizador de cabello multifuncional con iones negativos.',
      price: 99000,
      comparePrice: 149000,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      stock: 0,
      isActive: false,
      createdAt: '2026-02-14T11:45:00Z'
    }
  ];

  getProducts(): Observable<Product[]> {
    return this.api.get<{ data: Product[]; pagination: any }>('/products').pipe(
      map((res) => (Array.isArray(res) ? res : res.data ?? [])),
      catchError(() => of(this.mockProducts))
    );
  }

  getProductById(id: string): Observable<Product | null> {
    return this.api.get<Product>(`/products/${id}`).pipe(
      catchError(() => of(this.mockProducts.find(p => p.id === id) || null))
    );
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('/products', product).pipe(
      catchError(() => {
        const newProduct: Product = {
          id: 'prod-' + Date.now(),
          tenantId: product.tenantId || 'ten-superlink',
          name: product.name || 'Nuevo Producto',
          description: product.description || '',
          price: product.price || 0,
          comparePrice: product.comparePrice,
          imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          stock: product.stock !== undefined ? product.stock : 0,
          isActive: product.isActive !== undefined ? product.isActive : true,
          createdAt: new Date().toISOString()
        };
        this.mockProducts.unshift(newProduct);
        return of(newProduct);
      })
    );
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, updates).pipe(
      catchError(() => {
        const idx = this.mockProducts.findIndex(p => p.id === id);
        if (idx !== -1) {
          this.mockProducts[idx] = { ...this.mockProducts[idx], ...updates };
          return of(this.mockProducts[idx]);
        }
        return of({ ...updates, id } as Product);
      })
    );
  }

  deleteProduct(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/products/${id}`).pipe(
      catchError(() => {
        this.mockProducts = this.mockProducts.filter(p => p.id !== id);
        return of({ success: true });
      })
    );
  }
}
