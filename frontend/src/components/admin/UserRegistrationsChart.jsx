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

const UserRegistrationsChart = ({ data = [] }) => {
	// Transformer les données pour le graphique
	const chartData = data.map((item) => ({
		date: `${item._id.day}/${item._id.month}`,
		count: item.count,
	}));

	if (chartData.length === 0) {
		return (
			<div className="h-64 flex items-center justify-center text-gray-500">
				<div className="text-center">
					<p>Aucune donnée d'inscription disponible</p>
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
						<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
							<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
					/>
					<Area
						type="monotone"
						dataKey="count"
						name="Inscriptions"
						stroke="#3b82f6"
						strokeWidth={3}
						fillOpacity={1}
						fill="url(#colorCount)"
						animationDuration={2000}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default UserRegistrationsChart;
