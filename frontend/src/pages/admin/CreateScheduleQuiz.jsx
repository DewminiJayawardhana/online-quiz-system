import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateScheduleQuiz.css";

// ✅ Show next quiz number WITHOUT increasing counter
function generateQuizNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const last = localStorage.getItem("oqs_last_quiz_no");
  const nextNumber = last ? Number(last) + 1 : 1;

  return `OQS-${year}-${month}-${nextNumber}`;
}

// ✅ Increase counter ONLY after submit
function commitQuizNumber() {
  const last = localStorage.getItem("oqs_last_quiz_no");
  const nextNumber = last ? Number(last) + 1 : 1;
  localStorage.setItem("oqs_last_quiz_no", String(nextNumber));
}

const CATEGORIES = [
  "Programming",
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

export default function CreateScheduleQuiz() {
  const nav = useNavigate();

  const [quizNo, setQuizNo] = useState("");
  const [category, setCategory] = useState("");
  const [timeLimit, setTimeLimit] = useState(10);
  const [noOfQuestions, setNoOfQuestions] = useState(1);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMark, setPassingMark] = useState(50);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setQuizNo(generateQuizNumber());
  }, []);

  const validation = useMemo(() => {
    const errors = [];

    if (!category) errors.push("Please select a quiz category.");
    if (Number(timeLimit) < 10 || Number(timeLimit) > 120)
      errors.push("Time limit must be between 10 and 120 minutes.");
    if (Number(noOfQuestions) < 1)
      errors.push("Number of questions must be at least 1.");
    if (Number(totalMarks) < 1) errors.push("Total marks must be at least 1.");
    if (Number(passingMark) < 0)
      errors.push("Passing mark cannot be negative.");
    if (Number(passingMark) > Number(totalMarks))
      errors.push("Passing mark cannot be greater than total marks.");
    if (!startAt) errors.push("Start date & time is required.");
    if (!endAt) errors.push("End date & time is required.");

    if (startAt && endAt) {
      const s = new Date(startAt).getTime();
      const e = new Date(endAt).getTime();
      if (isNaN(s) || isNaN(e)) errors.push("Invalid start/end date & time.");
      else if (e <= s)
        errors.push("End date & time must be after start date & time.");
    }

    return errors;
  }, [
    category,
    timeLimit,
    noOfQuestions,
    totalMarks,
    passingMark,
    startAt,
    endAt,
  ]);

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (validation.length > 0) {
      setErr(validation[0]);
      return;
    }

    const payload = {
      quizNo,
      category,
      timeLimitMinutes: Number(timeLimit),
      noOfQuestions: Number(noOfQuestions),
      totalMarks: Number(totalMarks),
      passingMark: Number(passingMark),
      startAt,
      endAt,
      status: "SCHEDULED",
    };

    console.log("QUIZ CREATE PAYLOAD:", payload);

    // ✅ Increase quiz counter ONLY after submit success
    commitQuizNumber();

    // ✅ Prepare next quiz number immediately (so next time it increments)
    setQuizNo(generateQuizNumber());

    setOk(
      "Quiz details saved (frontend). Next: connect backend API to store in MongoDB."
    );
  };

  return (
    <div className="cq-page">
      <div className="cq-container">
        <div className="cq-top">
          <h1 className="cq-title">Create & Schedule Quiz</h1>
          <button
            className="cq-back"
            type="button"
            onClick={() => nav("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        <form className="cq-card" onSubmit={submit}>
          {err && <div className="cq-alert cq-alert-err">{err}</div>}
          {ok && <div className="cq-alert cq-alert-ok">{ok}</div>}

          <div className="cq-grid">
            <div className="cq-field">
              <label className="cq-label">Quiz Number (Auto)</label>
              <input className="cq-input" value={quizNo} readOnly />
            </div>

            <div className="cq-field">
              <label className="cq-label">Quiz Category</label>
              <select
                className="cq-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="cq-field">
              <label className="cq-label">Time Limit (minutes)</label>
              <input
                className="cq-input"
                type="number"
                min="10"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
              <small className="cq-help">Min 10 — Max 120</small>
            </div>

            <div className="cq-field">
              <label className="cq-label">Number of Questions</label>
              <input
                className="cq-input"
                type="number"
                min="1"
                value={noOfQuestions}
                onChange={(e) => setNoOfQuestions(e.target.value)}
              />
            </div>

            <div className="cq-field">
              <label className="cq-label">Total Marks</label>
              <input
                className="cq-input"
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
            </div>

            <div className="cq-field">
              <label className="cq-label">Passing Mark</label>
              <input
                className="cq-input"
                type="number"
                min="0"
                value={passingMark}
                onChange={(e) => setPassingMark(e.target.value)}
              />
              <small className="cq-help">Must be ≤ Total Marks</small>
            </div>

            <div className="cq-field">
              <label className="cq-label">Start Date & Time</label>
              <input
                className="cq-input"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>

            <div className="cq-field">
              <label className="cq-label">End Date & Time</label>
              <input
                className="cq-input"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <div className="cq-actions">
            <button className="cq-btn" type="submit">
              Save Quiz Schedule
            </button>
          </div>
        </form>

        {validation.length > 0 && (
          <div className="cq-note">
            <strong>Validation:</strong> {validation.join(" • ")}
          </div>
        )}
      </div>
    </div>
  );
}