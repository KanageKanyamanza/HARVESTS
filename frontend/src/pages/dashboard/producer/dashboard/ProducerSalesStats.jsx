import React from "react";
import { useTranslation } from "react-i18next";
import SalesChart from "../../../../components/admin/SalesChart";

const ProducerSalesStats = ({
	salesChartData,
	monthlyGrowth,
	loading = false,
}) => {
	const { t } = useTranslation("dashboard-producer");
	return (
		<div className="grid gap-6 mb-6">
			{/* Chart Section - Full width for now */}
			<div className=" max-h-[350px] bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							{t("dashboard.salesTitle")}
						</h3>
						<p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
							{t("dashboard.salesSubtitle", { count: salesChartData?.length || 12 })}
						</p>
					</div>
					<div className="flex flex-col items-end">
						{!loading && (
						<span
							className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black ${monthlyGrowth >= 0 ? "bg-green-500 border-green-400 shadow-green-200" : "bg-red-500 border-red-400 shadow-red-200"} text-white shadow-md border animate-pulse-slow uppercase tracking-widest`}
						>
							{t("dashboard.growth", {
								value: `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth}`,
							})}
						</span>
						)}
					</div>
				</div>
				<div className="max-h-[280px] w-full relative z-10 mx-1">
					{/* Seul le graphique (données serveur) attend */}
					{loading ?
						<div className="h-[240px] w-full bg-gray-100/70 rounded-xl animate-pulse" />
					:	<SalesChart data={salesChartData} type="area" />}
				</div>
			</div>
		</div>
	);
};

export default ProducerSalesStats;
