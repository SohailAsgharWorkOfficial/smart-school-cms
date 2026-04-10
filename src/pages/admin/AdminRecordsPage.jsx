import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import FormField from "../../components/forms/FormField";
import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import { COLLECTIONS } from "../../firebase/collections";
import { db } from "../../firebase/config";
import { createRecord } from "../../services/firestoreService";
import { seedDemoSchoolData } from "../../services/seedService";

const defaultValues = { name: "", address: "", phone: "", principalName: "", academicYear: "", notes: "" };

function AdminRecordsPage() {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, COLLECTIONS.SCHOOL, "profile"), (snapshot) => {
      const value = snapshot.exists() ? snapshot.data() : defaultValues;
      reset(value);
      setLoading(false);
    });

    return unsubscribe;
  }, [reset]);

  const onSubmit = async (values) => {
    await createRecord(COLLECTIONS.SCHOOL, values, "profile");
    toast.success("School record updated");
  };

  const handleSeed = async () => {
    try {
      await seedDemoSchoolData();
      toast.success("Demo data seeded to Firestore");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Spinner label="Loading school records..." />;

  return (
    <div className="content-grid">
      <PageHeader
        title="School Records"
        subtitle="Manage official school profile settings and seed demonstration data for local evaluation."
        actions={<button className="button secondary" type="button" onClick={handleSeed}>Seed Demo Data</button>}
      />

      <section className="split-grid">
        <article className="panel">
          <h3>School Profile</h3>
          <form className="content-grid" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <FormField label="School Name" name="name" register={register} errors={errors} rules={{ required: "School name is required" }} />
              <FormField label="Phone" name="phone" register={register} errors={errors} />
              <FormField label="Address" name="address" register={register} errors={errors} />
              <FormField label="Principal" name="principalName" register={register} errors={errors} />
              <FormField label="Academic Year" name="academicYear" register={register} errors={errors} />
              <FormField label="Notes" name="notes" type="textarea" register={register} errors={errors} />
            </div>
            <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save School Record"}</button>
          </form>
        </article>

        <article className="panel">
          <h3>Demo Data Notes</h3>
          <ul className="list-reset content-grid">
            <li>Seeds sample school profile, one teacher, one student, one class, and two subjects.</li>
            <li>Creates teacher assignment, attendance, and result demo entries.</li>
            <li>Also seeds `users` role documents for clear Firestore structure references.</li>
            <li>Use Firebase Authentication to create actual login accounts with the same emails.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default AdminRecordsPage;
