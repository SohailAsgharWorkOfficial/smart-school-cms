import PageHeader from "../../components/shared/PageHeader";
import Spinner from "../../components/shared/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { COLLECTIONS } from "../../firebase/collections";
import useCollection from "../../hooks/useCollection";

function ProfilePage() {
  const { userProfile } = useAuth();
  const collectionName = userProfile?.role === "teacher" ? COLLECTIONS.TEACHERS : COLLECTIONS.STUDENTS;
  const linkedId = userProfile?.linkedProfileId;
  const { data, loading } = useCollection(collectionName);

  if (loading) {
    return <Spinner label="Loading profile..." />;
  }

  const linkedRecord = data.find((item) => item.id === linkedId);

  return (
    <div className="content-grid">
      <PageHeader title="My Profile" subtitle="Personal and academic information available for your current role." />

      <section className="split-grid">
        <article className="info-card">
          <h3>Account Details</h3>
          <p><strong>Name:</strong> {userProfile?.displayName}</p>
          <p><strong>Email:</strong> {userProfile?.email}</p>
          <p><strong>Role:</strong> {userProfile?.role}</p>
          <p><strong>Status:</strong> {userProfile?.status ?? "active"}</p>
        </article>

        <article className="info-card">
          <h3>Linked Record</h3>
          {linkedRecord ? (
            <>
              <p><strong>ID:</strong> {linkedRecord.rollNumber ?? linkedRecord.employeeId ?? linkedRecord.id}</p>
              <p><strong>Phone:</strong> {linkedRecord.phone ?? "N/A"}</p>
              {linkedRecord.guardianName ? <p><strong>Guardian:</strong> {linkedRecord.guardianName}</p> : null}
              {linkedRecord.department ? <p><strong>Department:</strong> {linkedRecord.department}</p> : null}
            </>
          ) : (
            <p className="muted-text">No linked role record is available yet.</p>
          )}
        </article>
      </section>
    </div>
  );
}

export default ProfilePage;
