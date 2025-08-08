// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAmENepwvW1eH8-tfsCmdbMzGeCvmnryI",
  authDomain: "spectrum-analyser-f68b9.firebaseapp.com",
  projectId: "spectrum-analyser-f68b9",
  storageBucket: "spectrum-analyser-f68b9.appspot.com",
  messagingSenderId: "375665648027",
  appId: "1:375665648027:web:1fa45961305c48b8c9413e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services for use in other components
export { auth, db };
