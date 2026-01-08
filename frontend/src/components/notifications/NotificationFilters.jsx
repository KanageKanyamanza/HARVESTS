import React from "react";
import { Filter, Search, X } from "lucide-react";

const NotificationFilters = ({
	filter,
	setFilter,
	searchTerm,
	setSearchTerm,
	unreadCount,
}) => {
	return (
		<div className="bg-white/50 backdrop-blur-sm rounded-xl p-1.5 border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-inner">
			{/* Filtres */}
			<div className="flex bg-gray-100/50 p-1 rounded-lg gap-1 overflow-x-auto no-scrollbar">
				{[
					{ id: "all", label: "Toutes" },
					{ id: "unread", label: "Non lues", count: unreadCount },
					{ id: "read", label: "Lues" },
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setFilter(tab.id)}
						className={`
                        relative px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap z-0
                        ${
													filter === tab.id
														? "text-emerald-700 shadow-sm"
														: "text-gray-500 hover:text-gray-700"
												}
                    `}
					>
						{filter === tab.id && (
							<div className="absolute inset-0 bg-white rounded-md shadow-sm z-[-1] animate-scale-in"></div>
						)}
						<span className="relative z-10 flex items-center gap-1.5">
							{tab.label}
							{tab.count > 0 && (
								<span
									className={`px-1 py-0.5 rounded text-[8px] ${
										filter === tab.id
											? "bg-emerald-100 text-emerald-800"
											: "bg-gray-200 text-gray-600"
									}`}
								>
									{tab.count}
								</span>
							)}
						</span>
					</button>
				))}
			</div>

			{/* Recherche */}
			<div className="relative group w-full sm:w-auto sm:min-w-[250px]">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Search className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
				</div>
				<input
					type="text"
					placeholder="Rechercher..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="block w-full pl-9 pr-8 py-2 bg-white border border-gray-100 rounded-lg text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
				/>
				{searchTerm && (
					<button
						onClick={() => setSearchTerm("")}
						className="absolute inset-y-0 right-0 pr-2 flex items-center"
					>
						<div className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
							<X className="h-3 w-3" />
						</div>
					</button>
				)}
			</div>
		</div>
	);
};

export default NotificationFilters;
