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

const defaultValues = { name: "", section: "", room: "", academicYear: "" };

function AdminClassesPage() {
  const classes = useCollection(COLLECTIONS.CLASSES);
  const students = useCollection(COLLECTIONS.STUDENTS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  };

  const openEdit = (classItem) => {
    setEditing(classItem);
    reset({ ...defaultValues, ...classItem });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await updateRecord(COLLECTIONS.CLASSES, editing.id, values);
        toast.success("Class updated successfully");
      } else {
        await createRecord(COLLECTIONS.CLASSES, values);
        toast.success("Class created successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class record?")) return;
    await deleteRecord(COLLECTIONS.CLASSES, id);
    toast.success("Class deleted");
  };

  if (classes.loading || students.loading) return <Spinner label="Loading classes..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="Class Management"
        subtitle="Organize class sections, rooms, and enrollment anchors used across the system."
        actions={<button className="button primary" type="button" onClick={openCreate}>Add Class</button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Class Name" },
          { key: "section", label: "Section" },
          { key: "room", label: "Room" },
          { key: "academicYear", label: "Academic Year" },
          { key: "studentCount", label: "Students", render: (row) => students.data.filter((item) => item.classId === row.id).length },
        ]}
        rows={classes.data}
        emptyTitle="No classes available"
        emptyDescription="Add a class section so students and subjects can be organized correctly."
        actions={(row) => (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={() => openEdit(row)}>Edit</button>
            <button className="button danger" type="button" onClick={() => handleDelete(row.id)}>Delete</button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Edit Class" : "Add Class"} onClose={() => setOpen(false)}>
        <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Class Name" name="name" register={register} errors={errors} rules={{ required: "Class name is required" }} />
            <FormField label="Section" name="section" register={register} errors={errors} rules={{ required: "Section is required" }} />
            <FormField label="Room" name="room" register={register} errors={errors} />
            <FormField label="Academic Year" name="academicYear" register={register} errors={errors} rules={{ required: "Academic year is required" }} />
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Class"}</button>
            <button className="button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminClassesPage;
