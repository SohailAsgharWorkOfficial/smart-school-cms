import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatCard from "../../components/shared/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";

function TeacherDashboard() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const results = useCollection(COLLECTIONS.RESULTS);

  if ([assignments.loading, classes.loading, students.loading, attendance.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading teacher dashboard..." />;
  }

  const myAssignments = assignments.data.filter((item) => item.teacherId === userProfile?.linkedProfileId);
  const myClassIds = [...new Set(myAssignments.map((item) => item.classId))];
  const myStudents = students.data.filter((item) => myClassIds.includes(item.classId));
  const myAttendance = attendance.data.filter((item) => item.teacherId === userProfile?.linkedProfileId);
  const myResults = results.data.filter((item) => item.teacherId === userProfile?.linkedProfileId);

  return (
    <div className="content-grid">
      <PageHeader title="Teacher Dashboard" subtitle="Work only within your assigned classes and subjects, with quick access to attendance and results." />

      <section className="stats-grid">
        <StatCard label="Assigned Subjects" value={myAssignments.length} hint="Assignments created by admin" />
        <StatCard label="Assigned Classes" value={myClassIds.length} hint="Distinct class sections you teach" />
        <StatCard label="Students" value={myStudents.length} hint="Students available in your sections" />
        <StatCard label="Results Entered" value={myResults.length} hint="Marks published by you" />
      </section>

      <section className="split-grid">
        <article className="panel">
          <h3>Teaching Scope</h3>
          <div className="content-grid">
            {myAssignments.map((assignment) => {
              const classItem = classes.data.find((item) => item.id === assignment.classId);
              return (
                <div key={assignment.id} className="highlight-card">
                  <strong>{classItem ? `${classItem.name} - ${classItem.section}` : assignment.classId}</strong>
                  <p className="helper-text">Subject assignment ID: {assignment.subjectId}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <h3>Current Workload</h3>
          <div className="grid-2">
            <div className="highlight-card">
              <strong>{myAttendance.length}</strong>
              <p className="helper-text">Attendance records you have marked</p>
            </div>
            <div className="highlight-card">
              <strong>{myResults.length}</strong>
              <p className="helper-text">Result entries you have created</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default TeacherDashboard;
