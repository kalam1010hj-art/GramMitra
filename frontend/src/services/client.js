import axios from "axios";

export const api = axios.create({
  baseURL:
    (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
      /\/+$/,
      "",
    ) + "/",
  timeout: 30000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !["accounts/login", "accounts/register"].includes(config.url)) {
    config.headers.Authorization = "Token " + token;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authorization = error.config?.headers?.Authorization;
    if (
      error.response?.status === 401 &&
      authorization &&
      authorization === "Token " + localStorage.getItem("token")
    ) {
      window.dispatchEvent(new Event("grammitra-session-ended"));
    }
    return Promise.reject(error);
  },
);

export function errorText(error) {
  const data = error.response?.data;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(
        ([key, value]) =>
          (key === "detail" ? "" : key.replaceAll("_", " ") + ": ") +
          String(value),
      )
      .join(" · ");
  }
  return "Could not reach GramMitra. Please try again.";
}
