import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      
      {/* Header */}
      <header className="home-header">
        <div className="logo">Online Quiz System</div>

        <button
          className="get-started-btn"
          onClick={() => navigate("/admin/login")}
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>
          Build, Manage & Conduct <span>Professional Online Quizzes</span>
        </h1>
        <p>
          Create quizzes, schedule exams, manage questions, and track results —
          all in one powerful platform.
        </p>

        <button
          className="hero-btn"
          onClick={() => navigate("/admin/login")}
        >
          Get Started
        </button>
      </section>

    </div>
  );
}