import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

function Dashboard() {
  const [totals, setTotals] = useState({ students: 0, courses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTotals = async () => {
      try {
        const [students, courses] = await Promise.all([
          api.get("/students"),
          api.get("/courses"),
        ]);
        setTotals({
          students: students.data.length,
          courses: courses.data.length,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    loadTotals();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="cards">
          <div className="card">
            <div className="card-number">{totals.students}</div>
            <div className="card-label">Total students</div>
          </div>
          <div className="card">
            <div className="card-number">{totals.courses}</div>
            <div className="card-label">Available courses</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;