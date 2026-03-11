import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import "./StudentQuizPlay.css";

// ✅ Email-based keys
const getStudentEmail = () => localStorage.getItem("oqs_student_email") || "guest";
const getStudentName = () => localStorage.getItem("oqs_student_name") || "Guest";

const attemptKey = (quizId) => `oqs_${getStudentEmail()}_attempt_${quizId}`;
const attemptsListKey = () => `oqs_${getStudentEmail()}_attempts_list`;
const startKey = (quizId) => `oqs_${getStudentEmail()}_quiz_start_${quizId}`;

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
  const email = getStudentEmail();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [result, setResult] = useState(null);
  const [correctMap, setCorrectMap] = useState({});

  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

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
  }, [quizId, email]);

  useEffect(() => {
    if (submitted || !quiz) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [submitted, quiz]);

  useEffect(() => {
    if (!submitted && quiz && secondsLeft === 0 && questions.length > 0) {
      doSubmit(true);
    }
  }, [secondsLeft]);

  const missingCount = useMemo(() => {
    if (!questions?.length) return 0;
    return questions.filter((q) => answers[q.id] === undefined).length;
  }, [questions, answers]);

  const select = (qId, index) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  const doSubmit = async (auto = false) => {
    if (submitted) return;

    if (!auto && missingCount > 0) {
      alert(`Please answer all questions! Missing: ${missingCount}`);
      return;
    }

    const submissionData = {};
    questions.forEach((q) => {
      const selectedIdx = answers[q.id];
      const options = (q.options || []).map((op) =>
        typeof op === "string" ? op : op?.text
      );
      submissionData[q.id] =
        selectedIdx !== undefined ? options[selectedIdx] : null;
    });

    try {
      setLoading(true);

      const studentEmail = getStudentEmail();
      const studentName = getStudentName();

      const res = await api.post(
        `/api/student/quizzes/${quizId}/submit?email=${studentEmail}&name=${studentName}`,
        submissionData
      );

      const serverResult = res.data;

      const cmIdx = {};
      questions.forEach((q) => {
        const options = (q.options || []).map((op) =>
          typeof op === "string" ? op : op?.text
        );
        const correctText = serverResult.correctMap?.[q.id];
        cmIdx[q.id] = options.indexOf(correctText);
      });

      const resObj = {
        score: serverResult.score,
        total: serverResult.total,
        correctCount: serverResult.correctCount,
        passed: serverResult.passed,
      };

      setSubmitted(true);
      setResult(resObj);
      setCorrectMap(cmIdx);

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
        correctMap: cmIdx,
      };

      localStorage.setItem(attemptKey(quizId), JSON.stringify(attemptData));

      const listKey = attemptsListKey();
      const prev = JSON.parse(localStorage.getItem(listKey) || "[]");

      localStorage.setItem(
        listKey,
        JSON.stringify([...prev.filter((a) => a.quizId !== quizId), attemptData])
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Submission failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quiz) return <div className="p-10">Loading quiz data...</div>;
  if (err) return <div className="p-10 text-red-500">{err}</div>;

  return (
    <div className="sq-page">
      <div className="sq-wrap">
        <div className="sq-topbar">
          <button className="sq-back" onClick={() => nav("/student")}>
            ← Back
          </button>

          <div className="sq-titleBox">
            <div className="sq-title">{quiz?.quizNo}</div>
            <div className="sq-sub">
              {quiz?.category} • {quiz?.timeLimitMinutes} min
            </div>
          </div>

          {!submitted ? (
            <div className={`sq-timer ${secondsLeft <= 30 ? "danger" : ""}`}>
              ⏱ {formatTime(secondsLeft)}
            </div>
          ) : (
            <div className={`sq-scoreChip ${result?.passed ? "pass" : "fail"}`}>
              {result?.passed ? "✅ PASS" : "❌ FAIL"} — {result?.score}/{result?.total}
            </div>
          )}
        </div>

        {submitted && (
          <div className="sq-card result-summary">
            <h3>🎉 Result Summary</h3>
            <p>
              Score: <b>{result?.score}</b> / {result?.total}
            </p>
            <p>
              Correct Questions: <b>{result?.correctCount}</b> / {questions.length}
            </p>
          </div>
        )}

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
                  <span className="sq-qNo">{idx + 1}</span>
                  <p className="sq-qText">{q.text}</p>
                </div>

                <div className="sq-opts">
                  {options.map((optText, i) => {
                    const isSelected = selected === i;
                    const isCorrect = submitted && correctIndex === i;
                    const isWrong = submitted && isSelected && correctIndex !== i;

                    const cls = `sq-opt ${isSelected ? "selected" : ""} ${
                      isCorrect ? "correct" : ""
                    } ${isWrong ? "wrong" : ""}`;

                    return (
                      <button
                        key={i}
                        className={cls}
                        onClick={() => select(q.id, i)}
                        disabled={submitted}
                      >
                        <span className="sq-optBadge">{String.fromCharCode(65 + i)}</span>
                        <span>{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div className="sq-actions">
            <button className="sq-submit" onClick={() => doSubmit(false)}>
              Submit Answers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}