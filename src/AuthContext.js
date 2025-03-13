// AuthContext.js
import React, { createContext, useContext, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define actions
const SET_USER = "SET_USER";
const REMOVE_USER = "REMOVE_USER";

// Initial state for authentication
const initialState = {
	isLoggedIn: false,
	user: null,
};

// Reducer function to handle login state changes
const authReducer = (state, action) => {
	switch (action.type) {
		case SET_USER:
			return {
				...state,
				isLoggedIn: true,
				user: action.payload,
			};
		case REMOVE_USER:
			return {
				...state,
				isLoggedIn: false,
				user: null,
			};
		default:
			return state;
	}
};

// Create context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app
export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// Check if user is already logged in by checking AsyncStorage
	const checkUserLogin = async () => {
		const user = await AsyncStorage.getItem("user");
		if (user) {
			dispatch({ type: SET_USER, payload: JSON.parse(user) });
		}
	};

	// Function to log the user in
	const loginUser = async (user) => {
		await AsyncStorage.setItem("user", JSON.stringify(user));
		dispatch({ type: SET_USER, payload: user });
	};

	// Function to log the user out
	const logoutUser = async () => {
		await AsyncStorage.removeItem("user");
		dispatch({ type: REMOVE_USER });
	};

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: state.isLoggedIn,
				user: state.user,
				loginUser,
				logoutUser,
				checkUserLogin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
