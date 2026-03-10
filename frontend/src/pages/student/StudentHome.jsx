import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./StudentHome.css";

const CATEGORIES = [
  { key: "Data Structures", icon: "🧱" },
  { key: "Algorithms", icon: "🧠" },
  { key: "Databases", icon: "🗄️" },
  { key: "Operating Systems", icon: "🖥️" },
  { key: "Computer Networks", icon: "🌐" },
  { key: "Software Engineering", icon: "🛠️" },
  { key: "Web Development", icon: "🕸️" },
  { key: "Cyber Security", icon: "🛡️" },
  { key: "Artificial Intelligence", icon: "🤖" },
];

// ✅ email-based attempts loader
function loadAttempts(email) {
  if (!email) return [];
  const key = `oqs_${email}_attempts_list`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

export default function StudentHome() {
  const nav = useNavigate();

  const studentEmail = localStorage.getItem("oqs_student_email");
  const studentName = localStorage.getItem("oqs_student_name") || "Student";

  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const logout = () => {
    localStorage.removeItem("oqs_student_name");
    localStorage.removeItem("oqs_student_email");
    localStorage.removeItem("oqs_student_token");
    nav("/");
  };

  // ✅ load attempts using student email
  useEffect(() => {
    setAttempts(loadAttempts(studentEmail));
  }, [studentEmail]);

  // ✅ load published quizzes for selected category
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/student/quizzes", {
          params: { category: activeCategory },
        });
        setPublishedQuizzes(res.data || []);
      } catch {
        setPublishedQuizzes([]);
      }
    };
    load();
  }, [activeCategory]);

  // ✅ compute progress
  const progress = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => {
      map[c.key] = { passed: [], failed: [] };
    });

    for (const a of attempts) {
      const cat = a.category;
      if (!map[cat]) map[cat] = { passed: [], failed: [] };

      if (a?.result?.passed) map[cat].passed.push(a);
      else map[cat].failed.push(a);
    }

    const totalAttempts = attempts.length;
    const totalPassed = attempts.filter((a) => a?.result?.passed).length;
    const totalFailed = totalAttempts - totalPassed;

    return { map, totalAttempts, totalPassed, totalFailed };
  }, [attempts]);

  const catProgress = progress.map[activeCategory] || { passed: [], failed: [] };

  const refreshProgress = () => {
    setAttempts(loadAttempts(studentEmail));
  };

  return (
    <div className="st-page">
      <div className="st-hero">
        <div className="st-heroLeft">
          <div className="st-badge">🎉 Student Quiz Zone</div>
          <h1 className="st-title">
            Hi, <span className="st-name">{studentName}</span> 👋
          </h1>
          <p className="st-subtitle">
            Choose a category, play quizzes, and improve every day!
          </p>

          <div className="st-heroBtns">
            <button className="st-btn ghost" onClick={refreshProgress} type="button">
              🔄 Refresh Progress
            </button>

            <button className="st-btn" onClick={logout} type="button">
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="st-stats">
          <div className="st-statCard">
            <div className="st-statEmoji">🏆</div>
            <div>
              <div className="st-statNum">{progress.totalPassed}</div>
              <div className="st-statLabel">Passed</div>
            </div>
          </div>

          <div className="st-statCard">
            <div className="st-statEmoji">❌</div>
            <div>
              <div className="st-statNum">{progress.totalFailed}</div>
              <div className="st-statLabel">Failed</div>
            </div>
          </div>

          <div className="st-statCard">
            <div className="st-statEmoji">📝</div>
            <div>
              <div className="st-statNum">{progress.totalAttempts}</div>
              <div className="st-statLabel">Attempts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="st-sectionTitle">📚 Categories</div>

      <div className="st-catsGrid">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`st-catCard ${activeCategory === c.key ? "active" : ""}`}
            onClick={() => setActiveCategory(c.key)}
            type="button"
          >
            <div className="st-catIcon">{c.icon}</div>
            <div className="st-catName">{c.key}</div>
            <div className="st-catMini">
              ✅ {progress.map[c.key]?.passed?.length || 0} | ❌{" "}
              {progress.map[c.key]?.failed?.length || 0}
            </div>
          </button>
        ))}
      </div>

      <div className="st-contentGrid">
        <div className="st-panel">
          <div className="st-panelHeader">
            <h2 className="st-panelTitle">🚀 Quizzes to Play</h2>
            <span className="st-pill">{activeCategory}</span>
          </div>

          {publishedQuizzes.length === 0 ? (
            <div className="st-empty">
              No quizzes published in <b>{activeCategory}</b> yet.
            </div>
          ) : (
            <div className="st-quizList">
              {publishedQuizzes.map((q) => (
                <div key={q.id} className="st-quizCard">
                  <div className="st-quizTop">
                    <div className="st-quizNo">{q.quizNo}</div>
                    <div className="st-quizTag">{q.category}</div>
                  </div>

                  <div className="st-quizMeta">
                    ⏱ {q.timeLimitMinutes} min • ❓ {q.noOfQuestions} Qs • 🏅{" "}
                    {q.totalMarks} marks
                  </div>

                  <button
                    className="st-startBtn"
                    onClick={() => nav(`/student/quizzes/${q.id}`)}
                    type="button"
                  >
                    Start Quiz 🚀
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="st-panel">
          <div className="st-panelHeader">
            <h2 className="st-panelTitle">📌 Your Results</h2>
            <span className="st-pill">{activeCategory}</span>
          </div>

          <div className="st-resultsGrid">
            <div className="st-resultBox pass">
              <div className="st-resultTitle">✅ Passed Quizzes</div>
              {catProgress.passed.length === 0 ? (
                <div className="st-emptyMini">No passed quizzes here yet 😄</div>
              ) : (
                catProgress.passed
                  .slice()
                  .reverse()
                  .map((a) => (
                    <div key={a.quizId} className="st-resultRow">
                      <span className="st-rQuiz">{a.quizNo}</span>
                      <span className="st-rScore">
                        {a.result.score}/{a.result.total}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="st-resultBox fail">
              <div className="st-resultTitle">❌ Failed Quizzes</div>
              {catProgress.failed.length === 0 ? (
                <div className="st-emptyMini">No failed quizzes 🎉 Great!</div>
              ) : (
                catProgress.failed
                  .slice()
                  .reverse()
                  .map((a) => (
                    <div key={a.quizId} className="st-resultRow">
                      <span className="st-rQuiz">{a.quizNo}</span>
                      <span className="st-rScore">
                        {a.result.score}/{a.result.total}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="st-tip">
            ⭐ Tip: Try again later — practice makes perfect!
          </div>
        </div>
      </div>
    </div>
  );
}