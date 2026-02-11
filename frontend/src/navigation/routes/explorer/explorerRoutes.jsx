/**
 * Routes pour les explorateurs
 */
import React from "react";

// Import des composants explorer (lazy loading)
const ExplorerDashboard = React.lazy(
	() => import("../../../pages/dashboard/explorer/ExplorerDashboardNew"),
);
const OrderDetail = React.lazy(
	() => import("../../../pages/orders/OrderDetail"),
);
const Favorites = React.lazy(
	() => import("../../../pages/dashboard/consumer/Favorites"),
);
const OrderHistory = React.lazy(
	() => import("../../../pages/dashboard/consumer/OrderHistory"),
);
const Reviews = React.lazy(
	() => import("../../../pages/dashboard/consumer/Reviews"),
);
const Statistics = React.lazy(
	() => import("../../../pages/dashboard/consumer/Statistics"),
);
const ProfilePage = React.lazy(
	() => import("../../../pages/dashboard/common/ProfilePage"),
);
const SettingsPage = React.lazy(
	() => import("../../../pages/dashboard/common/SettingsPage"),
);
const NotificationsPage = React.lazy(
	() => import("../../../pages/dashboard/common/NotificationsPage"),
);
const Messages = React.lazy(() => import("../../../pages/Messages"));

export const explorerRoutes = [
	{
		path: "/explorer/dashboard",
		element: <ExplorerDashboard />,
		title: "Tableau de bord",
	},
	{
		path: "/explorer/messages",
		element: <Messages />,
		title: "Messages",
	},
	{
		path: "/explorer/favorites",
		element: <Favorites />,
		title: "Mes favoris",
	},
	{
		path: "/explorer/orders",
		element: <OrderHistory />,
		title: "Mes commandes",
	},
	{
		path: "/explorer/orders/:orderId",
		element: <OrderDetail />,
		title: "Détails de la commande",
	},
	{
		path: "/explorer/reviews",
		element: <Reviews />,
		title: "Mes avis",
	},
	{
		path: "/explorer/statistics",
		element: <Statistics />,
		title: "Statistiques",
	},
	{
		path: "/explorer/profile",
		element: <ProfilePage />,
		title: "Mon profil",
	},
	{
		path: "/explorer/settings",
		element: <SettingsPage />,
		title: "Paramètres",
	},
	{
		path: "/explorer/notifications",
		element: <NotificationsPage />,
		title: "Notifications",
	},
	{
		path: "/explorer/messages/:id",
		element: <Messages />,
		title: "Messages",
	},
];

export default explorerRoutes;
