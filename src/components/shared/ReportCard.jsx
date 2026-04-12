import StatusBadge from "./StatusBadge";
import { gradeFromScore } from "../../utils/formatters";
import { assessmentLabel, isAssessmentType, pickLatestResult } from "../../utils/results";

function ReportCard({ student, classItem, assignments = [], subjects = [], teachers = [], results = [], assessmentType = "midterm" }) {
  if (!student) {
    return (
      <div className="highlight-card">
        <strong>No student profile found</strong>
        <p className="helper-text">Ask admin to link your account with a student record.</p>
      </div>
    );
  }

  const expected = assignments
    .filter((item) => item.classId === student.classId)
    .map((assignment) => {
      const subject = subjects.find((item) => item.id === assignment.subjectId);
      const teacher = teachers.find((item) => item.id === assignment.teacherId);
      return {
        id: assignment.id,
        subjectId: assignment.subjectId,
        subjectName: subject?.name ?? "N/A",
        subjectCode: subject?.code ?? "",
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "N/A",
        schoolYear: assignment.schoolYear ?? null,
      };
    })
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  const myResults = results.filter((item) => item.studentId === student.id && isAssessmentType(item, assessmentType));
  const bySubject = myResults.reduce((acc, item) => {
    acc[item.subjectId] ??= [];
    acc[item.subjectId].push(item);
    return acc;
  }, {});

  const rows = expected.map((subjectRow) => {
    const latest = pickLatestResult(bySubject[subjectRow.subjectId] ?? []);
    const score = latest ? Number(latest.score) : null;
    const totalMarks = latest ? Number(latest.totalMarks) : null;
    const grade = latest ? gradeFromScore(score, totalMarks) : "N/A";
    const pass = latest ? Number(score) / Number(totalMarks) >= 0.5 : null;
    return {
      ...subjectRow,
      score,
      totalMarks,
      grade,
      pass,
      teacherId: latest?.teacherId ?? null,
    };
  });

  const completed = rows.filter((item) => item.score !== null && item.totalMarks !== null).length;
  const totalSubjects = rows.length;
  const pendingSubjects = rows.filter((item) => item.score === null).map((item) => item.subjectName);

  const totals = rows.reduce(
    (acc, item) => {
      if (item.score === null || item.totalMarks === null) return acc;
      acc.score += Number(item.score);
      acc.total += Number(item.totalMarks);
      return acc;
    },
    { score: 0, total: 0 },
  );

  return (
    <div className="content-grid">
      <div className="panel-header">
        <div>
          <h3>{assessmentLabel(assessmentType)} Report Card</h3>
          <p className="helper-text">
            {classItem ? `${classItem.name} - ${classItem.section}` : "Class"} • {completed}/{totalSubjects} subjects uploaded
          </p>
        </div>
        <div className="button-row">
          <div className="highlight-card">
            <strong>{totals.total ? `${totals.score}/${totals.total}` : "Pending"}</strong>
            <p className="helper-text">Total</p>
          </div>
          <div className="highlight-card">
            <strong>{totals.total ? `${Math.round((totals.score / totals.total) * 100)}%` : "N/A"}</strong>
            <p className="helper-text">Percentage</p>
          </div>
        </div>
      </div>

      {pendingSubjects.length ? (
        <div className="highlight-card">
          <strong>Pending from teachers</strong>
          <p className="helper-text">{pendingSubjects.join(", ")}</p>
        </div>
      ) : (
        <div className="highlight-card">
          <strong>Complete</strong>
          <p className="helper-text">All subject marks are available for this exam.</p>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.subjectId}>
                <td>
                  {item.subjectName} {item.subjectCode ? <span className="muted-text">({item.subjectCode})</span> : null}
                </td>
                <td>{item.teacherName}</td>
                <td>{item.score === null ? <span className="muted-text">Pending</span> : `${item.score}/${item.totalMarks}`}</td>
                <td>
                  {item.score === null ? (
                    <span className="muted-text">—</span>
                  ) : (
                    <StatusBadge status={item.grade} type={item.pass ? "success" : "danger"} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportCard;

