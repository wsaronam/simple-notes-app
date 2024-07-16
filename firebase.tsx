// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "hidden",
  authDomain: "hidden",
  projectId: "hidden",
  storageBucket: "hidden",
  messagingSenderId: "hidden",
  appId: "hidden"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Get instance of database
const db = getFirestore(app)
// Get collection of our notes data
export const notesCollection = collection(db, "notes")