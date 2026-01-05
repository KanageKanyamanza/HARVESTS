import React from "react";
import { Package, CheckCircle, Info, Tag } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import { parseProductName } from "../../utils/productUtils";
import { DEFAULT_CURRENCY } from "../../config/currencies";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../contexts/CurrencyContext";
import { convertPrice, formatPrice } from "../../utils/currencyUtils";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { getItemStatusConfig } from "./OrderStatusBadge";

const getImageUrl = (productImages, productName) => {
	if (!productImages?.length) return { url: null, alt: null };

	const firstImg = productImages[0];

	if (typeof firstImg === "string") {
		if (firstImg.startsWith("http") || firstImg.startsWith("//")) {
			return { url: firstImg, alt: parseProductName(productName) };
		}
		try {
			const parsed = JSON.parse(firstImg);
			if (parsed?.url)
				return {
					url: parsed.url,
					alt: parsed.alt || parseProductName(productName),
				};
		} catch {
			const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
			if (urlMatch?.[1])
				return { url: urlMatch[1], alt: parseProductName(productName) };
		}
	} else if (typeof firstImg === "object") {
		if (firstImg.url)
			return {
				url: firstImg.url,
				alt: firstImg.alt || parseProductName(productName),
			};
		if (firstImg.secure_url)
			return {
				url: firstImg.secure_url,
				alt: firstImg.alt || parseProductName(productName),
			};
		if (firstImg.public_id)
			return {
				url: `https://res.cloudinary.com/harvests/image/upload/${firstImg.public_id}`,
				alt: firstImg.alt || parseProductName(productName),
			};
	}

	return { url: null, alt: null };
};

const OrderItemsList = ({
	order,
	isSellerView,
	updateOrderStatus,
	updating,
}) => {
	const items = isSellerView
		? order.segment?.items || order.items || []
		: order.items || [];
	const currentSegmentStatus = order.segment?.status || order.status;
	const { currency: globalCurrency } = useCurrency();

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
			<div className="flex items-center justify-between mb-8">
				<h3 className="text-xl font-[1000] text-gray-900 uppercase tracking-tight">
					Articles commandés
				</h3>
				<div className="px-5 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
					<Tag className="h-3 w-3 text-green-400" />
					{items.length} Référence(s)
				</div>
			</div>

			<div className="space-y-6">
				{items.map((item, index) => {
					const productData =
						item.product ||
						item.productSnapshot ||
						item.dish ||
						item.dishSnapshot ||
						{};
					const productSnapshot =
						item.productSnapshot || item.dishSnapshot || {};

					const productName =
						productData.name ||
						productSnapshot.name ||
						item.name ||
						"Produit inconnu";

					const productImages =
						(productData.images?.length ? productData.images : null) ||
						(productSnapshot.images?.length ? productSnapshot.images : null) ||
						(item.images?.length ? item.images : null) ||
						(productData.image ? [productData.image] : null) ||
						(item.image ? [item.image] : null) ||
						(productData.primaryImage ? [productData.primaryImage] : null) ||
						[];

					const { url: imageUrl, alt: imageAlt } = getImageUrl(
						productImages,
						productName
					);

					const productPrice =
						productSnapshot.price ||
						item.price ||
						item.unitPrice ||
						item.priceAtOrder ||
						0;
					const productUnit =
						productSnapshot.unit ||
						item.unit ||
						(item.originType === "dish" || !!item.dish || !!item.dishSnapshot
							? "portion"
							: "unité");
					const quantity = item.quantity || 1;
					const totalPrice = item.totalPrice || productPrice * quantity;
					const itemCurrency =
						productSnapshot.currency ||
						item.currency ||
						productData.currency ||
						DEFAULT_CURRENCY;

					const displayedPrice = convertPrice(
						productPrice,
						itemCurrency,
						globalCurrency
					);
					const displayedTotalPrice = convertPrice(
						totalPrice,
						itemCurrency,
						globalCurrency
					);

					const orderStatus = order.status || currentSegmentStatus || "pending";
					const itemStatus =
						orderStatus === "completed" || orderStatus === "delivered"
							? orderStatus
							: item.status || "pending";
					const itemStatusConfig = getItemStatusConfig(itemStatus);
					const itemId = item._id || item.id || `${order._id}-${index}`;
					const canConfirmItem =
						isSellerView &&
						currentSegmentStatus === "pending" &&
						itemStatus === "pending" &&
						item._id;

					return (
						<div
							key={itemId}
							className="group relative p-6 bg-gray-50/40 rounded-[2rem] border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500"
						>
							<div className="flex flex-col md:flex-row gap-8">
								{/* Image Container */}
								<div className="relative w-full md:w-32 h-32 flex-shrink-0">
									<div className="absolute inset-0 bg-white rounded-3xl shadow-inner border border-gray-100 overflow-hidden">
										{imageUrl ? (
											<CloudinaryImage
												src={imageUrl}
												alt={imageAlt || parseProductName(productName)}
												className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
												fallback={
													<div className="h-full w-full flex items-center justify-center bg-gray-50">
														<Package className="h-10 w-10 text-gray-200" />
													</div>
												}
											/>
										) : (
											<div className="h-full w-full flex items-center justify-center bg-gray-50">
												<Package className="h-10 w-10 text-gray-200" />
											</div>
										)}
									</div>
									<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs font-[1000] shadow-lg">
										x{quantity}
									</div>
								</div>

								{/* Info Content */}
								<div className="flex-1 min-w-0">
									<div className="flex flex-wrap items-start justify-between gap-4 mb-4">
										<div>
											<h4 className="text-xl font-[1000] text-gray-900 tracking-tight mb-1 truncate">
												{parseProductName(productName)}
											</h4>
											<div className="flex items-center gap-3 text-xs font-bold text-gray-400">
												<span className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-gray-100 text-gray-500">
													<Info className="h-3 w-3" />
													{productUnit}
												</span>
												<span>
													PU: {formatPrice(displayedPrice, globalCurrency)}
												</span>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
												Sous-total
											</p>
											<p className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-none">
												{formatPrice(displayedTotalPrice, globalCurrency)}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between mt-auto">
										<span
											className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-sm ${itemStatusConfig.color}`}
										>
											{itemStatusConfig.text}
										</span>

										{canConfirmItem && (
											<button
												onClick={() =>
													updateOrderStatus("confirmed", { itemId: item._id })
												}
												disabled={updating}
												className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
											>
												<CheckCircle className="h-4 w-4" />
												{updating ? "Validation..." : "Confirmer"}
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default OrderItemsList;
