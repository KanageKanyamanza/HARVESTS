import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { generateUniqueId } from "../utils/uuid";
import { notificationService } from "../services/notificationService";
import { NotificationContext } from "./NotificationContextObject";

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const auth = useAuth();
	const isAuthenticated = auth?.isAuthenticated || false;
	const user = auth?.user || null;
	const isAdmin = user?.role === "admin" || user?.userType === "admin";

	const cleanupOldNotifications = useCallback(() => {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		setNotifications((prev) => {
			const filtered = prev.filter((notification) => {
				const notificationDate = new Date(notification.timestamp);
				return notificationDate > thirtyDaysAgo;
			});

			if (filtered.length !== prev.length) {
				if (filtered.length > 0) {
					localStorage.setItem("harvests_notifications", JSON.stringify(filtered));
				} else {
					localStorage.removeItem("harvests_notifications");
				}
			}
			return filtered;
		});

		const currentNotifications = JSON.parse(localStorage.getItem("harvests_notifications") || "[]");
		setUnreadCount(currentNotifications.filter((n) => !n.read).length);
	}, []);

	useEffect(() => {
		const loadNotifications = async () => {
			if (isAuthenticated && !isAdmin) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				try {
					const backendNotifications = await notificationService.getNotifications(1, 50);
					setNotifications(backendNotifications.notifications || []);
					setUnreadCount(backendNotifications.unreadCount || 0);
				} catch (error) {
					if (error.response?.status !== 401) {
						console.error("[NotificationProvider] Erreur backend:", error);
					}
					loadFromLocalStorage();
				}
			} else {
				loadFromLocalStorage();
			}
		};

		const loadFromLocalStorage = () => {
			const savedNotifications = localStorage.getItem("harvests_notifications");
			if (savedNotifications) {
				try {
					const parsed = JSON.parse(savedNotifications);
					setNotifications(parsed);
					setUnreadCount(parsed.filter((n) => !n.read).length);
				} catch (error) {
					console.error("Erreur chargement local:", error);
				}
			}
		};

		loadNotifications();
		if (!isAuthenticated) cleanupOldNotifications();

		let pollingInterval;
		if (isAuthenticated && !isAdmin) {
			pollingInterval = setInterval(async () => {
				if (document.hidden) return;
				try {
					const backendNotifications = await notificationService.getNotifications(1, 50);
					setNotifications(backendNotifications.notifications || []);
					setUnreadCount(backendNotifications.unreadCount || 0);
				} catch {}
			}, 60000);
		}
		return () => pollingInterval && clearInterval(pollingInterval);
	}, [isAuthenticated, isAdmin, cleanupOldNotifications]);

	useEffect(() => {
		const updateAppBadge = async () => {
			try {
				if ("setAppBadge" in navigator) {
					if (unreadCount > 0) await navigator.setAppBadge(unreadCount);
					else await navigator.clearAppBadge();
				}
			} catch {}
		};
		updateAppBadge();
	}, [unreadCount]);

	useEffect(() => {
		if (!isAuthenticated && notifications.length > 0) {
			localStorage.setItem("harvests_notifications", JSON.stringify(notifications));
		}
	}, [notifications, isAuthenticated]);

	const removeNotification = useCallback(async (notificationId) => {
		setNotifications((prev) => {
			const notification = prev.find((n) => n.id === notificationId);
			if (notification && !notification.read) setUnreadCount((p) => Math.max(0, p - 1));
			return prev.filter((n) => n.id !== notificationId);
		});
		if (isAuthenticated && notificationId?.match(/^[0-9a-fA-F]{24}$/)) {
			try { await notificationService.deleteNotification(notificationId); } catch {}
		}
	}, [isAuthenticated]);

	const addNotification = useCallback((notification) => {
		const newNotif = {
			id: generateUniqueId(),
			...notification,
			timestamp: new Date().toISOString(),
			read: false,
			showAsToast: notification.showAsToast !== false,
		};
		setNotifications((prev) => [newNotif, ...prev]);
		setUnreadCount((prev) => prev + 1);
		if (notification.showAsToast === true) {
			setTimeout(() => removeNotification(newNotif.id), 5000);
		}
	}, [removeNotification]);

	const markAsRead = useCallback(async (notificationId) => {
		if (isAuthenticated) {
			try {
				await notificationService.markAsRead(notificationId);
				const res = await notificationService.getNotifications(1, 50);
				setNotifications(res.notifications || []);
				setUnreadCount(res.unreadCount || 0);
			} catch {
				setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n));
				setUnreadCount((p) => Math.max(0, p - 1));
			}
		} else {
			setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n));
			setUnreadCount((p) => Math.max(0, p - 1));
		}
	}, [isAuthenticated]);

	const markAllAsRead = useCallback(async () => {
		if (isAuthenticated) {
			try {
				await notificationService.markAllAsRead();
				const res = await notificationService.getNotifications(1, 50);
				setNotifications(res.notifications || []);
				setUnreadCount(res.unreadCount || 0);
			} catch {
				setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
				setUnreadCount(0);
			}
		} else {
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
		}
	}, [isAuthenticated]);

	const clearAllNotifications = useCallback(async () => {
		setNotifications([]);
		setUnreadCount(0);
		localStorage.removeItem("harvests_notifications");
		if (isAuthenticated) { try { await notificationService.deleteAllNotifications(); } catch {} }
	}, [isAuthenticated]);

	const showSuccess = useCallback((m, t = "Succès", s = true) => addNotification({ type: "success", title: t, message: m, icon: "✅", showAsToast: s }), [addNotification]);
	const showError = useCallback((m, t = "Erreur", s = true) => addNotification({ type: "error", title: t, message: m, icon: "❌", showAsToast: s }), [addNotification]);
	const showInfo = useCallback((m, t = "Info", s = true) => addNotification({ type: "info", title: t, message: m, icon: "ℹ️", showAsToast: s }), [addNotification]);
	const showWarning = useCallback((m, t = "Attention", s = true) => addNotification({ type: "warning", title: t, message: m, icon: "⚠️", showAsToast: s }), [addNotification]);

	const refreshNotifications = useCallback(async () => {
		if (isAuthenticated) {
			try {
				const res = await notificationService.getNotifications(1, 50);
				setNotifications(res.notifications || []);
				setUnreadCount(res.unreadCount || 0);
			} catch {}
		} else {
			const saved = localStorage.getItem("harvests_notifications");
			if (saved) {
				const parsed = JSON.parse(saved);
				setNotifications(parsed);
				setUnreadCount(parsed.filter((n) => !n.read).length);
			}
		}
	}, [isAuthenticated]);

	const value = useMemo(() => ({
		notifications, unreadCount, addNotification, markAsRead, markAllAsRead,
		removeNotification, clearAllNotifications, refreshNotifications,
		cleanupOldNotifications, showSuccess, showError, showInfo, showWarning
	}), [
		notifications, unreadCount, addNotification, markAsRead, markAllAsRead,
		removeNotification, clearAllNotifications, refreshNotifications,
		cleanupOldNotifications, showSuccess, showError, showInfo, showWarning
	]);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};
