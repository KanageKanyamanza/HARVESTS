/**
 * Routes pour les transformateurs
 */
import React from "react";

// Import des composants transformer (lazy loading)
const TransformerDashboard = React.lazy(() =>
	import("../../../pages/dashboard/transformer/TransformerDashboardNew")
);
const TransformerProducts = React.lazy(() =>
	import("../../../pages/dashboard/transformer/products/MyProducts")
);
const TransformerAddProduct = React.lazy(() =>
	import("../../../pages/dashboard/transformer/products/AddProduct")
);
const TransformerEditProduct = React.lazy(() =>
	import("../../../pages/dashboard/transformer/products/EditProduct")
);
const OrdersList = React.lazy(() =>
	import("../../../pages/dashboard/transformer/OrdersList")
);
const TransformerReviews = React.lazy(() =>
	import("../../../pages/dashboard/transformer/TransformerReviews")
);
const TransformerStats = React.lazy(() =>
	import("../../../pages/dashboard/transformer/TransformerStats")
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

export const transformerRoutes = [
	{
		path: "/transformer/dashboard",
		element: <TransformerDashboard />,
		title: "Tableau de bord",
	},
	{
		path: "/transformer/products",
		element: <TransformerProducts />,
		title: "Mes produits",
	},
	{
		path: "/transformer/products/add",
		element: <TransformerAddProduct />,
		title: "Ajouter un produit",
	},
	{
		path: "/transformer/products/:id/edit",
		element: <TransformerEditProduct />,
		title: "Modifier un produit",
	},
	{
		path: "/transformer/orders",
		element: <OrdersList />,
		title: "Mes commandes",
	},
	{
		path: "/transformer/orders/:id",
		element: <OrderDetail />,
		title: "Détails de la commande",
	},
	{
		path: "/transformer/reviews",
		element: <TransformerReviews />,
		title: "Avis reçus",
	},
	{
		path: "/transformer/stats",
		element: <TransformerStats />,
		title: "Statistiques",
	},
	{
		path: "/transformer/profile",
		element: <ProfilePage />,
		title: "Mon profil",
	},
	{
		path: "/transformer/settings",
		element: <SettingsPage />,
		title: "Paramètres",
	},
	{
		path: "/transformer/notifications",
		element: <NotificationsPage />,
		title: "Notifications",
	},
	{
		path: "/transformer/documents",
		element: <DocumentsPage />,
		title: "Documents & Certifications",
	},
];

export default transformerRoutes;
