export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  role: string;
  provider: string;
  provider_id: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  image_url: string | null;
  stock: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_department: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  tracking_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface JWTPayload {
  sub: string;
  tenant: string;
  role: string;
  exp: number;
}
