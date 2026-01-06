import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const RevenueTrendsChart = ({ data = [] }) => {
	// Transformer les données pour le graphique
	const chartData = data.map((item) => ({
		date: `${item._id.day}/${item._id.month}`,
		revenue: item.revenue || 0,
		orders: item.orders || 0,
	}));

	const formatPrice = (value) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XOF",
			minimumFractionDigits: 0,
		}).format(value);
	};

	if (chartData.length === 0) {
		return (
			<div className="h-64 flex items-center justify-center text-gray-500">
				<div className="text-center">
					<p>Aucune donnée de chiffre d'affaires disponible</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={chartData}
					margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						vertical={false}
						stroke="#f1f5f9"
					/>
					<XAxis
						dataKey="date"
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
						dy={10}
					/>
					<YAxis
						axisLine={false}
						tickLine={false}
						tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
						tickFormatter={(value) =>
							value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
						}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.9)",
							backdropFilter: "blur(8px)",
							border: "1px solid rgba(255, 255, 255, 0.6)",
							borderRadius: "16px",
							boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
						}}
						itemStyle={{
							fontSize: "12px",
							fontWeight: "900",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}
						formatter={(value, name) => [
							name === "revenue" ? formatPrice(value) : value,
							name === "revenue" ? "Revenus" : "Commandes",
						]}
					/>
					<Area
						type="monotone"
						dataKey="revenue"
						stroke="#10b981"
						strokeWidth={3}
						fillOpacity={1}
						fill="url(#colorRevenue)"
						animationDuration={2500}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default RevenueTrendsChart;
