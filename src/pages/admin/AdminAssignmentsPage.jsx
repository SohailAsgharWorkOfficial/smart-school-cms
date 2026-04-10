import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import FormField from "../../components/forms/FormField";
import DataTable from "../../components/shared/DataTable";
import Modal from "../../components/shared/Modal";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";
import { createRecord, deleteRecord, updateRecord } from "../../services/firestoreService";

const defaultValues = { classId: "", subjectId: "", teacherId: "", schoolYear: "" };

function AdminAssignmentsPage() {
  const assignments = useCollection(COLLECTIONS.ASSIGNMENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const teachers = useCollection(COLLECTIONS.TEACHERS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const classOptions = useMemo(() => classes.data.map((item) => ({ value: item.id, label: `${item.name} - ${item.section}` })), [classes.data]);
  const subjectOptions = useMemo(() => subjects.data.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` })), [subjects.data]);
  const teacherOptions = useMemo(() => teachers.data.map((item) => ({ value: item.id, label: `${item.firstName} ${item.lastName}` })), [teachers.data]);

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  };

  const openEdit = (assignment) => {
    setEditing(assignment);
    reset({ ...defaultValues, ...assignment });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await updateRecord(COLLECTIONS.ASSIGNMENTS, editing.id, values);
        toast.success("Assignment updated successfully");
      } else {
        await createRecord(COLLECTIONS.ASSIGNMENTS, values);
        toast.success("Assignment created successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await deleteRecord(COLLECTIONS.ASSIGNMENTS, id);
    toast.success("Assignment deleted");
  };

  if ([assignments.loading, classes.loading, subjects.loading, teachers.loading].some(Boolean)) {
    return <Spinner label="Loading assignments..." />;
  }

  const resolveLabel = (list, id, formatter) => formatter(list.find((item) => item.id === id));

  return (
    <div className="content-grid">
      <PageHeader
        title="Teacher Assignments"
        subtitle="Link teachers to the subjects and class sections they are permitted to manage."
        actions={<button className="button primary" type="button" onClick={openCreate}>Add Assignment</button>}
      />

      <DataTable
        columns={[
          { key: "classId", label: "Class", render: (row) => resolveLabel(classes.data, row.classId, (item) => item ? `${item.name} - ${item.section}` : "N/A") },
          { key: "subjectId", label: "Subject", render: (row) => resolveLabel(subjects.data, row.subjectId, (item) => item ? item.name : "N/A") },
          { key: "teacherId", label: "Teacher", render: (row) => resolveLabel(teachers.data, row.teacherId, (item) => item ? `${item.firstName} ${item.lastName}` : "N/A") },
          { key: "schoolYear", label: "School Year" },
        ]}
        rows={assignments.data}
        emptyTitle="No assignments available"
        emptyDescription="Assign a teacher to a class and subject to unlock restricted workflows."
        actions={(row) => (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={() => openEdit(row)}>Edit</button>
            <button className="button danger" type="button" onClick={() => handleDelete(row.id)}>Delete</button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Edit Assignment" : "Add Assignment"} onClose={() => setOpen(false)}>
        <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Class" name="classId" type="select" register={register} errors={errors} options={classOptions} rules={{ required: "Class is required" }} />
            <FormField label="Subject" name="subjectId" type="select" register={register} errors={errors} options={subjectOptions} rules={{ required: "Subject is required" }} />
            <FormField label="Teacher" name="teacherId" type="select" register={register} errors={errors} options={teacherOptions} rules={{ required: "Teacher is required" }} />
            <FormField label="School Year" name="schoolYear" register={register} errors={errors} rules={{ required: "School year is required" }} />
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Assignment"}</button>
            <button className="button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminAssignmentsPage;
