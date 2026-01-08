import React from "react";
import SalesChart from "../../../components/admin/SalesChart";

const SalesAndUserStats = ({
	salesChartData,
	marketplaceStats,
	monthlyGrowth,
}) => {
	return (
		<div className="grid gap-6 mb-6">
			{/* Chart Section - Takes 2/3 width */}
			<div className=" max-h-[350px] bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							Évolution des ventes
						</h3>
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Revenus sur les {salesChartData?.length || 12} derniers mois
						</p>
					</div>
					<div className="flex flex-col items-end">
						<span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-green-500 text-white shadow-md shadow-green-200 border border-green-400 animate-pulse-slow uppercase tracking-widest">
							{monthlyGrowth >= 0 ? "+" : ""}
							{monthlyGrowth}% croissance
						</span>
					</div>
				</div>
				<div className="max-h-[280px] w-full relative z-10 mx-1">
					<SalesChart data={salesChartData} type="bar" />
				</div>
			</div>

			{/* User Stats Section */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden">
				<h3 className="text-sm font-black text-gray-900 mb-4 tracking-tight uppercase tracking-widest leading-none">
					Répartition
				</h3>
				<div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
					{marketplaceStats.map((stat, index) => (
						<div
							key={index}
							className="group flex items-center p-2 rounded-xl bg-white/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-300 cursor-default"
						>
							<div
								className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
							>
								<stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
							</div>
							<div className="ml-3 flex-1">
								<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
									{stat.title}
								</p>
								<div className="flex items-baseline justify-between">
									<p className="text-base font-black text-gray-900 leading-none">
										{stat.value}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SalesAndUserStats;
