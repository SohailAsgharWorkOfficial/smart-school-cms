import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { query, where } from "firebase/firestore";
import AttendanceCalendar from "../../components/shared/AttendanceCalendar";
import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { ATTENDANCE_OPTIONS } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";
import { createRecord } from "../../services/firestoreService";
import { resolveLinkedProfileId } from "../../utils/profile";

function TeacherAttendancePage() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const [assignmentId, setAssignmentId] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [saving, setSaving] = useState(false);

  const teacherUid = userProfile?.uid || userProfile?.id || null;
  const teacherScopeId = resolveLinkedProfileId(userProfile);

  const myAttendanceQuery = useCallback(
    (ref) => query(ref, where("teacherId", "==", teacherScopeId || "__none__")),
    [teacherScopeId],
  );
  const attendance = useCollection(COLLECTIONS.ATTENDANCE, myAttendanceQuery);

  const loading = [assignments.loading, classes.loading, students.loading, subjects.loading, attendance.loading].some(Boolean);
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
      .sort((left, right) => `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`));
  }, [selectedAssignment?.classId, students.data]);

  const statusOptions = useMemo(() => ATTENDANCE_OPTIONS.map((option) => ({ value: option, label: option })), []);

  const statusTypeFor = (status) => (status === "present" ? "success" : status === "late" ? "warning" : status === "absent" ? "danger" : "info");

  const existingForSelectedDate = useMemo(() => {
    if (!selectedAssignment || !dateValue) return [];
    return attendance.data.filter(
      (item) =>
        item.teacherId === teacherScopeId &&
        item.classId === selectedAssignment.classId &&
        item.subjectId === selectedAssignment.subjectId &&
        item.date === dateValue,
    );
  }, [attendance.data, dateValue, selectedAssignment, teacherScopeId]);

  const loadStatusMap = (nextAssignmentId, nextDate) => {
    const nextAssignment = myAssignments.find((item) => item.id === nextAssignmentId);
    if (!nextAssignment || !nextDate) return {};
    const roster = students.data.filter((item) => item.classId === nextAssignment.classId);
    const existing = attendance.data.filter(
      (item) =>
        item.teacherId === teacherScopeId &&
        item.classId === nextAssignment.classId &&
        item.subjectId === nextAssignment.subjectId &&
        item.date === nextDate,
    );
    const existingMap = existing.reduce((acc, entry) => {
      acc[entry.studentId] = entry.status;
      return acc;
    }, {});

    return roster.reduce((acc, student) => {
      acc[student.id] = existingMap[student.id] ?? "present";
      return acc;
    }, {});
  };

  const handleAssignmentChange = (nextValue) => {
    setAssignmentId(nextValue);
    setStatusMap(loadStatusMap(nextValue, dateValue));
  };

  const handleDateChange = (nextValue) => {
    setDateValue(nextValue);
    setStatusMap(loadStatusMap(effectiveAssignmentId, nextValue));
  };

  const setAllStatuses = (status) => {
    if (!enrolledStudents.length) return;
    setStatusMap(
      enrolledStudents.reduce((acc, student) => {
        acc[student.id] = status;
        return acc;
      }, {}),
    );
  };

  const saveBulkAttendance = async () => {
    try {
      if (!teacherScopeId) return toast.error("Teacher profile is not linked properly. Please logout/login again or ask admin to relink your account.");
      if (!selectedAssignment) return toast.error("Select a valid assigned class and subject");
      if (!dateValue) return toast.error("Select an attendance date");
      if (!enrolledStudents.length) return toast.error("No students enrolled in this class");

      setSaving(true);
      const writes = enrolledStudents.map((student) => {
        const status = statusMap[student.id] ?? "present";
        const payload = {
          studentId: student.id,
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          teacherId: teacherScopeId,
          date: dateValue,
          status,
        };
        const customId = `attendance-${student.id}-${selectedAssignment.classId}-${selectedAssignment.subjectId}-${dateValue}`;
        return createRecord(COLLECTIONS.ATTENDANCE, payload, customId);
      });

      await Promise.all(writes);
      toast.success(`Saved attendance for ${enrolledStudents.length} students`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const assignmentCalendarRecords = useMemo(() => {
    if (!selectedAssignment) return [];
    const classItem = classes.data.find((item) => item.id === selectedAssignment.classId);
    const subjectName = subjects.data.find((item) => item.id === selectedAssignment.subjectId)?.name ?? "N/A";
    const className = classItem ? `${classItem.name} - ${classItem.section}` : "N/A";
    return attendance.data
      .filter(
        (item) =>
          item.teacherId === teacherScopeId &&
          item.classId === selectedAssignment.classId &&
          item.subjectId === selectedAssignment.subjectId,
      )
      .map((entry) => {
        const student = students.data.find((item) => item.id === entry.studentId);
        return {
          ...entry,
          className,
          subjectName,
          studentName: student ? `${student.firstName} ${student.lastName}` : "N/A",
        };
      });
  }, [attendance.data, classes.data, selectedAssignment, students.data, subjects.data, teacherScopeId]);

  const myAttendanceRows = useMemo(() => {
    return attendance.data
      .filter((item) => item.teacherId === teacherScopeId)
      .map((entry) => {
        const student = students.data.find((item) => item.id === entry.studentId);
        const subject = subjects.data.find((item) => item.id === entry.subjectId);
        return { ...entry, studentName: student ? `${student.firstName} ${student.lastName}` : "N/A", subjectName: subject?.name ?? "N/A" };
      });
  }, [attendance.data, students.data, subjects.data, teacherScopeId]);

  if (loading) {
    return <Spinner label="Loading attendance workspace..." />;
  }

  return (
    <div className="content-grid">
      <PageHeader title="Attendance Management" subtitle="Mark and update attendance only for students in your assigned classes and subjects." />

      <section className="split-grid">
        <article className="panel">
          <h3>Bulk Mark Attendance</h3>
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
                <label htmlFor="attendance-date">Date</label>
                <input id="attendance-date" type="date" value={dateValue} onChange={(event) => handleDateChange(event.target.value)} />
              </div>
            </div>

            <div className="button-row">
              <button className="button secondary" type="button" onClick={() => setAllStatuses("present")} disabled={!dateValue || !enrolledStudents.length}>All Present</button>
              <button className="button secondary" type="button" onClick={() => setAllStatuses("absent")} disabled={!dateValue || !enrolledStudents.length}>All Absent</button>
              <button className="button ghost" type="button" onClick={() => setStatusMap(loadStatusMap(effectiveAssignmentId, dateValue))} disabled={!dateValue || !enrolledStudents.length}>Reload</button>
              <button className="button primary" type="button" onClick={saveBulkAttendance} disabled={saving || !dateValue || !enrolledStudents.length}>
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>

            {dateValue && enrolledStudents.length ? (
              <div className="table-wrap">
                <table className="attendance-roster">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.firstName} {student.lastName} <span className="muted-text">({student.rollNumber})</span></td>
                        <td>
                          <select
                            className="attendance-inline-select"
                            value={statusMap[student.id] ?? "present"}
                            onChange={(event) => setStatusMap((prev) => ({ ...prev, [student.id]: event.target.value }))}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="highlight-card">
                <strong>{dateValue ? "No students enrolled in this class yet" : "Select a date first"}</strong>
                <p className="helper-text">
                  {dateValue
                    ? "Ask admin to assign students to this class. Once roster exists, you can mark attendance in one click."
                    : "Pick a date to load your class roster and mark everyone at once."}
                </p>
              </div>
            )}

            {existingForSelectedDate.length ? (
              <p className="helper-text">
                Found <strong>{existingForSelectedDate.length}</strong> existing record(s) for this date. Saving will update them (no duplicates).
              </p>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <h3>Rule Enforcement</h3>
          <ul className="list-reset content-grid">
            <li>Only your own `assignments` are available.</li>
            <li>Roster is auto-derived from the selected assignment's class.</li>
            <li>Saving uses a deterministic record ID per student/date to prevent duplicates.</li>
          </ul>
          {selectedAssignment ? (
            enrolledStudents.length ? (
              <div className="highlight-card">
                <strong>Enrolled students in this class: {enrolledStudents.length}</strong>
                <p className="helper-text">
                  {enrolledStudents.map((item) => `${item.firstName} ${item.lastName}`).join(", ")}
                </p>
              </div>
            ) : (
              <div className="highlight-card">
                <strong>No students enrolled in this assigned class yet</strong>
                <p className="helper-text">
                  Open Admin `Student Management` and assign students to this class first. The
                  teacher dropdown is empty because no `students.classId` matches this assignment.
                </p>
              </div>
            )
          ) : (
            <div className="highlight-card">
              <strong>Select an assignment first</strong>
              <p className="helper-text">
                Once you choose a class-subject assignment, the enrolled class roster will appear here.
              </p>
            </div>
          )}
        </article>
      </section>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h3>Class Attendance Calendar</h3>
            <p className="helper-text">Monthly view for your selected class-subject attendance.</p>
          </div>
        </div>
        <AttendanceCalendar
          records={assignmentCalendarRecords}
          emptyLabel="No attendance records for this assignment in this month."
          detailColumns={[
            { key: "studentName", label: "Student", render: (row) => row.studentName ?? "N/A" },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type={statusTypeFor(row.status)} /> },
          ]}
          sortComparator={(a, b) => `${a.studentName ?? ""}`.localeCompare(`${b.studentName ?? ""}`)}
        />
      </article>

      <DataTable
        columns={[
          { key: "studentName", label: "Student" },
          { key: "subjectName", label: "Subject" },
          { key: "date", label: "Date", render: (row) => formatDate(row.date) },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} type={row.status === "present" ? "success" : row.status === "late" ? "warning" : "danger"} /> },
        ]}
        rows={myAttendanceRows}
        emptyTitle="No attendance records yet"
        emptyDescription="Your marked attendance history will appear here."
      />
    </div>
  );
}

export default TeacherAttendancePage;
