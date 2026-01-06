import React, { createContext, useReducer, useCallback } from "react";
import {
	getDefaultRoute,
	hasPermission,
	canAccessRoute,
} from "../utils/authUtils";
import { initialState, AUTH_ACTIONS } from "./authTypes";
import { authReducer } from "./authReducer";
import { saveAuthData, clearAuthData } from "./auth/authStorage";
import {
	login as authLogin,
	register as authRegister,
	logout as authLogout,
} from "./auth/authLogin";
import { updateProfile, refreshUser, restoreSession } from "./auth/authProfile";
import {
	verifyEmail,
	forgotPassword,
	resetPassword,
	updatePassword,
} from "./auth/authPassword";
import {
	setUser,
	updateActivity,
	isTokenExpired,
	createContextValue,
} from "./auth/authUtils";
import { useRestoreSession, useUserActivity } from "./auth/authHooks";

import pushService from "../services/pushService";

// Création du contexte
const AuthContext = createContext();

// Provider du contexte
export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// Wrapper functions pour les actions
	const login = async (credentials) => {
		return await authLogin(credentials, dispatch);
	};

	const register = async (userData) => {
		return await authRegister(userData, dispatch);
	};

	const logout = async () => {
		return await authLogout(dispatch, clearAuthData);
	};

	const updateProfileWrapper = async (userData) => {
		return await updateProfile(userData, state, dispatch);
	};

	const refreshUserWrapper = async () => {
		return await refreshUser(state, dispatch);
	};

	// Utiliser useCallback pour éviter la boucle infinie
	const restoreSessionWrapper = useCallback(async () => {
		return await restoreSession(dispatch, clearAuthData);
	}, [dispatch]);

	const setUserWrapper = (updatedUser) => {
		const token = localStorage.getItem("harvests_token");
		setUser(updatedUser, token, dispatch);
	};

	const updateActivityWrapper = () => {
		updateActivity(dispatch);
	};

	const isTokenExpiredWrapper = () => {
		return isTokenExpired(state.tokenExpiry);
	};

	const clearError = () => {
		dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
	};

	// S'abonner aux notifications push quand l'utilisateur est connecté
	React.useEffect(() => {
		if (state.user && state.isAuthenticated) {
			const isAdmin =
				state.user.userType === "admin" ||
				["super-admin", "admin", "moderator", "support"].includes(
					state.user.role
				);
		}
	}, [state.user, state.isAuthenticated]);

	// Hooks
	useRestoreSession(restoreSessionWrapper);
	useUserActivity(state, updateActivityWrapper, isTokenExpiredWrapper, logout);

	// Valeur du contexte
	const value = createContextValue(
		state,
		{
			login,
			register,
			logout,
			updateProfile: updateProfileWrapper,
			setUser: setUserWrapper,
			clearError,
			refreshUser: refreshUserWrapper,
			verifyEmail,
			forgotPassword,
			resetPassword,
			updatePassword,
			updateActivity: updateActivityWrapper,
		},
		{
			hasPermission,
			canAccessRoute,
			getDefaultRoute,
		}
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Exporter le contexte pour le hook
export { AuthContext };
