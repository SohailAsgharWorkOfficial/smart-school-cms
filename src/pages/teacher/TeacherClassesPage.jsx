import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { resolveLinkedProfileId } from "../../utils/profile";

function TeacherClassesPage() {
  const { userProfile } = useAuth();
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);

  if ([assignments.loading, classes.loading, students.loading, subjects.loading].some(Boolean)) {
    return <Spinner label="Loading teacher classes..." />;
  }

  const teacherUid = userProfile?.uid || userProfile?.id || null;
  const teacherScopeId = resolveLinkedProfileId(userProfile);
  const myAssignments = assignments.data.filter(
    (item) => (teacherUid && item.teacherUserId === teacherUid) || (teacherScopeId && item.teacherId === teacherScopeId),
  );
  const rows = myAssignments.map((assignment) => {
    const classItem = classes.data.find((item) => item.id === assignment.classId);
    const subject = subjects.data.find((item) => item.id === assignment.subjectId);
    const enrolledStudents = students.data.filter((item) => item.classId === assignment.classId);
    return {
      id: assignment.id,
      className: classItem ? `${classItem.name} - ${classItem.section}` : assignment.classId,
      subjectName: subject?.name ?? assignment.subjectId,
      studentCount: enrolledStudents.length,
      studentRoster: enrolledStudents.length
        ? enrolledStudents.map((item) => `${item.firstName} ${item.lastName}`).join(", ")
        : "No enrolled students yet",
      schoolYear: assignment.schoolYear,
    };
  });

  return (
    <div className="content-grid">
      <PageHeader title="Assigned Classes" subtitle="View only the classes and subjects allocated to your account." />
      <DataTable
        columns={[
          { key: "className", label: "Class" },
          { key: "subjectName", label: "Subject" },
          { key: "studentCount", label: "Students" },
          { key: "studentRoster", label: "Enrolled Roster" },
          { key: "schoolYear", label: "School Year" },
        ]}
        rows={rows}
        emptyTitle="No assignments available"
        emptyDescription="Ask the admin to assign you to a class and subject."
      />
    </div>
  );
}

export default TeacherClassesPage;
