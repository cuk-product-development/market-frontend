import client from "./client";

export const register = (data: { name: string; email: string; password: string; role?: string }) =>
  client.post("/api/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  client.post("/api/auth/login", data);

export const getMe = () => client.get("/api/auth/me");
