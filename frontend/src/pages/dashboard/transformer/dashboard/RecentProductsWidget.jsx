import React from "react";
import { Link } from "react-router-dom";
import { Package, Tag, Clock, Edit, Eye } from "lucide-react";
import CloudinaryImage from "../../../../components/common/CloudinaryImage";

const RecentProductsWidget = ({ products = [] }) => {
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
		});
	};

	if (products.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center h-full flex flex-col items-center justify-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
					<Package className="w-8 h-8 text-gray-300" />
				</div>
				<h3 className="text-base font-black text-gray-900 tracking-tight">
					Aucun produit
				</h3>
				<Link
					to="/transformer/products/add"
					className="mt-3 text-[10px] font-black text-white bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl transition-all shadow-lg shadow-purple-200 uppercase tracking-widest"
				>
					Ajouter un produit
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						Mes Produits
					</h3>
					<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
						Derniers ajouts
					</p>
				</div>
				<Link
					to="/transformer/products"
					className="text-[9px] font-black text-purple-600 hover:text-white hover:bg-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 transition-all duration-300 uppercase tracking-widest"
				>
					Tout voir
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto relative z-10">
				{products.map((product, index) => (
					<div
						key={product._id || index}
						className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 bg-white/40"
					>
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0 relative">
								<CloudinaryImage
									src={product.images?.[0]?.url || product.images?.[0]}
									alt={product.name}
									className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500"
									fallback="/images/placeholder-product.svg"
								/>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between mb-1">
									<div>
										<h4 className="text-sm font-[1000] text-gray-900 group-hover:text-purple-600 transition-colors tracking-tight truncate max-w-[150px]">
											{product.name}
										</h4>
										<div className="flex items-center space-x-1.5 mt-0.5">
											<Tag className="w-2.5 h-2.5 text-blue-500" />
											<span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[100px]">
												{product.category || "Général"}
											</span>
										</div>
									</div>

									<div className="text-right">
										<p className="text-sm font-[1000] text-gray-900 tracking-tighter leading-none mb-0.5">
											{formatCurrency(product.price)}
										</p>
										<span className="text-[8px] font-bold text-gray-400 flex items-center justify-end">
											<Clock className="w-2 h-2 mr-1 opacity-60" />{" "}
											{formatDate(product.createdAt)}
										</span>
									</div>
								</div>

								{/* Quick Actions Overlay on Hover (optional) or just visible buttons */}
								<div className="mt-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<Link
										to={`/transformer/products/edit/${product._id}`}
										className="p-1 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
									>
										<Edit className="w-3 h-3" />
									</Link>
									<Link
										to={`/products/${product._id}`}
										className="p-1 bg-gray-100 hover:bg-purple-50 text-gray-500 hover:text-purple-600 rounded-lg transition-colors"
									>
										<Eye className="w-3 h-3" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				))}

				{/* Add Button if list is small */}
				{products.length < 5 && (
					<Link
						to="/transformer/products/add"
						className="flex items-center justify-center p-3 rounded-[1rem] border border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 text-gray-400 hover:text-purple-600 transition-all duration-300 group cursor-pointer"
					>
						<span className="text-[10px] font-black uppercase tracking-widest">
							+ Ajouter un produit
						</span>
					</Link>
				)}
			</div>
		</div>
	);
};

export default RecentProductsWidget;
