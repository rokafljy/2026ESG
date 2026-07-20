// Firebase 클라이언트 SDK — 지연 초기화 (브라우저에서 첫 사용 시점에 초기화)
// 빌드/프리렌더 단계에서는 환경변수가 없어도 모듈 로드가 실패하지 않도록
// 반드시 함수 호출 시점에 초기화합니다.
// NEXT_PUBLIC_* 설정값은 공개 가능한 값입니다 — 실제 보안은 Security Rules가 담당합니다.

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | undefined;

function firebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
  }
  return app;
}

export function clientAuth(): Auth {
  return getAuth(firebaseApp());
}

export function clientDb(): Firestore {
  return getFirestore(firebaseApp());
}

export function clientStorage(): FirebaseStorage {
  return getStorage(firebaseApp());
}

export const googleProvider = new GoogleAuthProvider();
