import React from "react";
import { Link } from "react-router-dom";

const StatCards = ({ statCards }) => {
	// Helper to get vibrant gradients based on the base color class
	const getGradient = (colorClass) => {
		if (colorClass.includes("blue"))
			return "bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400";
		if (colorClass.includes("green"))
			return "bg-gradient-to-tr from-emerald-500 via-emerald-400 to-green-400";
		if (colorClass.includes("purple"))
			return "bg-gradient-to-tr from-purple-600 via-purple-500 to-fuchsia-400";
		if (colorClass.includes("yellow"))
			return "bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-300";
		if (colorClass.includes("emerald"))
			return "bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-300";
		return "bg-gradient-to-tr from-gray-700 to-gray-600";
	};

	const getShadow = (colorClass) => {
		if (colorClass.includes("blue")) return "shadow-blue-200/50";
		if (colorClass.includes("green")) return "shadow-emerald-200/50";
		if (colorClass.includes("purple")) return "shadow-purple-200/50";
		if (colorClass.includes("yellow")) return "shadow-orange-200/50";
		if (colorClass.includes("emerald")) return "shadow-teal-200/50";
		return "shadow-gray-200/50";
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 text-white font-sans">
			{statCards.map((card, index) => {
				const gradientClass = getGradient(card.color);
				const shadowColor = getShadow(card.color);

				return (
					<Link
						key={index}
						to={card.link}
						className={`relative overflow-hidden rounded-[1.5rem] p-4 min-h-[120px] aspect-auto flex flex-col justify-between ${gradientClass} ${shadowColor} shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}
					>
						{/* Top Badge/Pill */}
						<div className="flex justify-start">
							{card.change ? (
								<div className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 shadow-sm">
									<span className="text-[10px] font-bold tracking-wide">
										{card.change.includes("+") ? "↑" : ""} {card.change}
									</span>
								</div>
							) : (
								<div className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 shadow-sm opacity-0"></div> // Spacer to keep layout
							)}
						</div>

						{/* Background Icon (Large & Faded) */}
						<div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-10 transform scale-125 rotate-0 group-hover:scale-[1.4] group-hover:rotate-6 transition-all duration-700 ease-out pointer-events-none">
							<card.icon className="w-16 h-16" strokeWidth={1.5} />
						</div>

						{/* Decorative Background Shape */}
						<div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

						<div className="relative z-10 mt-auto">
							<h3 className="text-xl leading-none text-white font-black tracking-tighter mb-0.5 drop-shadow-sm">
								{card.value}
							</h3>
							<p className="text-[8px] font-black text-white/90 tracking-widest uppercase">
								{card.title}
							</p>
						</div>
					</Link>
				);
			})}
		</div>
	);
};

export default StatCards;
