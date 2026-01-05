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
					<div className="bg-yellow-100 p-2 rounded-xl shadow-lg shadow-yellow-200 border border-yellow-200">
						<Trophy className="w-5 h-5 text-yellow-600" />
					</div>
				);
			case 1:
				return (
					<div className="bg-gray-100 p-2 rounded-xl shadow-lg shadow-gray-200 border border-gray-200">
						<Trophy className="w-5 h-5 text-gray-600" />
					</div>
				);
			case 2:
				return (
					<div className="bg-orange-100 p-2 rounded-xl shadow-lg shadow-orange-200 border border-orange-200">
						<Trophy className="w-5 h-5 text-orange-600" />
					</div>
				);
			default:
				return (
					<div className="bg-gray-50 h-9 w-9 flex items-center justify-center rounded-xl border border-gray-100 italic font-black text-gray-400">
						{index + 1}
					</div>
				);
		}
	};

	if (producers.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-10 text-center">
				<div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
					<TrendingUp className="w-10 h-10 text-gray-300" />
				</div>
				<h3 className="text-xl font-black text-gray-900 tracking-tight">
					Aucune donnée
				</h3>
				<p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">
					Ventes insuffisantes
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
						Top Producteurs
					</h3>
					<p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">
						Performances de vente
					</p>
				</div>
				<Link
					to="/admin/producers"
					className="text-[10px] font-black text-amber-600 hover:text-white hover:bg-amber-600 bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-100 transition-all duration-300 uppercase tracking-widest"
				>
					Explorer
				</Link>
			</div>

			<div className="p-6 space-y-4 flex-1 overflow-auto relative z-10">
				{producers.map((producer, index) => (
					<div
						key={producer.producerId}
						className="group p-5 rounded-[2rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex items-center space-x-5">
							<div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
								{getRankIcon(index)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-3">
									<div>
										<h4 className="text-lg font-[1000] text-gray-900 group-hover:text-amber-600 transition-colors tracking-tight">
											{producer.producerName}
										</h4>
										{producer.farmName && (
											<div className="flex items-center space-x-1.5 mt-1">
												<MapPin className="w-3 h-3 text-green-500" />
												<span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
													{producer.farmName}
												</span>
											</div>
										)}
									</div>

									<div className="text-right">
										<p className="text-xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1">
											{formatCurrency(producer.totalSales)}
										</p>
										<div className="flex items-center justify-end space-x-1">
											<div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
												{producer.orderCount} commandes
											</p>
										</div>
									</div>
								</div>

								<div className="mt-4 flex items-center space-x-3">
									<div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
