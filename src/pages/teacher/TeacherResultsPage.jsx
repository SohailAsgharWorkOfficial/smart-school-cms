import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { query, where } from "firebase/firestore";
import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { createRecord } from "../../services/firestoreService";
import { RESULT_ASSESSMENTS } from "../../utils/constants";
import { gradeFromScore } from "../../utils/formatters";
import { assessmentLabel, isAssessmentType, pickLatestResult } from "../../utils/results";
import { resolveLinkedProfileId } from "../../utils/profile";

function TeacherResultsPage() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const [assignmentId, setAssignmentId] = useState("");
  const [assessmentType, setAssessmentType] = useState("midterm");
  const [totalMarks, setTotalMarks] = useState(100);
  const [scoreMap, setScoreMap] = useState({});
  const [saving, setSaving] = useState(false);

  const teacherUid = userProfile?.uid || userProfile?.id || null;
  const teacherScopeId = resolveLinkedProfileId(userProfile);
  const myResultsQuery = useCallback(
    (ref) => query(ref, where("teacherId", "==", teacherScopeId || "__none__")),
    [teacherScopeId],
  );
  const results = useCollection(COLLECTIONS.RESULTS, myResultsQuery);

  const loading = [assignments.loading, students.loading, classes.loading, subjects.loading, results.loading].some(Boolean);
  const myAssignments = assignments.data.filter(
    (item) => (teacherUid && item.teacherUserId === teacherUid) || (teacherScopeId && item.teacherId === teacherScopeId),
  );
  const assignmentOptions = useMemo(() => {
    return myAssignments
      .map((item) => {
        const classItem = classes.data.find((classValue) => classValue.id === item.classId);
        const subject = subjects.data.find((subjectValue) => subjectValue.id === item.subjectId);
        return { value: item.id, label: `${classItem?.name ?? item.classId} ${classItem?.section ?? ""} - ${subject?.name ?? item.subjectId}` };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [classes.data, myAssignments, subjects.data]);

  const effectiveAssignmentId = assignmentId || assignmentOptions[0]?.value || "";
  const selectedAssignment = myAssignments.find((item) => item.id === effectiveAssignmentId);

  const enrolledStudents = useMemo(() => {
    return students.data
      .filter((item) => item.classId === selectedAssignment?.classId)
      .slice()
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [selectedAssignment?.classId, students.data]);

  const existingForSelection = useMemo(() => {
    if (!selectedAssignment) return [];
    return results.data.filter(
      (item) =>
        item.teacherId === teacherScopeId &&
        item.classId === selectedAssignment.classId &&
        item.subjectId === selectedAssignment.subjectId &&
        isAssessmentType(item, assessmentType),
    );
  }, [assessmentType, results.data, selectedAssignment, teacherScopeId]);

  const loadScoreMap = (nextAssignmentId, nextAssessmentType) => {
    const assignment = myAssignments.find((item) => item.id === nextAssignmentId);
    if (!assignment) return {};

    const roster = students.data.filter((item) => item.classId === assignment.classId);
    const existing = results.data.filter(
      (item) =>
        item.teacherId === teacherScopeId &&
        item.classId === assignment.classId &&
        item.subjectId === assignment.subjectId &&
        isAssessmentType(item, nextAssessmentType),
    );

    const grouped = existing.reduce((acc, entry) => {
      acc[entry.studentId] ??= [];
      acc[entry.studentId].push(entry);
      return acc;
    }, {});

    return roster.reduce((acc, student) => {
      const latest = pickLatestResult(grouped[student.id] ?? []);
      acc[student.id] = latest ? Number(latest.score) : "";
      return acc;
    }, {});
  };

  const handleAssignmentChange = (nextValue) => {
    setAssignmentId(nextValue);
    setScoreMap(loadScoreMap(nextValue, assessmentType));
  };

  const handleAssessmentChange = (nextValue) => {
    setAssessmentType(nextValue);
    setScoreMap(loadScoreMap(effectiveAssignmentId, nextValue));
  };

  const saveBulkResults = async () => {
    try {
      if (!teacherScopeId) return toast.error("Teacher profile is not linked properly. Please logout/login again or ask admin to relink your account.");
      if (!selectedAssignment) return toast.error("Select a valid assignment");
      if (!enrolledStudents.length) return toast.error("No students enrolled in this class");
      if (!Number.isFinite(Number(totalMarks)) || Number(totalMarks) <= 0) return toast.error("Enter valid total marks");

      setSaving(true);
      const schoolYearSafe = `${selectedAssignment.schoolYear ?? "unknown"}`.replaceAll("/", "-");
      const writes = enrolledStudents.map((student) => {
        const rawScore = scoreMap[student.id];
        const score = rawScore === "" || rawScore === null || rawScore === undefined ? null : Number(rawScore);
        if (score === null || Number.isNaN(score)) return null;

        const payload = {
          studentId: student.id,
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          teacherId: teacherScopeId,
          schoolYear: selectedAssignment.schoolYear ?? null,
          assessmentType,
          examName: assessmentLabel(assessmentType),
          term: selectedAssignment.schoolYear ?? "N/A",
          score,
          totalMarks: Number(totalMarks),
        };

        const customId = `result-${student.id}-${selectedAssignment.classId}-${selectedAssignment.subjectId}-${assessmentType}-${schoolYearSafe}`;
        return createRecord(COLLECTIONS.RESULTS, payload, customId);
      }).filter(Boolean);

      if (!writes.length) return toast.error("Enter at least one student's marks to save");

      await Promise.all(writes);
      toast.success(`Saved marks for ${writes.length} students`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const myResults = useMemo(() => {
    return results.data
      .filter((item) => item.teacherId === teacherScopeId)
      .map((item) => {
        const student = students.data.find((studentValue) => studentValue.id === item.studentId);
        const subject = subjects.data.find((subjectValue) => subjectValue.id === item.subjectId);
        return {
          ...item,
          studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
          subjectName: subject?.name ?? "N/A",
          assessment: assessmentLabel(item.assessmentType ?? "other"),
        };
      });
  }, [results.data, students.data, subjects.data, teacherScopeId]);

  if (loading) {
    return <Spinner label="Loading results workspace..." />;
  }

  return (
    <div className="content-grid">
      <PageHeader title="Results Management" subtitle="Enter marks only for the subjects and classes that have been assigned to you." />

      <section className="split-grid">
        <article className="panel">
          <h3>Bulk Enter Marks</h3>
          <div className="content-grid">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="assignmentId">Assignment</label>
                <select id="assignmentId" value={effectiveAssignmentId} onChange={(event) => handleAssignmentChange(event.target.value)}>
                  {assignmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="assessmentType">Exam</label>
                <select id="assessmentType" value={assessmentType} onChange={(event) => handleAssessmentChange(event.target.value)}>
                  {RESULT_ASSESSMENTS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="totalMarks">Total Marks</label>
                <input id="totalMarks" type="number" value={totalMarks} onChange={(event) => setTotalMarks(event.target.value)} min="1" />
              </div>
            </div>

            <div className="button-row">
              <button className="button ghost" type="button" onClick={() => setScoreMap(loadScoreMap(effectiveAssignmentId, assessmentType))} disabled={!enrolledStudents.length}>Reload</button>
              <button className="button primary" type="button" onClick={saveBulkResults} disabled={saving || !enrolledStudents.length}>
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>

            {enrolledStudents.length ? (
              <div className="table-wrap">
                <table className="attendance-roster">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((student) => {
                      const score = scoreMap[student.id];
                      const grade = score === "" ? "N/A" : gradeFromScore(Number(score), Number(totalMarks));
                      return (
                        <tr key={student.id}>
                          <td>{student.firstName} {student.lastName} <span className="muted-text">({student.rollNumber})</span></td>
                          <td>
                            <input
                              className="attendance-inline-select"
                              type="number"
                              value={score ?? ""}
                              min="0"
                              max={Number(totalMarks) || undefined}
                              onChange={(event) => setScoreMap((prev) => ({ ...prev, [student.id]: event.target.value }))}
                              placeholder=""
                            />
                          </td>
                          <td>
                            {score === "" || score === null || score === undefined ? (
                              <span className="muted-text">Pending</span>
                            ) : (
                              <StatusBadge status={grade} type={Number(score) / Number(totalMarks) >= 0.5 ? "success" : "danger"} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="highlight-card">
                <strong>No students enrolled in this assigned class yet</strong>
                <p className="helper-text">Ask admin to assign students to this class. Then you can enter marks for everyone at once.</p>
              </div>
            )}

            {existingForSelection.length ? (
              <p className="helper-text">
                Found <strong>{existingForSelection.length}</strong> existing result(s) for this exam. Saving will update them (no duplicates).
              </p>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <h3>Publishing Rules</h3>
          <ul className="list-reset content-grid">
            <li>Teachers can only submit marks within their assigned class and subject pairs.</li>
            <li>Students only see their own result entries in the student area.</li>
            <li>Admin can review everything centrally from the results dashboard.</li>
          </ul>
        </article>
      </section>

      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "subjectName", label: "Subject" },
          { key: "assessment", label: "Assessment" },
          { key: "schoolYear", label: "School Year", render: (row) => row.schoolYear ?? row.term ?? "N/A" },
          { key: "score", label: "Score", render: (row) => `${row.score}/${row.totalMarks}` },
          { key: "grade", label: "Grade", render: (row) => <StatusBadge status={gradeFromScore(row.score, row.totalMarks)} type={Number(row.score) / Number(row.totalMarks) >= 0.5 ? "success" : "danger"} /> },
        ]}
        rows={myResults}
        emptyTitle="No results entered"
        emptyDescription="Your saved marks will appear here."
      />
    </div>
  );
}

export default TeacherResultsPage;
