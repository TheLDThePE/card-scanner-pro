import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3ri9u3xe4aNvdALRnrg6pzyb0eh_kCe0",
    authDomain: "ld-evacuation.firebaseapp.com",
    projectId: "ld-evacuation",
    storageBucket: "ld-evacuation.firebasestorage.app",
    messagingSenderId: "238147181022",
    appId: "1:238147181022:web:d377e8826ddd31619a654f",
    measurementId: "G-5QDE376EWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence failed: Browser not supported');
    }
});

export { db };
