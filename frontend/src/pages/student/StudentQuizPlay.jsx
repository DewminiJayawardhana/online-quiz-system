import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./StudentQuizPlay.css";

const attemptKey = (quizId) => `oqs_attempt_${quizId}`;
const attemptsListKey = "oqs_attempts_list";
const startKey = (quizId) => `oqs_quiz_start_${quizId}`;

const pad2 = (n) => String(n).padStart(2, "0");
const formatTime = (sec) => {
  const s = Math.max(0, Number(sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
};

export default function StudentQuizPlay() {
  const { id: quizId } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({}); // {questionId: selectedIndex}
  const [submitted, setSubmitted] = useState(false);

  const [result, setResult] = useState(null); // {score,total,passed,correctCount}
  const [correctMap, setCorrectMap] = useState({}); // {questionId: correctIndex}

  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // ===== Load quiz + existing attempt =====
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await api.get(`/api/student/quizzes/${quizId}`);
        const qz = res.data.quiz;
        const qs = res.data.questions || [];

        setQuiz(qz);
        setQuestions(qs);

        // If already attempted -> lock and show old
        const saved = localStorage.getItem(attemptKey(quizId));
        if (saved) {
          const attempt = JSON.parse(saved);
          setAnswers(attempt.answers || {});
          setSubmitted(true);
          setResult(attempt.result || null);
          setCorrectMap(attempt.correctMap || {});
          setSecondsLeft(0);
          return;
        }

        // Timer init (persist start time so refresh doesn't reset)
        const limitSeconds = Math.max(1, Number(qz?.timeLimitMinutes || 0) * 60);
        let startIso = localStorage.getItem(startKey(quizId));
        if (!startIso) {
          startIso = new Date().toISOString();
          localStorage.setItem(startKey(quizId), startIso);
        }

        const startedAt = new Date(startIso).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startedAt) / 1000);
        const left = Math.max(0, limitSeconds - elapsed);
        setSecondsLeft(left);
      } catch (e2) {
        setErr(e2?.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [quizId]);

  // ===== Timer tick =====
  useEffect(() => {
    if (submitted) return;
    if (!quiz) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, quiz]);

  // ===== Auto submit when time is up =====
  useEffect(() => {
    if (submitted) return;
    if (!quiz) return;
    if (secondsLeft === 0 && questions.length > 0) {
      doSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, submitted, quiz, questions.length]);

  const missingCount = useMemo(() => {
    if (!questions?.length) return 0;
    let miss = 0;
    for (const q of questions) {
      if (answers[q.id] === undefined) miss++;
    }
    return miss;
  }, [questions, answers]);

  const select = (qId, index) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  // ===== Submit (manual or auto) =====
  const doSubmit = (auto = false) => {
    if (submitted) return;

    // manual submit requires all answers
    if (!auto && missingCount > 0) {
      alert(`Answer all questions! Missing: ${missingCount}`);
      return;
    }

    let score = 0;
    let total = 0;
    let correctCount = 0;

    const cm = {};

    for (const q of questions) {
      const marks = Number(q.marks || 1);
      total += marks;

      const correctIndex = q.correctIndex; // must exist
      cm[q.id] = correctIndex;

      const selected = answers[q.id];
      const isCorrect = selected !== undefined && selected === correctIndex;

      if (isCorrect) {
        score += marks;
        correctCount += 1;
      }
    }

    const passingMark = Number(quiz?.passingMark ?? 0);
    const passed = score >= passingMark;

    const resObj = { score, total, correctCount, passed };

    setSubmitted(true);
    setResult(resObj);
    setCorrectMap(cm);

    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(startKey(quizId));

    const attemptData = {
      quizId,
      quizNo: quiz.quizNo,
      category: quiz.category,
      submittedAt: new Date().toISOString(),
      autoSubmitted: auto,
      answers,
      result: resObj,
      correctMap: cm,
    };

    localStorage.setItem(attemptKey(quizId), JSON.stringify(attemptData));

    const prev = JSON.parse(localStorage.getItem(attemptsListKey) || "[]");
    const filtered = prev.filter((a) => a.quizId !== quizId);
    filtered.push(attemptData);
    localStorage.setItem(attemptsListKey, JSON.stringify(filtered));
  };

  const submit = () => doSubmit(false);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;
  if (!quiz) return <div style={{ padding: 24 }}>Quiz not found</div>;

  const timerDanger = !submitted && secondsLeft <= 30;

  return (
    <div className="sq-page">
      <div className="sq-wrap">
        {/* ===== Top bar ===== */}
        <div className="sq-topbar">
          <button className="sq-back" type="button" onClick={() => nav("/student")}>
            ← Back
          </button>

          <div className="sq-titleBox">
            <div className="sq-title">{quiz.quizNo}</div>
            <div className="sq-sub">
              {quiz.category} • {quiz.timeLimitMinutes} min • Passing {quiz.passingMark}
            </div>
          </div>

          {!submitted && (
            <div className={`sq-timer ${timerDanger ? "danger" : ""}`}>
              ⏱ {formatTime(secondsLeft)}
            </div>
          )}

          {submitted && result && (
            <div className={`sq-scoreChip ${result.passed ? "pass" : "fail"}`}>
              {result.passed ? "✅ PASS" : "❌ FAIL"} — {result.score}/{result.total}
            </div>
          )}
        </div>

        {/* ===== Submitted summary ===== */}
        {submitted && result && (
          <div className="sq-card" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 1000, fontSize: 18 }}>🎉 Submitted!</div>
            <div style={{ marginTop: 8, fontWeight: 900, opacity: 0.9 }}>
              Marks: <b>{result.score}</b> / {result.total} • Correct:{" "}
              <b>{result.correctCount}</b> / {questions.length}
            </div>
            <div className="sq-lock" style={{ marginTop: 10 }}>
              This quiz is locked. You can only review now.
            </div>
          </div>
        )}

        {/* ===== Questions ===== */}
        <div className="sq-card">
          {questions.map((q, idx) => {
            const selected = answers[q.id];
            const correctIndex = correctMap[q.id];

            const options = (q.options || []).map((op) =>
              typeof op === "string" ? op : op?.text
            );

            return (
              <div key={q.id} className="sq-q">
                <div className="sq-qHead">
                  <div className="sq-qNo">Q{idx + 1}</div>
                  <div className="sq-qText">{q.text}</div>
                </div>

                <div className="sq-opts">
                  {options.map((optText, i) => {
                    const isSelected = selected === i;

                    // ✅ AFTER SUBMIT:
                    // - correct option ALWAYS green
                    // - student wrong selection red
                    const showCorrect = submitted && correctIndex === i;
                    const showWrong = submitted && isSelected && correctIndex !== i;

                    const cls = [
                      "sq-opt",
                      !submitted && isSelected ? "selected" : "",
                      showCorrect ? "correct" : "",
                      showWrong ? "wrong" : "",
                    ].join(" ");

                    return (
                      <button
                        key={i}
                        type="button"
                        className={cls}
                        onClick={() => select(q.id, i)}
                        disabled={submitted}
                      >
                        <div className="sq-optBadge">{String.fromCharCode(65 + i)}</div>

                        <div style={{ flex: 1 }}>
                          {optText}

                          {submitted && showCorrect && (
                            <div style={{ marginTop: 6, fontWeight: 900, color: "#166534" }}>
                              ✅ Correct Answer
                            </div>
                          )}

                          {submitted && showWrong && (
                            <div style={{ marginTop: 6, fontWeight: 900, color: "#9f1239" }}>
                              ❌ Your Answer
                            </div>
                          )}
                        </div>

                        {submitted && showCorrect && <div style={{ fontWeight: 1000 }}>✅</div>}
                        {submitted && showWrong && <div style={{ fontWeight: 1000 }}>❌</div>}
                      </button>
                    );
                  })}
                </div>

                {/* ✅ Show correct answer letter always after submit */}
                {submitted && correctIndex !== undefined && (
                  <div className="sq-lock">
                    Correct Answer: <b>{String.fromCharCode(65 + correctIndex)}</b>
                    {selected !== undefined && selected !== correctIndex ? (
                      <>
                        {" "}
                        • Your Answer: <b>{String.fromCharCode(65 + selected)}</b>
                      </>
                    ) : null}
                  </div>
                )}

                {!submitted && answers[q.id] === undefined && (
                  <div className="sq-lock">Pick an answer to continue 🙂</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== Actions ===== */}
        <div className="sq-actions">
          <button className="sq-submit" type="button" onClick={submit} disabled={submitted}>
            {submitted ? "Submitted ✅" : "Submit Answers ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}