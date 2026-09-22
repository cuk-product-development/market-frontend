export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  suspended?: boolean;
}

export interface Store {
  id: number;
  sellerId: number;
  name: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  seller?: { id: number; name: string; email?: string };
  _count?: { products: number };
}

export interface Product {
  id: number;
  storeId: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number;
  imageUrl?: string;
  status: "ACTIVE" | "INACTIVE";
  store?: { id: number; name: string };
  _count?: { reviews: number };
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product & { store: { id: number; name: string } };
}

export interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  price: number | string;
  product: { id: number; name: string; imageUrl?: string };
  store: { id: number; name: string };
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface Payment {
  id: number;
  orderId: number;
  amount: number | string;
  status: PaymentStatus;
}

export interface Order {
  id: number;
  userId: number;
  total: number | string;
  shippingFee: number | string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
  address?: Address;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  user?: { id: number; name: string };
}
