import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { sampleSeedData } from "../data/sampleData";
import { COLLECTIONS } from "../firebase/collections";
import { db } from "../firebase/config";

const upsertMany = async (collectionName, items) => {
  await Promise.all(
    items.map((item) =>
      setDoc(
        doc(db, collectionName, item.id),
        {
          ...item,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );
};

export const seedDemoSchoolData = async () => {
  await setDoc(
    doc(db, COLLECTIONS.SCHOOL, "profile"),
    { ...sampleSeedData.school, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true },
  );

  await upsertMany(COLLECTIONS.USERS, sampleSeedData.users);
  await upsertMany(COLLECTIONS.TEACHERS, sampleSeedData.teachers);
  await upsertMany(COLLECTIONS.CLASSES, sampleSeedData.classes);
  await upsertMany(COLLECTIONS.SUBJECTS, sampleSeedData.subjects);
  await upsertMany(COLLECTIONS.STUDENTS, sampleSeedData.students);
  await upsertMany(COLLECTIONS.ASSIGNMENTS, sampleSeedData.assignments);
  await upsertMany(COLLECTIONS.ATTENDANCE, sampleSeedData.attendance);
  await upsertMany(COLLECTIONS.RESULTS, sampleSeedData.results);
};
