import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// رفع فيديو أو PDF للدرس، وبيرجع رابط التحميل + بيبلغ عن نسبة التقدم
export function uploadLessonFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageRef = ref(storage, `lessons/${safeName}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, fileName: file.name });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}
