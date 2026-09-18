import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const docRef = doc(db, "lms", "data");

const DEFAULT_STATE = { students: [], lessons: [], progress: {}, adminPass: "2580" };

export function subscribeToState(callback) {
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        callback({ ...DEFAULT_STATE, ...d });
      } else {
        setDoc(docRef, DEFAULT_STATE).catch((e) => console.error(e));
        callback(DEFAULT_STATE);
      }
    },
    (err) => {
      console.error("Firestore sync error:", err);
    }
  );
}

export async function saveField(field, value) {
  try {
    await setDoc(docRef, { [field]: value }, { merge: true });
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}
