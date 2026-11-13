import { BGProduct, BGReview } from '../data/basmaglowConstants';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiErrorBody {
  error?: string;
}

export interface CheckoutRequest {
  name: string;
  phone: string;
  address: string;
  cityCode: string;
  deliveryType: 'home' | 'desk';
  promoCode: string;
  items: Array<{ productId: number; quantity: number }>;
}

export interface CreatedOrder {
  id: string;
  total: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
  };
}

export interface AnalyticsSummary {
  today: { visitors: number; pageViews: number };
  last7Days: { visitors: number; pageViews: number };
  last30Days: { visitors: number; pageViews: number };
  daily: Array<{ date: string; visitors: number; pageViews: number }>;
  popularPages: Array<{ path: string; pageViews: number; visitors: number }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({} as ApiErrorBody));
    throw new Error(body.error || `Erreur API (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getProducts(): Promise<BGProduct[]> {
  return request('/api/products');
}

export function getReviews(): Promise<BGReview[]> {
  return request('/api/reviews');
}

export function trackPageView(visitorId: string, pagePath: string): Promise<void> {
  return request('/api/analytics/page-view', {
    method: 'POST',
    body: JSON.stringify({ visitorId, pagePath }),
    keepalive: true,
  });
}

export function getAnalytics(token: string): Promise<AnalyticsSummary> {
  return request('/api/admin/analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getCurrentUser(token: string): Promise<AuthResponse['user']> {
  return request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createOrder(order: CheckoutRequest, token?: string): Promise<CreatedOrder> {
  return request('/api/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(order),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function saveProduct(product: BGProduct, token: string, isNew: boolean): Promise<BGProduct> {
  return request(isNew ? '/api/admin/products' : `/api/admin/products/${product.id}`, {
    method: isNew ? 'POST' : 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id: number, token: string): Promise<void> {
  return request(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function saveReview(review: BGReview, token: string, isNew: boolean): Promise<BGReview> {
  return request(isNew ? '/api/admin/reviews' : `/api/admin/reviews/${review.id}`, {
    method: isNew ? 'POST' : 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(review),
  });
}

export function deleteReview(id: number, token: string): Promise<void> {
  return request(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface AdminAccountUpdateRequest {
  currentPassword: string;
  email: string;
  newPassword?: string;
}

export function updateAdminAccount(
  input: AdminAccountUpdateRequest,
  token: string
): Promise<AuthResponse> {
  return request('/api/admin/account', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export interface CustomerAccountUpdateRequest {
  currentPassword: string;
  name: string;
  email: string;
  newPassword?: string;
}

export interface OrderItem {
  productId: number;
  brand: string;
  name: string;
  vol: string;
  price: number;
  quantity: number;
  img: string;
}

export interface CustomerOrder {
  id: string;
  customerId?: string | null;
  customerName: string;
  phone: string;
  address: string;
  cityCode: string;
  deliveryType: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
}

export function getMyOrders(token: string): Promise<CustomerOrder[]> {
  return request('/api/orders/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateCustomerAccount(
  input: CustomerAccountUpdateRequest,
  token: string
): Promise<AuthResponse> {
  return request('/api/account', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export type SiteTextsMap = Record<string, string>;

export function getSiteTexts(): Promise<SiteTextsMap> {
  return request('/api/site-texts');
}

export function updateSiteTexts(texts: SiteTextsMap, token: string): Promise<void> {
  return request('/api/admin/site-texts', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ texts }),
  });
}
