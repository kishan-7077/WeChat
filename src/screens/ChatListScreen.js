import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from "react-native";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function ChatListScreen() {
	const [users, setUsers] = useState([]);
	const navigation = useNavigation();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const usersCollection = collection(db, "users");
				const q = query(
					usersCollection,
					where("uid", "!=", auth.currentUser.uid) // Fetch users except the logged-in user
				);
				const querySnapshot = await getDocs(q);
				const usersArray = [];
				querySnapshot.forEach((doc) => {
					usersArray.push(doc.data());
				});
				setUsers(usersArray);
			} catch (error) {
				console.error("Error fetching users: ", error);
			}
		};

		fetchUsers();
	}, []);

	const handleUserPress = (user) => {
		// Navigate to the chat screen with the selected user
		navigation.navigate("Chat", { userId: user.uid, userName: user.name });
	};

	const handleLogout = async () => {
		try {
			await auth.signOut(); // Sign the user out
			navigation.replace("Login"); // Navigate to Login screen
		} catch (error) {
			console.error("Error signing out: ", error);
		}
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={users}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.userItem}
						onPress={() => handleUserPress(item)}
					>
						<Text style={styles.userName}>{item.name}</Text>
					</TouchableOpacity>
				)}
				keyExtractor={(item) => item.uid}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	userItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
	},
	userName: {
		fontSize: 18,
		color: "#333",
	},
});
