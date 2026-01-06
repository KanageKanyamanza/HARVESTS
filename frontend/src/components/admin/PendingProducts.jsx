import React from "react";
import { Link } from "react-router-dom";
import { Package, Clock, User, MapPin } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";

const PendingProducts = ({ products = [] }) => {
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	if (products.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-10 text-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<Package className="w-8 h-8 text-gray-400" />
				</div>
				<h3 className="text-lg font-medium text-gray-900">
					Aucun produit en attente
				</h3>
				<p className="text-gray-500 mt-1">
					Les nouveaux produits apparaîtront ici.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="p-4 border-b border-gray-200/50 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
						Produits en attente
					</h3>
					<p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-[0.2em]">
						Modération requise
					</p>
				</div>
				<Link
					to="/admin/products"
					className="text-[10px] font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl border border-blue-100 transition-all duration-300 uppercase tracking-widest"
				>
					Tout voir
				</Link>
			</div>

			<div className="p-4 space-y-4 flex-1 overflow-auto relative z-10">
				{products.map((product) => (
					<div
						key={product._id}
						className="group p-5 rounded-[2rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex items-start space-x-5">
							<div className="flex-shrink-0 relative">
								<CloudinaryImage
									src={product.images?.[0]?.url}
									alt={product.name?.fr || product.name}
									className="w-20 h-20 rounded-3xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
									fallback="/images/placeholder-product.svg"
								/>
								<div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white uppercase tracking-tighter">
									New
								</div>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between mb-3">
									<div>
										<h4 className="text-lg font-[1000] text-gray-900 truncate group-hover:text-blue-600 transition-colors tracking-tight">
											{product.name?.fr || product.name}
										</h4>
										<span className="inline-block px-2 py-0.5 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">
											{product.category}
										</span>
									</div>
									<div className="flex flex-col items-end">
										<span className="text-lg font-[1000] text-gray-900 tracking-tighter leading-none">
											{formatCurrency(product.price)}
										</span>
										<span className="text-[10px] font-bold text-gray-400 flex items-center mt-2 bg-gray-200/50 px-2 py-0.5 rounded-full">
											<Clock className="w-3 h-3 mr-1.5 opacity-60" />{" "}
											{formatDate(product.createdAt)}
										</span>
									</div>
								</div>

								<div className="mt-4 flex items-center justify-between bg-gray-200/50 group-hover:bg-white rounded-2xl p-3 border border-transparent group-hover:border-gray-100 transition-all duration-500">
									<div className="flex items-center space-x-2">
										<div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
											<User className="w-3.5 h-3.5" />
										</div>
										<span className="text-xs font-[1000] text-gray-700 tracking-tight">
											{product.producer?.firstName} {product.producer?.lastName}
										</span>
									</div>
									{product.producer?.farmName && (
										<div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-100">
											<MapPin className="w-3 h-3 text-green-500" />
											<span className="text-[10px] font-black text-gray-600 truncate max-w-[120px] uppercase tracking-tighter">
												{product.producer.farmName}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PendingProducts;
