import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      setLoading(true);
      const res = await api.post("/api/admin-auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("oqs_admin_token", res.data.token);
      localStorage.setItem("oqs_admin_role", res.data.admin.role);
      localStorage.setItem("oqs_admin_email", res.data.admin.email);

      nav("/admin/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <form className="al-card" onSubmit={submit}>
        <h1 className="al-title">Admin Login</h1>
        <p className="al-sub">Login to access the Online Quiz System dashboard.</p>

        {err && <div className="al-error">{err}</div>}

        <label className="al-label">User Email</label>
        <input
          className="al-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mainadmin@oqs.com"
        />

        <label className="al-label">Password</label>
        <input
          className="al-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />

        <button className="al-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}