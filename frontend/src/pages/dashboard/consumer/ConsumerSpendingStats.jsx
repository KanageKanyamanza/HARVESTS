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
} from "recharts";
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { formatPrice } from "../../../utils/currencyUtils";
import { formatMonthCode } from "../../../utils/i18n";

// loading : titres affichés, seuls le montant et la courbe (serveur) attendent
const ConsumerSpendingStats = ({
	monthlySpentChart,
	currentMonthSpent,
	monthlyGrowth,
	loading = false,
}) => {
	const { t, i18n } = useTranslation("dashboard-consumer");
	const formatCurrency = (val) => formatPrice(val || 0, "XOF");

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 relative overflow-hidden group">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
				<div className="flex items-center gap-4">
					<div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
						<FiTrendingUp className="w-7 h-7" />
					</div>
					<div>
						<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
							{t("dashboard.spending.title")}
						</h3>
						<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">
							{t("dashboard.spending.subtitle")}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="text-right">
						<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
							{t("dashboard.spending.thisMonth")}
						</p>
						<p className="text-2xl font-[1000] text-gray-900 tracking-tighter">
							{loading ?
								<span className="inline-block h-6 w-24 bg-gray-100 rounded animate-pulse" />
							:	formatCurrency(currentMonthSpent)}
						</p>
					</div>
					{/* Tendance réelle (mois en cours vs mois précédent), seulement si calculable */}
					{!loading && monthlyGrowth !== null && monthlyGrowth !== undefined && (
						<>
							<div className="w-[1px] h-10 bg-gray-100 mx-2"></div>
							<div
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
									monthlyGrowth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
								}`}
							>
								{monthlyGrowth >= 0 ?
									<FiArrowUpRight className="w-3 h-3" />
								:	<FiArrowDownRight className="w-3 h-3" />}
								{monthlyGrowth >= 0 ? "+" : ""}
								{monthlyGrowth}%
							</div>
						</>
					)}
				</div>
			</div>

			<div className="h-[280px] w-full relative z-10">
				{loading ?
					<div className="h-full w-full bg-gray-100/70 rounded-2xl animate-pulse" />
				:	<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={monthlySpentChart}>
							<defs>
								<linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
							<XAxis
								dataKey="month"
								tickFormatter={(month) => formatMonthCode(month, i18n.language)}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }}
								dy={10}
							/>
							<YAxis hide={true} />
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(255, 255, 255, 0.8)",
									backdropFilter: "blur(12px)",
									borderRadius: "20px",
									border: "1px solid rgba(255, 255, 255, 0.6)",
									boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
									fontSize: "12px",
									fontWeight: "bold",
									color: "#1e293b",
								}}
								labelFormatter={(month) =>
									formatMonthCode(month, i18n.language, { month: "long", year: "numeric" })
								}
								formatter={(value) => [formatCurrency(value), t("dashboard.spending.spent")]}
							/>
							<Area
								type="monotone"
								dataKey="value"
								stroke="#3b82f6"
								strokeWidth={4}
								fillOpacity={1}
								fill="url(#colorSpent)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				}
			</div>
		</div>
	);
};

export default ConsumerSpendingStats;
