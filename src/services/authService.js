import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { COLLECTIONS } from "../firebase/collections";
import { auth, db } from "../firebase/config";

export const loginUser = async (email, password) => {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
};

export const logoutUser = () => signOut(auth);

export const getUserProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const registerUser = async ({
  displayName,
  email,
  password,
  role,
  phone,
  guardianName,
  guardianPhone,
  department,
  qualification,
}) => {
  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credentials;

  await updateProfile(user, { displayName });

  const profileId = user.uid;
  const batch = writeBatch(db);

  batch.set(doc(db, COLLECTIONS.USERS, user.uid), {
    uid: user.uid,
    displayName,
    email,
    role,
    linkedProfileId: profileId,
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (role === "teacher") {
    const [firstName = "", ...lastNameParts] = displayName.trim().split(" ");
    batch.set(doc(db, COLLECTIONS.TEACHERS, profileId), {
      firstName,
      lastName: lastNameParts.join(" "),
      email,
      phone: phone || "",
      employeeId: `T-${user.uid.slice(0, 6).toUpperCase()}`,
      qualification: qualification || "",
      department: department || "",
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  if (role === "student") {
    const [firstName = "", ...lastNameParts] = displayName.trim().split(" ");
    batch.set(doc(db, COLLECTIONS.STUDENTS, profileId), {
      firstName,
      lastName: lastNameParts.join(" "),
      email,
      phone: phone || "",
      rollNumber: `STD-${user.uid.slice(0, 6).toUpperCase()}`,
      guardianName: guardianName || "",
      guardianPhone: guardianPhone || "",
      classId: "",
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return user;
};
