import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA2zr0-Czr2K8aU_sNHB4sVsEYHxcXtOXU",
    authDomain: "project-2942784991429937034.firebaseapp.com",
    projectId: "project-2942784991429937034",
    storageBucket: "project-2942784991429937034.firebasestorage.app",
    messagingSenderId: "875318755446",
    appId: "1:875318755446:web:0246818546c6d6d2cf1f57",
    measurementId: "G-FFLHQGRRFH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
