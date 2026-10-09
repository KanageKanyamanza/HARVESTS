import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNotificationDate } from "../../utils/notificationHelpers";
import {
	FiBell,
	FiX,
	FiCheck,
	FiTrash2,
	FiShoppingBag,
	FiPackage,
	FiTruck,
	FiAlertCircle,
	FiRefreshCw,
} from "react-icons/fi";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { getNotificationsRoute } from "../../utils/routeUtils";

const NotificationDropdown = ({ shouldBeTransparent }) => {
	const { t } = useTranslation("common");
	const [isOpen, setIsOpen] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const { user } = useAuth();
	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		removeNotification,
		refreshNotifications,
	} = useNotifications();

	// Fermer le dropdown quand on clique à l'extérieur
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Obtenir l'icône selon la catégorie de notification
	const getNotificationIcon = (category) => {
		switch (category) {
			case "order":
				return <FiShoppingBag className="h-4 w-4 text-blue-500" />;
			case "payment":
				return <FiTruck className="h-4 w-4 text-green-500" />;
			case "product":
				return <FiPackage className="h-4 w-4 text-orange-500" />;
			case "system":
				return <FiAlertCircle className="h-4 w-4 text-red-500" />;
			case "message":
				return <FiBell className="h-4 w-4 text-purple-500" />;
			case "account":
				return <FiAlertCircle className="h-4 w-4 text-yellow-500" />;
			case "marketing":
				return <FiBell className="h-4 w-4 text-pink-500" />;
			default:
				return <FiBell className="h-4 w-4 text-gray-500" />;
		}
	};

	// Obtenir la couleur de fond selon la catégorie
	const getNotificationBgColor = (category) => {
		switch (category) {
			case "order":
				return "bg-blue-50 border-blue-200";
			case "payment":
				return "bg-green-50 border-green-200";
			case "product":
				return "bg-orange-50 border-orange-200";
			case "system":
				return "bg-red-50 border-red-200";
			case "message":
				return "bg-purple-50 border-purple-200";
			case "account":
				return "bg-yellow-50 border-yellow-200";
			case "marketing":
				return "bg-pink-50 border-pink-200";
			default:
				return "bg-harvests-light border-gray-200";
		}
	};

	// Gérer le clic sur une notification
	const handleNotificationClick = async (notification) => {
		// Marquer comme lue
		if (!notification.read) {
			await markAsRead(notification.id);
		}

		// Rediriger selon le type de notification
		if (notification.data?.orderId) {
			// Notification de commande - utiliser le préfixe utilisateur
			const orderRoute = user?.userType
				? `/${user.userType}/orders/${notification.data.orderId}`
				: `/orders/${notification.data.orderId}`;
			navigate(orderRoute);
			setIsOpen(false);
		} else if (notification.data?.productId) {
			// Notification de produit
			navigate(`/products/${notification.data.productId}`);
			setIsOpen(false);
		} else if (notification.actions && notification.actions[0]?.url) {
			// Utiliser l'URL définie dans les actions
			// Nettoyer l'URL si elle contient une URL absolue (extraire le chemin)
			let url = notification.actions[0].url;
			// Si l'URL commence par http:// ou https://, extraire le chemin
			if (url.startsWith("http://") || url.startsWith("https://")) {
				try {
					const urlObj = new URL(url);
					url = urlObj.pathname;
				} catch {
					// Si l'URL est malformée, essayer d'extraire le chemin manuellement
					const match = url.match(/\/admin\/.*/);
					if (match) {
						url = match[0];
					}
				}
			}
			navigate(url);
			setIsOpen(false);
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Bouton de notification */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				aria-label={t("notificationCenter.dropdown.open")}
				className={`relative p-2 rounded-lg transition-colors duration-500 ease-in-out ${
					shouldBeTransparent
						? "text-white hover:text-primary-200"
						: "text-gray-700 hover:text-primary-600"
				}`}
			>
				<FiBell className="h-6 w-6" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown des notifications */}
			{isOpen && (
				<div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto mt-2 sm:mt-2 w-auto sm:w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
					{/* Header */}
					<div className="px-5 py-2 border-b border-gray-200 flex items-center justify-between">
						<h3 className="text-lg font-semibold text-gray-900">
							{t("notificationCenter.titleHighlight")}
						</h3>

						<button
							type="button"
							onClick={() => setIsOpen(false)}
							aria-label={t("notificationCenter.dropdown.close")}
							className="text-gray-400 hover:text-gray-500 ml-auto"
						>
							<FiX className="h-4 w-4" />
						</button>
					</div>
					<div className="flex justify-around items-center py-2">
						<button
							type="button"
							onClick={async () => {
								setIsRefreshing(true);
								await refreshNotifications();
								setTimeout(() => setIsRefreshing(false), 500);
							}}
							className={`text-gray-400 ml-2 hover:text-gray-500 p-1 ${
								isRefreshing ? "animate-spin" : ""
							}`}
							title={t("notificationCenter.dropdown.refresh")}
							aria-label={t("notificationCenter.dropdown.refresh")}
							disabled={isRefreshing}
						>
							<FiRefreshCw className="h-4 w-4" />
						</button>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllAsRead}
								className="text-xs text-blue-600 hover:text-blue-700 font-medium"
							>
								{t("notificationCenter.markAllRead")}
							</button>
						)}
					</div>

					{/* Liste des notifications */}
					<div className="max-h-96 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="px-4 py-8 text-center text-gray-500">
								<FiBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
								<p>{t("notificationCenter.dropdown.none")}</p>
							</div>
						) : (
							notifications.map((notification) => (
								<div
									key={notification.id}
									className={`px-4 py-3 border-b border-gray-100 hover:bg-harvests-light transition-colors cursor-pointer ${
										notification.read ? "bg-harvests-light/30" : "bg-blue-50/50"
									}`}
									onClick={() => handleNotificationClick(notification)}
								>
									<div className="flex items-start space-x-3">
										{/* Icône */}
										<div
											className={`p-2 rounded-full border ${getNotificationBgColor(
												notification.category
											)}`}
										>
											{getNotificationIcon(notification.category)}
										</div>

										{/* Contenu */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<h4 className="text-sm font-medium text-gray-900 truncate">
														{notification.title}
													</h4>
													<p className="text-sm text-gray-600 mt-1 line-clamp-2">
														{notification.message}
													</p>
													<p className="text-xs text-gray-400 mt-1">
														{formatNotificationDate(notification.timestamp)}
													</p>
												</div>

												{/* Actions */}
												<div className="flex items-center space-x-1 ml-2 flex-shrink-0">
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															markAsRead(notification.id);
														}}
														className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
														title={t("notificationCenter.markRead")}
														aria-label={t("notificationCenter.markRead")}
													>
														<FiCheck className="h-3 w-3" />
													</button>
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															removeNotification(notification.id);
														}}
														className="p-1 text-gray-400 hover:text-red-600 transition-colors"
														title={t("notificationCenter.delete")}
														aria-label={t("notificationCenter.delete")}
													>
														<FiTrash2 className="h-3 w-3" />
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{/* Footer */}
					<div className="px-4 py-3 border-t border-gray-200 bg-harvests-light rounded-b-lg">
						{notifications.length > 0 ? (
							<div className="flex items-center justify-between">
								<p className="text-xs text-gray-500">
									{t("notificationCenter.dropdown.count", { count: notifications.length })}
									{unreadCount > 0 && (
										<span className="ml-1">
											{t("notificationCenter.dropdown.unread", { count: unreadCount })}
										</span>
									)}
								</p>
								<button
									type="button"
									onClick={() => {
										navigate(getNotificationsRoute(user));
										setIsOpen(false);
									}}
									className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
								>
									{t("notificationCenter.dropdown.seeAll")}
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={() => {
									navigate(getNotificationsRoute(user));
									setIsOpen(false);
								}}
								className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors w-full text-center"
							>
								{t("notificationCenter.dropdown.seeAllNotifications")}
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationDropdown;
