import React from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Package, Tag } from "lucide-react";

const TopProducts = ({ products = [] }) => {
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

	if (products.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
					<Package className="w-8 h-8 text-gray-300" />
				</div>
				<h3 className="text-base font-black text-gray-900 tracking-tight">
					Aucun produit
				</h3>
				<p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
					Ajoutez des produits
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						Produits Performants
					</h3>
					<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
						Best Sellers
					</p>
				</div>
				<Link
					to="/producer/products"
					className="text-[9px] font-black text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all duration-300 uppercase tracking-widest"
				>
					Catalogue
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto relative z-10">
				{products.map((product, index) => (
					<div
						key={product._id || index}
						className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
								{getRankIcon(index)}
							</div>

							{/* Image Placeholder or Actual Image if available */}
							<div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
								{product.images && product.images[0] ?
									<img
										src={product.images[0]}
										alt={product.name}
										className="h-full w-full object-cover"
									/>
								:	<Package className="h-full w-full p-2 text-gray-400" />}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<div>
										<h4 className="text-sm font-[1000] text-gray-900 group-hover:text-emerald-600 transition-colors tracking-tight truncate max-w-[120px]">
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
										<p className="text-base font-[1000] text-gray-900 tracking-tighter leading-none mb-0.5">
											{formatCurrency(product.price)}
										</p>
										<div className="flex items-center justify-end space-x-1">
											{/* Simulated sales count if not present */}
											<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
												{product.sales || 0} ventes
											</p>
										</div>
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

export default TopProducts;
