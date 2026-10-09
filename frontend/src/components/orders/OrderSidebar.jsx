import React from "react";
import { useTranslation } from "react-i18next";
import i18n, { formatDateTime } from "../../utils/i18n";
import {
	User,
	Phone,
	MapPin,
	Truck,
	Calendar,
	Mail,
	ArrowRight,
	Navigation,
} from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";

import { useCurrency } from "../../contexts/CurrencyContext";
import { convertPrice, formatPrice } from "../../utils/currencyUtils";

const formatDate = (dateString) =>
	formatDateTime(dateString, i18n.language, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

// Note: On passera dorénavant l'ordre pour avoir sa devise source
const useOrderCurrency = (order) => {
	const { currency: userCurrency } = useCurrency();

	const formatAmount = (amount) => {
		const converted = convertPrice(
			amount,
			order?.currency || "XOF",
			userCurrency
		);
		return formatPrice(converted, userCurrency);
	};

	return { formatAmount, userCurrency };
};

export const DeliveryAddressCard = ({ order, user }) => {
	const { t } = useTranslation("common");
	const isProducerView =
		user?.userType === "producer" || user?.userType === "transformer";
	const isAdmin = user?.role === "admin" || user?.userType === "admin";
	const showUserInfo = isProducerView || isAdmin;

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
			<h3 className="text-xl font-[1000] text-gray-900 mb-8 uppercase tracking-tight">
				{showUserInfo ? t("orderDetail.customerInfo") : t("orderDetail.deliveryAddress")}
			</h3>

			<div className="space-y-6">
				{showUserInfo && (
					<div className="flex items-center gap-6 p-3 bg-gray-50/50 rounded-3xl border border-gray-100/50">
						<div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-1 flex-shrink-0">
							{order.buyer?.avatar ? (
								<CloudinaryImage
									src={order.buyer.avatar}
									className="w-full h-full object-cover rounded-xl"
								/>
							) : (
								<div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl">
									<User className="h-10 w-10 text-gray-300" />
								</div>
							)}
						</div>
						<div className="min-w-0">
							<p className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-1 truncate">
								{order.buyer?.firstName} {order.buyer?.lastName}
							</p>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
								{t("orderDetail.harvestsCustomer")}
							</p>
							<div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-500 bg-white/50 w-fit px-3 py-1 rounded-full border border-gray-100">
								<Mail className="h-3 w-3" />
								{order.buyer?.email}
							</div>
						</div>
					</div>
				)}

				<div className="space-y-6">
					{!showUserInfo && order.delivery?.deliveryAddress && (
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 flex-shrink-0">
								<User className="h-5 w-5" />
							</div>
							<div>
								<p className="text-sm font-black text-gray-900 tracking-tight">
									{order.delivery.deliveryAddress.firstName}{" "}
									{order.delivery.deliveryAddress.lastName}
								</p>
								{order.delivery.deliveryAddress.label && (
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
										{order.delivery.deliveryAddress.label}
									</p>
								)}
							</div>
						</div>
					)}

					{(order.buyer?.phone || order.delivery?.deliveryAddress?.phone) && (
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 flex-shrink-0">
								<Phone className="h-5 w-5" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
									{t("orderDetail.phone")}
								</p>
								<p className="text-sm font-black text-gray-900 tracking-tight">
									{order.buyer?.phone || order.delivery.deliveryAddress.phone}
								</p>
							</div>
						</div>
					)}

					{order.delivery?.deliveryAddress ? (
						<div className="flex items-start gap-4">
							<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 flex-shrink-0">
								<MapPin className="h-5 w-5" />
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
									{t("orderDetail.address")}
								</p>
								<AddressDisplay address={order.delivery.deliveryAddress} />
							</div>
						</div>
					) : (
						!showUserInfo && (
							<p className="text-sm text-gray-500 italic font-medium">
								{t("orderDetail.addressUnavailable")}
							</p>
						)
					)}

					{order.delivery?.deliveryAddress?.deliveryInstructions && (
						<div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
							<Navigation className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
							<p className="text-xs text-amber-900 font-bold leading-relaxed">
								<span className="text-[10px] font-black uppercase tracking-widest block mb-1">
									{t("orderDetail.deliveryInstructions")}
								</span>
								{order.delivery.deliveryAddress.deliveryInstructions}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const AddressDisplay = ({ address }) => (
	<div className="text-sm font-black text-gray-900 tracking-tight leading-relaxed">
		<p>{address.street}</p>
		<p>
			{address.city}, {address.region}
		</p>
		<p className="text-gray-400 font-bold mt-1">
			{address.country} {address.postalCode}
		</p>
	</div>
);

export const OrderSummaryCard = ({
	order,
	isSellerView,
}) => {
	const { t } = useTranslation("common");
	const { formatAmount } = useOrderCurrency(order);

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
			<h3 className="text-xl font-[1000] text-gray-900 mb-8 uppercase tracking-tight">
				{t("orderDetail.financialSummary")}
			</h3>
			<div className="space-y-6">
				<div className="flex justify-between items-center px-2">
					<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
						{t("orderDetail.subtotal")}
					</span>
					<span className="text-base font-black text-gray-900 tracking-tighter">
						{formatAmount(
							isSellerView
								? order.segment?.subtotal ?? order.subtotal ?? 0
								: order.subtotal ??
										order.originalTotals?.subtotal ??
										order.total + (order.couponDiscount || 0)
						)}
					</span>
				</div>



				{(order.couponDiscount > 0 ||
					(isSellerView && order.segment?.discount > 0)) && (
					<div className="flex justify-between items-center px-2 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
						<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
							{t("orderDetail.couponDiscount")}
						</span>
						<span className="text-base font-black text-emerald-600 tracking-tighter">
							-
							{formatAmount(
								isSellerView
									? order.segment?.discount ?? 0
									: order.couponDiscount ?? 0
							)}
						</span>
					</div>
				)}

				<div className="pt-6 border-t border-gray-100">
					<div className="flex justify-between items-center px-2">
						<span className="text-lg font-[1000] text-gray-900 uppercase tracking-tighter">
							{t("orderDetail.total")}
						</span>
						<div className="text-right">
							<span className="text-3xl font-[1000] text-green-600 tracking-tighter block mb-1">
								{formatAmount(
									isSellerView
										? order.segment?.total ??
												order.segment?.subtotal ??
												order.subtotal ??
												0
										: order.total ||
												(order.subtotal ?? 0) -
													(order.couponDiscount ?? 0)
								)}
							</span>
							<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
								{t("orderDetail.taxesIncluded")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const DeliveryInfoCard = ({ order }) => {
	const { t } = useTranslation("common");
	return (
	<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
		<h3 className="text-xl font-[1000] text-gray-900 mb-8 uppercase tracking-tight">
			{t("orderDetail.deliveryMethodTitle")}
		</h3>
		<div className="space-y-8">
			<div className="flex items-center gap-6">
				<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm transition-transform hover:rotate-12 transition-all">
					<Truck className="h-8 w-8" />
				</div>
				<div>
					<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
						{t("orderDetail.shippingMode")}
					</p>
					<p className="text-lg font-[1000] text-gray-900 tracking-tight leading-none">
						{t(`orderDetail.deliveryMethods.${order.delivery?.method || "standard-delivery"}`, {
							defaultValue: order.delivery?.method,
						})}
					</p>
				</div>
			</div>

			<div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
						{t("orderDetail.currentStatus")}
					</span>
					<span className="px-3 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 text-gray-600 shadow-sm">
						{order.delivery?.status ?
							t(`orderDetail.deliveryStatuses.${order.delivery.status}`, {
								defaultValue: order.delivery.status,
							})
						:	t("orderDetail.unknown")}
					</span>
				</div>
				{order.delivery?.estimatedDeliveryDate && (
					<div className="flex justify-between items-center pt-4 border-t border-gray-100/50">
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							{t("orderDetail.estimate")}
						</span>
						<span className="text-xs font-black text-gray-900 tracking-tight">
							{formatDate(order.delivery.estimatedDeliveryDate)}
						</span>
					</div>
				)}
			</div>
		</div>
	</div>
	);
};

export const TransporterCard = ({ order }) => {
	const { t } = useTranslation("common");
	if (!order.delivery?.transporter) return null;

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] mt-10">
			<h3 className="text-xl font-[1000] text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-4">
				<div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
					<Truck className="h-5 w-5" />
				</div>
				{t("orderDetail.logisticsPartner")}
			</h3>

			<div className="space-y-8">
				<div className="flex items-center gap-6 p-6 bg-gray-900 rounded-[2rem] text-white overflow-hidden relative group">
					<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all duration-700"></div>

					<div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white/50 border border-white/10 backdrop-blur-md flex-shrink-0">
						<Truck className="h-8 w-8" />
					</div>
					<div className="relative z-10 flex-1 min-w-0">
						<p className="text-lg font-[1000] tracking-tight leading-none mb-2 truncate">
							{order.delivery.transporter?.companyName ||
								`${order.delivery.transporter?.firstName || ""} ${
									order.delivery.transporter?.lastName || ""
								}`.trim() ||
								t("orderDetail.courier")}
						</p>
						{order.delivery.transporter?.userType && (
							<span
								className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
									order.delivery.transporter.userType === "exporter"
										? "bg-purple-500/10 text-purple-400 border-purple-500/20"
										: "bg-blue-500/10 text-blue-400 border-blue-500/20"
								}`}
							>
								{t(`userTypes.${order.delivery.transporter.userType}`, {
									defaultValue: order.delivery.transporter.userType,
								})}
							</span>
						)}
					</div>
					<ArrowRight className="h-6 w-6 text-white/10 group-hover:text-green-500 transition-all transform group-hover:translate-x-2" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{order.delivery.transporter?.email && (
						<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
							<Mail className="h-4 w-4 text-gray-400" />
							<p className="text-sm font-black text-gray-900 tracking-tight truncate">
								{order.delivery.transporter.email}
							</p>
						</div>
					)}
					{order.delivery.transporter?.phone && (
						<div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
							<Phone className="h-4 w-4 text-gray-400" />
							<p className="text-sm font-black text-gray-900 tracking-tight">
								{order.delivery.transporter.phone}
							</p>
						</div>
					)}
				</div>

				{order.delivery?.timeline?.length > 0 && (
					<div className="pt-8 border-t border-gray-100">
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
							{t("orderDetail.transitHistory")}
						</p>
						<div className="space-y-8 pl-4 border-l-2 border-gray-100 ml-4">
							{order.delivery.timeline.map((event, idx) => (
								<div key={idx} className="relative">
									<div className="absolute -left-[2.1rem] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-4 border-amber-500 shadow-sm"></div>
									<div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 relative hover:bg-white transition-all duration-300">
										<p className="text-sm font-[1000] text-gray-900 tracking-tight uppercase leading-none mb-1">
											{t(`orderDetail.deliveryStatuses.${event.status}`, {
												defaultValue: event.status,
											})}
										</p>
										<div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
											<Calendar className="h-3 w-3" />
											{formatDate(event.timestamp)}
											{event.location && (
												<span className="flex items-center gap-1 text-amber-600">
													<MapPin className="h-3 w-3" />
													{event.location}
												</span>
											)}
										</div>
										{event.note && (
											<p className="mt-3 text-xs text-gray-500 font-medium italic bg-white p-3 rounded-xl border border-gray-100/50">
												"{event.note}"
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
