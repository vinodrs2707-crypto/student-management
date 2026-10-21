import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

function CourseStudents({ course, onClose }) {
  const [enrolled, setEnrolled] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [enrolledResponse, studentsResponse] = await Promise.all([
        api.get(`/courses/${course.id}/students`),
        api.get("/students"),
      ]);
      setEnrolled(enrolledResponse.data);
      setAllStudents(studentsResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [course.id]);

  const availableStudents = allStudents.filter(
    (student) => !enrolled.some((item) => item.id === student.id)
  );

  const handleEnroll = async () => {
    setError("");
    setMessage("");
    if (!selectedId) {
      setError("Please choose a student.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/courses/${course.id}/students`, {
        student_id: Number(selectedId),
      });
      setMessage("Student enrolled.");
      setSelectedId("");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card">
      <div className="page-header">
        <h3 style={{ margin: 0 }}>Students in {course.name}</h3>
        <button className="btn-small btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {enrolled.length === 0 ? (
            <p>No students are enrolled yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolled.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-group" style={{ marginTop: "16px" }}>
            <label>Enroll a student</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choose a student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <button className="btn-small" onClick={handleEnroll} disabled={saving}>
            {saving ? "Enrolling..." : "Enroll"}
          </button>
        </>
      )}
    </div>
  );
}

export default CourseStudents;