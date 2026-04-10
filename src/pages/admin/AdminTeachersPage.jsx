import { useState } from "react";
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
  employeeId: "",
  qualification: "",
  department: "",
  userId: "",
};

function AdminTeachersPage() {
  const teachers = useCollection(COLLECTIONS.TEACHERS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  };

  const openEdit = (teacher) => {
    setEditing(teacher);
    reset({ ...defaultValues, ...teacher });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await updateRecord(COLLECTIONS.TEACHERS, editing.id, values);
        toast.success("Teacher updated successfully");
      } else {
        const customId = values.userId?.trim() || undefined;
        await createRecord(COLLECTIONS.TEACHERS, values, customId);
        toast.success("Teacher created successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher record?")) return;
    await deleteRecord(COLLECTIONS.TEACHERS, id);
    toast.success("Teacher deleted");
  };

  if (teachers.loading) return <Spinner label="Loading teachers..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="Teacher Management"
        subtitle="Manage faculty accounts, academic departments, and teacher identity records."
        actions={<button className="button primary" type="button" onClick={openCreate}>Add Teacher</button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Teacher", render: (row) => `${row.firstName} ${row.lastName}` },
          { key: "employeeId", label: "Employee ID" },
          { key: "email", label: "Email" },
          { key: "department", label: "Department" },
          { key: "qualification", label: "Qualification" },
        ]}
        rows={teachers.data}
        emptyTitle="No teachers added"
        emptyDescription="Create teacher records before assigning them to classes and subjects."
        actions={(row) => (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={() => openEdit(row)}>Edit</button>
            <button className="button danger" type="button" onClick={() => handleDelete(row.id)}>Delete</button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Edit Teacher" : "Add Teacher"} onClose={() => setOpen(false)}>
        <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="First Name" name="firstName" register={register} errors={errors} rules={{ required: "First name is required" }} />
            <FormField label="Last Name" name="lastName" register={register} errors={errors} rules={{ required: "Last name is required" }} />
            <FormField label="Email" name="email" type="email" register={register} errors={errors} rules={{ required: "Email is required" }} />
            <FormField label="Phone" name="phone" register={register} errors={errors} />
            <FormField label="Employee ID" name="employeeId" register={register} errors={errors} rules={{ required: "Employee ID is required" }} />
            <FormField label="Qualification" name="qualification" register={register} errors={errors} />
            <FormField label="Department" name="department" register={register} errors={errors} />
            <FormField label="Linked User ID" name="userId" register={register} errors={errors} placeholder="Firebase auth uid after account creation" />
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Teacher"}</button>
            <button className="button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminTeachersPage;
