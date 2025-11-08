import axios from "axios";

const api = axios.create({
  baseURL: "https://technacallcanadabackend-production.up.railway.app/",
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const res = await axios.post(
          "https://technacallcanadabackend-production.up.railway.app/api/auth/refresh-token",
          { refreshToken }
        );
        if (res.data.success) {
          localStorage.setItem("accessToken", res.data.data.accessToken);
          localStorage.setItem("refreshToken", res.data.data.refreshToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${res.data.data.accessToken}`;
          return axios(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Blogs API
const BASE_URL = "https://technacallcanadabackend-production.up.railway.app/api";

export const BLOGS_API = `${BASE_URL}/blogs`;

export const getBlogs = async () => {
  const res = await fetch(BLOGS_API);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  const data = await res.json();
  return data.data.blogs ?? [];
};

export const deleteBlog = async (id: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${BLOGS_API}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete blog");
  return data;
};

export const publishBlog = async (id: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${BLOGS_API}/${id}/publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to publish blog");
  return data;
};

export const unpublishBlog = async (id: string) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${BLOGS_API}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status: "DRAFT" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to unpublish blog");
  return data;
};
// Create a new blog
export const createBlog = async (formData: FormData, token: string) => {
  const res = await fetch(BLOGS_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error creating blog");
  return data.data.blog;
};

// Update an existing blog
export const updateBlog = async (id: string, formData: FormData, token: string) => {
  const res = await fetch(`${BLOGS_API}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error updating blog");
  return data.data.blog;
};

