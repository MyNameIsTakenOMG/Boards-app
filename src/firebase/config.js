// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getFirestore} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import {getFunctions} from 'firebase/functions'
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpib3VfVYnPPg6WaapDaE-432jmW3w8_A",
  authDomain: "boards-app-9e576.firebaseapp.com",
  projectId: "boards-app-9e576",
  storageBucket: "boards-app-9e576.appspot.com",
  messagingSenderId: "104786480635",
  appId: "1:104786480635:web:4ff4d50d2592775741cf5e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// initialize services
const projectFirestore = getFirestore(app);
const projectAuth = getAuth(app);
const projectFunctions = getFunctions(app);
const projectStorage = getStorage(app);

export {projectStorage,projectFirestore, projectAuth, projectFunctions};