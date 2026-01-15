/**
 * Routes pour les administrateurs
 */
import React from "react";

// Import des composants admin (lazy loading)
const AdminDashboard = React.lazy(() =>
	import("../../../pages/admin/AdminDashboard")
);
const AdminUsers = React.lazy(() => import("../../../pages/admin/AdminUsers"));
const AdminProducts = React.lazy(() =>
	import("../../../pages/admin/AdminProducts")
);
const ProductDetails = React.lazy(() =>
	import("../../../pages/admin/ProductDetails")
);
const AdminDishes = React.lazy(() =>
	import("../../../pages/admin/AdminDishes")
);
const DishDetails = React.lazy(() =>
	import("../../../pages/admin/DishDetails")
);
const AdminOrders = React.lazy(() =>
	import("../../../pages/admin/AdminOrders")
);
const AdminReviews = React.lazy(() =>
	import("../../../pages/admin/AdminReviews")
);
const AdminMessages = React.lazy(() =>
	import("../../../pages/admin/AdminMessages")
);
const AdminAnalytics = React.lazy(() =>
	import("../../../pages/admin/AdminAnalytics")
);
const AdminBlogs = React.lazy(() => import("../../../pages/admin/AdminBlogs"));
const AdminBlogCreate = React.lazy(() =>
	import("../../../pages/admin/AdminBlogCreate")
);
const AdminBlogEdit = React.lazy(() =>
	import("../../../pages/admin/AdminBlogEdit")
);
const AdminBlogStats = React.lazy(() =>
	import("../../../pages/admin/AdminBlogStats")
);
const AdminBlogAnalytics = React.lazy(() =>
	import("../../../pages/admin/AdminBlogAnalytics")
);
const AdminManagement = React.lazy(() =>
	import("../../../pages/admin/AdminManagement")
);
const AdminSubscriptions = React.lazy(() =>
	import("../../../pages/admin/AdminSubscriptions")
);
const ChatbotManagement = React.lazy(() =>
	import("../../../pages/admin/ChatbotManagement")
);
const AdminFaqManager = React.lazy(() =>
	import("../../../pages/admin/AdminFaqManager")
);
const AdminSettings = React.lazy(() =>
	import("../../../pages/admin/AdminSettings")
);
const UserDetails = React.lazy(() =>
	import("../../../pages/admin/UserDetails")
);
const OrderDetail = React.lazy(() =>
	import("../../../pages/orders/OrderDetail")
);
const AdminNewsletter = React.lazy(() =>
	import("../../../pages/admin/AdminNewsletter")
);
const NotificationsPage = React.lazy(() =>
	import("../../../pages/dashboard/common/NotificationsPage")
);

export const adminRoutes = [
	{
		path: "/admin",
		element: <AdminDashboard />,
		title: "Tableau de bord Admin",
	},
	{
		path: "/admin/users",
		element: <AdminUsers />,
		title: "Gestion des utilisateurs",
	},
	{
		path: "/admin/users/:id",
		element: <UserDetails />,
		title: "Détails de l'utilisateur",
	},
	{
		path: "/admin/products",
		element: <AdminProducts />,
		title: "Gestion des produits",
	},
	{
		path: "/admin/products/:id",
		element: <ProductDetails />,
		title: "Détails du produit",
	},
	{
		path: "/admin/dishes",
		element: <AdminDishes />,
		title: "Gestion des plats",
	},
	{
		path: "/admin/dishes/:id",
		element: <DishDetails />,
		title: "Détails du plat",
	},
	{
		path: "/admin/orders",
		element: <AdminOrders />,
		title: "Gestion des commandes",
	},
	{
		path: "/admin/orders/:id",
		element: <OrderDetail />,
		title: "Détails de la commande",
	},
	{
		path: "/admin/reviews",
		element: <AdminReviews />,
		title: "Gestion des avis",
	},
	{
		path: "/admin/messages",
		element: <AdminMessages />,
		title: "Messages",
	},
	{
		path: "/admin/analytics",
		element: <AdminAnalytics />,
		title: "Analytiques",
	},
	{
		path: "/admin/blog",
		element: <AdminBlogs />,
		title: "Gestion des blogs",
	},
	{
		path: "/admin/blog/create",
		element: <AdminBlogCreate />,
		title: "Créer un blog",
	},
	{
		path: "/admin/blog/edit/:id",
		element: <AdminBlogEdit />,
		title: "Modifier un blog",
	},
	{
		path: "/admin/blog/stats",
		element: <AdminBlogStats />,
		title: "Statistiques des blogs",
	},
	{
		path: "/admin/blog/analytics",
		element: <AdminBlogAnalytics />,
		title: "Analytics des blogs",
	},
	{
		path: "/admin/management",
		element: <AdminManagement />,
		title: "Gestion des admins",
	},
	{
		path: "/admin/subscriptions",
		element: <AdminSubscriptions />,
		title: "Gestion des souscriptions",
	},
	{
		path: "/admin/chatbot",
		element: <ChatbotManagement />,
		title: "Gestion du Chatbot",
	},
	{
		path: "/admin/chatbot/faqs",
		element: <AdminFaqManager />,
		title: "Gestion des FAQs",
	},
	{
		path: "/admin/settings",
		element: <AdminSettings />,
		title: "Paramètres",
	},
	{
		path: "/admin/newsletter",
		element: <AdminNewsletter />,
		title: "Gestion Newsletter",
	},
	{
		path: "/admin/notifications",
		element: <NotificationsPage />,
		title: "Notifications",
	},
];

export default adminRoutes;
