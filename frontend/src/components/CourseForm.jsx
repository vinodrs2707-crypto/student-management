import { useState } from "react";
import api, { getErrorMessage } from "../services/api";

function CourseForm({ course, onSaved, onCancel }) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState({
    name: course?.name || "",
    code: course?.code || "",
    description: course?.description || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = form.code.trim();
    if (form.name.trim().length < 2) {
      setError("Course name must be at least 2 characters.");
      return;
    }
    if (code.length < 2 || code.length > 20) {
      setError("Course code must be 2 to 20 characters.");
      return;
    }
    if (form.description.length > 500) {
      setError("Description must be 500 characters or less.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code,
      description: form.description.trim() || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/courses/${course.id}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      onSaved(isEdit ? "Course updated." : "Course added.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card">
      <h3>{isEdit ? "Edit course" : "Add course"}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Course name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Course code</label>
          <input name="code" value={form.code} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button className="btn-small" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn-small btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;