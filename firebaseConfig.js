import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
    apiKey: "AIzaSyADbA9pgJju8YvDBbmI24EkexYj3QDCvd4",
    authDomain: "intouch-chat-app.firebaseapp.com",
    projectId: "intouch-chat-app",
    storageBucket: "intouch-chat-app.appspot.com",
    messagingSenderId: "153489940234",
    appId: "1:153489940234:web:d47b44b90a9400d3bda4f3"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { app, auth, firestore };