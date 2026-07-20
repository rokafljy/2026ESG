// Firebase Admin SDK — 서버(API Route) 전용 싱글턴
// 서비스 계정 자격증명은 환경변수로만 관리하며 클라이언트에 절대 노출되지 않습니다.

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App | undefined;

function adminApp(): App {
  if (!app) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Netlify 등의 env 저장소는 PEM 줄바꿈을 \n 문자열로 이스케이프하므로 복원 필수
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
  }
  return app;
}

export function adminDb() {
  return getFirestore(adminApp());
}

export function adminAuth() {
  return getAuth(adminApp());
}

export function adminBucket() {
  return getStorage(adminApp()).bucket();
}
