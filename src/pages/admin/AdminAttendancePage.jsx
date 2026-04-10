import DataTable from "../../components/shared/DataTable";
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

  if ([attendance.loading, students.loading, subjects.loading, classes.loading].some(Boolean)) {
    return <Spinner label="Loading attendance..." />;
  }

  return (
    <div className="content-grid">
      <PageHeader title="Attendance Records" subtitle="Review all attendance records published by teachers across class and subject assignments." />

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
