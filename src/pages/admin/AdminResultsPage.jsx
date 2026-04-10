import DataTable from "../../components/shared/DataTable";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import StatusBadge from "../../components/shared/StatusBadge";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { gradeFromScore } from "../../utils/formatters";

function AdminResultsPage() {
  const results = useCollection(COLLECTIONS.RESULTS);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);

  if ([results.loading, students.loading, subjects.loading].some(Boolean)) {
    return <Spinner label="Loading results..." />;
  }

  return (
    <div className="content-grid">
      <PageHeader title="Results Management" subtitle="Inspect and manage all marks entered by teachers before or after publication." />

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
          { key: "subjectId", label: "Subject", render: (row) => subjects.data.find((item) => item.id === row.subjectId)?.name ?? "N/A" },
          { key: "examName", label: "Assessment" },
          { key: "term", label: "Term" },
          { key: "score", label: "Score", render: (row) => `${row.score}/${row.totalMarks}` },
          {
            key: "grade",
            label: "Grade",
            render: (row) => <StatusBadge status={gradeFromScore(row.score, row.totalMarks)} type={Number(row.score) / Number(row.totalMarks) >= 0.5 ? "success" : "danger"} />,
          },
        ]}
        rows={results.data}
        emptyTitle="No result records"
        emptyDescription="Teacher result entries will show here once marks are published."
      />
    </div>
  );
}

export default AdminResultsPage;
