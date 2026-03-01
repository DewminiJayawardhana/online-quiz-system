import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./ManageScheduledQuizzes.css";

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

export default function ManageScheduledQuizzes() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  const load = async (cat) => {
    setErr("");
    try {
      const res = await api.get("/api/quizzes/scheduled", { params: { category: cat } });
      setQuizzes(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load scheduled quizzes");
    }
  };

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory]);

  return (
    <div className="msq-page">
      <div className="msq-container">
        <div className="msq-top">
          <h1 className="msq-title">Manage Scheduled Quizzes (Add Questions)</h1>
          <button className="msq-back" onClick={() => nav("/admin/dashboard")}>← Back</button>
        </div>

        <div className="msq-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`msq-cat ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        {err && <div className="msq-err">{err}</div>}

        <div className="msq-list">
          {quizzes.length === 0 ? (
            <div className="msq-empty">No scheduled quizzes under {activeCategory}.</div>
          ) : (
            quizzes.map((q) => (
              <button
                key={q.id}
                className="msq-quiz"
                onClick={() => nav(`/admin/quizzes/scheduled/${q.id}`)}
                type="button"
              >
                {q.quizNo}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}