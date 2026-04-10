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
import { createRecord } from "../../services/firestoreService";
import { gradeFromScore } from "../../utils/formatters";

function TeacherResultsPage() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const results = useCollection(COLLECTIONS.RESULTS);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { assignmentId: "", studentId: "", examName: "", term: "", score: "", totalMarks: "" },
  });

  if ([assignments.loading, students.loading, classes.loading, subjects.loading, results.loading].some(Boolean)) {
    return <Spinner label="Loading results workspace..." />;
  }

  const myAssignments = assignments.data.filter((item) => item.teacherId === userProfile?.linkedProfileId);
  const assignmentOptions = myAssignments.map((item) => {
    const classItem = classes.data.find((classValue) => classValue.id === item.classId);
    const subject = subjects.data.find((subjectValue) => subjectValue.id === item.subjectId);
    return { value: item.id, label: `${classItem?.name ?? item.classId} ${classItem?.section ?? ""} - ${subject?.name ?? item.subjectId}` };
  });
  const selectedAssignment = myAssignments.find((item) => item.id === watch("assignmentId"));
  const studentOptions = students.data
    .filter((item) => item.classId === selectedAssignment?.classId)
    .map((item) => ({ value: item.id, label: `${item.firstName} ${item.lastName} (${item.rollNumber})` }));

  const onSubmit = async (values) => {
    try {
      if (!selectedAssignment) return toast.error("Select a valid assignment");

      await createRecord(COLLECTIONS.RESULTS, {
        studentId: values.studentId,
        classId: selectedAssignment.classId,
        subjectId: selectedAssignment.subjectId,
        teacherId: userProfile?.linkedProfileId,
        examName: values.examName,
        term: values.term,
        score: Number(values.score),
        totalMarks: Number(values.totalMarks),
      });
      toast.success("Result saved");
      reset({ assignmentId: values.assignmentId, studentId: "", examName: "", term: "", score: "", totalMarks: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const myResults = results.data
    .filter((item) => item.teacherId === userProfile?.linkedProfileId)
    .map((item) => {
      const student = students.data.find((studentValue) => studentValue.id === item.studentId);
      const subject = subjects.data.find((subjectValue) => subjectValue.id === item.subjectId);
      return { ...item, studentName: student ? `${student.firstName} ${student.lastName}` : "N/A", subjectName: subject?.name ?? "N/A" };
    });

  return (
    <div className="content-grid">
      <PageHeader title="Results Management" subtitle="Enter marks only for the subjects and classes that have been assigned to you." />

      <section className="split-grid">
        <article className="panel">
          <h3>Enter Marks</h3>
          <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <FormField label="Assignment" name="assignmentId" type="select" register={register} errors={errors} options={assignmentOptions} rules={{ required: "Assignment is required" }} />
              <FormField label="Student" name="studentId" type="select" register={register} errors={errors} options={studentOptions} rules={{ required: "Student is required" }} />
              <FormField label="Assessment Name" name="examName" register={register} errors={errors} rules={{ required: "Assessment name is required" }} />
              <FormField label="Term" name="term" register={register} errors={errors} rules={{ required: "Term is required" }} />
              <FormField label="Score" name="score" type="number" register={register} errors={errors} rules={{ required: "Score is required" }} />
              <FormField label="Total Marks" name="totalMarks" type="number" register={register} errors={errors} rules={{ required: "Total marks is required" }} />
            </div>
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Result"}</button>
          </form>
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
          { key: "examName", label: "Assessment" },
          { key: "term", label: "Term" },
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
