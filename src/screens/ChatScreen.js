import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TextInput as RNTextInput,
	Keyboard,
} from "react-native";
import { db, auth } from "../firebase";
import {
	collection,
	addDoc,
	query,
	where,
	onSnapshot,
} from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Timestamp } from "firebase/firestore"; // Import Timestamp

export default function ChatScreen() {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const route = useRoute();
	const { userId, userName } = route.params; // Get user info passed from ChatListScreen

	useEffect(() => {
		const messagesCollection = collection(db, "chats");
		const q = query(
			messagesCollection,
			where("users", "array-contains", auth.currentUser.uid)
		);

		const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const fetchedMessages = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (
					(data.senderId === auth.currentUser.uid &&
						data.receiverId === userId) ||
					(data.senderId === userId && data.receiverId === auth.currentUser.uid)
				) {
					fetchedMessages.push(data);
				}
			});
			setMessages(fetchedMessages);
		});

		return unsubscribe;
	}, [userId]);

	const handleSendMessage = async () => {
		if (message.trim()) {
			const newMessage = {
				senderId: auth.currentUser.uid,
				receiverId: userId,
				text: message,
				timestamp: new Date(),
				users: [auth.currentUser.uid, userId], // Store both user IDs to easily query
			};

			await addDoc(collection(db, "chats"), newMessage);
			setMessage(""); // Clear message input
			Keyboard.dismiss(); // Dismiss keyboard
		}
	};

	const formatTime = (timestamp) => {
		// Convert Firebase Timestamp to Date if needed
		const date =
			timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<Text style={styles.headerText}>{userName}</Text>
				</View>

				<FlatList
					data={messages}
					renderItem={({ item }) => (
						<View
							style={[
								styles.messageContainer,
								item.senderId === auth.currentUser.uid
									? styles.sentMessage
									: styles.receivedMessage,
							]}
						>
							<Text
								style={[
									styles.messageText,
									item.senderId === auth.currentUser.uid
										? styles.sentText
										: styles.receivedText,
								]}
							>
								{item.text}
							</Text>

							{/* Displaying the timestamp */}
							<Text
								style={[
									styles.timeText,
									item.senderId === auth.currentUser.uid
										? styles.sentText
										: styles.receivedText,
								]}
							>
								{formatTime(item.timestamp)}
							</Text>
						</View>
					)}
					keyExtractor={(item, index) => index.toString()}
					contentContainerStyle={styles.messageList}
				/>

				<View style={styles.inputContainer}>
					<RNTextInput
						style={styles.input}
						placeholder="Type a message"
						value={message}
						onChangeText={setMessage}
					/>
					<TouchableOpacity onPress={handleSendMessage}>
						<Text style={styles.sendButton}>Send</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f1f1f1",
	},
	safeArea: {
		flex: 1,
	},
	header: {
		backgroundColor: "#075e54",
		padding: 15,
	},
	headerText: {
		fontSize: 20,
		color: "#fff",
		fontWeight: "bold",
	},
	messageList: {
		padding: 10,
	},
	messageContainer: {
		maxWidth: "80%",
		marginVertical: 5,
		borderRadius: 15,
		padding: 10,
	},
	sentMessage: {
		alignSelf: "flex-end",
		backgroundColor: "#dcf8c6",
		borderBottomRightRadius: 0,
	},
	receivedMessage: {
		alignSelf: "flex-start",
		backgroundColor: "#fff",
		borderBottomLeftRadius: 0,
	},
	messageText: {
		fontSize: 16,
		color: "#333",
	},
	sentText: {
		color: "#333",
	},
	receivedText: {
		color: "#075e54",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#ddd",
	},
	input: {
		flex: 1,
		backgroundColor: "#f1f1f1",
		padding: 10,
		borderRadius: 30,
		fontSize: 16,
	},
	sendButton: {
		marginLeft: 10,
		color: "#075e54",
		fontSize: 16,
		fontWeight: "bold",
	},
	timeText: {
		fontSize: 12,
		color: "#999",
		marginTop: 5,
	},
});
