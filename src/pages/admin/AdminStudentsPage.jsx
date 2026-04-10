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

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  rollNumber: "",
  classId: "",
  userId: "",
};

function AdminStudentsPage() {
  const students = useCollection(COLLECTIONS.STUDENTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const classOptions = useMemo(
    () => classes.data.map((classItem) => ({ value: classItem.id, label: `${classItem.name} - ${classItem.section}` })),
    [classes.data],
  );

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    reset({ ...defaultValues, ...student });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await updateRecord(COLLECTIONS.STUDENTS, editing.id, values);
        toast.success("Student updated successfully");
      } else {
        const customId = values.userId?.trim() || undefined;
        await createRecord(COLLECTIONS.STUDENTS, values, customId);
        toast.success("Student created successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student record?")) return;
    await deleteRecord(COLLECTIONS.STUDENTS, id);
    toast.success("Student deleted");
  };

  if (students.loading || classes.loading) return <Spinner label="Loading students..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="Student Management"
        subtitle="Create, edit, and publish official student profiles, guardians, and class enrollment."
        actions={<button className="button primary" type="button" onClick={openCreate}>Add Student</button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Student", render: (row) => `${row.firstName} ${row.lastName}` },
          { key: "rollNumber", label: "Roll Number" },
          { key: "email", label: "Email" },
          {
            key: "classId",
            label: "Class",
            render: (row) => {
              const classItem = classes.data.find((item) => item.id === row.classId);
              return classItem ? `${classItem.name} - ${classItem.section}` : "Unassigned";
            },
          },
          { key: "guardianName", label: "Guardian" },
        ]}
        rows={students.data}
        emptyTitle="No students yet"
        emptyDescription="Add the first student record to begin class enrollment and academic tracking."
        actions={(row) => (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={() => openEdit(row)}>Edit</button>
            <button className="button danger" type="button" onClick={() => handleDelete(row.id)}>Delete</button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Edit Student" : "Add Student"} onClose={() => setOpen(false)}>
        <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="First Name" name="firstName" register={register} errors={errors} rules={{ required: "First name is required" }} />
            <FormField label="Last Name" name="lastName" register={register} errors={errors} rules={{ required: "Last name is required" }} />
            <FormField label="Email" name="email" type="email" register={register} errors={errors} rules={{ required: "Email is required" }} />
            <FormField label="Phone" name="phone" register={register} errors={errors} />
            <FormField label="Roll Number" name="rollNumber" register={register} errors={errors} rules={{ required: "Roll number is required" }} />
            <FormField label="Class" name="classId" type="select" register={register} errors={errors} options={classOptions} rules={{ required: "Class is required" }} />
            <FormField label="Guardian Name" name="guardianName" register={register} errors={errors} />
            <FormField label="Guardian Phone" name="guardianPhone" register={register} errors={errors} />
            <FormField label="Linked User ID" name="userId" register={register} errors={errors} placeholder="Firebase auth uid after account creation" />
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Student"}</button>
            <button className="button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminStudentsPage;
