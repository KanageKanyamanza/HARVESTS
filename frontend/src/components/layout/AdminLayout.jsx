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
	HelpCircle,
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
			current: location.pathname === "/admin/chatbot",
		},
		{
			name: "FAQs Chatbot",
			href: "/admin/chatbot/faqs",
			icon: HelpCircle,
			current: location.pathname.startsWith("/admin/chatbot/faqs"),
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
			{/* Mobile sidebar - Redesigned & Premium */}
			<div
				className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out ${
					sidebarOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
			>
				{/* Backdrop */}
				<div
					className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${
						sidebarOpen ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setSidebarOpen(false)}
				/>

				{/* Sidebar Panel */}
				<div
					className={`relative flex flex-col h-full w-[85%] max-w-[300px] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-out border-r border-white/20 ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					{/* Close Button */}
					<div className="absolute top-4 right-4 z-50">
						<button
							type="button"
							className="p-2 rounded-full bg-gray-100/50 text-gray-500 hover:bg-gray-200 transition-colors"
							onClick={() => setSidebarOpen(false)}
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Header Logo */}
					<div className="flex-shrink-0 px-6 pt-10 pb-6 border-b border-gray-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-200">
								<Shield className="h-6 w-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-[1000] text-gray-900 tracking-tighter leading-none">
									Panel<span className="text-green-600">Admin</span>.
								</h2>
								<p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">
									Harvests Manager
								</p>
							</div>
						</div>
					</div>

					{/* Navigation Items */}
					<div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
						{menuItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => setSidebarOpen(false)}
									className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
										item.current
											? "bg-green-50 text-green-700 shadow-sm shadow-green-100"
											: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<Icon
										className={`mr-4 h-5 w-5 transition-transform duration-300 ${
											item.current
												? "text-green-600 scale-110"
												: "text-gray-400 group-hover:text-gray-600 group-hover:scale-105"
										}`}
									/>
									<span className="tracking-tight">{item.name}</span>
									{item.current && (
										<div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-300"></div>
									)}
								</Link>
							);
						})}
					</div>

					{/* Footer User & Logout */}
					<div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
						<div className="flex items-center justify-between mb-4 px-2">
							<div className="flex items-center gap-3">
								<div className="relative">
									{user?.avatar ? (
										<CloudinaryImage
											src={user.avatar}
											alt={`${user.firstName} ${user.lastName}`}
											className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
										/>
									) : (
										<div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center border-2 border-white shadow-md">
											<span className="text-white text-xs font-bold">
												{user?.firstName?.charAt(0)}
												{user?.lastName?.charAt(0)}
											</span>
										</div>
									)}
									<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
								</div>
								<div>
									<p className="text-sm font-black text-gray-900 leading-none">
										{user?.firstName} {user?.lastName}
									</p>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
										Administrateur
									</p>
								</div>
							</div>
						</div>

						<button
							onClick={handleLogout}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:shadow-sm transition-all duration-300 group"
						>
							<LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
							<span className="text-xs font-black uppercase tracking-widest">
								Déconnexion
							</span>
						</button>
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
