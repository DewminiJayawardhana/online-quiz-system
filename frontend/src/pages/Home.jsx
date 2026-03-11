import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const nav = useNavigate();

  const categories = [
    { title: "Data Structures", desc: "Master arrays, linked lists, trees and graphs.", icon: "🏗️" },
    { title: "Algorithms", desc: "Solve complex problems with efficient logic.", icon: "⚡" },
    { title: "Databases", desc: "Learn SQL, NoSQL and data management.", icon: "🗄️" },
    { title: "Operating Systems", desc: "Understand kernels, threads and memory.", icon: "💻" },
    { title: "Computer Networks", desc: "Explore protocols, IP and connectivity.", icon: "🌐" },
    { title: "Software Engineering", desc: "SDLC, design patterns and architecture.", icon: "⚙️" },
    { title: "Web Development", desc: "Frontend, Backend and API technologies.", icon: "🚀" },
    { title: "Cyber Security", desc: "Defend systems against digital threats.", icon: "🛡️" },
    { title: "Artificial Intelligence", desc: "Machine learning and neural networks.", icon: "🤖" },
  ];

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
          <h1>Smart Quizzes for Modern Learners</h1>
          <p>
            The ultimate platform to test your knowledge in Computer Science. 
            Join thousands of students and challenge yourself today!
          </p>

          <div className="hp-heroBtns">
            <button className="hp-btn big" onClick={() => nav("/student/register")}>
              Get Started as Student 🚀
            </button>
            
          </div>
        </section>

        <h2 className="section-title">Explore Categories</h2>
        
        <section className="hp-cards">
          {categories.map((cat, index) => (
            <div className="hp-card" key={index}>
              <div className="card-icon">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="hp-footer">
        <p>© 2026 Online Quiz System. Built for Excellence.</p>
      </footer>
    </div>
  );
}
