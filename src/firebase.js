// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getAuth,
	initializeAuth,
	getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDZFpZpk60VmJoi-V5qkXFbxPhIDVOvFtw",
	authDomain: "wechat-16ea4.firebaseapp.com",
	databaseURL: "https://wechat-16ea4-default-rtdb.firebaseio.com",
	projectId: "wechat-16ea4",
	storageBucket: "wechat-16ea4.firebasestorage.app",
	messagingSenderId: "37387719869",
	appId: "1:37387719869:web:9d55614ac41be84fd893d4",
	measurementId: "G-CFDBKWD7LB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
