import React from "react";
import SalesChart from "../../../../components/admin/SalesChart";

const TransformerSalesStats = ({
	salesChartData,
	monthlyRevenue,
	monthlyGrowth,
}) => {
	return (
		<div className="grid gap-6 mb-6">
			{/* Chart Section - Full width for now */}
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
						<span
							className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black ${monthlyGrowth >= 0 ? "bg-green-500 border-green-400 shadow-green-200" : "bg-red-500 border-red-400 shadow-red-200"} text-white shadow-md border animate-pulse-slow uppercase tracking-widest`}
						>
							{monthlyGrowth >= 0 ? "+" : ""}
							{monthlyGrowth}% croissance
						</span>
					</div>
				</div>
				<div className="max-h-[280px] w-full relative z-10 mx-1">
					<SalesChart data={salesChartData} type="area" color="purple" />
				</div>
			</div>
		</div>
	);
};

export default TransformerSalesStats;
