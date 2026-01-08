import React from "react";
import { TrendingUp, CheckCircle, Clock, DollarSign } from "lucide-react";
import { formatPrice } from "../../../utils/subscriptionHelpers";

const SubscriptionStats = ({ stats }) => {
	if (!stats) return null;

	const statCards = [
		{
			icon: TrendingUp,
			color: "from-blue-600 via-blue-500 to-blue-400",
			shadowColor: "shadow-blue-200",
			label: "TOTAL ABONNEMENTS",
			value: stats.total || 0,
			trend: "+12%", // Mock trend for design consistency
			trendUp: true,
		},
		{
			icon: CheckCircle,
			color: "from-emerald-500 via-green-500 to-teal-400",
			shadowColor: "shadow-green-200",
			label: "ACTIFS",
			value: stats.active || 0,
			trend: "+5%",
			trendUp: true,
		},
		{
			icon: Clock,
			color: "from-orange-500 via-amber-500 to-yellow-400",
			shadowColor: "shadow-orange-200",
			label: "EN ATTENTE",
			value: stats.pending || 0,
			trend: "Action requise",
			trendUp: false,
		},
		{
			icon: DollarSign,
			color: "from-violet-600 via-purple-500 to-fuchsia-500",
			shadowColor: "shadow-purple-200",
			label: "REVENUS TOTAUX",
			value: `${formatPrice(stats.revenue?.total || 0)}`,
			subValue: "FCFA",
			trend: "+18% this month",
			trendUp: true,
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			{statCards.map((card, index) => {
				const Icon = card.icon;
				return (
					<div
						key={index}
						className={`relative p-5 rounded-2xl bg-gradient-to-tr ${card.color} shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden border border-white/10`}
					>
						{/* Background Decorative Elements */}
						<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out"></div>
						<div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out"></div>

						{/* Large Background Icon */}
						<Icon className="absolute -right-2 -bottom-2 w-20 h-20 text-white/10 transform rotate-12 group-hover:scale-[1.2] group-hover:rotate-6 transition-transform duration-500 ease-out pointer-events-none" />

						<div className="relative z-10 flex flex-col h-full justify-between">
							<div className="flex items-start justify-between mb-3">
								<div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:scale-110 transition-transform duration-300">
									<Icon className="w-5 h-5 text-white drop-shadow-md" />
								</div>
								{card.trend && (
									<span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-[8px] font-black text-white uppercase tracking-widest shadow-sm">
										{card.trend}
									</span>
								)}
							</div>

							<div>
								<h3 className="text-[9px] font-bold text-white/80 uppercase tracking-widest mb-0.5">
									{card.label}
								</h3>
								<div className="flex items-baseline gap-1">
									<span className="text-2xl font-black text-white tracking-tighter drop-shadow-sm">
										{card.value}
									</span>
									{card.subValue && (
										<span className="text-xs font-bold text-white/70 tracking-tighter">
											{card.subValue}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default SubscriptionStats;
