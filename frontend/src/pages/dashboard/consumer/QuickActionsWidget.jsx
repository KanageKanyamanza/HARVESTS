import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiSearch, FiHeart, FiMapPin, FiArrowRight, FiGrid } from "react-icons/fi";

const ACTIONS = [
	{ key: "discover", icon: FiSearch, link: "/products", classes: "bg-blue-50 text-blue-600" },
	{ key: "favorites", icon: FiHeart, link: "/consumer/favorites", classes: "bg-rose-50 text-rose-600" },
	{ key: "categories", icon: FiGrid, link: "/categories", classes: "bg-amber-50 text-amber-600" },
];

const QuickActionsWidget = () => {
	const { t } = useTranslation("dashboard-consumer");

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col justify-between">
			<div className="mb-6">
				<h3 className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-1">
					{t("dashboard.shortcuts.title")}
				</h3>
				<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">
					{t("dashboard.shortcuts.subtitle")}
				</p>
			</div>

			<div className="space-y-3">
				{ACTIONS.map(({ key, icon: Icon, link, classes }) => (
					<Link
						key={key}
						to={link}
						className="group flex items-center justify-between p-4 bg-white/50 border border-gray-100/50 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
					>
						<div className="flex items-center gap-4">
							<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${classes}`}>
								<Icon className="w-5 h-5" />
							</div>
							<div>
								<h4 className="text-sm font-[900] text-gray-900 leading-none mb-1">
									{t(`dashboard.shortcuts.${key}.title`)}
								</h4>
								<p className="text-[9px] font-bold text-gray-400 group-hover:text-gray-500">
									{t(`dashboard.shortcuts.${key}.description`)}
								</p>
							</div>
						</div>
						<FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
					</Link>
				))}
			</div>

			<div className="mt-6 pt-6 border-t border-gray-100">
				<Link
					to="/consumer/profile"
					className="block bg-blue-600 rounded-2xl p-5 relative overflow-hidden group"
				>
					<div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
						<FiMapPin className="w-16 h-16 text-white" />
					</div>
					<h4 className="text-white font-[1000] text-sm relative z-10 leading-tight max-w-[12rem]">
						{t("dashboard.shortcuts.addressTitle")}
					</h4>
					<span className="inline-flex items-center gap-2 mt-3 text-[9px] font-black text-white uppercase tracking-widest relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
						{t("dashboard.shortcuts.update")} <FiArrowRight className="w-3 h-3" />
					</span>
				</Link>
			</div>
		</div>
	);
};

export default QuickActionsWidget;
