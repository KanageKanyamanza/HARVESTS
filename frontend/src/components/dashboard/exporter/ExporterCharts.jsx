import React from "react";
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

const data = [
	{ name: "Jan", revenue: 4000, volume: 240 },
	{ name: "Fév", revenue: 3000, volume: 198 },
	{ name: "Mar", revenue: 5000, volume: 305 },
	{ name: "Avr", revenue: 4500, volume: 280 },
	{ name: "Mai", revenue: 6000, volume: 390 },
	{ name: "Juin", revenue: 5500, volume: 360 },
];

const ExporterCharts = ({ loading, stats }) => {
	if (loading) {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="h-[300px] bg-white animate-pulse rounded-2xl shadow-sm border border-gray-100" />
				<div className="h-[300px] bg-white animate-pulse rounded-2xl shadow-sm border border-gray-100" />
			</div>
		);
	}

	const monthlyGrowth = stats?.monthlyGrowth || 12;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
			{/* Revenue Chart */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							Tendance des Revenus
						</h3>
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Performance financière semestrielle
						</p>
					</div>
					<div className="flex flex-col items-end">
						<span
							className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black ${monthlyGrowth >= 0 ? "bg-emerald-500 border-emerald-400" : "bg-red-500 border-red-400"} text-white shadow-md border uppercase tracking-widest`}
						>
							{monthlyGrowth >= 0 ? "+" : ""}
							{monthlyGrowth}% croissance
						</span>
					</div>
				</div>
				<div className="h-[250px] w-full relative z-10">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={data}>
							<defs>
								<linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f0f0f0"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
								tickFormatter={(value) => `${value}`}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: "12px",
									border: "none",
									boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
								}}
								labelStyle={{ fontWeight: 800, color: "#111827" }}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#0d9488"
								strokeWidth={3}
								fillOpacity={1}
								fill="url(#colorRev)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Volume Chart */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4 transition-all hover:shadow-md relative overflow-hidden group">
				<div className="flex items-center justify-between mb-4 relative z-10">
					<div>
						<h3 className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1">
							Volume d'Exportation
						</h3>
						<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Unités expédiées par mois
						</p>
					</div>
				</div>
				<div className="h-[250px] w-full relative z-10">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data}>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="#f0f0f0"
							/>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 10, fontWeight: 700, fill: "#9ca3af" }}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: "12px",
									border: "none",
									boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
								}}
								cursor={{ fill: "#f8fafc" }}
							/>
							<Bar
								dataKey="volume"
								fill="#3b82f6"
								radius={[4, 4, 0, 0]}
								barSize={20}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
};

export default ExporterCharts;
