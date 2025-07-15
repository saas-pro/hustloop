
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDEv3CHNo3X0pg0ssG8hdO1-mJNPpXlE-s",
  authDomain: "hustloop.firebaseapp.com",
  projectId: "hustloop",
  storageBucket: "hustloop.firebasestorage.app",
  messagingSenderId: "1059618765323",
  appId: "1:1059618765323:web:443c3e836dc18dd5dba50e",
  measurementId: "G-G1YRLQ771T"
};

// A function to initialize Firebase App, ensuring it's a singleton.
// This is now safe to be called on both server and client.
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const firebaseApp = app;
export function getFirebaseApp(): FirebaseApp {
    return app;
}
