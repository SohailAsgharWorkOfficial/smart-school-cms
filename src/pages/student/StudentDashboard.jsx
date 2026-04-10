import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatCard from "../../components/shared/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";

function StudentDashboard() {
  const { userProfile } = useAuth();
  const students = useCollection(COLLECTIONS.STUDENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const results = useCollection(COLLECTIONS.RESULTS);

  if ([students.loading, classes.loading, assignments.loading, attendance.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading student dashboard..." />;
  }

  const student = students.data.find((item) => item.id === userProfile?.linkedProfileId);
  const currentClass = classes.data.find((item) => item.id === student?.classId);
  const myAssignments = assignments.data.filter((item) => item.classId === student?.classId);
  const myAttendance = attendance.data.filter((item) => item.studentId === student?.id);
  const myResults = results.data.filter((item) => item.studentId === student?.id);

  return (
    <div className="content-grid">
      <PageHeader title="Student Dashboard" subtitle="View your own profile, class information, subjects, attendance, and published results." />

      <section className="stats-grid">
        <StatCard label="Current Class" value={currentClass ? `${currentClass.name} ${currentClass.section}` : "N/A"} hint="Your enrolled section" />
        <StatCard label="Subjects" value={myAssignments.length} hint="Assigned through your class" />
        <StatCard label="Attendance Entries" value={myAttendance.length} hint="Your attendance history" />
        <StatCard label="Results" value={myResults.length} hint="Published academic records" />
      </section>

      <section className="split-grid">
        <article className="panel">
          <h3>Student Snapshot</h3>
          <p><strong>Name:</strong> {student ? `${student.firstName} ${student.lastName}` : "N/A"}</p>
          <p><strong>Roll Number:</strong> {student?.rollNumber ?? "N/A"}</p>
          <p><strong>Class:</strong> {currentClass ? `${currentClass.name} - ${currentClass.section}` : "N/A"}</p>
        </article>

        <article className="panel">
          <h3>Access Rules</h3>
          <ul className="list-reset content-grid">
            <li>You can only access records linked to your own student document.</li>
            <li>Teacher and subject visibility comes from your class assignments.</li>
            <li>Attendance and result views exclude all other students automatically.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default StudentDashboard;
