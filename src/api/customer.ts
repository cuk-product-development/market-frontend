import client from "./client";

// Stores
export const getStores = () => client.get("/api/customer/stores");
export const getStore = (id: number) => client.get(`/api/customer/stores/${id}`);

// Products
export const getProducts = (params?: Record<string, string | number>) =>
  client.get("/api/customer/products", { params });
export const getProduct = (id: number) => client.get(`/api/customer/products/${id}`);

// Cart
export const getCart = () => client.get("/api/customer/cart");
export const addToCart = (productId: number, quantity: number) =>
  client.post("/api/customer/cart", { productId, quantity });
export const updateCartItem = (id: number, quantity: number) =>
  client.patch(`/api/customer/cart/${id}`, { quantity });
export const removeCartItem = (id: number) => client.delete(`/api/customer/cart/${id}`);
export const clearCart = () => client.delete("/api/customer/cart");

// Addresses
export const getAddresses = () => client.get("/api/customer/addresses");
export const createAddress = (data: {
  label: string; street: string; city: string;
  province: string; postalCode: string; isDefault?: boolean;
}) => client.post("/api/customer/addresses", data);

// Checkout
export const checkout = (addressId?: number) =>
  client.post("/api/customer/checkout", { addressId });

// Payment
export const pay = (orderId: number, simulate: "success" | "failure") =>
  client.post(`/api/customer/payment/${orderId}`, { simulate });

// Orders
export const getOrders = () => client.get("/api/customer/orders");
export const getOrder = (id: number) => client.get(`/api/customer/orders/${id}`);
export const cancelOrder = (id: number) => client.post(`/api/customer/orders/${id}/cancel`);

// Reviews
export const createReview = (data: { productId: number; rating: number; comment?: string }) =>
  client.post("/api/customer/reviews", data);
