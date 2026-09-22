import client from "./client";

// Store
export const getMyStore   = () => client.get("/api/seller/store");
export const createStore  = (data: { name: string; description?: string }) => client.post("/api/seller/store", data);
export const updateStore  = (data: { name?: string; description?: string }) => client.patch("/api/seller/store", data);

// Products (paginated)
export const getMyProducts = (params?: Record<string, string | number>) =>
  client.get("/api/seller/products", { params });
export const createProduct = (data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) =>
  client.post("/api/seller/products", data);
export const updateProduct = (id: number, data: Partial<{ name: string; description: string; price: number; stock: number; imageUrl: string; status: string }>) =>
  client.patch(`/api/seller/products/${id}`, data);
export const deleteProduct = (id: number) => client.delete(`/api/seller/products/${id}`);

// Orders (paginated)
export const getSellerOrders = (params?: Record<string, string | number>) =>
  client.get("/api/seller/orders", { params });
export const updateOrderStatus = (id: number, status: string) =>
  client.patch(`/api/seller/orders/${id}`, { status });

// Report
export const getReport = () => client.get("/api/seller/report");

// Upload
export const uploadImage = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return client.post("/api/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
};
