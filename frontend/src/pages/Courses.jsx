import { useEffect, useState } from "react";
import CourseForm from "../components/CourseForm";
import CourseStudents from "../components/CourseStudents";
import api, { getErrorMessage } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openAddForm = () => {
    setEditing(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const openEditForm = (course) => {
    setEditing(course);
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
    loadCourses();
  };

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Delete ${course.name}? Its enrollments will be removed too.`
    );
    if (!confirmed) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await api.delete(`/courses/${course.id}`);
      if (selectedCourse && selectedCourse.id === course.id) {
        setSelectedCourse(null);
      }
      setMessage(`${course.name} was deleted.`);
      loadCourses();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Courses</h2>
        {!showForm && (
          <button className="btn-small" onClick={openAddForm}>
            Add course
          </button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <CourseForm
          key={editing ? editing.id : "new"}
          course={editing}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {selectedCourse && (
        <CourseStudents
          key={selectedCourse.id}
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : courses.length === 0 ? (
        <p>No courses yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.description || "-"}</td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Students
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => openEditForm(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDelete(course)}
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

export default Courses;