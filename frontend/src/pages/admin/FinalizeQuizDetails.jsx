import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../../api/api"; // adjust if needed
import "./FinalizeQuizDetails.css";

export default function FinalizeQuizDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tab = params.get("tab") || "NEW";

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    setErr(""); setOk("");
    try {
      const res = await api.get(`/api/finalize-quizzes/${id}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quiz details");
    }
  };

  useEffect(() => { load(); }, [id]);

  const printPdf = () => {
    // ✅ Practical production way:
    // browser print -> Save as PDF
    window.print();
  };

  const publish = async () => {
    setErr(""); setOk("");
    try {
      setPublishing(true);
      await api.post(`/api/finalize-quizzes/${id}/publish`);
      setOk("Quiz published to students successfully.");
      // go back to list (published tab)
      nav("/admin/quizzes/finalized");
    } catch (e) {
      setErr(e?.response?.data?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (!data) return <div style={{ padding: 24 }}>Loading...</div>;

  const quiz = data.quiz;
  const questions = data.questions || [];

  return (
    <div className="fzd-page">
      <div className="fzd-container">
        <div className="no-print fzd-top">
          <h1 className="fzd-title">Finalize Quiz Details</h1>
          <button className="fzd-back" type="button" onClick={() => nav("/admin/quizzes/finalized")}>
            ← Back
          </button>
        </div>

        {err && <div className="no-print fzd-err">{err}</div>}
        {ok && <div className="no-print fzd-ok">{ok}</div>}

        {/* PRINT AREA */}
        <div className="print-area fzd-card">
          <div className="fzd-head">
            <div>
              <div className="lbl">Quiz Number</div>
              <div className="val">{quiz.quizNo}</div>
            </div>
            <div>
              <div className="lbl">Category</div>
              <div className="val">{quiz.category}</div>
            </div>
            <div>
              <div className="lbl">Status</div>
              <div className="val">{quiz.status}</div>
            </div>
          </div>

          <div className="fzd-metaGrid">
            <div><span className="lbl">Time Limit:</span> {quiz.timeLimitMinutes} minutes</div>
            <div><span className="lbl">Questions:</span> {quiz.noOfQuestions}</div>
            <div><span className="lbl">Total Marks:</span> {quiz.totalMarks}</div>
            <div><span className="lbl">Passing Mark:</span> {quiz.passingMark}</div>
            <div><span className="lbl">Start:</span> {quiz.startAt ? new Date(quiz.startAt).toLocaleString() : "-"}</div>
            <div><span className="lbl">End:</span> {quiz.endAt ? new Date(quiz.endAt).toLocaleString() : "-"}</div>
          </div>

          <div className="fzd-sectionTitle">Questions & Answers</div>

          {questions.length === 0 ? (
            <div className="fzd-empty">No questions found.</div>
          ) : (
            questions.map((q, idx) => (
              <div className="fzd-q" key={q.id}>
                <div className="fzd-qTitle">
                  Q{idx + 1}. {q.text}
                </div>
                <ol className="fzd-opts" type="A">
                  {(q.options || []).map((op, i) => (
                    <li key={i} className={op.correct ? "correct" : ""}>
                      {op.text} {op.correct ? " ✅ (Correct)" : ""}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>

        {/* ACTIONS */}
        <div className="no-print fzd-actions">
          <button className="btn" type="button" onClick={printPdf}>
            Print PDF
          </button>

          {tab === "NEW" && quiz.status === "READY" && (
            <button className="btn publish" type="button" onClick={publish} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish to Students"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}