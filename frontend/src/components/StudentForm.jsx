import { useState } from "react";
import api, { getErrorMessage } from "../services/api";

function StudentForm({ student, courses, onSaved, onCancel }) {
  const isEdit = Boolean(student);
  const [form, setForm] = useState({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    department: student?.department || "",
    course: student?.course || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const courseNames = courses.map((course) => course.name);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phone = form.phone.trim();
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (phone.length < 7 || phone.length > 15) {
      setError("Phone number must be 7 to 15 characters.");
      return;
    }
    if (form.department.trim().length < 2) {
      setError("Department must be at least 2 characters.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone,
      department: form.department.trim(),
      course: form.course || null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/students/${student.id}`, payload);
      } else {
        await api.post("/students", payload);
      }
      onSaved(isEdit ? "Student updated." : "Student added.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card">
      <h3>{isEdit ? "Edit student" : "Add student"}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone number</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Course</label>
          <select name="course" value={form.course} onChange={handleChange}>
            <option value="">No course</option>
            {form.course && !courseNames.includes(form.course) && (
              <option value={form.course}>{form.course}</option>
            )}
            {courses.map((course) => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
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

export default StudentForm;