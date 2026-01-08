import React from "react";
import {
	TrendingUp,
	TrendingDown,
	Clock,
	Target,
	BarChart3,
	PieChart,
	Activity,
	Search,
	MessageSquare,
} from "lucide-react";

const AdvancedStatsTab = ({ stats }) => {
	if (!stats) return null;

	const formatNumber = (num) => {
		return new Intl.NumberFormat("fr-FR").format(num || 0);
	};

	const getGrowthIcon = (growth) => {
		if (!growth || growth === "0%") return null;
		return growth.startsWith("-") ? TrendingDown : TrendingUp;
	};

	// Helper for metric cards
	const MetricCard = ({
		title,
		value,
		subtext,
		icon: Icon,
		gradient,
		shadow,
	}) => (
		<div
			className={`relative overflow-hidden rounded-[2.5rem] p-6 min-h-[180px] flex flex-col justify-between ${gradient} ${shadow} shadow-xl group hover:-translate-y-1 transition-all duration-300 text-white`}
		>
			{/* Background Icon */}
			<div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10 transform scale-150 rotate-0 group-hover:scale-[1.7] group-hover:rotate-6 transition-all duration-700 ease-out pointer-events-none">
				<Icon className="w-32 h-32" strokeWidth={1.5} />
			</div>

			{/* Decorative Shape */}
			<div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>

			<div className="relative z-10">
				<p className="text-sm font-bold text-white/80 uppercase tracking-wider mb-1">
					{title}
				</p>
				<div className="flex items-baseline gap-2">
					<p className="text-4xl text-white tracking-tighter drop-shadow-sm">
						{value}
					</p>
					{/* Optional icon next to value */}
					{/* {growthIcon && <growthIcon className="w-6 h-6 text-white/50" />} */}
				</div>
				<p className="text-xs font-medium text-white/70 mt-2 bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
					{subtext}
				</p>
			</div>
		</div>
	);

	return (
		<div className="space-y-8 animate-fade-in-up">
			{/* Métriques avancées - Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Croissance */}
				{stats.overview?.growth && (
					<MetricCard
						title="Croissance"
						value={stats.overview.growth}
						subtext="vs période précédente"
						icon={getGrowthIcon(stats.overview.growth) || Activity}
						gradient={
							stats.overview.growth.startsWith("-")
								? "bg-gradient-to-tr from-rose-500 to-orange-400"
								: "bg-gradient-to-tr from-emerald-500 to-green-400"
						}
						shadow={
							stats.overview.growth.startsWith("-")
								? "shadow-rose-200/50"
								: "shadow-emerald-200/50"
						}
					/>
				)}

				{/* Taux de satisfaction */}
				{stats.overview?.satisfactionRate && (
					<MetricCard
						title="Satisfaction"
						value={stats.overview.satisfactionRate}
						subtext="Basé sur les feedbacks"
						icon={Target}
						gradient="bg-gradient-to-tr from-blue-500 to-indigo-400"
						shadow="shadow-blue-200/50"
					/>
				)}

				{/* Temps de réponse moyen */}
				{stats.overview?.avgResponseTime && (
					<MetricCard
						title="Temps de réponse"
						value={`${stats.overview.avgResponseTime.avg}ms`}
						subtext="Moyenne"
						icon={Clock}
						gradient="bg-gradient-to-tr from-violet-500 to-purple-400"
						shadow="shadow-violet-200/50"
					/>
				)}

				{/* Questions totales */}
				<MetricCard
					title="Questions posées"
					value={formatNumber(stats.overview?.totalInteractions || 0)}
					subtext="Volume total"
					icon={MessageSquare}
					gradient="bg-gradient-to-tr from-gray-700 to-gray-600"
					shadow="shadow-gray-200/50"
				/>
			</div>

			{/* Graphiques avancés - Containers */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Distribution par type de question */}
				{stats.questionTypeDistribution &&
					Object.keys(stats.questionTypeDistribution).length > 0 && (
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 p-8">
							<h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
								<PieChart className="h-6 w-6 text-emerald-600" />
								Types de questions
							</h3>
							<div className="space-y-4">
								{Object.entries(stats.questionTypeDistribution)
									.sort((a, b) => b[1].count - a[1].count)
									.map(([type, data]) => {
										const typeLabels = {
											how: "Comment",
											what: "Quoi",
											when: "Quand",
											where: "Où",
											why: "Pourquoi",
											how_much: "Combien",
											yes_no: "Oui/Non",
											general: "Général",
										};
										return (
											<div key={type} className="flex flex-col">
												<div className="flex justify-between items-end mb-1">
													<span className="text-sm font-bold text-gray-700">
														{typeLabels[type] || type}
													</span>
													<span className="text-xs font-medium text-gray-500">
														{data.count} ({data.percentage}%)
													</span>
												</div>
												<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
													<div
														className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
														style={{ width: `${data.percentage}%` }}
													/>
												</div>
											</div>
										);
									})}
							</div>
						</div>
					)}

				{/* Distribution par intention */}
				{stats.intentDistribution && stats.intentDistribution.length > 0 && (
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 p-8">
						<h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
							<BarChart3 className="h-6 w-6 text-blue-600" />
							Intentions détectées
						</h3>
						<div className="space-y-4">
							{stats.intentDistribution.slice(0, 8).map((intent) => {
								const intentLabels = {
									GREETING: "Salutation",
									BOT_CAPABILITIES: "Capacités",
									TRACK_ORDER: "Suivi commande",
									MY_ORDERS: "Mes commandes",
									MY_CART: "Mon panier",
									SEARCH_PRODUCT: "Recherche produit",
									CONTACT_SUPPORT: "Support",
								};
								return (
									<div key={intent.intent} className="flex flex-col">
										<div className="flex justify-between items-end mb-1">
											<span className="text-sm font-bold text-gray-700">
												{intentLabels[intent.intent] || intent.intent}
											</span>
											<div className="flex items-center gap-2">
												<span className="text-xs font-medium text-gray-500">
													{intent.count} ({intent.percentage}%)
												</span>
												{intent.avgConfidence && (
													<span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-1">
														Conf: {intent.avgConfidence}
													</span>
												)}
											</div>
										</div>
										<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
											<div
												className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full"
												style={{ width: `${intent.percentage}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Activité par heure */}
				{stats.hourlyStats && Object.keys(stats.hourlyStats).length > 0 && (
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 p-8 lg:col-span-2">
						<h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
							<Activity className="h-6 w-6 text-purple-600" />
							Activité par heure
						</h3>
						<div className="flex items-end space-x-1 h-56 pt-4">
							{Array.from({ length: 24 }, (_, i) => {
								const count = stats.hourlyStats[i] || 0;
								const maxCount = Math.max(...Object.values(stats.hourlyStats));
								const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
								return (
									<div
										key={i}
										className="flex-1 flex flex-col items-center group relative hover:z-10"
									>
										{/* Tooltip */}
										<div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap">
											{count} hits
										</div>

										<div className="w-full flex flex-col items-center justify-end h-full">
											<div
												className="w-full bg-purple-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"
												style={{ height: `${Math.max(height, 2)}%` }}
											></div>
										</div>
										{i % 3 === 0 && (
											<span className="text-[10px] font-bold text-gray-400 mt-2">
												{i}h
											</span>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Top recherches */}
				{stats.topSearches && stats.topSearches.length > 0 && (
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 p-8">
						<h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
							<Search className="h-6 w-6 text-orange-600" />
							Top recherches
						</h3>
						<div className="space-y-3">
							{stats.topSearches.map((search, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 bg-white border border-gray-100/50 rounded-2xl shadow-sm hover:shadow-md transition-all"
								>
									<div className="flex-1">
										<p className="font-bold text-gray-900">{search.search}</p>
										<div className="flex items-center mt-1 space-x-3">
											<span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
												{search.count}x
											</span>
											<span className="text-xs font-bold text-green-600">
												{search.successRate}% réussite
											</span>
										</div>
									</div>
									<span className="text-2xl font-black text-gray-200">
										#{index + 1}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Top questions */}
				{stats.topQuestions && stats.topQuestions.length > 0 && (
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 p-8">
						<h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
							<MessageSquare className="h-6 w-6 text-indigo-600" />
							Questions fréquentes
						</h3>
						<div className="space-y-3">
							{stats.topQuestions.map((q, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 bg-white border border-gray-100/50 rounded-2xl shadow-sm hover:shadow-md transition-all"
								>
									<div className="flex-1 min-w-0 pr-4">
										<p className="font-bold text-gray-900 truncate">
											{q.question}
										</p>
										<div className="flex items-center mt-1 space-x-3">
											<span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
												{q.count}x
											</span>
											{q.avgConfidence && (
												<span className="text-xs font-bold text-blue-600">
													Conf: {q.avgConfidence}
												</span>
											)}
										</div>
									</div>
									<span className="text-2xl font-black text-gray-200">
										#{index + 1}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdvancedStatsTab;
