import React from "react";
import SalesChart from "../../../components/admin/SalesChart";

const SalesAndUserStats = ({
	salesChartData,
	marketplaceStats,
	monthlyGrowth,
}) => {
	return (
		<div className="grid gap-10 mb-10">
			{/* Chart Section - Takes 2/3 width */}
			<div className=" max-h-[450px] bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-5 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden group">
				<div className="flex items-center justify-between mb-10 relative z-10">
					<div>
						<h3 className="text-2xl font-[900] text-gray-900 tracking-tight">
							Évolution des ventes
						</h3>
						<p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
							Revenus sur les {salesChartData?.length || 12} derniers mois
						</p>
					</div>
					<div className="flex flex-col items-end">
						<span className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-black bg-green-500 text-white shadow-lg shadow-green-200 border border-green-400 animate-pulse-slow">
							{monthlyGrowth >= 0 ? "+" : ""}
							{monthlyGrowth}% de croissance
						</span>
					</div>
				</div>
				<div className="max-h-[450px] w-full relative z-10 mx-5">
					<SalesChart data={salesChartData} type="bar" />
				</div>
			</div>

			{/* User Stats Section */}
			<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-5 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden">
				<h3 className="text-2xl font-[900] text-gray-900 mb-8 tracking-tight">
					Répartition
				</h3>
				<div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{marketplaceStats.map((stat, index) => (
						<div
							key={index}
							className="group flex items-center p-4 rounded-3xl bg-white/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 cursor-default"
						>
							<div
								className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
							>
								<stat.icon className={`w-6 h-6 ${stat.color}`} />
							</div>
							<div className="ml-5 flex-1">
								<p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
									{stat.title}
								</p>
								<div className="flex items-baseline justify-between">
									<p className="text-2xl font-black text-gray-900 leading-none">
										{stat.value}
									</p>
									{stat.description && (
										<span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400 group-hover:text-gray-500 transition-colors">
											{stat.description}
										</span>
									)}
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
