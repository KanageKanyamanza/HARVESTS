import React from "react";
import { useTranslation } from "react-i18next";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import { formatMonthCode } from "../../../utils/i18n";
import { formatPrice } from "../../../utils/currencyUtils";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
};
const axisTick = { fontSize: 10, fontWeight: 700, fill: "#9ca3af" };

// Jour 55 : données réelles (stats.monthlyExports, 6 derniers mois, renvoyé par
// /exporters/me/stats). Les courbes affichaient jusque-là des valeurs inventées
// (janvier-juin) et une croissance de 12 % par défaut.
// loading : titres des graphiques affichés, seules les courbes attendent
const ExporterCharts = ({ loading, stats }) => {
	const { t, i18n } = useTranslation("dashboard-transporter");
	const data = stats?.monthlyExports || [];
	const monthlyGrowth = stats?.monthlyGrowth;
	const monthLabel = (month) => formatMonthCode(month, i18n.language);
	const longMonth = (month) =>
		formatMonthCode(month, i18n.language, { month: "long", year: "numeric" });

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
			{/* Revenus */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							{t("exporter.charts.revenueTitle")}
						</h3>
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							{t("exporter.charts.revenueSubtitle")}
						</p>
					</div>
					{/* Tendance affichée seulement si elle est calculable */}
					{!loading && monthlyGrowth !== null && monthlyGrowth !== undefined && (
						<span
							className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black ${monthlyGrowth >= 0 ? "bg-emerald-500 border-emerald-400" : "bg-red-500 border-red-400"} text-white shadow-md border uppercase tracking-widest`}
						>
							{t("exporter.charts.growth", {
								value: `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth}`,
							})}
						</span>
					)}
				</div>
				<div className="h-[250px] w-full relative z-10">
					{loading ?
						<div className="h-full w-full bg-gray-100/70 rounded-xl animate-pulse" />
					:	<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={data}>
								<defs>
									<linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
								<XAxis dataKey="month" tickFormatter={monthLabel} axisLine={false} tickLine={false} tick={axisTick} />
								<YAxis axisLine={false} tickLine={false} tick={axisTick} />
								<Tooltip
									contentStyle={tooltipStyle}
									labelStyle={{ fontWeight: 800, color: "#111827" }}
									labelFormatter={longMonth}
									formatter={(value) => [formatPrice(value, "XOF"), t("exporter.charts.revenue")]}
								/>
								<Area
									type="monotone"
									dataKey="value"
									stroke="#0d9488"
									strokeWidth={3}
									fillOpacity={1}
									fill="url(#colorRev)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					}
				</div>
			</div>

			{/* Volume */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							{t("exporter.charts.volumeTitle")}
						</h3>
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							{t("exporter.charts.volumeSubtitle")}
						</p>
					</div>
				</div>
				<div className="h-[250px] w-full relative z-10">
					{loading ?
						<div className="h-full w-full bg-gray-100/70 rounded-xl animate-pulse" />
					:	<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
								<XAxis dataKey="month" tickFormatter={monthLabel} axisLine={false} tickLine={false} tick={axisTick} />
								<YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axisTick} />
								<Tooltip
									contentStyle={tooltipStyle}
									cursor={{ fill: "#f8fafc" }}
									labelFormatter={longMonth}
									formatter={(value) => [value, t("exporter.charts.exports")]}
								/>
								<Bar dataKey="exports" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
							</BarChart>
						</ResponsiveContainer>
					}
				</div>
			</div>
		</div>
	);
};

export default ExporterCharts;
