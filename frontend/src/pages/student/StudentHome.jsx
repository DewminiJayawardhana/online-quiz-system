import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api"; // change to ../../api/axios if needed
import "./StudentHome.css";

const CATEGORIES = [
  "Data Structures",
  "Algorithms",
  "Databases",
  "Operating Systems",
  "Computer Networks",
  "Software Engineering",
  "Web Development",
  "Cyber Security",
  "Artificial Intelligence",
];

const EMOJI = {
  "Data Structures": "🧱",
  "Algorithms": "🧠",
  "Databases": "🗄️",
  "Operating Systems": "🖥️",
  "Computer Networks": "🌐",
  "Software Engineering": "🛠️",
  "Web Development": "🕸️",
  "Cyber Security": "🛡️",
  "Artificial Intelligence": "🤖",
};

export default function StudentHome() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  const load = async (cat) => {
    setErr("");
    try {
      const res = await api.get("/api/student/quizzes", { params: { category: cat } });
      setQuizzes(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quizzes");
    }
  };

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory]);

  return (
    <div className="st-page">
      <div className="st-topbar">
        <div className="st-brand">
          <div className="st-logo">🎉</div>
          <div>
            <div className="st-title">Student Quiz Zone</div>
            <div className="st-sub">Pick a category and start playing!</div>
          </div>
        </div>

        <button className="st-adminBtn" type="button" onClick={() => nav("/admin/login")}>
          Admin Login
        </button>
      </div>

      <div className="st-shell">
        <div className="st-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`st-cat ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              <span className="st-emoji">{EMOJI[c]}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>

        {err && <div className="st-err">{err}</div>}

        <div className="st-grid">
          {quizzes.length === 0 ? (
            <div className="st-empty">
              No published quizzes in <strong>{activeCategory}</strong> yet. Check again soon! ✨
            </div>
          ) : (
            quizzes.map((q) => (
              <div className="st-card" key={q.id}>
                <div className="st-cardTop">
                  <div className="st-cardNo">{q.quizNo}</div>
                  <div className="st-chip">{EMOJI[q.category]} {q.category}</div>
                </div>

                <div className="st-meta">
                  <div>⏱️ {q.timeLimitMinutes} min</div>
                  <div>❓ {q.noOfQuestions} questions</div>
                  <div>🏅 {q.totalMarks} marks</div>
                </div>

                <button className="st-play" type="button" onClick={() => nav(`/student/quizzes/${q.id}`)}>
                  Start Quiz 🚀
                </button>
              </div>
            ))
          )}
        </div>

        <div className="st-footer">
          Tip: Choose carefully! You can submit when finished ⭐
        </div>
      </div>
    </div>
  );
}