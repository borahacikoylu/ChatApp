// firebaseConfig.js
import { initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
    projectId: "FIREBASE_PROJECT_ID",
    storageBucket: "FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
    appId: "FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);

export default app;
