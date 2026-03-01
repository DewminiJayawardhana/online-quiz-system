import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="hp-page">
      <header className="hp-header">
        <div className="hp-brand">
          <div className="hp-logo">🧠</div>
          <div>
            <div className="hp-title">Online Quiz System</div>
            <div className="hp-sub">Learn • Practice • Win 🎉</div>
          </div>
        </div>

        <div className="hp-actions">
          <button className="hp-btn ghost" onClick={() => nav("/login")}>
            Sign In
          </button>
          <button className="hp-btn" onClick={() => nav("/student/register")}>
            Get Started
          </button>
        </div>
      </header>

      <main className="hp-main">
        <section className="hp-hero">
          <h1>Smart Quizzes for Students & Admins</h1>
          <p>
            Students can join, pick a category, and attempt published quizzes.
            Admins can schedule, draft, finalize, and publish quizzes.
          </p>

          <div className="hp-heroBtns">
            <button className="hp-btn big" onClick={() => nav("/student/register")}>
              Get Started as Student 🚀
            </button>
            <button className="hp-btn ghost big" onClick={() => nav("/login")}>
              Sign In 🔐
            </button>
          </div>
        </section>

        <section className="hp-cards">
          <div className="hp-card">
            <h3>📚 Categories</h3>
            <p>Algorithms, Databases, OS, Networks, Cyber Security, AI and more.</p>
          </div>
          <div className="hp-card">
            <h3>📝 MCQ Quizzes</h3>
            <p>Multiple choice questions with time limit and marks.</p>
          </div>
          <div className="hp-card">
            <h3>✅ Admin Workflow</h3>
            <p>Scheduled → Draft → Finalized → Published to Students.</p>
          </div>
        </section>
      </main>
    </div>
  );
}