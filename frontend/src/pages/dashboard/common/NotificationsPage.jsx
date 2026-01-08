import React from "react";
import { Bell, CheckCheck, Check } from "lucide-react"; // Icons
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import NotificationFilters from "../../../components/notifications/NotificationFilters";
import NotificationBulkActions from "../../../components/notifications/NotificationBulkActions";
import NotificationItem from "../../../components/notifications/NotificationItem";
import NotificationCard from "../../../components/notifications/NotificationCard";
import NotificationPagination from "../../../components/notifications/NotificationPagination";
import { useNotificationsPage } from "../../../hooks/useNotificationsPage";

const NotificationsPage = () => {
	const {
		notifications,
		filteredNotifications,
		loading,
		filter,
		setFilter,
		searchTerm,
		setSearchTerm,
		selectedNotifications,
		setSelectedNotifications,
		currentPage,
		setCurrentPage,
		totalPages,
		total,
		unreadCount,
		handleMarkAsRead,
		handleMarkAllAsRead,
		handleDelete,
		handleDeleteSelected,
		toggleSelect,
		selectAll,
	} = useNotificationsPage();

	// Gérer les actions en masse
	const handleBulkMarkAsRead = () => {
		selectedNotifications.forEach((id) => {
			const notif = notifications.find((n) => n.id === id);
			if (notif && !notif.read) {
				handleMarkAsRead(id);
			}
		});
		setSelectedNotifications([]);
	};

	if (loading && notifications.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des notifications..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-4 py-8 relative z-10 pl-6">
				{/* Header */}
				<div className="mb-8 animate-fade-in-down">
					<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
						<div className="w-5 h-[2px] bg-emerald-600"></div>
						<span>Centre de Notifications</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
						<div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								Vos <span className="text-emerald-600">Notifications</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-2xl">
								{unreadCount > 0 ? (
									<span>
										Vous avez{" "}
										<span className="text-emerald-600 font-bold">
											{unreadCount} notification{unreadCount > 1 ? "s" : ""} non
											lue{unreadCount > 1 ? "s" : ""}
										</span>{" "}
										en attente d'attention.
									</span>
								) : (
									<span>
										Restez informé des dernières activités sur votre plateforme.
									</span>
								)}
							</p>
						</div>
						<div className="flex items-center space-x-3">
							{unreadCount > 0 && (
								<button
									onClick={handleMarkAllAsRead}
									className="group flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-md"
								>
									<CheckCheck className="h-3.5 w-3.5 mr-2" />
									<span>Tout marquer comme lu</span>
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Filters & Bulk Actions */}
				<div className="mb-8 space-y-6">
					<NotificationFilters
						filter={filter}
						setFilter={setFilter}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
						unreadCount={unreadCount}
					/>

					<NotificationBulkActions
						selectedCount={selectedNotifications.length}
						onMarkAsRead={handleBulkMarkAsRead}
						onDelete={handleDeleteSelected}
					/>
				</div>

				{/* Liste des notifications */}
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-sm min-h-[400px]">
					{filteredNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
								<Bell className="h-10 w-10 text-gray-300" />
							</div>
							<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight mb-2">
								{searchTerm || filter !== "all"
									? "Aucun résultat"
									: "Tout est calme"}
							</h3>
							<p className="text-gray-500 font-medium max-w-sm">
								{searchTerm || filter !== "all"
									? "Aucune notification ne correspond à vos critères de recherche."
									: "Vous n'avez aucune notification pour le moment. Revenez plus tard !"}
							</p>
						</div>
					) : (
						<>
							{/* Vue desktop - Tableau Premium */}
							<div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100/50">
								<table className="min-w-full">
									<thead>
										<tr className="bg-gray-50/80 border-b border-gray-100">
											<th className="px-4 py-3 text-left w-12">
												<div className="relative flex items-center">
													<input
														type="checkbox"
														checked={
															selectedNotifications.length ===
																filteredNotifications.length &&
															filteredNotifications.length > 0
														}
														onChange={selectAll}
														className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400"
													/>
													<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
												</div>
											</th>
											<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
												Notification
											</th>
											<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-32">
												Catégorie
											</th>
											<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest w-40">
												Date
											</th>
											<th className="px-4 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest w-20">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-50">
										{filteredNotifications.map((notification) => (
											<NotificationItem
												key={notification.id}
												notification={notification}
												isSelected={selectedNotifications.includes(
													notification.id
												)}
												onToggleSelect={() => toggleSelect(notification.id)}
												onMarkAsRead={() => handleMarkAsRead(notification.id)}
												onDelete={() => handleDelete(notification.id)}
											/>
										))}
									</tbody>
								</table>
							</div>

							{/* Vue mobile - Cartes */}
							<div className="md:hidden space-y-4">
								<div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
									<label className="flex items-center space-x-3 cursor-pointer">
										<div className="relative flex items-center">
											<input
												type="checkbox"
												checked={
													selectedNotifications.length ===
														filteredNotifications.length &&
													filteredNotifications.length > 0
												}
												onChange={selectAll}
												className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-emerald-500 checked:bg-emerald-500"
											/>
											<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
										</div>
										<span className="text-sm font-bold text-gray-700">
											Tout sélectionner
										</span>
									</label>
								</div>
								{filteredNotifications.map((notification) => (
									<NotificationCard
										key={notification.id}
										notification={notification}
										isSelected={selectedNotifications.includes(notification.id)}
										onToggleSelect={() => toggleSelect(notification.id)}
										onMarkAsRead={() => handleMarkAsRead(notification.id)}
										onDelete={() => handleDelete(notification.id)}
									/>
								))}
							</div>

							<div className="mt-8 border-t border-gray-100 pt-6">
								<NotificationPagination
									currentPage={currentPage}
									totalPages={totalPages}
									total={total}
									onPageChange={setCurrentPage}
									isMobile={false}
								/>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default NotificationsPage;
