import { useEffect, useState } from "react";
import StudentForm from "../components/StudentForm";
import api, { getErrorMessage } from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (err) {
      setCourses([]);
    }
  };

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const openEditForm = (student) => {
    setEditing(student);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSaved = (text) => {
    closeForm();
    setMessage(text);
    loadStudents();
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name}?`);
    if (!confirmed) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await api.delete(`/students/${student.id}`);
      setMessage(`${student.name} was deleted.`);
      loadStudents();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Students</h2>
        {!showForm && (
          <button className="btn-small" onClick={openAddForm}>
            Add student
          </button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <StudentForm
          key={editing ? editing.id : "new"}
          student={editing}
          courses={courses}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No students yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.department}</td>
                  <td>{student.course || "-"}</td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => openEditForm(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(student)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Students;