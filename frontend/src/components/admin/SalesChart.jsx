import React from "react";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	AreaChart,
	Area,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";

const SalesChart = ({ data, type = "line", color = "green" }) => {
	const themeColors = {
		green: {
			stroke: "#22C55E",
			fill: "#22C55E",
		},
		purple: {
			stroke: "#9333EA",
			fill: "#9333EA",
		},
		blue: {
			stroke: "#3B82F6",
			fill: "#3B82F6",
		},
		orange: {
			stroke: "#F97316",
			fill: "#F97316",
		},
	};

	const currentColor = themeColors[color] || themeColors.green;

	if (!data || data.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-500"></div>
				<div className="p-4 border-b border-gray-100 flex items-center justify-between relative z-10">
					<div className="flex items-center justify-center h-64 bg-harvests-light rounded-lg w-full">
						<p className="text-gray-500">Aucune donnée disponible</p>
					</div>
				</div>
			</div>
		);
	}

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(value);
	};

	const formatMonth = (month) => {
		const [year, monthNum] = month.split("-");
		const date = new Date(year, monthNum - 1);
		return date.toLocaleDateString("fr-FR", {
			month: "short",
			year: "2-digit",
		});
	};

	if (type === "bar") {
		return (
			<ResponsiveContainer width="90%" height={300}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="month"
						tickFormatter={formatMonth}
						angle={-45}
						textAnchor="end"
						height={60}
					/>
					<YAxis tickFormatter={(value) => formatCurrency(value)} />
					<Tooltip
						formatter={(value, name) => [
							name === "sales" ? formatCurrency(value) : value,
							name === "sales" ? "Ventes" : "Commandes",
						]}
						labelFormatter={(label) => formatMonth(label)}
					/>
					<Bar dataKey="sales" fill={currentColor.fill} name="Ventes" />
				</BarChart>
			</ResponsiveContainer>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={350}>
			<AreaChart data={data}>
				<defs>
					<linearGradient
						id={`colorSales-${color}`}
						x1="0"
						y1="0"
						x2="0"
						y2="1"
					>
						<stop offset="5%" stopColor={currentColor.fill} stopOpacity={0.3} />
						<stop offset="95%" stopColor={currentColor.fill} stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray="3 3"
					vertical={false}
					stroke="#F3F4F6"
				/>
				<XAxis
					dataKey="month"
					tickFormatter={formatMonth}
					axisLine={false}
					tickLine={false}
					tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }}
					dy={10}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }}
					tickFormatter={(value) => `${value / 1000}k`}
				/>
				<Tooltip
					cursor={{ stroke: currentColor.stroke, strokeWidth: 2 }}
					contentStyle={{
						borderRadius: "1rem",
						border: "none",
						boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
						fontSize: "12px",
						fontWeight: "900",
					}}
					formatter={(value, name) => [
						name === "sales" ? formatCurrency(value) : value,
						name === "sales" ? "VENTES" : "COMMANDES",
					]}
					labelFormatter={(label) => formatMonth(label)}
				/>
				<Area
					type="monotone"
					dataKey="sales"
					stroke={currentColor.stroke}
					strokeWidth={4}
					fillOpacity={1}
					fill={`url(#colorSales-${color})`}
					name="sales"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default SalesChart;
