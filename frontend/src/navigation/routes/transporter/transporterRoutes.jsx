/**
 * Routes pour les transporteurs
 */
import React from "react";

// Import des composants transporter (lazy loading)
const TransporterDashboard = React.lazy(() =>
	import("../../../pages/dashboard/transporter/TransporterDashboardNew")
);
const Fleet = React.lazy(() =>
	import("../../../pages/dashboard/transporter/Fleet")
);
const AddVehicle = React.lazy(() =>
	import("../../../pages/dashboard/transporter/AddVehicle")
);
const EditVehicle = React.lazy(() =>
	import("../../../pages/dashboard/transporter/EditVehicle")
);
const Orders = React.lazy(() =>
	import("../../../pages/dashboard/transporter/Orders")
);
const Statistics = React.lazy(() =>
	import("../../../pages/dashboard/transporter/Statistics")
);
const ProfilePage = React.lazy(() =>
	import("../../../pages/dashboard/common/ProfilePage")
);
const SettingsPage = React.lazy(() =>
	import("../../../pages/dashboard/common/SettingsPage")
);
const OrderDetail = React.lazy(() =>
	import("../../../pages/orders/OrderDetail")
);
const NotificationsPage = React.lazy(() =>
	import("../../../pages/dashboard/common/NotificationsPage")
);
const DocumentsPage = React.lazy(() =>
	import("../../../pages/dashboard/common/DocumentsPage")
);

export const transporterRoutes = [
	{
		path: "/transporter/dashboard",
		element: <TransporterDashboard />,
		title: "Tableau de bord",
	},
	{
		path: "/transporter/fleet",
		element: <Fleet />,
		title: "Ma flotte",
	},
	{
		path: "/transporter/fleet/add",
		element: <AddVehicle />,
		title: "Ajouter un véhicule",
	},
	{
		path: "/transporter/fleet/edit/:vehicleId",
		element: <EditVehicle />,
		title: "Modifier un véhicule",
	},
	{
		path: "/transporter/orders",
		element: <Orders />,
		title: "Livraisons locales",
	},
	{
		path: "/transporter/orders/:id",
		element: <OrderDetail />,
		title: "Détails de la livraison",
	},
	{
		path: "/transporter/statistics",
		element: <Statistics />,
		title: "Statistiques",
	},
	{
		path: "/transporter/profile",
		element: <ProfilePage />,
		title: "Mon profil",
	},
	{
		path: "/transporter/settings",
		element: <SettingsPage />,
		title: "Paramètres",
	},
	{
		path: "/transporter/notifications",
		element: <NotificationsPage />,
		title: "Notifications",
	},
	{
		path: "/transporter/documents",
		element: <DocumentsPage />,
		title: "Documents & Certifications",
	},
];

export default transporterRoutes;
