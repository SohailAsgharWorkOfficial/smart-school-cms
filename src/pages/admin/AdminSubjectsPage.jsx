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

const defaultValues = { name: "", code: "", description: "", classIds: [] };

function AdminSubjectsPage() {
  const subjects = useCollection(COLLECTIONS.SUBJECTS);
  const classes = useCollection(COLLECTIONS.CLASSES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const classOptions = useMemo(
    () => classes.data.map((item) => ({ value: item.id, label: `${item.name} - ${item.section}` })).sort((a, b) => a.label.localeCompare(b.label)),
    [classes.data],
  );

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues);
    setOpen(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    reset({ ...defaultValues, ...subject, classIds: Array.isArray(subject.classIds) ? subject.classIds : [] });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const prepared = {
        ...values,
        classIds: Array.isArray(values.classIds) ? values.classIds : values.classIds ? [values.classIds] : [],
      };
      if (editing) {
        await updateRecord(COLLECTIONS.SUBJECTS, editing.id, prepared);
        toast.success("Subject updated successfully");
      } else {
        await createRecord(COLLECTIONS.SUBJECTS, prepared);
        toast.success("Subject created successfully");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject record?")) return;
    await deleteRecord(COLLECTIONS.SUBJECTS, id);
    toast.success("Subject deleted");
  };

  if ([subjects.loading, classes.loading].some(Boolean)) return <Spinner label="Loading subjects..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="Subject Management"
        subtitle="Maintain subject catalog entries that teachers and students reference in class assignments."
        actions={<button className="button primary" type="button" onClick={openCreate}>Add Subject</button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Subject" },
          { key: "code", label: "Code" },
          { key: "description", label: "Description" },
          {
            key: "classIds",
            label: "Classes",
            render: (row) => {
              const classIds = Array.isArray(row.classIds) ? row.classIds : [];
              if (!classIds.length) return "All / Unassigned";
              const labels = classIds
                .map((id) => classes.data.find((item) => item.id === id))
                .filter(Boolean)
                .map((item) => `${item.name} - ${item.section}`);
              return labels.length ? labels.join(", ") : "All / Unassigned";
            },
          },
        ]}
        rows={subjects.data}
        emptyTitle="No subjects found"
        emptyDescription="Add subjects before linking them to classes and teachers."
        actions={(row) => (
          <div className="inline-actions">
            <button className="button secondary" type="button" onClick={() => openEdit(row)}>Edit</button>
            <button className="button danger" type="button" onClick={() => handleDelete(row.id)}>Delete</button>
          </div>
        )}
      />

      <Modal open={open} title={editing ? "Edit Subject" : "Add Subject"} onClose={() => setOpen(false)}>
        <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Subject Name" name="name" register={register} errors={errors} rules={{ required: "Subject name is required" }} />
            <FormField label="Subject Code" name="code" register={register} errors={errors} rules={{ required: "Subject code is required" }} />
            <FormField label="Description" name="description" type="textarea" register={register} errors={errors} />
            <div className="form-group">
              <label htmlFor="classIds">Classes</label>
              <select id="classIds" multiple {...register("classIds")}>
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="helper-text">Select one or more classes. Leave empty if this subject applies to all classes.</p>
            </div>
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Subject"}</button>
            <button className="button ghost" type="button" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminSubjectsPage;
