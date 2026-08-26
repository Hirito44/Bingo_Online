// Using Firebase from CDN (window.firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDSYXSzV42vdTXnSZOMcVGHDNyAfqRQQYw",
  authDomain: "bingo-aa0fa.firebaseapp.com",
  databaseURL: "https://bingo-aa0fa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bingo-aa0fa",
  storageBucket: "bingo-aa0fa.firebasestorage.app",
  messagingSenderId: "884728363933",
  appId: "1:884728363933:web:4551b89b2762847a08cd74",
  measurementId: "G-7PDXTDSRZ2"
};

// Initialize Firebase if not already initialized
if (!window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig);
}

export const database = window.firebase.database();
