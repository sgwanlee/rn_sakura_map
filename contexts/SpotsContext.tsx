import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { type CherrySpot } from "../constants/spots";

const COLLECTION = "cherry_spots";
const STORAGE_KEY = "cherry_spots_cache";

interface SpotsContextValue {
  spots: CherrySpot[];
  loading: boolean;
}

const SpotsContext = createContext<SpotsContextValue>({
  spots: [],
  loading: true,
});

export function SpotsProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<CherrySpot[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cached data first
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as CherrySpot[];
          setSpots(parsed);
          setLoading(false);
        } catch {}
      }
    });
  }, []);

  // Subscribe to Firestore and update cache
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
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
        },
        (error) => {
          console.warn("[SpotsProvider] Firestore error:", error);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  return (
    <SpotsContext.Provider value={{ spots, loading }}>
      {children}
    </SpotsContext.Provider>
  );
}

export function useSpots() {
  return useContext(SpotsContext);
}
