import React, { useMemo, useState } from "react";
import { api } from "../../api/api";
import "./AddEditQuestionModal.css";

function toOptionsForEdit(question) {
  if (!question) return [
    { text: "", correct: true },
    { text: "", correct: false },
    { text: "", correct: false },
    { text: "", correct: false },
  ];
  const ops = question.options || [];
  // ensure at least 2 options
  const base = ops.map((o) => ({ text: o.text || "", correct: !!o.correct }));
  while (base.length < 2) base.push({ text: "", correct: false });
  return base;
}

export default function AddEditQuestionModal({ quizId, initialQuestion, onClose, onSaved }) {
  const isEdit = !!initialQuestion;

  const [text, setText] = useState(initialQuestion?.text || "");
  const [marks, setMarks] = useState(initialQuestion?.marks ?? 1);
  const [options, setOptions] = useState(toOptionsForEdit(initialQuestion));

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const correctCount = useMemo(() => options.filter((o) => o.correct).length, [options]);

  const validation = useMemo(() => {
    const errors = [];
    if (!text.trim()) errors.push("Question text is required.");
    if (options.length < 2) errors.push("At least 2 options required.");
    options.forEach((o, i) => {
      if (!o.text.trim()) errors.push(`Option ${i + 1} text is required.`);
    });
    if (correctCount !== 1) errors.push("Exactly 1 correct answer must be selected.");
    return errors;
  }, [text, options, correctCount]);

  const setCorrectIndex = (idx) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, correct: i === idx })));
  };

  const updateOptionText = (idx, value) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text: value } : o)));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", correct: false }]);
  };

  const removeOption = (idx) => {
    setOptions((prev) => {
      if (prev.length <= 2) return prev; // keep minimum 2
      const next = prev.filter((_, i) => i !== idx);
      // if removed correct option, make first option correct
      if (!next.some((o) => o.correct)) {
        next[0] = { ...next[0], correct: true };
      }
      return next;
    });
  };

  const save = async () => {
    setErr("");
    if (validation.length) {
      setErr(validation[0]);
      return;
    }

    const payload = {
      text: text.trim(),
      options: options.map((o) => ({ text: o.text.trim(), correct: !!o.correct })),
      marks: Number(marks) || 1,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await api.patch(`/api/draft-quizzes/questions/${initialQuestion.id}`, payload);
      } else {
        await api.post(`/api/draft-quizzes/${quizId}/questions`, payload);
      }
      onSaved();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aqm-backdrop" onMouseDown={onClose}>
      <div className="aqm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="aqm-top">
          <h2 className="aqm-title">{isEdit ? "Edit Question" : "Add Question"}</h2>
          <button className="aqm-x" type="button" onClick={onClose}>✕</button>
        </div>

        {err && <div className="aqm-err">{err}</div>}

        <div className="aqm-field">
          <label className="lbl">Question</label>
          <textarea className="ta" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        </div>

        <div className="aqm-field">
          <label className="lbl">Marks</label>
          <input className="inp" type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} />
        </div>

        <div className="aqm-optsTop">
          <div className="aqm-sub">Options (select the correct answer)</div>
          <button className="aqm-addOpt" type="button" onClick={addOption}>+ Add Option</button>
        </div>

        <div className="aqm-options">
          {options.map((o, idx) => (
            <div className="aqm-opt" key={idx}>
              <input
                type="radio"
                name="correct"
                checked={o.correct}
                onChange={() => setCorrectIndex(idx)}
              />
              <input
                className="optInp"
                value={o.text}
                placeholder={`Option ${idx + 1}`}
                onChange={(e) => updateOptionText(idx, e.target.value)}
              />
              <button className="rm" type="button" onClick={() => removeOption(idx)} title="Remove option">
                −
              </button>
            </div>
          ))}
        </div>

        <div className="aqm-actions">
          <button className="btn2" type="button" onClick={onClose}>Cancel</button>
          <button className="btn" type="button" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {validation.length > 0 && (
          <div className="aqm-note">
            <strong>Validation:</strong> {validation.join(" • ")}
          </div>
        )}
      </div>
    </div>
  );
}