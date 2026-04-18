// Firebase Configuration for Noir Auteur
const firebaseConfig = {
  apiKey: "AIzaSyBQe-rdzIO9Z78SZGtm5Cfj3p_LI-oG-Rw",
  authDomain: "noir-analytics-b7c31.firebaseapp.com",
  projectId: "noir-analytics-b7c31",
  storageBucket: "noir-analytics-b7c31.firebasestorage.app",
  messagingSenderId: "668981725883",
  appId: "1:668981725883:web:69fb4c2dd1c2eb8721779e",
  measurementId: "G-Y00MR1P5ZQ"
};

// Initialize Firebase Firebase (Compat version for easier integration)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Export Globally
window.db = db;
