// firebase/index.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHacUCNfD9TLt6dJikiHVxg1FGq9fy6I0",
  authDomain: "spoton-645b5.firebaseapp.com",
  projectId: "spoton-645b5",
  storageBucket: "spoton-645b5.firebasestorage.app",
  messagingSenderId: "928397598606",
  appId: "1:928397598606:web:81de2d57e8f9a4fd994edf",
  measurementId: "G-KXXWR5HE3N"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);

export default app;