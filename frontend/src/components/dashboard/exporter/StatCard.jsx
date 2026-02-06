import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatCard = ({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	color,
	gradient,
}) => (
	<div
		className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${gradient} text-white`}
	>
		{/* Decorative blur circles */}
		<div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
		<div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/5 blur-xl" />

		<div className="relative z-10">
			<div className="flex items-center justify-between mb-4">
				<div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
					<Icon className="h-6 w-6 text-white" />
				</div>
				{trend && (
					<div
						className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md ${trend > 0 ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}
					>
						{trend > 0 ?
							<FiTrendingUp className="h-3 w-3" />
						:	<FiTrendingDown className="h-3 w-3" />}
						<span>{Math.abs(trend)}%</span>
					</div>
				)}
			</div>

			<div>
				<p className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">
					{title}
				</p>
				<h3 className="text-3xl font-extrabold text-white mb-1">{value}</h3>
				{subtitle && (
					<p className="text-xs text-white/70 font-medium">{subtitle}</p>
				)}
			</div>
		</div>
	</div>
);

export default StatCard;
