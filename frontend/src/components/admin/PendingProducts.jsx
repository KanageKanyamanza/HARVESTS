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
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center">
				<div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
					<Package className="w-6 h-6 text-gray-400" />
				</div>
				<h3 className="text-base font-medium text-gray-900">
					Aucun produit en attente
				</h3>
				<p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
					Les nouveaux produits apparaîtront ici.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="p-4 border-b border-gray-200/50 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						Produits en attente
					</h3>
					<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
						Modération requise
					</p>
				</div>
				<Link
					to="/admin/products"
					className="text-[9px] font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-all duration-300 uppercase tracking-widest"
				>
					Tout voir
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto relative z-10">
				{products.map((product) => (
					<div
						key={product._id}
						className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex items-start space-x-3">
							<div className="flex-shrink-0 relative">
								<CloudinaryImage
									src={product.images?.[0]?.url}
									alt={product.name?.fr || product.name}
									className="w-12 h-12 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
									fallback="/images/placeholder-product.svg"
								/>
								<div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white uppercase tracking-tighter">
									New
								</div>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between mb-1">
									<div>
										<h4 className="text-sm font-[1000] text-gray-900 truncate group-hover:text-blue-600 transition-colors tracking-tight">
											{product.name?.fr || product.name}
										</h4>
										<span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
											{product.category}
										</span>
									</div>
									<div className="flex flex-col items-end">
										<span className="text-sm font-[1000] text-gray-900 tracking-tighter leading-none">
											{formatCurrency(product.price)}
										</span>
										<span className="text-[8px] font-bold text-gray-400 flex items-center mt-1 bg-gray-200/50 px-1.5 py-0.5 rounded-full">
											<Clock className="w-2 h-2 mr-1 opacity-60" />{" "}
											{formatDate(product.createdAt)}
										</span>
									</div>
								</div>

								<div className="mt-1 flex items-center justify-between bg-gray-200/50 group-hover:bg-white rounded-lg p-1.5 border border-transparent group-hover:border-gray-100 transition-all duration-500">
									<div className="flex items-center space-x-1.5">
										<div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
											<User className="w-2 h-2" />
										</div>
										<span className="text-[9px] font-[1000] text-gray-700 tracking-tight">
											{product.producer?.firstName} {product.producer?.lastName}
										</span>
									</div>
									{product.producer?.farmName && (
										<div className="flex items-center space-x-1.5 bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-gray-100">
											<MapPin className="w-2 h-2 text-green-500" />
											<span className="text-[8px] font-black text-gray-600 truncate max-w-[80px] uppercase tracking-tighter">
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
