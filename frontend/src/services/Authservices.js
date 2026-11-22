import { api } from "./client";

export default function login({ username, password }) {
  const name = username.trim();
  return api.post(
    "accounts/login",
    /^\+?\d{10,15}$/.test(name)
      ? { phone: name, password }
      : { username: name, password },
  );
}
export const register = (data) => api.post("accounts/register", data);
export const updateProfile = (data) => api.patch("accounts/profileEdit", data);
