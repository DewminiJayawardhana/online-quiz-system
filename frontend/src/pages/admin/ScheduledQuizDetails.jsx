import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import "./ScheduledQuizDetails.css";

export default function ScheduledQuizDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const role = localStorage.getItem("oqs_admin_role");

  const [quiz, setQuiz] = useState(null);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canEdit = role === "SCHEDULE_ADMIN";
  const canAddQuestions = role === "QUIZ_ADMIN";

  const load = async () => {
    setErr(""); setOk("");
    try {
      const res = await api.get(`/api/quizzes/${id}`);
      setQuiz(res.data);
      setForm({
        timeLimitMinutes: res.data.timeLimitMinutes ?? 10,
        noOfQuestions: res.data.noOfQuestions ?? 1,
        totalMarks: res.data.totalMarks ?? 100,
        passingMark: res.data.passingMark ?? 50,
        startAt: res.data.startAt ? res.data.startAt.slice(0,16) : "",
        endAt: res.data.endAt ? res.data.endAt.slice(0,16) : "",
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load quiz");
    }
  };

  useEffect(() => { load(); }, [id]);

  const validation = useMemo(() => {
    if (!form) return [];
    const errors = [];
    if (Number(form.timeLimitMinutes) < 10 || Number(form.timeLimitMinutes) > 120)
      errors.push("Time limit must be 10–120 minutes");
    if (Number(form.passingMark) > Number(form.totalMarks))
      errors.push("Passing mark cannot be greater than total marks");
    if (!form.startAt || !form.endAt) errors.push("Start/End date & time required");
    if (form.startAt && form.endAt) {
      const s = new Date(form.startAt).getTime();
      const e = new Date(form.endAt).getTime();
      if (e <= s) errors.push("End must be after start");
    }
    return errors;
  }, [form]);

  const saveEdits = async () => {
    setErr(""); setOk("");
    if (validation.length) { setErr(validation[0]); return; }

    try {
      await api.patch(`/api/quizzes/${id}`, {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setOk("Quiz details updated (category and quiz number remain locked).");
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    }
  };

  const moveToDraft = async () => {
    setErr(""); setOk("");
    try {
      await api.post(`/api/quizzes/${id}/move-to-draft`);
      setOk("Quiz moved to Draft Quizzes. Now you can add questions.");
      nav("/admin/quizzes/drafts");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to move to draft");
    }
  };

  if (!quiz || !form) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="sqd-page">
      <div className="sqd-container">
        <div className="sqd-top">
          <h1 className="sqd-title">Scheduled Quiz Details</h1>
          <button className="sqd-back" onClick={() => nav("/admin/quizzes/scheduled")}>← Back</button>
        </div>

        {err && <div className="sqd-err">{err}</div>}
        {ok && <div className="sqd-ok">{ok}</div>}

        <div className="sqd-card">
          <div className="sqd-row">
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

          <div className="sqd-grid">
            <div>
              <div className="lbl">Time Limit (minutes)</div>
              <input className="inp" type="number" min="10" max="120"
                value={form.timeLimitMinutes}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, timeLimitMinutes: e.target.value})}/>
            </div>
            <div>
              <div className="lbl">Number of Questions</div>
              <input className="inp" type="number" min="1"
                value={form.noOfQuestions}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, noOfQuestions: e.target.value})}/>
            </div>
            <div>
              <div className="lbl">Total Marks</div>
              <input className="inp" type="number" min="1"
                value={form.totalMarks}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, totalMarks: e.target.value})}/>
            </div>
            <div>
              <div className="lbl">Passing Mark</div>
              <input className="inp" type="number" min="0"
                value={form.passingMark}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, passingMark: e.target.value})}/>
            </div>
            <div>
              <div className="lbl">Start Date & Time</div>
              <input className="inp" type="datetime-local"
                value={form.startAt}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, startAt: e.target.value})}/>
            </div>
            <div>
              <div className="lbl">End Date & Time</div>
              <input className="inp" type="datetime-local"
                value={form.endAt}
                disabled={!canEdit}
                onChange={(e)=>setForm({...form, endAt: e.target.value})}/>
            </div>
          </div>

          <div className="sqd-actions">
            {canEdit && (
              <button className="btn" type="button" onClick={saveEdits}>
                Save Changes
              </button>
            )}
            {canAddQuestions && (
              <button className="btn" type="button" onClick={moveToDraft}>
                Add Questions (Move to Draft)
              </button>
            )}
          </div>

          {!canEdit && role === "QUIZ_ADMIN" && (
            <div className="hint">You can’t edit schedule details. Click “Add Questions” to continue.</div>
          )}
          {!canAddQuestions && role === "SCHEDULE_ADMIN" && (
            <div className="hint">You can edit schedule details, but only Quiz Admin can add questions.</div>
          )}
        </div>
      </div>
    </div>
  );
}