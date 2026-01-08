import React from "react";
import { Eye, User } from "lucide-react";
import {
	formatPrice,
	formatDate,
	getStatusBadge,
	getPaymentStatusBadge,
	getPlanBadge,
} from "../../../utils/subscriptionHelpers";

const SubscriptionTable = ({ subscriptions, onViewDetails }) => {
	if (subscriptions.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
				<div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
					<User className="h-10 w-10 text-gray-200" />
				</div>
				<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
					Aucune souscription trouvée
				</h3>
				<p className="text-gray-500 mt-2">
					Ajustez vos filtres pour voir plus de résultats
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-100">
					<thead>
						<tr className="bg-gray-50/50">
							<th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Utilisateur
							</th>
							<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Plan & Période
							</th>
							<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Montant
							</th>
							<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Statuts
							</th>
							<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Dates
							</th>
							<th className="px-5 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{subscriptions.map((subscription) => {
							const isExpired = new Date(subscription.endDate) < new Date();
							const statusBadge = getStatusBadge(
								isExpired ? "expired" : subscription.status
							);
							const paymentBadge = getPaymentStatusBadge(
								subscription.paymentStatus
							);
							const planBadge = getPlanBadge(subscription.planId);
							const StatusIcon = statusBadge.Icon;

							return (
								<tr
									key={subscription._id}
									className="group hover:bg-slate-50/50 transition-colors duration-300"
								>
									<td className="px-5 py-3 whitespace-nowrap">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-white transition-colors overflow-hidden flex-shrink-0">
												<div className="text-xs font-black text-emerald-600">
													{subscription.user?.firstName?.charAt(0) || (
														<User className="h-4 w-4" />
													)}
												</div>
											</div>
											<div>
												<div className="text-xs font-black text-gray-900 leading-none mb-0.5 group-hover:text-emerald-600 transition-colors">
													{subscription.user?.firstName}{" "}
													{subscription.user?.lastName}
												</div>
												<div className="text-[9px] font-bold text-gray-400">
													{subscription.user?.email}
												</div>
											</div>
										</div>
									</td>
									<td className="px-3 py-3 whitespace-nowrap">
										<div className="flex flex-col gap-0.5">
											<span
												className={`inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${planBadge.color
													.replace("text-", "border border-")
													.replace("bg-", "bg-opacity-10 ")}`}
											>
												{planBadge.label}
											</span>
											<div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500">
												{subscription.billingPeriod === "monthly" ? (
													<>
														<span className="w-1.5 h-1.5 rounded-full bg-blue-400 font-black"></span>
														Mensuel
													</>
												) : (
													<>
														<span className="w-1.5 h-1.5 rounded-full bg-purple-400 font-black"></span>
														Annuel
													</>
												)}
											</div>
										</div>
									</td>
									<td className="px-3 py-3 whitespace-nowrap">
										<div className="text-sm font-black text-gray-900 tracking-tighter">
											{formatPrice(subscription.amount)}
											<span className="text-[9px] text-gray-400 font-bold ml-0.5 uppercase">
												{subscription.currency}
											</span>
										</div>
									</td>
									<td className="px-3 py-3 whitespace-nowrap">
										<div className="flex items-center gap-1.5">
											<span
												className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${statusBadge.color} bg-opacity-10`}
											>
												<StatusIcon className="w-2.5 h-2.5 mr-1" />
												{statusBadge.label}
											</span>
											<span
												className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
													paymentBadge.color.includes("green")
														? "text-green-600 bg-green-50 border-green-100"
														: "text-gray-600 bg-gray-50 border-gray-100"
												}`}
											>
												{paymentBadge.label}
											</span>
										</div>
									</td>
									<td className="px-3 py-3 whitespace-nowrap">
										<div className="flex flex-col gap-0.5">
											<div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 tracking-tight">
												<span className="text-gray-300">DU:</span>{" "}
												{formatDate(subscription.startDate)}
											</div>
											<div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 tracking-tight">
												<span className="text-gray-300">AU:</span>{" "}
												{formatDate(subscription.endDate)}
											</div>
										</div>
									</td>
									<td className="px-5 py-3 whitespace-nowrap text-right">
										<div className="flex items-center justify-end gap-1.5">
											<button
												onClick={() => onViewDetails(subscription)}
												className="p-1.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100"
												title="Voir détails"
											>
												<Eye className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default SubscriptionTable;
