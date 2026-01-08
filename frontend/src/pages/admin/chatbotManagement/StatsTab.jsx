import React from "react";
import {
	MessageCircle,
	Users,
	CheckCircle,
	AlertCircle,
	ThumbsUp,
	ThumbsDown,
	ArrowRight,
} from "lucide-react";

const StatsTab = ({ stats, setActiveTab, setSelectedQuestion }) => {
	if (!stats) return null;

	const cards = [
		{
			title: "Total interactions",
			value: stats.overview.totalInteractions,
			icon: MessageCircle,
			gradient: "bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400",
			shadow: "shadow-blue-200/50",
		},
		{
			title: "Utilisateurs uniques",
			value: stats.overview.uniqueUsers,
			icon: Users,
			gradient:
				"bg-gradient-to-tr from-purple-600 via-purple-500 to-fuchsia-400",
			shadow: "shadow-purple-200/50",
		},
		{
			title: "Taux de réponse",
			value: stats.overview.responseRate,
			icon: CheckCircle,
			gradient:
				"bg-gradient-to-tr from-emerald-500 via-emerald-400 to-green-400",
			shadow: "shadow-emerald-200/50",
		},
		{
			title: "Questions en attente",
			value: stats.overview.pendingQuestions,
			icon: AlertCircle,
			gradient: "bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-300",
			shadow: "shadow-orange-200/50",
		},
	];

	return (
		<div className="space-y-8 animate-fade-in-up">
			{/* Overview Cards */}
			{stats.overview && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white font-sans">
					{cards.map((card, index) => (
						<div
							key={index}
							className={`relative overflow-hidden rounded-2xl p-4 min-h-[120px] flex flex-col justify-between ${card.gradient} ${card.shadow} shadow-md hover:shadow-lg transition-all duration-300 group`}
						>
							{/* Background Icon */}
							<div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10 transform scale-150 rotate-0 group-hover:scale-[1.7] group-hover:rotate-6 transition-all duration-700 ease-out pointer-events-none">
								<card.icon className="w-40 h-40" strokeWidth={1.5} />
							</div>

							{/* Decorative Shape */}
							<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>

							{/* Top Spacer/Badge place */}
							<div className="h-6"></div>

							<div className="relative z-10 mt-auto">
								<h3 className="text-3xl leading-none text-white tracking-tighter mb-1 drop-shadow-sm">
									{card.value}
								</h3>
								<p className="text-[10px] text-white text-white/90 tracking-widest uppercase">
									{card.title}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Feedback Stats */}
				{stats.feedbackStats && (
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4">
						<h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
							<ThumbsUp className="w-5 h-5 text-emerald-500" />
							Feedback Utilisateurs
						</h3>
						<div className="flex items-center gap-3">
							<div className="flex-1 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100/50 flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-all duration-300">
								<div className="p-2 bg-white rounded-full shadow-sm text-emerald-500 mb-1 group-hover:scale-110 transition-transform">
									<ThumbsUp className="h-6 w-6" />
								</div>
								<span className="text-2xl font-black text-emerald-600 tracking-tighter leading-none">
									{stats.feedbackStats.helpful || 0}
								</span>
								<span className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest">
									Utiles
								</span>
							</div>
							<div className="flex-1 bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-100/50 flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-all duration-300">
								<div className="p-2 bg-white rounded-full shadow-sm text-rose-500 mb-1 group-hover:scale-110 transition-transform">
									<ThumbsDown className="h-6 w-6" />
								</div>
								<span className="text-2xl font-black text-rose-600 tracking-tighter leading-none">
									{stats.feedbackStats.not_helpful || 0}
								</span>
								<span className="text-[9px] font-black text-rose-600/70 uppercase tracking-widest">
									Inutiles
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Top Unanswered */}
				{stats.topUnanswered && (
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 flex flex-col">
						<h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-orange-500" />
							Top questions sans réponse
						</h3>
						{stats.topUnanswered.length > 0 ? (
							<div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
								{stats.topUnanswered.slice(0, 5).map((q, index) => (
									<div
										key={q._id}
										className="flex items-center justify-between p-4 bg-white border border-gray-100/50 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-100 transition-all hover:-translate-x-1 group"
									>
										<div className="flex items-center min-w-0 pr-4">
											<span className="w-8 h-8 flex-shrink-0 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-sm font-black mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
												{index + 1}
											</span>
											<span className="text-gray-700 font-medium truncate group-hover:text-orange-900 transition-colors">
												{q.question}
											</span>
										</div>
										<div className="flex items-center shrink-0">
											<span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full mr-3">
												{q.count}x
											</span>
											<button
												onClick={() => {
													setSelectedQuestion(q);
													setActiveTab("questions");
												}}
												className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all transform hover:rotate-[-45deg]"
												title="Répondre"
											>
												<ArrowRight className="w-4 h-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
								<CheckCircle className="w-12 h-12 mb-2 opacity-20" />
								<p className="font-medium">Tout est à jour !</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Daily Stats Chart */}
			{stats.dailyStats && stats.dailyStats.length > 0 && (
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4">
					<h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
						<MessageCircle className="w-5 h-5 text-blue-500" />
						Activité des 7 derniers jours
					</h3>
					<div className="flex items-end justify-between space-x-4 h-64 px-4 pb-2">
						{stats.dailyStats.map((day) => {
							const maxCount = Math.max(
								...stats.dailyStats.map((d) => d.count),
								1
							);
							const height = (day.count / maxCount) * 100;
							return (
								<div
									key={day._id}
									className="flex-1 flex flex-col items-center group relative"
								>
									{/* Tooltip */}
									<div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-20">
										{day.count} interactions
										<div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
									</div>

									<div className="w-full max-w-[60px] flex flex-col-reverse h-full relative">
										<div className="w-full bg-gray-100 rounded-t-2xl absolute inset-0 z-0 opacity-50"></div>
										{/* No Answer Bar (Top part if stacked, but simplified here to overlay or just use main bar for now) */}

										{/* Main Bar */}
										<div
											className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-2xl relative z-10 hover:from-emerald-400 hover:to-teal-300 transition-all duration-300 shadow-lg shadow-emerald-200/50"
											style={{ height: `${Math.max(height, 5)}%` }}
										>
											{/* Error/No Answer Indicator as a segment */}
											{day.noAnswer > 0 && (
												<div
													className="w-full bg-rose-400 absolute top-0 left-0 rounded-t-2xl hover:bg-rose-300 transition-colors"
													style={{
														height: `${(day.noAnswer / day.count) * 100}%`,
														minHeight: "4px",
													}}
													title={`${day.noAnswer} sans réponse`}
												/>
											)}
										</div>
									</div>
									<span className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
										{new Date(day._id).toLocaleDateString("fr-FR", {
											weekday: "short",
										})}
									</span>
								</div>
							);
						})}
					</div>
					<div className="flex items-center justify-center space-x-8 mt-8 text-sm font-medium">
						<div className="flex items-center">
							<span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-200"></span>
							<span className="text-gray-600">Avec réponse</span>
						</div>
						<div className="flex items-center">
							<span className="w-3 h-3 bg-rose-400 rounded-full mr-2 shadow-sm shadow-rose-200"></span>
							<span className="text-gray-600">Sans réponse</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StatsTab;
