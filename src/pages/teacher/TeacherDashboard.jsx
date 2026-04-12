import { useMemo, useState } from "react";
import AttendanceCalendar from "../../components/shared/AttendanceCalendar";
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
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const results = useCollection(COLLECTIONS.RESULTS);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const myAssignments = useMemo(
    () => assignments.data.filter((item) => item.teacherId === userProfile?.linkedProfileId),
    [assignments.data, userProfile?.linkedProfileId],
  );
  const myClassIds = useMemo(() => [...new Set(myAssignments.map((item) => item.classId))], [myAssignments]);
  const myStudents = useMemo(() => students.data.filter((item) => myClassIds.includes(item.classId)), [myClassIds, students.data]);
  const myAttendance = useMemo(
    () => attendance.data.filter((item) => item.teacherId === userProfile?.linkedProfileId),
    [attendance.data, userProfile?.linkedProfileId],
  );
  const myResults = useMemo(
    () => results.data.filter((item) => item.teacherId === userProfile?.linkedProfileId),
    [results.data, userProfile?.linkedProfileId],
  );

  const classOptions = useMemo(() => {
    return myClassIds
      .map((classId) => {
        const classItem = classes.data.find((item) => item.id === classId);
        return { value: classId, label: classItem ? `${classItem.name} - ${classItem.section}` : classId };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [classes.data, myClassIds]);

  const effectiveClassId = selectedClassId || classOptions[0]?.value || "";

  const selectedClassStudents = useMemo(() => {
    return myStudents
      .filter((item) => item.classId === effectiveClassId)
      .slice()
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [effectiveClassId, myStudents]);

  const studentOptions = useMemo(
    () => selectedClassStudents.map((item) => ({ value: item.id, label: `${item.firstName} ${item.lastName} (${item.rollNumber})` })),
    [selectedClassStudents],
  );

  const effectiveStudentId = (studentOptions.some((item) => item.value === selectedStudentId) ? selectedStudentId : studentOptions[0]?.value) ?? "";

  const selectedStudentRecords = useMemo(() => {
    return myAttendance
      .filter((item) => item.studentId === effectiveStudentId)
      .map((entry) => {
        const subjectName = subjects.data.find((item) => item.id === entry.subjectId)?.name ?? "N/A";
        const classItem = classes.data.find((item) => item.id === entry.classId);
        const className = classItem ? `${classItem.name} - ${classItem.section}` : "N/A";
        return { ...entry, subjectName, className };
      });
  }, [classes.data, effectiveStudentId, myAttendance, subjects.data]);

  if ([assignments.loading, classes.loading, students.loading, subjects.loading, attendance.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading teacher dashboard..." />;
  }

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
              const subjectName = subjects.data.find((item) => item.id === assignment.subjectId)?.name ?? assignment.subjectId;
              return (
                <div key={assignment.id} className="highlight-card">
                  <strong>{classItem ? `${classItem.name} - ${classItem.section}` : assignment.classId}</strong>
                  <p className="helper-text">Subject: {subjectName}</p>
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

      <article className="panel">
        <div className="panel-header">
          <div>
            <h3>Student Attendance Calendar</h3>
            <p className="helper-text">Quickly review the attendance you have marked for a student.</p>
          </div>
            <div className="attendance-filter-row">
            <div className="attendance-filter">
              <label htmlFor="teacher-class-filter">Class</label>
              <select id="teacher-class-filter" value={effectiveClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="attendance-filter">
              <label htmlFor="teacher-student-filter">Student</label>
              <select id="teacher-student-filter" value={effectiveStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} disabled={!studentOptions.length}>
                {studentOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <AttendanceCalendar
          key={`${effectiveClassId}-${effectiveStudentId}`}
          records={selectedStudentRecords}
          emptyLabel={effectiveStudentId ? "No attendance records for this student in this month." : "Select a student to view attendance."}
        />
      </article>
    </div>
  );
}

export default TeacherDashboard;
