import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api"; // <-- if your axios instance is in api.js, change to "../../api/api"
import "./ManageDraftQuizzes.css";

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

export default function ManageDraftQuizzes() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  const load = async (cat) => {
    setErr("");
    try {
      const res = await api.get("/api/draft-quizzes", { params: { category: cat } });
      setQuizzes(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load draft quizzes");
    }
  };

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory]);

  return (
    <div className="mdq-page">
      <div className="mdq-container">
        <div className="mdq-top">
          <h1 className="mdq-title">Manage Draft Quizzes</h1>
          <button className="mdq-back" type="button" onClick={() => nav("/admin/dashboard")}>
            ← Back
          </button>
        </div>

        <div className="mdq-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`mdq-cat ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {err && <div className="mdq-err">{err}</div>}

        <div className="mdq-list">
          {quizzes.length === 0 ? (
            <div className="mdq-empty">No draft quizzes under {activeCategory}.</div>
          ) : (
            quizzes.map((q) => (
              <button
                key={q.id}
                type="button"
                className="mdq-quiz"
                onClick={() => nav(`/admin/quizzes/drafts/${q.id}`)}
              >
                <div className="mdq-quizNo">{q.quizNo}</div>
                <div className="mdq-meta">
                  <span>Status: {q.status}</span>
                  <span>
                    Approvals: {q.contentCompleted ? "✅" : "⬜"} content •{" "}
                    {q.scheduleVerified ? "✅" : "⬜"} schedule
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}