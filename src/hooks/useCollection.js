import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";

function useCollection(collectionName, buildQuery) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!collectionName) {
      setError("Invalid collection name");
      setLoading(false);
      return () => {};
    }

    const reference = collection(db, collectionName);
    const preparedQuery = buildQuery ? buildQuery(reference) : reference;

    const unsubscribe = onSnapshot(
      preparedQuery,
      (snapshot) => {
        setData(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [buildQuery, collectionName]);

  return { data, loading, error };
}

export default useCollection;
