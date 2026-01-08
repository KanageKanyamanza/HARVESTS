import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
	LayoutDashboard,
	Users,
	Package,
	ShoppingCart,
	BarChart3,
	Settings,
	Bell,
	LogOut,
	Menu,
	X,
	Shield,
	MessageSquare,
	MessageCircle,
	CreditCard,
	Truck,
	UtensilsCrossed,
	FileText,
	Mail,
	Star,
	Search,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import NotificationDropdown from "../notifications/NotificationDropdown";
import CloudinaryImage from "../common/CloudinaryImage";
import DashboardSidebarFixed from "../dashboard/DashboardSidebarFixed";

const AdminLayout = ({ children }) => {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	// Fermer le sidebar mobile lors d'un changement de route
	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			// Utiliser window.location.href pour forcer une navigation complète
			// et éviter les redirections automatiques vers /login
			window.location.href = "/";
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
			// Rediriger quand même vers l'accueil en cas d'erreur
			window.location.href = "/";
		}
	};

	const menuItems = [
		{
			name: "Tableau de bord",
			href: "/admin",
			icon: LayoutDashboard,
			current: location.pathname === "/admin",
		},
		{
			name: "Gestion des admins",
			href: "/admin/management",
			icon: Shield,
			current: location.pathname.startsWith("/admin/management"),
		},
		{
			name: "Produits à valider",
			href: "/admin/products",
			icon: Package,
			current: location.pathname.startsWith("/admin/products"),
		},
		{
			name: "Plats restaurateurs",
			href: "/admin/dishes",
			icon: UtensilsCrossed,
			current: location.pathname.startsWith("/admin/dishes"),
		},
		{
			name: "Utilisateurs",
			href: "/admin/users",
			icon: Users,
			current: location.pathname.startsWith("/admin/users"),
		},
		{
			name: "Avis à modérer",
			href: "/admin/reviews",
			icon: Star,
			current: location.pathname.startsWith("/admin/reviews"),
		},
		{
			name: "Messages support",
			href: "/admin/messages",
			icon: MessageSquare,
			current: location.pathname.startsWith("/admin/messages"),
		},
		{
			name: "Commandes",
			href: "/admin/orders",
			icon: ShoppingCart,
			current: location.pathname.startsWith("/admin/orders"),
		},
		{
			name: "Analytiques",
			href: "/admin/analytics",
			icon: BarChart3,
			current: location.pathname.startsWith("/admin/analytics"),
		},
		{
			name: "Blog",
			href: "/admin/blog",
			icon: FileText,
			current: location.pathname.startsWith("/admin/blog"),
		},
		{
			name: "Newsletter",
			href: "/admin/newsletter",
			icon: Mail,
			current: location.pathname.startsWith("/admin/newsletter"),
		},
		{
			name: "Abonnements",
			href: "/admin/subscriptions",
			icon: CreditCard,
			current: location.pathname.startsWith("/admin/subscriptions"),
		},
		{
			name: "Chatbot",
			href: "/admin/chatbot",
			icon: MessageCircle,
			current: location.pathname.startsWith("/admin/chatbot"),
		},
		{
			name: "Notifications",
			href: "/admin/notifications",
			icon: Bell,
			current: location.pathname.startsWith("/admin/notifications"),
		},
		{
			name: "Paramètres",
			href: "/admin/settings",
			icon: Settings,
			current: location.pathname.startsWith("/admin/settings"),
		},
	];

	return (
		<div className="min-h-screen bg-gray-50/50">
			{/* Mobile sidebar */}
			<div
				className={`fixed inset-0 z-50 lg:hidden ${
					sidebarOpen ? "block" : "hidden"
				}`}
			>
				<div
					className="fixed inset-0 bg-gray-600 bg-opacity-75"
					onClick={() => setSidebarOpen(false)}
				/>
				<div className="relative flex flex-col h-full max-w-xs w-full bg-white">
					<div className="absolute top-0 right-0 -mr-12 pt-2">
						<button
							type="button"
							className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-6 w-6 text-white" />
						</button>
					</div>
					<div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
						<div className="flex-shrink-0 flex items-center px-4">
							<Shield className="h-8 w-8 text-green-600" />
							<span className="ml-2 text-xl font-bold text-gray-900">
								Admin Panel
							</span>
						</div>
						<nav className="mt-5 flex-1 px-2 space-y-1">
							{menuItems.map((item) => {
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										to={item.href}
										onClick={() => setSidebarOpen(false)}
										className={`${
											item.current
												? "bg-green-100 text-green-900"
												: "text-gray-600 hover:bg-harvests-light hover:text-gray-900"
										} group flex items-center px-2 py-2 text-base font-medium rounded-md`}
									>
										<Icon className="mr-4 h-6 w-6" />
										{item.name}
									</Link>
								);
							})}
						</nav>
						{/* User info en bas */}
						<div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									{user?.avatar ? (
										<CloudinaryImage
											src={user.avatar}
											alt={`${user.firstName} ${user.lastName}`}
											className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
											fallback={
												<div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
													<span className="text-white text-sm font-medium">
														{user?.firstName?.charAt(0)}
														{user?.lastName?.charAt(0)}
													</span>
												</div>
											}
										/>
									) : (
										<div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
											<span className="text-white text-sm font-medium">
												{user?.firstName?.charAt(0)}
												{user?.lastName?.charAt(0)}
											</span>
										</div>
									)}
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-700">
										{user?.firstName} {user?.lastName}
									</p>
									<p className="text-xs font-medium text-gray-500">
										Administrateur
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop sidebar - New Design */}
			<div className="hidden lg:block">
				<DashboardSidebarFixed
					onLogout={handleLogout}
					collapsed={sidebarCollapsed}
					onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
					navigationItems={menuItems}
					user={user}
				/>
			</div>

			{/* Main content */}
			<div
				className={`flex flex-col flex-1 transition-all duration-300 ${
					sidebarCollapsed ? "lg:pl-[55px]" : "lg:pl-[240px]"
				}`}
			>
				{/* Top navigation - Only visible on Mobile since Sidebar covers Desktop top */}
				<div className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
					<button
						type="button"
						className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<Menu className="h-6 w-6" />
					</button>
					<div className="flex-1 px-4 flex justify-between">
						<div className="flex-1 flex">
							<div className="w-full flex md:ml-0">
								<div className="relative w-full text-gray-400 focus-within:text-gray-600">
									<div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
										<Search className="h-5 w-5" />
									</div>
									<input
										className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
										placeholder="Rechercher..."
										type="search"
									/>
								</div>
							</div>
						</div>
						<div className="ml-4 flex items-center md:ml-6">
							{/* Notifications */}
							<NotificationDropdown />

							{/* Profile dropdown */}
							<div className="ml-3 relative">
								<div className="flex items-center space-x-3">
									<div className="flex items-center space-x-2">
										{user?.avatar ? (
											<CloudinaryImage
												src={user.avatar}
												alt={`${user.firstName} ${user.lastName}`}
												className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
												fallback={
													<div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
														<span className="text-white text-sm font-medium">
															{user?.firstName?.charAt(0)}
															{user?.lastName?.charAt(0)}
														</span>
													</div>
												}
											/>
										) : (
											<div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
												<span className="text-white text-sm font-medium">
													{user?.firstName?.charAt(0)}
													{user?.lastName?.charAt(0)}
												</span>
											</div>
										)}
										<div className="text-sm text-gray-700 hidden md:block">
											<div className="font-medium">
												{user?.firstName} {user?.lastName}
											</div>
											<div className="text-xs text-gray-500">
												Administrateur
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="flex-1">
					<div className="">
						<div className="max-w-[1920px] mx-auto">{children}</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
