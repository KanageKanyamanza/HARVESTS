import React from "react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";

const ProductStats = ({ data = {} }) => {
	const { byCategory = [], byStatus = [] } = data;

	const COLORS = [
		"#3B82F6", // Blue
		"#10B981", // Emerald
		"#F59E0B", // Amber
		"#EF4444", // Red
		"#8B5CF6", // Violet
		"#EC4899", // Pink
		"#06B6D4", // Cyan
		"#F97316", // Orange
	];

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(value);
	};

	if (byCategory.length === 0 && byStatus.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-10 text-center">
				<p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
					Aucune donnée produit
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="p-4 border-b border-gray-100 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
						Analyses Produits
					</h3>
					<p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">
						Répartition & Tendances
					</p>
				</div>
			</div>

			<div className="p-4 space-y-10 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					{/* Graphique par catégorie */}
					<div className="bg-white/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-xl duration-500">
						<h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
							Par catégorie
						</h4>
						{byCategory.length > 0 ? (
							<ResponsiveContainer width="100%" height={320}>
								<PieChart>
									<Pie
										data={byCategory}
										cx="50%"
										cy="45%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={5}
										dataKey="count"
										nameKey="_id"
										stroke="none"
										label={({ _id, percent }) =>
											`${_id} (${(percent * 100).toFixed(0)}%)`
										}
									>
										{byCategory.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
												className="hover:opacity-80 transition-opacity"
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "1rem",
											border: "none",
											boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									/>
									<Legend
										verticalAlign="bottom"
										align="center"
										wrapperStyle={{
											paddingTop: "20px",
											fontSize: "11px",
											fontWeight: "900",
											textTransform: "uppercase",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-300">
								Aucune donnée
							</div>
						)}
					</div>

					{/* Graphique par statut */}
					<div className="bg-white/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-xl duration-500">
						<h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
							Par statut
						</h4>
						{byStatus.length > 0 ? (
							<ResponsiveContainer width="100%" height={320}>
								<PieChart>
									<Pie
										data={byStatus}
										cx="50%"
										cy="45%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={5}
										dataKey="count"
										nameKey="_id"
										stroke="none"
										label={({ _id, percent }) =>
											`${_id} (${(percent * 100).toFixed(0)}%)`
										}
									>
										{byStatus.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[(index + 3) % COLORS.length]}
												className="hover:opacity-80 transition-opacity"
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "1rem",
											border: "none",
											boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
									/>
									<Legend
										verticalAlign="bottom"
										align="center"
										wrapperStyle={{
											paddingTop: "20px",
											fontSize: "11px",
											fontWeight: "900",
											textTransform: "uppercase",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="flex items-center justify-center h-64 text-gray-300">
								Aucune donnée
							</div>
						)}
					</div>
				</div>

				{/* Tableau simplifié & Premium */}
				<div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white/30 backdrop-blur-sm">
					<table className="min-w-full divide-y divide-gray-100">
						<thead className="bg-gray-50/50">
							<tr>
								<th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Catégorie
								</th>
								<th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Volume
								</th>
								<th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Prix Moyen
								</th>
								<th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
									Part
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{byCategory.slice(0, 5).map((category, index) => {
								const total = byCategory.reduce(
									(sum, item) => sum + item.count,
									0
								);
								const percentage = ((category.count / total) * 100).toFixed(0);

								return (
									<tr
										key={category._id || index}
										className="group hover:bg-white transition-colors duration-300"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
											{category._id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">
											{category.count}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500 font-mono">
											{formatCurrency(category.averagePrice || 0)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center justify-end space-x-3">
												<span className="text-xs font-black text-gray-900">
													{percentage}%
												</span>
												<div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
													<div
														className="h-full bg-teal-400 rounded-full"
														style={{ width: `${percentage}%` }}
													></div>
												</div>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ProductStats;
