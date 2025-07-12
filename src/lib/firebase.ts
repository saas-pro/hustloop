
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBw7SxFgACSo_BqMiwpl_Wmha1yljkhVhc",
  authDomain: "hustloop.firebaseapp.com",
  projectId: "hustloop",
  storageBucket: "hustloop.firebasestorage.app",
  messagingSenderId: "1059618765323",
  appId: "1:1059618765323:web:443c3e836dc18dd5dba50e",
  measurementId: "G-G1YRLQ771T"
};

// A function to initialize Firebase App, ensuring it's a singleton.
// This can be called safely from the client-side.
export function getFirebaseApp(): FirebaseApp {
    if (typeof window === 'undefined') {
        throw new Error('getFirebaseApp() must only be called on the client side');
    }
    if (getApps().length) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}
