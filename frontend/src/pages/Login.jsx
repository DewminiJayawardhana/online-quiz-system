import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ADMIN_ACCOUNTS = [
  { email: "mainadmin@oqs.com", password: "main@admin123", role: "MAIN_ADMIN" },
  { email: "sheduleadmin@oqs.com", password: "shedule@admin123", role: "SCHEDULE_ADMIN" },
  { email: "quizeadmin@oqs.com", password: "quize@admin123", role: "QUIZ_ADMIN" },
];

const STUDENTS_KEY = "oqs_students"; // [{name,email,password}]

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    const e1 = email.trim().toLowerCase();
    const p1 = password;

    // ✅ Admin check
    const admin = ADMIN_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === e1 && a.password === p1
    );

    if (admin) {
      localStorage.setItem("oqs_admin_token", "demo-token");
      localStorage.setItem("oqs_admin_email", admin.email);
      localStorage.setItem("oqs_admin_role", admin.role);
      nav("/admin/dashboard");
      return;
    }

    // ✅ Student check
    const students = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]");
    const student = students.find(
      (s) => s.email.toLowerCase() === e1 && s.password === p1
    );

    if (student) {
      localStorage.setItem("oqs_student_email", student.email);
      localStorage.setItem("oqs_student_name", student.name);
      nav("/student");
      return;
    }

    setErr("Invalid email or password.");
  };

  return (
    <div className="lg-page">
      <div className="lg-card">
        <h1 className="lg-title">Sign In 🔐</h1>
        <p className="lg-sub">Login as Student or Admin</p>

        {err && <div className="lg-err">{err}</div>}

        <form onSubmit={submit} className="lg-form">
          <label className="lg-label">Email</label>
          <input
            className="lg-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            type="email"
            required
          />

          <label className="lg-label">Password</label>
          <input
            className="lg-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            required
          />

          <button className="lg-btn" type="submit">
            Login
          </button>
        </form>

        <div className="lg-links">
          <button className="lg-link" type="button" onClick={() => nav("/student/register")}>
            New student? Register 🚀
          </button>
          <button className="lg-link" type="button" onClick={() => nav("/")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}