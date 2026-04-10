import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const createRecord = async (collectionName, payload, customId) => {
  const data = {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (customId) {
    await setDoc(doc(db, collectionName, customId), data, { merge: true });
    return customId;
  }

  const reference = await addDoc(collection(db, collectionName), data);
  return reference.id;
};

export const updateRecord = async (collectionName, id, payload) => {
  await updateDoc(doc(db, collectionName, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const deleteRecord = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};
