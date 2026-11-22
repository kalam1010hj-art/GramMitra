import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorText } from "../services/client";
import s from "../modules/Workspace.module.css";

export default function AccountPassword() {
  const navigate = useNavigate(),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    try {
      await api.post(
        "accounts/password",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      window.dispatchEvent(new Event("grammitra-session-ended"));
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorText(err));
    }
  }
  return (
    <main className={s.page}>
      <h1>Change password</h1>
      <p>Sign in again after saving your new password.</p>
      <form onSubmit={submit} className={s.panel}>
        <label>
          Current password
          <input
            type="password"
            name="old_password"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            name="new_password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button>Change password</button>
      </form>
    </main>
  );
}
