import { useMemo, useState } from "react";
import DataTable from "../../components/shared/DataTable";
import AttendanceCalendar from "../../components/shared/AttendanceCalendar";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { formatDate } from "../../utils/formatters";

function AdminAttendancePage() {
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const studentOptions = useMemo(
    () =>
      students.data
        .slice()
        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
        .map((student) => ({ value: student.id, label: `${student.firstName} ${student.lastName} (${student.rollNumber})` })),
    [students.data],
  );

  const effectiveStudentId = selectedStudentId || studentOptions[0]?.value || "";
  const selectedStudent = students.data.find((item) => item.id === effectiveStudentId);
  const selectedStudentRecords = useMemo(
    () =>
      attendance.data
        .filter((item) => item.studentId === effectiveStudentId)
        .map((entry) => {
          const subjectName = subjects.data.find((item) => item.id === entry.subjectId)?.name ?? "N/A";
          const classItem = classes.data.find((item) => item.id === entry.classId);
          const className = classItem ? `${classItem.name} - ${classItem.section}` : "N/A";
          return { ...entry, subjectName, className };
        }),
    [attendance.data, classes.data, effectiveStudentId, subjects.data],
  );

  if ([attendance.loading, students.loading, subjects.loading, classes.loading].some(Boolean)) {
    return <Spinner label="Loading attendance..." />;
  }

  return (
    <div className="content-grid">
      <PageHeader title="Attendance Records" subtitle="Review all attendance records published by teachers across class and subject assignments." />

      <article className="panel">
        <div className="panel-header">
          <div>
            <h3>Student Attendance Calendar</h3>
            <p className="helper-text">Select a student to view attendance in calendar format.</p>
          </div>
          <div className="attendance-filter">
            <label htmlFor="student-filter">Student</label>
            <select id="student-filter" value={effectiveStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              {studentOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <AttendanceCalendar
          key={effectiveStudentId}
          records={selectedStudentRecords}
          emptyLabel={selectedStudent ? `No attendance found for ${selectedStudent.firstName} ${selectedStudent.lastName} in this month.` : "No attendance records for this month."}
        />
      </article>

      <DataTable
        columns={[
          {
            key: "studentId",
            label: "Student",
            render: (row) => {
              const student = students.data.find((item) => item.id === row.studentId);
              return student ? `${student.firstName} ${student.lastName}` : "N/A";
            },
          },
          {
            key: "classId",
            label: "Class",
            render: (row) => {
              const classItem = classes.data.find((item) => item.id === row.classId);
              return classItem ? `${classItem.name} - ${classItem.section}` : "N/A";
            },
          },
          { key: "subjectId", label: "Subject", render: (row) => subjects.data.find((item) => item.id === row.subjectId)?.name ?? "N/A" },
          { key: "date", label: "Date", render: (row) => formatDate(row.date) },
          {
            key: "status",
            label: "Status",
            render: (row) => <StatusBadge status={row.status} type={row.status === "present" ? "success" : row.status === "late" ? "warning" : "danger"} />,
          },
        ]}
        rows={attendance.data}
        emptyTitle="No attendance records"
        emptyDescription="Teachers have not published attendance yet."
      />
    </div>
  );
}

export default AdminAttendancePage;
