
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./StudentHome.css";

const ATTEMPTS_KEY = "oqs_attempts_list";

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

function loadAttempts() {
  return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
}

export default function StudentHome() {
  const nav = useNavigate();

  const studentName = localStorage.getItem("oqs_student_name") || "Student";
  const [activeCategory, setActiveCategory] = useState("Algorithms");
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);

  // ✅ logout
  const logout = () => {
    // remove student session
    localStorage.removeItem("oqs_student_name");
    localStorage.removeItem("oqs_student_email");
    localStorage.removeItem("oqs_student_token"); // if you use this
    // don't clear attempts unless you want to reset progress:
    // localStorage.removeItem(ATTEMPTS_KEY);

    nav("/"); // go to main home page
  };

  // ✅ load attempts once
  useEffect(() => {
    setAttempts(loadAttempts());
  }, []);

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
    CATEGORIES.forEach((c) => (map[c.key] = { passed: [], failed: [] }));

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
    setAttempts(loadAttempts());
  };

  return (
    <div className="st-page">
      {/* ===== Top Header ===== */}
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

        {/* ===== Big Progress Cards ===== */}
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

      {/* ===== Category selector ===== */}
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

      {/* ===== Main content ===== */}
      <div className="st-contentGrid">
        {/* Published quizzes */}
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

        {/* Passed / Failed lists */}
        <div className="st-panel">
          <div className="st-panelHeader">
            <h2 className="st-panelTitle">📌 Your Results</h2>
            <span className="st-pill">{activeCategory}</span>
          </div>

          <div className="st-resultsGrid">
            {/* PASSED */}
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

            {/* FAILED */}
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
/*import React, { useEffect, useState } from "react";
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
}*/