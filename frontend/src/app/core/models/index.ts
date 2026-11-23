export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'super_admin' | 'admin' | 'vendedor' | 'operador' | 'viewer';
  provider: 'email' | 'google';
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'max';
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface PublicProduct {
  store: { name: string; slug: string };
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    stock: number;
  };
}

export interface CodOrderRequest {
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_department: string;
  customer_email?: string;
  notes?: string;
}

export interface CodOrderResponse {
  order_id: string;
  status: string;
  total: number;
  message: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerDepartment?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  paymentMethod: 'cod' | 'bold' | 'transfer';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  subtotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  trackingCode?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  department?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  ordersChange: number;
  revenueChange: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
