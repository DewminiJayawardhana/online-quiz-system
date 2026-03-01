import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api"; // adjust if needed
import "./StudentQuizPlay.css";

export default function StudentQuizPlay() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState({}); // {questionId: optionIndex}
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const res = await api.get(`/api/student/quizzes/${id}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quiz");
    }
  };

  useEffect(() => { load(); }, [id]);

  const quiz = data?.quiz;
  const questions = data?.questions || [];

  const total = questions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  const choose = (qid, idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const submit = () => {
    if (answeredCount !== total) {
      alert(`Please answer all questions! (${answeredCount}/${total})`);
      return;
    }
    setSubmitted(true);
    // Later: send to backend for scoring
  };

  if (!data && !err) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="sp-page">
      <div className="sp-top">
        <button className="sp-back" type="button" onClick={() => nav("/student")}>
          ← Back
        </button>

        <div className="sp-head">
          <div className="sp-title">🧩 {quiz?.quizNo}</div>
          <div className="sp-sub">
            {quiz?.category} • ⏱️ {quiz?.timeLimitMinutes} min • 🏅 {quiz?.totalMarks} marks
          </div>
        </div>

        <div className="sp-badge">{submitted ? "✅ Submitted" : "🎯 In Progress"}</div>
      </div>

      {err && <div className="sp-err">{err}</div>}

      <div className="sp-progressWrap">
        <div className="sp-progressBar">
          <div className="sp-progressFill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sp-progressText">
          {answeredCount}/{total} answered • {progress}%
        </div>
      </div>

      <div className="sp-list">
        {questions.map((q, idx) => (
          <div key={q.id} className="sp-qCard">
            <div className="sp-qTitle">
              <span className="sp-qNo">Q{idx + 1}</span> {q.text}
            </div>

            <div className="sp-options">
              {(q.options || []).map((op, i) => {
                const picked = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`sp-opt ${picked ? "picked" : ""}`}
                    onClick={() => choose(q.id, i)}
                    disabled={submitted}
                  >
                    <span className="sp-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="sp-opText">{op.text}</span>
                    {picked && <span className="sp-star">⭐</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sp-actions">
        <button className="sp-submit" type="button" onClick={submit} disabled={submitted || total === 0}>
          Submit Answers ✅
        </button>
      </div>

      {submitted && (
        <div className="sp-done">
          🎉 Great job! Your answers were submitted. (Next: we’ll add scoring + results!)
        </div>
      )}
    </div>
  );
}