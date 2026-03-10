import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { type CherrySpot, type Region } from "../constants/spots";

const COLLECTION = "cherry_spots";

export function useSpots() {
  const [spots, setSpots] = useState<CherrySpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection(COLLECTION)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<CherrySpot, "id">),
          }));
          setSpots(data);
          setLoading(false);
        },
        (error) => {
          console.warn("[useSpots] Firestore error:", error);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  return { spots, loading };
}
