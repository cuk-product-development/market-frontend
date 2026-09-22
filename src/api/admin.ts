import client from "./client";

export const getDashboard = () => client.get("/api/admin/dashboard");

export const getUsers = (params?: Record<string, string | number>) =>
  client.get("/api/admin/users", { params });
export const updateUser = (id: number, data: { suspended?: boolean }) =>
  client.patch(`/api/admin/users/${id}`, data);
export const deleteUser = (id: number) => client.delete(`/api/admin/users/${id}`);

export const getAdminStores = (params?: Record<string, string | number>) =>
  client.get("/api/admin/stores", { params });
export const updateStore = (id: number, data: { status: string }) =>
  client.patch(`/api/admin/stores/${id}`, data);

export const getAdminProducts = (params?: Record<string, string | number>) =>
  client.get("/api/admin/products", { params });

export const getTransactions = (params?: Record<string, string | number>) =>
  client.get("/api/admin/transactions", { params });
