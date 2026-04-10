import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatCard from "../../components/shared/StatCard";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";

function AdminDashboard() {
  const students = useCollection(COLLECTIONS.STUDENTS);
  const teachers = useCollection(COLLECTIONS.TEACHERS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const results = useCollection(COLLECTIONS.RESULTS);

  const loading = [students, teachers, classes, assignments, attendance, results].some((item) => item.loading);
  if (loading) return <Spinner label="Loading admin dashboard..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Full control over students, teachers, classes, attendance, results, and official school records."
      />

      <section className="stats-grid">
        <StatCard label="Students" value={students.data.length} hint="Active student records in Firestore" />
        <StatCard label="Teachers" value={teachers.data.length} hint="Faculty and staff records" />
        <StatCard label="Classes" value={classes.data.length} hint="Sections and rooms currently managed" />
        <StatCard label="Assignments" value={assignments.data.length} hint="Teacher to subject and class links" />
      </section>

      <section className="split-grid">
        <article className="panel">
          <h3>Operational Snapshot</h3>
          <div className="grid-2">
            <div className="highlight-card">
              <strong>{attendance.data.length}</strong>
              <p className="helper-text">Attendance entries tracked</p>
            </div>
            <div className="highlight-card">
              <strong>{results.data.length}</strong>
              <p className="helper-text">Published marks and result records</p>
            </div>
            <div className="highlight-card">
              <strong>{attendance.data.filter((item) => item.status === "present").length}</strong>
              <p className="helper-text">Present records logged so far</p>
            </div>
            <div className="highlight-card">
              <strong>{results.data.filter((item) => Number(item.score) >= Number(item.totalMarks) * 0.5).length}</strong>
              <p className="helper-text">Results at or above passing threshold</p>
            </div>
          </div>
        </article>

        <article className="panel">
          <h3>Scalable Data Model</h3>
          <ul className="list-reset content-grid">
            <li>`users` stores auth-linked role metadata.</li>
            <li>`students` and `teachers` keep profile-specific details.</li>
            <li>`assignments` maps teacher, class, and subject relationships.</li>
            <li>`attendance` and `results` remain publishable academic records.</li>
            <li>`school/profile` centralizes settings for future modules.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default AdminDashboard;
