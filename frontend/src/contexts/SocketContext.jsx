import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "../store/AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
	const { user, isAuthenticated } = useContext(AuthContext);
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [activeUsers, setActiveUsers] = useState([]);

	// URL du serveur (sans le chemin /api/v1)
	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
	const SOCKET_URL = new URL(API_URL).origin;

	useEffect(() => {
		let newSocket;

		if (isAuthenticated && user) {
			// Récupérer le token du localStorage comme backup si non dispo dans le contexte immédiat
			const token = localStorage.getItem("harvests_token");

			if (token) {
				newSocket = io(SOCKET_URL, {
					auth: {
						token: token,
					},
					query: {
						token: token,
					},
					// Options de reconnexion
					reconnection: true,
					reconnectionAttempts: 10,
					reconnectionDelay: 1000,
				});

				newSocket.on("connect", () => {
					console.log("✅ Socket connected:", newSocket.id);
					setIsConnected(true);
				});

				newSocket.on("disconnect", () => {
					console.log("❌ Socket disconnected");
					setIsConnected(false);
				});

				newSocket.on("connect_error", (err) => {
					console.error("⚠️ Socket connection error:", err.message);
					setIsConnected(false);
				});

				setSocket(newSocket);
			}
		}

		return () => {
			if (newSocket) {
				newSocket.disconnect();
			}
		};
	}, [isAuthenticated, user, SOCKET_URL]);

	const value = {
		socket,
		isConnected,
		activeUsers,
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};

export default SocketContext;
