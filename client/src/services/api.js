import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchCurrentUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const updateCurrentUser = async (data) => {
  const res = await api.patch("/users/me", data);
  return res.data;
};

export const deleteCurrentUser = async () => {
  const res = await api.delete("/users/me");
  return res.data;
};

export const uploadAvatar = async (avatarUrl) => {
  const res = await api.post("/users/me/avatar", { avatarUrl });
  return res.data;
};

export const downloadProfilePdf = async () => {
  const res = await api.get("/users/me/pdf", { responseType: 'blob' });
  return res.data;
};

export default api;
