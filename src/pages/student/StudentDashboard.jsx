import { useCallback, useMemo, useState } from "react";
import { query, where } from "firebase/firestore";
import AttendanceCalendar from "../../components/shared/AttendanceCalendar";
import PageHeader from "../../components/shared/PageHeader";
import ReportCard from "../../components/shared/ReportCard";
import Spinner from "../../components/shared/Spinner";
import StatCard from "../../components/shared/StatCard";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { RESULT_ASSESSMENTS } from "../../utils/constants";
import { resolveLinkedProfileId } from "../../utils/profile";

function StudentDashboard() {
  const { userProfile } = useAuth();
  const students = useCollection(COLLECTIONS.STUDENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const teachers = useCollection(COLLECTIONS.TEACHERS);
  const [assessmentType, setAssessmentType] = useState("midterm");

  const studentScopeId = resolveLinkedProfileId(userProfile);
  const myAttendanceQuery = useCallback(
    (ref) => query(ref, where("studentId", "==", studentScopeId || "__none__")),
    [studentScopeId],
  );
  const myResultsQuery = useCallback(
    (ref) => query(ref, where("studentId", "==", studentScopeId || "__none__")),
    [studentScopeId],
  );
  const attendance = useCollection(COLLECTIONS.ATTENDANCE, myAttendanceQuery);
  const results = useCollection(COLLECTIONS.RESULTS, myResultsQuery);
  const student = useMemo(
    () => students.data.find((item) => item.id === studentScopeId),
    [students.data, studentScopeId],
  );
  const currentClass = useMemo(
    () => classes.data.find((item) => item.id === student?.classId),
    [classes.data, student?.classId],
  );
  const myAssignments = useMemo(
    () => assignments.data.filter((item) => item.classId === student?.classId),
    [assignments.data, student?.classId],
  );
  const myAttendance = useMemo(
    () => attendance.data.filter((item) => item.studentId === student?.id),
    [attendance.data, student?.id],
  );
  const myResults = useMemo(
    () => results.data.filter((item) => item.studentId === student?.id),
    [results.data, student?.id],
  );

  const attendanceCalendarRecords = useMemo(() => {
    return myAttendance.map((entry) => {
      const subjectName = subjects.data.find((item) => item.id === entry.subjectId)?.name ?? "N/A";
      const className = currentClass ? `${currentClass.name} - ${currentClass.section}` : "N/A";
      return { ...entry, subjectName, className };
    });
  }, [currentClass, myAttendance, subjects.data]);

  if ([students.loading, classes.loading, assignments.loading, subjects.loading, teachers.loading, attendance.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading student dashboard..." />;
  }

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

      <article className="panel">
        <div className="panel-header">
          <div>
            <h3>My Attendance Calendar</h3>
            <p className="helper-text">Monthly attendance view for your records.</p>
          </div>
        </div>
        <AttendanceCalendar records={attendanceCalendarRecords} emptyLabel="No attendance records for this month." />
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h3>My Report Card</h3>
            <p className="helper-text">Midterm and Final Term marks from all your subjects.</p>
          </div>
          <div className="button-row">
            {RESULT_ASSESSMENTS.map((option) => (
              <button
                key={option.value}
                className={`button ${assessmentType === option.value ? "primary" : "secondary"}`}
                type="button"
                onClick={() => setAssessmentType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ReportCard
          student={student}
          classItem={currentClass}
          assignments={assignments.data}
          subjects={subjects.data}
          teachers={teachers.data}
          results={results.data}
          assessmentType={assessmentType}
        />
      </article>
    </div>
  );
}

export default StudentDashboard;
