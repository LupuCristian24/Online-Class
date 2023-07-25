// import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_Api_Key,
    authDomain: process.env.REACT_APP_FIREBASE_Auth_Domain,
    projectId: process.env.REACT_APP_FIREBASE_Project_Id,
    storageBucket: process.env.REACT_APP_FIREBASE_Storage_Bucket,
    messagingSenderId: process.env.REACT_APP_FIREBASE_Messaging_Sender_Id,
    appId: process.env.React_REACT_APP_FIREBASE_App_Id,
    measurementId: process.env.REACT_APP_FIREBASE_Measurement_Id
  };

  const firebaseApp = initializeApp(firebaseConfig);
  
  export const db = getFirestore(firebaseApp);
  export const auth = getAuth(firebaseApp);
  export const provider = new GoogleAuthProvider();
  export const storage = getStorage(firebaseApp);