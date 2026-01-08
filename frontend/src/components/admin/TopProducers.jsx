import React from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, ShoppingCart, MapPin, User } from "lucide-react";

const TopProducers = ({ producers = [] }) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getRankIcon = (index) => {
		switch (index) {
			case 0:
				return (
					<div className="bg-yellow-100 p-1.5 rounded-lg shadow-lg shadow-yellow-200 border border-yellow-200">
						<Trophy className="w-4 h-4 text-yellow-600" />
					</div>
				);
			case 1:
				return (
					<div className="bg-gray-100 p-1.5 rounded-lg shadow-lg shadow-gray-200 border border-gray-200">
						<Trophy className="w-4 h-4 text-gray-600" />
					</div>
				);
			case 2:
				return (
					<div className="bg-orange-100 p-1.5 rounded-lg shadow-lg shadow-orange-200 border border-orange-200">
						<Trophy className="w-4 h-4 text-orange-600" />
					</div>
				);
			default:
				return (
					<div className="bg-gray-50 h-7 w-7 flex items-center justify-center rounded-lg border border-gray-100 italic font-black text-[10px] text-gray-400">
						{index + 1}
					</div>
				);
		}
	};

	if (producers.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
					<TrendingUp className="w-8 h-8 text-gray-300" />
				</div>
				<h3 className="text-base font-black text-gray-900 tracking-tight">
					Aucune donnée
				</h3>
				<p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
					Ventes insuffisantes
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						Top Producteurs
					</h3>
					<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
						Performances
					</p>
				</div>
				<Link
					to="/admin/producers"
					className="text-[9px] font-black text-amber-600 hover:text-white hover:bg-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 transition-all duration-300 uppercase tracking-widest"
				>
					Explorer
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto relative z-10">
				{producers.map((producer, index) => (
					<div
						key={producer.producerId}
						className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
								{getRankIcon(index)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<div>
										<h4 className="text-sm font-[1000] text-gray-900 group-hover:text-amber-600 transition-colors tracking-tight">
											{producer.producerName}
										</h4>
										{producer.farmName && (
											<div className="flex items-center space-x-1.5 mt-0.5">
												<MapPin className="w-2.5 h-2.5 text-green-500" />
												<span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
													{producer.farmName}
												</span>
											</div>
										)}
									</div>

									<div className="text-right">
										<p className="text-base font-[1000] text-gray-900 tracking-tighter leading-none mb-0.5">
											{formatCurrency(producer.totalSales)}
										</p>
										<div className="flex items-center justify-end space-x-1">
											<div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
											<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
												{producer.orderCount} cmds
											</p>
										</div>
									</div>
								</div>

								<div className="mt-1 flex items-center space-x-3">
									<div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
										<div
											className={`h-full ${
												index === 0
													? "bg-yellow-400"
													: index === 1
													? "bg-gray-400"
													: "bg-orange-400"
											} rounded-full transition-all duration-1000 ease-out`}
											style={{ width: `${Math.max(20, 100 - index * 20)}%` }}
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default TopProducers;
