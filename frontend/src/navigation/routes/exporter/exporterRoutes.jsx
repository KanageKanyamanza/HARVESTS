/**
 * Routes pour les exportateurs
 */
import React from "react";

// Import des composants exporter (lazy loading)
const ExporterDashboard = React.lazy(
	() => import("../../../pages/dashboard/exporter/ExporterDashboardNew"),
);
const Orders = React.lazy(
	() => import("../../../pages/dashboard/exporter/Orders"),
);
const Fleet = React.lazy(
	() => import("../../../pages/dashboard/exporter/Fleet"),
);
const AddVehicle = React.lazy(
	() => import("../../../pages/dashboard/exporter/AddVehicle"),
);
const EditVehicle = React.lazy(
	() => import("../../../pages/dashboard/exporter/EditVehicle"),
);
const Statistics = React.lazy(
	() => import("../../../pages/dashboard/exporter/Statistics"),
);
const ProfilePage = React.lazy(
	() => import("../../../pages/dashboard/common/ProfilePage"),
);
const SettingsPage = React.lazy(
	() => import("../../../pages/dashboard/common/SettingsPage"),
);
const OrderDetail = React.lazy(
	() => import("../../../pages/orders/OrderDetail"),
);
const NotificationsPage = React.lazy(
	() => import("../../../pages/dashboard/common/NotificationsPage"),
);
const DocumentsPage = React.lazy(
	() => import("../../../pages/dashboard/common/DocumentsPage"),
);
const Messages = React.lazy(() => import("../../../pages/Messages"));

export const exporterRoutes = [
	{
		path: "/exporter/dashboard",
		element: <ExporterDashboard />,
		title: "Tableau de bord",
	},
	{
		path: "/exporter/messages",
		element: <Messages />,
		title: "Messages",
	},
	{
		path: "/exporter/orders",
		element: <Orders />,
		title: "Commandes d'export",
	},
	{
		path: "/exporter/orders/:id",
		element: <OrderDetail />,
		title: "Détails de la commande",
	},
	{
		path: "/exporter/fleet",
		element: <Fleet />,
		title: "Flotte d'export",
	},
	{
		path: "/exporter/fleet/add",
		element: <AddVehicle />,
		title: "Ajouter un véhicule",
	},
	{
		path: "/exporter/fleet/edit/:vehicleId",
		element: <EditVehicle />,
		title: "Modifier un véhicule",
	},
	{
		path: "/exporter/statistics",
		element: <Statistics />,
		title: "Statistiques",
	},
	{
		path: "/exporter/profile",
		element: <ProfilePage />,
		title: "Mon profil",
	},
	{
		path: "/exporter/settings",
		element: <SettingsPage />,
		title: "Paramètres",
	},
	{
		path: "/exporter/notifications",
		element: <NotificationsPage />,
		title: "Notifications",
	},
	{
		path: "/exporter/documents",
		element: <DocumentsPage />,
		title: "Documents & Certifications",
	},
	{
		path: "/exporter/messages/:id",
		element: <Messages />,
		title: "Messages",
	},
];

export default exporterRoutes;
