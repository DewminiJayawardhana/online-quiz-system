import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api"; // adjust if needed
import AddEditQuestionModal from "./AddEditQuestionModal";
import "./DraftQuizDetails.css";

export default function DraftQuizDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const role = localStorage.getItem("oqs_admin_role"); // "SCHEDULE_ADMIN" | "QUIZ_ADMIN"

  const isScheduleAdmin = role === "SCHEDULE_ADMIN";
  const isQuizAdmin = role === "QUIZ_ADMIN";

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // editable fields (schedule admin)
  const [edit, setEdit] = useState(null);

  // question modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState(null);

  const load = async () => {
    setErr(""); setOk("");
    try {
      const [q1, q2] = await Promise.all([
        api.get(`/api/draft-quizzes/${id}`),
        api.get(`/api/draft-quizzes/${id}/questions`)
      ]);

      const quizData = q1.data;
      const qs = q2.data || [];

      setQuiz(quizData);
      setQuestions(qs);

      setEdit({
        timeLimitMinutes: quizData.timeLimitMinutes ?? 10,
        noOfQuestions: quizData.noOfQuestions ?? 1,
        totalMarks: quizData.totalMarks ?? 100,
        passingMark: quizData.passingMark ?? 50,
        startAt: quizData.startAt ? quizData.startAt.slice(0,16) : "",
        endAt: quizData.endAt ? quizData.endAt.slice(0,16) : "",
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load draft quiz");
    }
  };

  useEffect(() => { load(); }, [id]);

  const requiredCount = quiz?.noOfQuestions ?? 0;
  const addedCount = questions.length;
  const completedCountOk = addedCount === requiredCount;

  const canScheduleTick = isScheduleAdmin && completedCountOk;
  const canContentTick = isQuizAdmin;

  const scheduleEditValidation = useMemo(() => {
    if (!edit) return [];
    const errors = [];
    if (Number(edit.timeLimitMinutes) < 10 || Number(edit.timeLimitMinutes) > 120)
      errors.push("Time limit must be 10–120 minutes.");
    if (Number(edit.passingMark) > Number(edit.totalMarks))
      errors.push("Passing mark cannot be greater than total marks.");
    if (!edit.startAt || !edit.endAt) errors.push("Start/End date & time required.");
    if (edit.startAt && edit.endAt) {
      const s = new Date(edit.startAt).getTime();
      const e = new Date(edit.endAt).getTime();
      if (e <= s) errors.push("End must be after start.");
    }
    return errors;
  }, [edit]);

  const saveScheduleEdits = async () => {
    setErr(""); setOk("");
    if (scheduleEditValidation.length) { setErr(scheduleEditValidation[0]); return; }

    try {
      // reuse your existing scheduled PATCH endpoint (works also when DRAFT if you allow)
      // If your backend currently restricts edit only for SCHEDULED, tell me; I'll give you a safe new endpoint.
      await api.patch(`/api/quizzes/${id}`, {
        timeLimitMinutes: Number(edit.timeLimitMinutes),
        noOfQuestions: Number(edit.noOfQuestions),
        totalMarks: Number(edit.totalMarks),
        passingMark: Number(edit.passingMark),
        startAt: new Date(edit.startAt).toISOString(),
        endAt: new Date(edit.endAt).toISOString(),
      });
      setOk("Quiz details updated (quiz number & category locked).");
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update quiz details");
    }
  };

  const deleteQuestion = async (qid) => {
    setErr(""); setOk("");
    try {
      await api.delete(`/api/draft-quizzes/questions/${qid}`);
      setOk("Question deleted.");
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  const approve = async (type) => {
    setErr(""); setOk("");
    try {
      const res = await api.post(`/api/draft-quizzes/${id}/approve`, { type });
      const updated = res.data;
      setQuiz(updated);

      if (updated.status === "READY") {
        nav("/admin/quizzes/finalized");
        return;
      }

      setOk(type === "content" ? "Content approval saved." : "Schedule approval saved.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Approval failed");
    }
  };

  const openAdd = () => {
    setEditingQ(null);
    setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditingQ(q);
    setModalOpen(true);
  };

  if (!quiz || !edit) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="dqd-page">
      <div className="dqd-container">
        <div className="dqd-top">
          <h1 className="dqd-title">Draft Quiz Details</h1>
          <button className="dqd-back" type="button" onClick={() => nav("/admin/quizzes/drafts")}>
            ← Back
          </button>
        </div>

        {err && <div className="dqd-err">{err}</div>}
        {ok && <div className="dqd-ok">{ok}</div>}

        <div className="dqd-card">
          <div className="dqd-row">
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

          <div className="dqd-progress">
            Questions Added: <strong>{addedCount}</strong> / <strong>{requiredCount}</strong>
            {!completedCountOk && (
              <span className="dqd-warn">
                {" "}• Need exactly {requiredCount} questions to approve
              </span>
            )}
            {completedCountOk && <span className="dqd-good"> • Completed ✅</span>}
          </div>

          <div className="dqd-sectionTitle">Quiz Details (Schedule Admin can edit)</div>
          <div className="dqd-grid">
            <div>
              <div className="lbl">Time Limit (minutes)</div>
              <input
                className="inp"
                type="number"
                min="10"
                max="120"
                value={edit.timeLimitMinutes}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, timeLimitMinutes: e.target.value })}
              />
            </div>
            <div>
              <div className="lbl">Number of Questions</div>
              <input
                className="inp"
                type="number"
                min="1"
                value={edit.noOfQuestions}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, noOfQuestions: e.target.value })}
              />
            </div>
            <div>
              <div className="lbl">Total Marks</div>
              <input
                className="inp"
                type="number"
                min="1"
                value={edit.totalMarks}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, totalMarks: e.target.value })}
              />
            </div>
            <div>
              <div className="lbl">Passing Mark</div>
              <input
                className="inp"
                type="number"
                min="0"
                value={edit.passingMark}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, passingMark: e.target.value })}
              />
            </div>
            <div>
              <div className="lbl">Start Date & Time</div>
              <input
                className="inp"
                type="datetime-local"
                value={edit.startAt}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, startAt: e.target.value })}
              />
            </div>
            <div>
              <div className="lbl">End Date & Time</div>
              <input
                className="inp"
                type="datetime-local"
                value={edit.endAt}
                disabled={!isScheduleAdmin}
                onChange={(e) => setEdit({ ...edit, endAt: e.target.value })}
              />
            </div>
          </div>

          {isScheduleAdmin && (
            <div className="dqd-actions">
              <button className="btn" type="button" onClick={saveScheduleEdits}>
                Save Details
              </button>
            </div>
          )}

          <div className="dqd-sectionTitle">Questions</div>

          {isQuizAdmin && (
            <div className="dqd-actions">
              <button className="btn" type="button" onClick={openAdd} disabled={addedCount >= requiredCount}>
                + Add Question
              </button>
            </div>
          )}

          <div className="dqd-qList">
            {questions.length === 0 ? (
              <div className="dqd-empty">No questions added yet.</div>
            ) : (
              questions.map((q, idx) => (
                <div className="dqd-qItem" key={q.id}>
                  <div className="dqd-qHead">
                    <div className="dqd-qTitle">
                      Q{idx + 1}. {q.text}
                    </div>
                    {isQuizAdmin && (
                      <div className="dqd-qBtns">
                        <button className="mini" type="button" onClick={() => openEdit(q)}>
                          Edit
                        </button>
                        <button className="mini danger" type="button" onClick={() => deleteQuestion(q.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <ul className="dqd-options">
                    {(q.options || []).map((op, i) => (
                      <li key={i} className={op.correct ? "correct" : ""}>
                        {op.correct ? "✅ " : "⬜ "} {op.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          <div className="dqd-sectionTitle">Final Checks (Approvals)</div>

          <div className="dqd-approvals">
            <label className={`chk ${!isQuizAdmin ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={!!quiz.contentCompleted}
                disabled={!canContentTick || quiz.contentCompleted}
                onChange={() => approve("content")}
              />
              Content Completed (Quiz Admin)
            </label>

            <label className={`chk ${!canScheduleTick ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={!!quiz.scheduleVerified}
                disabled={!canScheduleTick || quiz.scheduleVerified}
                onChange={() => approve("schedule")}
              />
              Schedule Verified (Schedule Admin)
            </label>
          </div>

          {!completedCountOk && (
            <div className="dqd-hint">
              Schedule admin approval is locked until <strong>exactly {requiredCount}</strong> questions are added.
            </div>
          )}

          {(quiz.contentCompleted && quiz.scheduleVerified) && (
            <div className="dqd-good2">
              ✅ Both approvals completed. Quiz will move to Finalized automatically.
            </div>
          )}
        </div>

        {modalOpen && (
          <AddEditQuestionModal
            quizId={id}
            initialQuestion={editingQ}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false);
              load();
            }}
          />
        )}
      </div>
    </div>
  );
}