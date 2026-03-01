import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api"; // change to ../../api/axios if needed
import "./FinalizeQuizzes.css";

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

export default function FinalizeQuizzes() {
  const nav = useNavigate();
  const [tab, setTab] = useState("NEW"); // NEW | PUBLISHED
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const url =
        tab === "NEW"
          ? "/api/finalize-quizzes/new"
          : "/api/finalize-quizzes/published";

      const res = await api.get(url, { params: { category: activeCategory } });
      setQuizzes(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quizzes");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [tab, activeCategory]);

  return (
    <div className="fz-page">
      <div className="fz-container">
        <div className="fz-top">
          <h1 className="fz-title">Finalize Quizzes (Main Admin)</h1>
          <button className="fz-back" type="button" onClick={() => nav("/admin/dashboard")}>
            ← Back
          </button>
        </div>

        <div className="fz-tabs">
          <button
            type="button"
            className={`fz-tab ${tab === "NEW" ? "active" : ""}`}
            onClick={() => setTab("NEW")}
          >
            New Quizzes
          </button>
          <button
            type="button"
            className={`fz-tab ${tab === "PUBLISHED" ? "active" : ""}`}
            onClick={() => setTab("PUBLISHED")}
          >
            Published Quizzes
          </button>
        </div>

        <div className="fz-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`fz-cat ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {err && <div className="fz-err">{err}</div>}

        <div className="fz-list">
          {quizzes.length === 0 ? (
            <div className="fz-empty">
              No {tab === "NEW" ? "new" : "published"} quizzes under {activeCategory}.
            </div>
          ) : (
            quizzes.map((q) => (
              <button
                key={q.id}
                type="button"
                className="fz-item"
                onClick={() => nav(`/admin/quizzes/finalize/${q.id}?tab=${tab}`)}
              >
                <div className="fz-quizNo">{q.quizNo}</div>
                <div className="fz-meta">
                  <span>Status: {q.status}</span>
                  {q.publishedAt && <span>Published: {new Date(q.publishedAt).toLocaleString()}</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}