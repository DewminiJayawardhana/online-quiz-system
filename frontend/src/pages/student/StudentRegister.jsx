import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentRegister.css";

const STUDENTS_KEY = "oqs_students";

export default function StudentRegister() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr(""); setOk("");

    const n = name.trim();
    const em = email.trim().toLowerCase();
    const pw = password;

    if (n.length < 2) return setErr("Name is too short.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");

    const students = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]");

    if (students.some((s) => s.email.toLowerCase() === em)) {
      return setErr("This email is already registered.");
    }

    students.push({ name: n, email: em, password: pw });
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    setOk("Registration successful! Please login.");
    setTimeout(() => nav("/login"), 600);
  };

  return (
    <div className="sr-page">
      <div className="sr-card">
        <h1 className="sr-title">Get Started 🚀</h1>
        <p className="sr-sub">Create your student account</p>

        {err && <div className="sr-err">{err}</div>}
        {ok && <div className="sr-ok">{ok}</div>}

        <form onSubmit={submit} className="sr-form">
          <label className="sr-label">Student Name</label>
          <input className="sr-input" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="sr-label">Email</label>
          <input className="sr-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label className="sr-label">Password</label>
          <input className="sr-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          <button className="sr-btn" type="submit">Register</button>
        </form>

        <div className="sr-links">
          <button className="sr-link" type="button" onClick={() => nav("/login")}>Already have an account? Login</button>
          <button className="sr-link" type="button" onClick={() => nav("/")}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}