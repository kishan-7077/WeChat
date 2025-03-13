import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import LoginScreen from "./screens/LoginScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { AuthProvider } from "./AuthContext";

const Stack = createStackNavigator();

export default function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	// Check if user is logged in by checking AsyncStorage
	useEffect(() => {
		const checkLoginStatus = async () => {
			const user = await AsyncStorage.getItem("user");
			console.log("Stored user:", user); // Add logging to check AsyncStorage value

			if (user) {
				setIsLoggedIn(true); // User is logged in
			} else {
				setIsLoggedIn(false); // User is not logged in
			}
		};

		checkLoginStatus();
	}, []); // Run only once when the app starts

	const handleLogout = async () => {
		// Remove user data from AsyncStorage
		await AsyncStorage.removeItem("user");
		setIsLoggedIn(false); // Update the state to reflect logged-out status
	};

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: "#fff", // WeChat/WhatsApp header color
					},
					headerTintColor: "#075e54", // Text color of header
					headerTitleAlign: "left", // Center the title
				}}
			>
				{isLoggedIn ? (
					<>
						<Stack.Screen
							name="Home"
							component={ChatListScreen}
							options={{
								title: "WeChat",
								headerRight: () => (
									<TouchableOpacity onPress={handleLogout}>
										<Icon name="log-out-outline" size={25} color="#075e54" />
									</TouchableOpacity>
								),
							}} // Custom title for Chat List screen
						/>
						<Stack.Screen
							name="Chat"
							component={ChatScreen}
							options={{
								headerShown: false,
							}} // Custom title for Chat screen
						/>
					</>
				) : (
					<>
						<Stack.Screen
							name="Login"
							component={LoginScreen}
							options={{
								title: "Login to WeChat",
							}} // Custom title for Login screen
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
