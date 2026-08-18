import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

// 이 Firebase 프로젝트는 다른 앱들과 (default) Firestore 데이터베이스를 함께 사용하므로
// 컬렉션 이름에 접두사를 붙여 다른 앱의 데이터와 충돌하지 않도록 한다.
export const TODOS_COLLECTION = "todolist_todos";
export const RECURRING_PAYMENTS_COLLECTION = "todolist_recurringPayments";
