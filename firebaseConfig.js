import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
    apiKey: "Your API Key",
    authDomain: "YOUR PROJECT DETAILS",
    projectId: "YOUR PROJECT DETAILS",
    storageBucket: "YOUR PROJECT DETAILS",
    messagingSenderId: "YOUR PROJECT DETAILS",
    appId: "YOUR PROJECT DETAILS"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { app, auth, firestore };
