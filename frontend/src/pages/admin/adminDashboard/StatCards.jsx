import React from "react";
import { Link } from "react-router-dom";

const StatCards = ({ statCards }) => {
	// Helper to get nice gradients based on the base color class provided
	const getGradient = (colorClass) => {
		if (colorClass.includes("blue"))
			return "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700";
		if (colorClass.includes("green"))
			return "bg-gradient-to-br from-emerald-500 via-green-500 to-green-600";
		if (colorClass.includes("purple"))
			return "bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600";
		if (colorClass.includes("yellow"))
			return "bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500";
		if (colorClass.includes("emerald"))
			return "bg-gradient-to-br from-teal-400 via-emerald-500 to-emerald-600";
		return "bg-gradient-to-br from-gray-700 to-gray-900";
	};

	const getShadow = (colorClass) => {
		if (colorClass.includes("blue")) return "shadow-blue-200/50";
		if (colorClass.includes("green")) return "shadow-green-200/50";
		if (colorClass.includes("purple")) return "shadow-purple-200/50";
		if (colorClass.includes("yellow")) return "shadow-orange-200/50";
		if (colorClass.includes("emerald")) return "shadow-emerald-200/50";
		return "shadow-gray-200/50";
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
			{statCards.map((card, index) => {
				const gradientClass = getGradient(card.color);
				const shadowColor = getShadow(card.color);

				return (
					<Link
						key={index}
						to={card.link}
						className={`relative overflow-hidden rounded-[2rem] p-6 ${gradientClass} text-white shadow-xl ${shadowColor} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ring-1 ring-white/20`}
					>
						{/* Background Decor - Large Icon */}
						<div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
							<card.icon className="w-40 h-40" />
						</div>

						{/* Background Decor - Shine Effect */}
						<div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>

						<div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
							<div className="flex justify-between items-start">
								{/* <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
									<card.icon className="w-6 h-6 text-white drop-shadow-sm" />
								</div> */}
								{card.change && (
									<div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 shadow-sm">
										<span className="text-xs font-bold text-white tracking-wide">
											{card.change.includes("+") ? "↑" : ""} {card.change}
										</span>
									</div>
								)}
							</div>

							<div className="">
								<h3 className="text-4xl font-black tracking-tight text-white mb-1 drop-shadow-sm">
									{card.value}
								</h3>
								<p className="text-sm font-bold text-blue-50/80 tracking-wide uppercase opacity-90">
									{card.title}
								</p>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default StatCards;
