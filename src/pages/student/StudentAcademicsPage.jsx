import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { query, where } from "firebase/firestore";
import { useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { gradeFromScore } from "../../utils/formatters";
import { assessmentLabel, getAssessmentType } from "../../utils/results";
import { resolveLinkedProfileId } from "../../utils/profile";

function StudentAcademicsPage() {
  const { userProfile } = useAuth();
  const students = useCollection(COLLECTIONS.STUDENTS);
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const teachers = useCollection(COLLECTIONS.TEACHERS);

  const studentScopeId = resolveLinkedProfileId(userProfile);
  const myAttendanceQuery = useCallback(
    (ref) => query(ref, where("studentId", "==", studentScopeId || "__none__")),
    [studentScopeId],
  );
  const myResultsQuery = useCallback(
    (ref) => query(ref, where("studentId", "==", studentScopeId || "__none__")),
    [studentScopeId],
  );
  const attendance = useCollection(
    COLLECTIONS.ATTENDANCE,
    myAttendanceQuery,
  );
  const results = useCollection(
    COLLECTIONS.RESULTS,
    myResultsQuery,
  );

  if ([students.loading, assignments.loading, subjects.loading, teachers.loading, attendance.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading academics..." />;
  }

  const student = students.data.find((item) => item.id === studentScopeId);
  const myAssignments = assignments.data.filter((item) => item.classId === student?.classId);
  const myAttendance = attendance.data;
  const myResults = results.data;

  const subjectRows = myAssignments.map((assignment) => {
    const subject = subjects.data.find((item) => item.id === assignment.subjectId);
    const teacher = teachers.data.find((item) => item.id === assignment.teacherId);
    return {
      id: assignment.id,
      subjectName: subject?.name ?? "N/A",
      subjectCode: subject?.code ?? "N/A",
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "N/A",
    };
  });
  const attendanceRows = myAttendance.map((entry) => ({ ...entry, subjectName: subjects.data.find((item) => item.id === entry.subjectId)?.name ?? "N/A" }));
  const resultRows = myResults.map((entry) => ({ ...entry, subjectName: subjects.data.find((item) => item.id === entry.subjectId)?.name ?? "N/A" }));

  return (
    <div className="content-grid">
      <PageHeader title="Academic Records" subtitle="Your enrolled subjects, assigned teachers, attendance, and published results." />

      <div className="panel">
        <h3>Subjects and Teachers</h3>
        <DataTable
          columns={[
            { key: "subjectName", label: "Subject" },
            { key: "subjectCode", label: "Code" },
            { key: "teacherName", label: "Teacher" },
          ]}
          rows={subjectRows}
          emptyTitle="No subjects assigned"
          emptyDescription="Your class has not been mapped to subjects yet."
        />
      </div>

      <div className="panel">
        <h3>Attendance</h3>
        <DataTable
          columns={[
            { key: "subjectName", label: "Subject" },
            { key: "date", label: "Date" },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type={row.status === "present" ? "success" : row.status === "late" ? "warning" : "danger"} /> },
          ]}
          rows={attendanceRows}
          emptyTitle="No attendance available"
          emptyDescription="Attendance will appear once your teacher marks it."
        />
      </div>

      <div className="panel">
        <h3>Results</h3>
        <DataTable
          columns={[
            { key: "subjectName", label: "Subject" },
            { key: "assessment", label: "Assessment", render: (row) => assessmentLabel(getAssessmentType(row)) },
            { key: "schoolYear", label: "School Year", render: (row) => row.schoolYear ?? row.term ?? "N/A" },
            { key: "score", label: "Score", render: (row) => `${row.score}/${row.totalMarks}` },
            { key: "grade", label: "Grade", render: (row) => <StatusBadge status={gradeFromScore(row.score, row.totalMarks)} type={Number(row.score) / Number(row.totalMarks) >= 0.5 ? "success" : "danger"} /> },
          ]}
          rows={resultRows}
          emptyTitle="No results published"
          emptyDescription="Your published marks will appear here."
        />
      </div>
    </div>
  );
}

export default StudentAcademicsPage;
