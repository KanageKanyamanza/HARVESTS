import React from "react";
import { User, Mail, Lock } from "lucide-react";

const tabs = [
	{ id: "profile", label: "Profil", icon: User },
	{ id: "notifications", label: "Notifications", icon: Mail },
	{ id: "password", label: "Mot de passe", icon: Lock },
];

const SettingsTabs = ({ activeTab, onTabChange }) => {
	return (
		<nav className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 shadow-sm border border-white/60 sticky top-4">
			<div className="space-y-1">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`w-full flex items-center px-4 py-2 rounded-lg transition-all duration-300 group ${
								isActive
									? "bg-emerald-600 text-white shadow-md transform scale-[1.02]"
									: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							<div
								className={`p-1.5 rounded-md mr-3 transition-colors ${
									isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-white"
								}`}
							>
								<Icon
									className={`h-4 w-4 ${
										isActive
											? "text-white"
											: "text-gray-400 group-hover:text-emerald-500"
									}`}
								/>
							</div>
							<span
								className={`text-[11px] font-black uppercase tracking-widest ${
									isActive
										? "text-white"
										: "text-gray-600 group-hover:text-gray-900"
								}`}
							>
								{tab.label}
							</span>
							{isActive && (
								<div className="ml-auto">
									<div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
								</div>
							)}
						</button>
					);
				})}
			</div>
		</nav>
	);
};

export default SettingsTabs;
