import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("oqs_admin_role");
  const email = localStorage.getItem("oqs_admin_email");

  const handleLogout = () => {
    localStorage.removeItem("oqs_admin_token");
    localStorage.removeItem("oqs_admin_role");
    localStorage.removeItem("oqs_admin_email");
    navigate("/admin/login");
  };

  const canCreateSchedule = role === "SCHEDULE_ADMIN";

  const cards = [
    {
      key: "create",
      title: "Create & Schedule Quiz",
      desc: "Create a new quiz and configure title, duration, availability window, and schedule settings.",
      action: () => navigate("/admin/quizzes/create"),
      disabled: !canCreateSchedule,
      hint: !canCreateSchedule ? "Only Schedule Admin can access this section." : "",
    },
    {
      key: "scheduled",
      title: "Manage Scheduled Quizzes (Add Questions)",
      desc: "View scheduled quizzes that are incomplete and add or edit questions.",
      action: () => navigate("/admin/quizzes/scheduled"),
      disabled: false,
    },
    {
      key: "drafts",
      title: "Manage Draft Quizzes",
      desc: "Access quizzes saved as drafts for editing before scheduling or publishing.",
      action: () => navigate("/admin/quizzes/drafts"),
      disabled: false,
    },
    {
      key: "finalized",
      title: "Finalized Quizzes – Ready for Submission",
      desc: "Review completed quizzes that are fully prepared and ready for publishing or submission.",
      action: () => navigate("/admin/quizzes/finalized"),
      disabled: false,
    },
  ];

  return (
    <div className="ad-page">
      <div className="ad-container">
        <header className="ad-header">
          <div>
            <h1 className="ad-title">Admin Dashboard</h1>
            <p className="ad-subtitle">
              Logged in as: <strong>{email}</strong> — Role: <strong>{role}</strong>
            </p>
          </div>

          <button className="ad-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="ad-grid">
          {cards.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`ad-card ${c.disabled ? "ad-card-disabled" : ""}`}
              onClick={() => !c.disabled && c.action()}
              disabled={c.disabled}
              title={c.hint || ""}
            >
              <h2 className="ad-card-title">{c.title}</h2>
              <p className="ad-card-desc">{c.desc}</p>
              {c.disabled && <div className="ad-lock-hint">{c.hint}</div>}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}