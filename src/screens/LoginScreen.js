import React, { useState, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Alert,
	TouchableOpacity,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth, db } from "../firebase"; // Your Firebase configuration file
import {
	signInWithCredential,
	signInWithPhoneNumber,
	PhoneAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function LoginScreen({ navigation }) {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [name, setName] = useState(""); // New state for user's name
	const [verificationId, setVerificationId] = useState(null);

	const recaptchaVerifier = useRef(null);

	// Function to send verification code
	const sendVerificationCode = async () => {
		if (!phoneNumber.startsWith("+")) {
			Alert.alert(
				"Error",
				"Phone number must be in E.164 format (+15555555555)"
			);
			return;
		}

		// Ensure the name is provided
		if (!name) {
			Alert.alert("Error", "Please enter your name.");
			return;
		}

		try {
			const confirmationResult = await signInWithPhoneNumber(
				auth,
				phoneNumber,
				recaptchaVerifier.current
			);
			setVerificationId(confirmationResult.verificationId);
			Alert.alert("Success", "Verification code has been sent to your phone.");
		} catch (error) {
			console.error("Error sending verification code:", error);
			Alert.alert("Error", error.message);
		}
	};

	// Function to verify the code
	const verifyCode = async () => {
		if (!verificationCode) {
			Alert.alert("Error", "Please enter the verification code.");
			return;
		}

		try {
			const credential = PhoneAuthProvider.credential(
				verificationId,
				verificationCode
			);
			await signInWithCredential(auth, credential);

			// After successful login, save user data in Firestore
			const user = auth.currentUser;
			const userRef = doc(db, "users", user.uid);
			await setDoc(userRef, {
				uid: user.uid,
				phoneNumber: user.phoneNumber,
				name: name, // Store the user's name
				profilePic: user.photoURL || "", // Default to an empty string if no photoURL
			});

			// Store user info in AsyncStorage for persistent login state
			await AsyncStorage.setItem("user", JSON.stringify({ uid: user.uid }));

			Alert.alert("Success", "You are now logged in.");
			navigation.replace("Home"); // Replace with your Home Screen
		} catch (error) {
			console.error("Error verifying code:", error);
			Alert.alert("Error", error.message);
		}
	};

	return (
		<View style={styles.container}>
			<FirebaseRecaptchaVerifierModal
				ref={recaptchaVerifier}
				firebaseConfig={auth.app.options}
			/>
			<Text style={styles.title}>Login</Text>
			<Text style={styles.subtitle}>Enter your phone number to log in</Text>

			{/* Phone number input */}
			<TextInput
				style={styles.input}
				placeholder="Phone Number (+15555555555)"
				keyboardType="phone-pad"
				onChangeText={setPhoneNumber}
				maxLength={15} // Max length for phone number format
			/>

			{/* Name input - shown after phone number is entered */}
			{!verificationId && (
				<TextInput
					style={styles.input}
					placeholder="Your Name"
					onChangeText={setName}
					value={name}
					maxLength={50}
				/>
			)}

			{/* Button to send the verification code */}
			<TouchableOpacity style={styles.button} onPress={sendVerificationCode}>
				<Text style={styles.buttonText}>Send Code</Text>
			</TouchableOpacity>

			{/* Once verificationId is set, show the verification code input */}
			{verificationId && (
				<>
					<TextInput
						style={styles.input}
						placeholder="Verification Code"
						keyboardType="number-pad"
						onChangeText={setVerificationCode}
						maxLength={6} // Max length for verification code
					/>
					<TouchableOpacity style={styles.button} onPress={verifyCode}>
						<Text style={styles.buttonText}>Verify Code</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#ffffff", // White background similar to WhatsApp's style
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#075e54", // WhatsApp's green color
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		color: "#666",
		marginBottom: 30,
		textAlign: "center",
	},
	input: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#dcdcdc", // Lighter border similar to WhatsApp's inputs
		padding: 15,
		borderRadius: 30, // Rounded corners
		marginBottom: 20,
		fontSize: 16,
		backgroundColor: "#f1f1f1", // Light background for inputs
		color: "#333", // Dark text for better contrast
	},
	button: {
		width: "100%",
		backgroundColor: "#075e54", // WhatsApp's green color
		padding: 15,
		borderRadius: 30, // Rounded corners for button
		alignItems: "center",
		marginBottom: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
