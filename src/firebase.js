import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

const docRef = doc(db, "lms", "data");

const DEFAULT_STATE = {
  students: [],
  lessons: [],
  progress: {},
  adminPass: "2580",
};

// تسجيل دخول الطالب بشكل مجهول
async function ensureAnonymousLogin() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

// تسجيل دخول المدرّس
export async function loginAdmin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// تحميل بيانات المنصة
export async function subscribeToState(callback) {
  try {
    await ensureAnonymousLogin();

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
  } catch (e) {
    console.error("Firebase anonymous login error:", e);
    throw e;
  }
}

export async function saveField(field, value) {
  try {
    await ensureAnonymousLogin();

    await setDoc(
      docRef,
      { [field]: value },
      { merge: true }
    );
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}
