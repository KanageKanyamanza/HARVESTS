import React from "react";
import { useCart } from "../../../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiShoppingCart,
	FiPlus,
	FiMinus,
	FiTrash2,
	FiArrowLeft,
	FiPackage,
	FiArrowRight,
	FiCreditCard,
	FiInfo,
} from "react-icons/fi";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import { formatPrice } from "../../../utils/currencyUtils";
import { toPlainText } from "../../../utils/textHelpers";

const Cart = () => {
	const { t } = useTranslation("dashboard-consumer");
	const {
		items,
		totalItems,
		totalPrice,
		updateQuantity,
		removeFromCart,
		clearCart,
	} = useCart();
	const navigate = useNavigate();

	const formatCurrency = (val) => formatPrice(val || 0, "XOF");

	const content = (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-blue-600 rounded-full"></div>
							<span>{t("cart.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("cart.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
								{t("cart.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							{t("cart.subtitle")} {t("cart.itemCount", { count: totalItems })}
						</p>
					</div>

					{items.length > 0 && (
						<button
							onClick={clearCart}
							className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] hover:text-rose-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100"
						>
							<FiTrash2 className="w-3 h-3" />
							{t("cart.clear")}
						</button>
					)}
				</div>

				{items.length === 0 ?
					<div className="animate-fade-in-up delay-100">
						<div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-white/60 text-center shadow-lg">
							<div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-inner">
								<FiShoppingCart className="w-10 h-10" />
							</div>
							<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight mb-2">
								{t("cart.emptyTitle")}
							</h3>
							<p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
								{t("cart.emptyText")}
							</p>
							<Link
								to="/products"
								className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
							>
								{t("cart.discover")}
							</Link>
						</div>
					</div>
				:	<div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in-up delay-100">
						{/* Cart Items List */}
						<div className="lg:col-span-2 space-y-4">
							{items.map((item) => (
								<div
									key={item.productId}
									className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row items-center gap-6"
								>
									{/* Item Image */}
									<div className="w-24 h-24 rounded-3xl bg-gray-50 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
										<CloudinaryImage
											src={item.image}
											alt={toPlainText(item.name, "")}
											className="w-full h-full object-cover"
											width={100}
											height={100}
										/>
									</div>

									{/* Item Details */}
									<div className="flex-1 min-w-0">
										<h4 className="text-base font-[1000] text-gray-900 leading-tight mb-1 truncate">
											{toPlainText(item.name, "")}
										</h4>
										<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
											{t("cart.by", {
												name: item.producer?.name || item.producerName || t("cart.partner"),
											})}
										</p>
										<div className="flex items-center gap-3">
											<span className="text-lg font-[1000] text-blue-600 tracking-tighter">
												{formatCurrency(item.price)}
											</span>
											<span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
												{t("cart.perUnit")}
											</span>
										</div>
									</div>

									{/* Item Actions */}
									<div className="flex items-center gap-6">
										<div className="flex items-center bg-gray-50/50 rounded-2xl border border-gray-100/50 p-1">
											<button
												onClick={() =>
													updateQuantity(
														item.productId,
														item.quantity - 1,
														item.originType,
													)
												}
												title={t("cart.decrease")}
												aria-label={t("cart.decrease")}
												className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 transition-all shadow-sm"
											>
												<FiMinus className="w-3 h-3" />
											</button>
											<span className="px-4 text-xs font-[1000] text-gray-900 min-w-[3rem] text-center">
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(
														item.productId,
														item.quantity + 1,
														item.originType,
													)
												}
												title={t("cart.increase")}
												aria-label={t("cart.increase")}
												className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:text-blue-600 transition-all shadow-sm"
											>
												<FiPlus className="w-3 h-3" />
											</button>
										</div>

										<button
											onClick={() =>
												removeFromCart(item.productId, item.originType)
											}
											title={t("cart.remove")}
											aria-label={t("cart.remove")}
											className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
										>
											<FiTrash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-2xl shadow-blue-200/20 sticky top-24">
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight mb-8 flex items-center gap-3">
									{t("cart.summary")}
								</h3>

								<div className="space-y-4 mb-10">
									<div className="flex items-center justify-between">
										<span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
											{t("cart.subtotal")}
										</span>
										<span className="text-sm font-bold text-gray-900">
											{formatCurrency(totalPrice)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
											{t("cart.delivery")}
										</span>
										<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
											{t("cart.deliveryToCourier")}
										</span>
									</div>
									<div className="pt-4 border-t border-gray-100 flex items-center justify-between">
										<span className="text-sm font-[1000] text-gray-900 uppercase tracking-tighter">
											{t("cart.total")}
										</span>
										<span className="text-2xl font-[1000] text-blue-600 tracking-tighter">
											{formatCurrency(totalPrice)}
										</span>
									</div>
								</div>

								<div className="space-y-3">
									<button
										onClick={() => navigate("/consumer/checkout")}
										className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
									>
										{t("cart.checkout")}
										<FiArrowRight className="w-4 h-4" />
									</button>
									<Link
										to="/products"
										className="w-full py-4 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
									>
										{t("cart.continue")}
									</Link>
								</div>

								<div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
									<FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0" />
									<p className="text-[9px] font-bold text-blue-700/80 leading-relaxed uppercase tracking-widest">
										{t("cart.deliveryNote")}
									</p>
								</div>
							</div>
						</div>
					</div>
				}
			</div>
		</div>
	);

	return content;
};

export default Cart;
