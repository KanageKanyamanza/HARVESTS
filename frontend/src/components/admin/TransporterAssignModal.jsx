import React from "react";
import { X, Truck, Loader, User, ChevronRight } from "lucide-react";

const TransporterAssignModal = ({
	show,
	order,
	transporters,
	loading,
	assigning,
	onAssign,
	onClose,
}) => {
	if (!show) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
			<div
				className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl"
				onClick={onClose}
			></div>

			<div className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in">
				{/* Modal Header */}
				<div className="p-10 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
								<Truck className="h-5 w-5" />
							</div>
							<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter uppercase line-clamp-1">
								Assigner Transporteur
							</h3>
						</div>
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Sélectionnez un prestataire logistique pour la livraison
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-4 bg-white text-gray-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm border border-gray-100 hover:border-rose-100 hover:bg-rose-50"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				<div className="p-10">
					{order && (
						<div className="mb-10 bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-700"></div>
							<div className="relative z-10">
								<p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
									Détails de livraison
								</p>
								<p className="text-xl font-[1000] tracking-tight mb-2">
									Commande #
									{order.orderNumber || order._id.slice(-8).toUpperCase()}
								</p>
								<div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
									<div className="w-2 h-2 rounded-full bg-green-500"></div>
									{order.delivery?.deliveryAddress?.city},{" "}
									{order.delivery?.deliveryAddress?.region}
								</div>
							</div>
						</div>
					)}

					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
							<Loader className="h-10 w-10 text-amber-500 animate-spin mb-4" />
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Recherche de transporteurs...
							</p>
						</div>
					) : transporters.length === 0 ? (
						<div className="text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
							<div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
								<AlertCircle className="h-8 w-8 text-rose-300" />
							</div>
							<p className="text-lg font-[1000] text-gray-900 tracking-tight">
								Aucun transporteur disponible
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Vérifiez la zone de livraison ou réessayez plus tard
							</p>
						</div>
					) : (
						<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
							{transporters.map((transporter) => (
								<button
									key={transporter._id}
									onClick={() => onAssign(transporter._id)}
									disabled={assigning}
									className="group w-full p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-amber-500/30 hover:bg-amber-50/30 hover:shadow-xl hover:shadow-amber-100/20 transition-all duration-300 flex items-center justify-between disabled:opacity-50"
								>
									<div className="flex items-center gap-5">
										<div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-white transition-colors">
											<User className="h-7 w-7" />
										</div>
										<div className="text-left">
											<p className="text-base font-[1000] text-gray-900 tracking-tight leading-none mb-1">
												{transporter.companyName ||
													`${transporter.firstName} ${transporter.lastName}`}
											</p>
											<div className="flex items-center gap-2">
												<span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md">
													{transporter.fleet?.length || 0} véhicule(s)
												</span>
												<span className="text-[10px] font-bold text-gray-400">
													Disponible maintenant
												</span>
											</div>
										</div>
									</div>
									<div className="p-3 bg-gray-50 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
										{assigning ? (
											<Loader className="h-4 w-4 animate-spin" />
										) : (
											<ChevronRight className="h-5 w-5" />
										)}
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransporterAssignModal;
