import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import FormField from "../../components/forms/FormField";
import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { createRecord, updateRecord } from "../../services/firestoreService";
import { ATTENDANCE_OPTIONS } from "../../utils/constants";
import { formatDate } from "../../utils/formatters";

function TeacherAttendancePage() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const attendance = useCollection(COLLECTIONS.ATTENDANCE);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { assignmentId: "", studentId: "", date: "", status: "present" },
  });

  if ([assignments.loading, classes.loading, students.loading, subjects.loading, attendance.loading].some(Boolean)) {
    return <Spinner label="Loading attendance workspace..." />;
  }

  const myAssignments = assignments.data.filter((item) => item.teacherId === userProfile?.linkedProfileId);
  const assignmentOptions = myAssignments.map((item) => {
    const classItem = classes.data.find((classValue) => classValue.id === item.classId);
    const subject = subjects.data.find((subjectValue) => subjectValue.id === item.subjectId);
    return { value: item.id, label: `${classItem?.name ?? item.classId} ${classItem?.section ?? ""} - ${subject?.name ?? item.subjectId}` };
  });
  const selectedAssignment = myAssignments.find((item) => item.id === watch("assignmentId"));
  const enrolledStudents = students.data
    .filter((item) => item.classId === selectedAssignment?.classId)
    .sort((left, right) => `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`));
  const studentOptions = enrolledStudents
    .map((item) => ({ value: item.id, label: `${item.firstName} ${item.lastName} (${item.rollNumber})` }));
  const statusOptions = ATTENDANCE_OPTIONS.map((option) => ({ value: option, label: option }));

  const onSubmit = async (values) => {
    try {
      const assignment = myAssignments.find((item) => item.id === values.assignmentId);
      if (!assignment) return toast.error("Select a valid assigned class and subject");

      const existingEntry = attendance.data.find(
        (item) =>
          item.studentId === values.studentId &&
          item.subjectId === assignment.subjectId &&
          item.classId === assignment.classId &&
          item.date === values.date,
      );
      const payload = {
        studentId: values.studentId,
        classId: assignment.classId,
        subjectId: assignment.subjectId,
        teacherId: userProfile?.linkedProfileId,
        date: values.date,
        status: values.status,
      };

      if (existingEntry) {
        await updateRecord(COLLECTIONS.ATTENDANCE, existingEntry.id, payload);
        toast.success("Attendance updated");
      } else {
        await createRecord(COLLECTIONS.ATTENDANCE, payload);
        toast.success("Attendance marked");
      }

      reset({ assignmentId: values.assignmentId, studentId: "", date: "", status: "present" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const myAttendanceRows = attendance.data
    .filter((item) => item.teacherId === userProfile?.linkedProfileId)
    .map((entry) => {
      const student = students.data.find((item) => item.id === entry.studentId);
      const subject = subjects.data.find((item) => item.id === entry.subjectId);
      return { ...entry, studentName: student ? `${student.firstName} ${student.lastName}` : "N/A", subjectName: subject?.name ?? "N/A" };
    });

  return (
    <div className="content-grid">
      <PageHeader title="Attendance Management" subtitle="Mark and update attendance only for students in your assigned classes and subjects." />

      <section className="split-grid">
        <article className="panel">
          <h3>Mark Attendance</h3>
          <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <FormField label="Assignment" name="assignmentId" type="select" register={register} errors={errors} options={assignmentOptions} rules={{ required: "Assignment is required" }} />
              <FormField label="Student" name="studentId" type="select" register={register} errors={errors} options={studentOptions} rules={{ required: "Student is required" }} />
              <FormField label="Date" name="date" type="date" register={register} errors={errors} rules={{ required: "Date is required" }} />
              <FormField label="Status" name="status" type="select" register={register} errors={errors} options={statusOptions} rules={{ required: "Status is required" }} />
            </div>
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Attendance"}</button>
          </form>
        </article>

        <article className="panel">
          <h3>Rule Enforcement</h3>
          <ul className="list-reset content-grid">
            <li>Only your own `assignments` are available in the form.</li>
            <li>Student dropdown is derived from the selected assigned class.</li>
            <li>Existing attendance entries are updated instead of duplicated for the same date.</li>
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
