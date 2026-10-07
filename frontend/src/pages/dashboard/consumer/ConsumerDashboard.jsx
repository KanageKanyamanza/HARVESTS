import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiShoppingCart, FiGift, FiArrowRight } from "react-icons/fi";
import StatCards from "../../admin/adminDashboard/StatCards";
import RecentOrders from "../../../components/admin/RecentOrders";
import ConsumerSpendingStats from "./ConsumerSpendingStats";
import QuickActionsWidget from "./QuickActionsWidget";
import { useConsumerDashboardStats } from "./dashboardHooks";
import { createConsumerStatCards } from "./dashboardUtils";
import { formatPrice } from "../../../utils/currencyUtils";
import { formatNumber } from "../../../utils/i18n";
import { toPlainText } from "../../../utils/textHelpers";

const ConsumerDashboard = () => {
	const { t } = useTranslation("dashboard-consumer");
	const { stats, recentOrders, favoriteProducts, loading } = useConsumerDashboardStats();
	const statCards = createConsumerStatCards(stats);

	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Halos d'arrière-plan (bleu : espace client) */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-sky-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-4 md:space-y-6">
				{/* En-tête */}
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-fade-in-down">
					<div className="flex-1">
						<div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-blue-600"></div>
							<span className="text-[9px]">{t("dashboard.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-2">
							{t("dashboard.greetingStart")}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic ml-2">
								{t("dashboard.greetingHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							{t("dashboard.subtitle")}
						</p>
					</div>

					{/* Points de fidélité */}
					<div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/60 shadow-sm flex items-center gap-4 animate-scale-in">
						<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
							<FiGift className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">
								{t("dashboard.loyaltyPoints")}
							</p>
							<div className="flex items-baseline gap-1">
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tighter">
									{loading ?
										<span className="inline-block h-5 w-14 bg-gray-100 rounded animate-pulse" />
									:	formatNumber(stats.loyaltyPoints)}
								</h3>
								<span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
									{t("dashboard.points")}
								</span>
							</div>
						</div>
						<div className="w-[1px] h-8 bg-gray-100 mx-1"></div>
						<Link
							to="/loyalty"
							title={t("dashboard.seeLoyalty")}
							aria-label={t("dashboard.seeLoyalty")}
							className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
						>
							<FiArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>

				{/* Chiffres clés */}
				<div className="animate-fade-in-up">
					<StatCards statCards={statCards} loading={loading} />
				</div>

				{/* Dépenses et raccourcis */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
					<div className="lg:col-span-2">
						<ConsumerSpendingStats
							monthlySpentChart={stats.monthlySpentChart}
							currentMonthSpent={stats.currentMonthSpent}
							monthlyGrowth={stats.monthlyGrowth}
							loading={loading}
						/>
					</div>
					<div>
						<QuickActionsWidget />
					</div>
				</div>

				{/* Commandes récentes et favoris */}
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up delay-300">
					<div className="xl:col-span-2">
						<RecentOrders orders={recentOrders} basePath="/consumer/orders" loading={loading} />
					</div>

					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 relative overflow-hidden group">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-1">
									{t("dashboard.favoritesTitle")}
								</h3>
								<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">
									{t("dashboard.favoritesSubtitle")}
								</p>
							</div>
							<Link
								to="/consumer/favorites"
								className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
							>
								{t("dashboard.seeAll")}
							</Link>
						</div>

						<div className="space-y-4">
							{loading ?
								[1, 2, 3].map((i) => (
									<div key={i} className="flex items-center gap-4 p-3 animate-pulse">
										<div className="w-14 h-14 rounded-xl bg-gray-100" />
										<div className="flex-1 space-y-2">
											<div className="h-3 bg-gray-100 rounded w-1/2" />
											<div className="h-2.5 bg-gray-100 rounded w-1/4" />
										</div>
									</div>
								))
							: favoriteProducts.length > 0 ?
								favoriteProducts.map((product) => {
									const name = toPlainText(product.name, "");
									return (
										<div
											key={product.id}
											className="flex items-center gap-4 p-3 rounded-2xl bg-white/40 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
										>
											<div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
												<img
													src={product.image || "/images/placeholder-product.svg"}
													alt={name}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.target.src = "/images/placeholder-product.svg";
													}}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="text-sm font-[900] text-gray-900 leading-none mb-1 truncate">
													{name}
												</h4>
												<p className="text-[10px] font-black text-blue-600">
													{formatPrice(product.price, product.currency || "XOF")}
												</p>
											</div>
											<Link
												to={`/products/${product.slug || product.id}`}
												title={t("dashboard.viewProduct")}
												aria-label={t("dashboard.viewProduct")}
												className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
											>
												<FiShoppingCart className="w-4 h-4" />
											</Link>
										</div>
									);
								})
							:	<div className="py-10 text-center">
									<p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
										{t("dashboard.noFavorites")}
									</p>
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConsumerDashboard;
