import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { Order } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly api = inject(ApiService);

  private mockOrders: Order[] = [
    {
      id: 'ORD-9821',
      tenantId: 'ten-superlink',
      customerName: 'Carolina Restrepo',
      customerEmail: 'caro.restrepo@gmail.com',
      customerPhone: '+57 312 458 9210',
      customerAddress: 'Calle 127 # 19-45 Apto 502',
      customerCity: 'Bogotá D.C.',
      customerDepartment: 'Cundinamarca',
      status: 'confirmed',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal: 189000,
      shippingCost: 12000,
      total: 201000,
      notes: 'Llamar antes de entregar. Timbre 502.',
      trackingCode: 'ENV-CO-984321',
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Depiladora Láser IPL Pro',
          quantity: 1,
          unitPrice: 189000
        }
      ],
      createdAt: '2026-02-20T14:32:00Z'
    },
    {
      id: 'ORD-9820',
      tenantId: 'ten-superlink',
      customerName: 'Andrés Felipe Morales',
      customerEmail: 'andres.felipe@hotmail.com',
      customerPhone: '+57 300 892 1144',
      customerAddress: 'Cra 43A # 1Sur - 220',
      customerCity: 'Medellín',
      customerDepartment: 'Antioquia',
      status: 'shipped',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal: 349900,
      shippingCost: 15000,
      total: 364900,
      trackingCode: 'ENV-MED-44219',
      items: [
        {
          id: 'item-2',
          productId: 'prod-2',
          productName: 'Mini Proyector Portátil Smart 4K',
          quantity: 1,
          unitPrice: 349900
        }
      ],
      createdAt: '2026-02-20T11:15:00Z'
    },
    {
      id: 'ORD-9819',
      tenantId: 'ten-superlink',
      customerName: 'Valentina Ospina',
      customerEmail: 'valen.ospina@yahoo.com',
      customerPhone: '+57 315 771 9088',
      customerAddress: 'Avenida 6N # 28N - 10',
      customerCity: 'Cali',
      customerDepartment: 'Valle del Cauca',
      status: 'delivered',
      paymentMethod: 'bold',
      paymentStatus: 'paid',
      subtotal: 238000,
      shippingCost: 0,
      total: 238000,
      trackingCode: 'ENV-CAL-11893',
      items: [
        {
          id: 'item-3',
          productId: 'prod-3',
          productName: 'Humidificador Ultrasónico Antigravedad',
          quantity: 2,
          unitPrice: 119000
        }
      ],
      createdAt: '2026-02-19T09:40:00Z'
    },
    {
      id: 'ORD-9818',
      tenantId: 'ten-superlink',
      customerName: 'David Santiago Rivas',
      customerEmail: 'david.rivas@gmail.com',
      customerPhone: '+57 320 654 3321',
      customerAddress: 'Calle 53 # 45-12',
      customerCity: 'Barranquilla',
      customerDepartment: 'Atlántico',
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal: 145000,
      shippingCost: 14000,
      total: 159000,
      items: [
        {
          id: 'item-4',
          productId: 'prod-4',
          productName: 'Smartwatch Ultra Pro Max 2.0',
          quantity: 1,
          unitPrice: 145000
        }
      ],
      createdAt: '2026-02-20T15:20:00Z'
    },
    {
      id: 'ORD-9817',
      tenantId: 'ten-superlink',
      customerName: 'Laura Marcela Gómez',
      customerEmail: 'laura.gomez@outlook.com',
      customerPhone: '+57 311 234 5678',
      customerAddress: 'Carrera 15 # 98-40',
      customerCity: 'Bucaramanga',
      customerDepartment: 'Santander',
      status: 'returned',
      paymentMethod: 'cod',
      paymentStatus: 'refunded',
      subtotal: 99000,
      shippingCost: 12000,
      total: 111000,
      notes: 'Dirección no encontrada por transportadora.',
      items: [
        {
          id: 'item-5',
          productId: 'prod-5',
          productName: 'Cepillo Secador y Voluminizador 5 en 1',
          quantity: 1,
          unitPrice: 99000
        }
      ],
      createdAt: '2026-02-18T16:05:00Z'
    },
    {
      id: 'ORD-9816',
      tenantId: 'ten-superlink',
      customerName: 'Gabriel Enrique Peña',
      customerEmail: 'gabriel.pena@gmail.com',
      customerPhone: '+57 310 987 6543',
      customerAddress: 'Transversal 39B # 72-10',
      customerCity: 'Cartagena',
      customerDepartment: 'Bolívar',
      status: 'cancelled',
      paymentMethod: 'transfer',
      paymentStatus: 'refunded',
      subtotal: 189000,
      shippingCost: 0,
      total: 189000,
      items: [
        {
          id: 'item-6',
          productId: 'prod-1',
          productName: 'Depiladora Láser IPL Pro',
          quantity: 1,
          unitPrice: 189000
        }
      ],
      createdAt: '2026-02-17T13:20:00Z'
    }
  ];

  getOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/orders').pipe(
      catchError(() => of(this.mockOrders))
    );
  }

  getOrderById(id: string): Observable<Order | null> {
    return this.api.get<Order>(`/orders/${id}`).pipe(
      catchError(() => of(this.mockOrders.find(o => o.id === id) || null))
    );
  }

  createOrder(order: Partial<Order>): Observable<Order> {
    return this.api.post<Order>('/orders', order).pipe(
      catchError(() => {
        const newOrder: Order = {
          id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          tenantId: order.tenantId || 'ten-superlink',
          customerName: order.customerName || 'Cliente Anónimo',
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
          customerCity: order.customerCity,
          customerDepartment: order.customerDepartment,
          status: order.status || 'pending',
          paymentMethod: order.paymentMethod || 'cod',
          paymentStatus: order.paymentStatus || 'pending',
          subtotal: order.subtotal || 0,
          shippingCost: order.shippingCost || 0,
          total: (order.subtotal || 0) + (order.shippingCost || 0),
          notes: order.notes,
          trackingCode: order.trackingCode,
          items: order.items || [],
          createdAt: new Date().toISOString()
        };
        this.mockOrders.unshift(newOrder);
        return of(newOrder);
      })
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.api.patch<Order>(`/orders/${id}/status`, { status }).pipe(
      catchError(() => {
        const order = this.mockOrders.find(o => o.id === id);
        if (order) {
          order.status = status;
          return of({ ...order });
        }
        return of({ id, status } as any);
      })
    );
  }

  updateOrder(id: string, updates: Partial<Order>): Observable<Order> {
    return this.api.put<Order>(`/orders/${id}`, updates).pipe(
      catchError(() => {
        const idx = this.mockOrders.findIndex(o => o.id === id);
        if (idx !== -1) {
          this.mockOrders[idx] = { ...this.mockOrders[idx], ...updates };
          return of(this.mockOrders[idx]);
        }
        return of({ ...updates, id } as Order);
      })
    );
  }
}
