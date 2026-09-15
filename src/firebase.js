import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

// Login
export async function loginAdmin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// بيانات المنصة
const docRef = doc(db, "lms", "data");

const DEFAULT_STATE = {
  students: [],
  lessons: [],
  progress: {},
  adminPass: "2580",
};

export function subscribeToState(callback) {
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        callback({ ...DEFAULT_STATE, ...d });
      } else {
        setDoc(docRef, DEFAULT_STATE)
          .then(() => callback(DEFAULT_STATE))
          .catch((e) =>
            console.error("Firestore init error:", e)
          );
      }
    },
    (err) => {
      console.error("Firestore sync error:", err);
    }
  );
}

export async function saveField(field, value) {
  try {
    await setDoc(
      docRef,
      { [field]: value },
      { merge: true }
    );
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}
