import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./FinalizedQuizzes.css";

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

export default function FinalizedQuizzes() {
  const nav = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  const load = async (cat) => {
    setErr("");
    try {
      const res = await api.get("/api/draft-quizzes/ready", { params: { category: cat } });
      setQuizzes(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load finalized quizzes");
    }
  };

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory]);

  return (
    <div className="fq-page">
      <div className="fq-container">
        <div className="fq-top">
          <h1 className="fq-title">Finalized Quizzes (Ready)</h1>
          <button className="fq-back" type="button" onClick={() => nav("/admin/dashboard")}>
            ← Back
          </button>
        </div>

        <div className="fq-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`fq-cat ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {err && <div className="fq-err">{err}</div>}

        <div className="fq-list">
          {quizzes.length === 0 ? (
            <div className="fq-empty">No finalized quizzes under {activeCategory}.</div>
          ) : (
            quizzes.map((q) => (
              <div key={q.id} className="fq-item">
                <div className="fq-no">{q.quizNo}</div>
                <div className="fq-meta">
                  <span>Category: {q.category}</span>
                  <span>Approvals: ✅ content • ✅ schedule</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}