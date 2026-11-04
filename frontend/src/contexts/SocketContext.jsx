import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { AuthContext } from "../store/AuthContext";

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook stable, motif context+hook+provider standard du projet
export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
	const { user, isAuthenticated } = useContext(AuthContext);
	const [socket, setSocket] = useState(null);
	const [isConnected, setIsConnected] = useState(false);

	// URL du serveur (sans le chemin /api/v1)
	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
	const SOCKET_URL = new URL(API_URL).origin;

	// Une mise à jour du profil crée un nouvel objet `user` : seul le changement
	// de compte doit rouvrir la connexion, sinon les messages émis entre-temps sont perdus.
	const userId = user?._id || user?.id;

	useEffect(() => {
		let newSocket;

		if (isAuthenticated && userId) {
			if (localStorage.getItem("harvests_token")) {
				newSocket = io(SOCKET_URL, {
					// Relu à chaque tentative : le jeton d'accès (15 min) a pu être renouvelé
					// depuis l'ouverture. Hors de l'URL pour ne pas finir dans les journaux.
					auth: (cb) => cb({ token: localStorage.getItem("harvests_token") }),
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
	}, [isAuthenticated, userId, SOCKET_URL]);

	const value = {
		socket,
		isConnected,
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};

export default SocketContext;
