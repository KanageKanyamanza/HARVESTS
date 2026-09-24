import React from "react";
import {
	FiStar,
	FiTruck,
	FiCheckCircle,
	FiPackage,
	FiMapPin,
} from "react-icons/fi";
import {
	getVendorAverageRating,
	formatAverageRating,
} from "../../utils/vendorRatings";
import { formatPriceOrQuote, getBaseContact } from "./baseConfig.jsx";
import {
	VendorFleetCard,
	VendorReviewsList,
	VendorHours,
	VendorEmptyState,
} from "../../components/common/vendor";
import CertificationsSection from "../../components/profile/specific/CertificationsSection";
import i18n from "../../utils/i18n";

const t = (key, opts) =>
	i18n.t(`vendorProfile.${key}`, {
		ns: "public",
		...(typeof opts === "string" ? { defaultValue: opts } : opts),
	});

const getTransportTypeLabel = (type) => t(`transporter.transportTypes.${type}`, type);
const getServiceLabel = (type) => t(`transporter.serviceLabels.${type}`, type);
const getVehicleTypeLabel = (type) => t(`transporter.vehicleTypes.${type}`, type);
const getConditionLabel = (cond) => t(`transporter.conditionLabels.${cond}`, cond);

export const transporterConfig = {
	vendorType: "transporter",
	getVendorName: (transporter) => transporter.companyName || `${transporter.firstName} ${transporter.lastName}`,
	getVendorSubtitle: (transporter) =>
		(transporter.transportType || [])
			.map((type) => getTransportTypeLabel(type))
			.join(", ") || t("transporter.genericLabel"),

	getVendorStats: (transporter, _items, reviews = []) => {
		const averageRating = getVendorAverageRating(transporter, reviews);
		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: t("statLabels.averageRating"),
			},
			{
				icon: <FiTruck className="w-5 h-5 text-blue-500" />,
				value: transporter.fleet?.length || 0,
				label: t("transporter.vehiclesLabel"),
			},
			{
				icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
				value: `${transporter.performanceStats?.onTimeDeliveryRate || 0}%`,
				label: t("transporter.punctualityLabel"),
			},
			{
				icon: <FiPackage className="w-5 h-5 text-purple-500" />,
				value: transporter.performanceStats?.totalDeliveries || 0,
				label: t("transporter.deliveriesLabel"),
			},
		];
	},

	getVendorContact: getBaseContact,
	getVendorTags: (transporter) => {
		const tags = [];
		if (transporter.serviceTypes?.length > 0) {
			tags.push({
				label: t("tabs.services"),
				items: transporter.serviceTypes.map((type) => getServiceLabel(type)),
			});
		}
		if (transporter.serviceAreas?.length > 0) {
			tags.push({
				label: t("transporter.coverageZonesLabel"),
				items: [...new Set(transporter.serviceAreas.map((a) => a.region))],
			});
		}
		return tags;
	},

	formatPrice: formatPriceOrQuote,
	getItemName: (v) =>
		getVehicleTypeLabel(v.vehicleType) || t("genericVehicle"),
	getItemDescription: (v) => {
		const capacity = [];
		if (v.capacity?.weight)
			capacity.push(`${v.capacity.weight.value} ${v.capacity.weight.unit}`);
		if (v.capacity?.volume)
			capacity.push(`${v.capacity.volume.value} ${v.capacity.volume.unit}`);
		return capacity.length > 0
			? t("transporter.capacityLabel", { capacity: capacity.join(", ") })
			: t("transporter.genericVehicleDescription");
	},
	getItemPrice: () => null,
	getItemImage: (v) =>
		v.image?.url ||
		v.image?.secure_url ||
		(typeof v.image === "string" ? v.image : null),
	getItemExtraInfo: (v) =>
		`${v.isAvailable ? t("available") : t("unavailable")} - ${getConditionLabel(v.condition)}`,
	get getItemButtonText() { return t("transporter.itemButton"); },
	getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
	getItemButtonColor: "bg-blue-600 hover:bg-blue-700",
	getEmptyStateIcon: (
		<FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
	),
	get getEmptyStateTitle() { return t("transporter.emptyFleetTitle"); },
	get getEmptyStateDescription() { return t("transporter.emptyFleetDescription"); },

	tabs: ["fleet", "services", "about", "certifications", "reviews", "hours"],
	getTabLabel: (tab) =>
		({
			fleet: t("tabs.fleet"),
			services: t("tabs.services"),
			about: t("tabs.about"),
			certifications: t("tabs.certifications"),
			reviews: t("tabs.reviews"),
			hours: t("tabs.hours"),
		}[tab] || tab),
	getTabCount: (tab, items, reviews, vendor) => {
		if (tab === "fleet") return items?.length || 0;
		if (tab === "reviews") return reviews?.length || 0;
		if (tab === "services")
			return (
				(vendor?.serviceAreas?.length || 0) +
				(vendor?.specialCapabilities ? 1 : 0)
			);
		if (tab === "about" || tab === "hours") return 1;
		if (tab === "certifications") return vendor?.certifications?.length || 0;
		return 0;
	},

	getTabContent: (tab, items, vendor, helpers, reviews = []) => {
		if (tab === "fleet") {
			if (!items || items.length === 0) {
				return (
					<VendorEmptyState
						icon={helpers.getEmptyStateIcon}
						title={helpers.getEmptyStateTitle}
						description={helpers.getEmptyStateDescription}
					/>
				);
			}
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((vehicle, idx) => (
						<VendorFleetCard
							key={vehicle._id || vehicle.registrationNumber || idx}
							vehicle={vehicle}
							helpers={helpers}
							onAction={() => alert(t("reservationComingSoon"))}
						/>
					))}
				</div>
			);
		}

		if (tab === "services") {
			return (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{vendor.serviceAreas?.length > 0 && (
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<FiMapPin className="w-5 h-5 mr-2 text-blue-500" />
								{t("transporter.coverageZonesLabel")}
							</h3>
							<div className="space-y-3">
								{vendor.serviceAreas.map((area, idx) => (
									<div
										key={idx}
										className="border-b border-gray-100 pb-3 last:border-b-0"
									>
										<p className="font-medium text-gray-900">{area.region}</p>
										{area.cities?.length > 0 && (
											<p className="text-sm text-gray-600 mt-1">
												{t("transporter.citiesLabel", { cities: area.cities.join(", ") })}
											</p>
										)}
										{area.deliveryRadius && (
											<p className="text-sm text-gray-500 mt-1">
												{t("transporter.radiusLabel", { radius: area.deliveryRadius })}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					)}
					{vendor.specialCapabilities && (
						<div className="bg-white border border-gray-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{t("transporter.servicesTitle")}
							</h3>
							<div className="space-y-2">
								{vendor.specialCapabilities.coldChain?.available && (
									<div className="flex items-center text-sm">
										<FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
										<span>{t("transporter.coldChain")}</span>
										{vendor.specialCapabilities.coldChain.temperatureRange && (
											<span className="text-gray-500 ml-2">
												(
												{
													vendor.specialCapabilities.coldChain.temperatureRange
														.min
												}
												°C -{" "}
												{
													vendor.specialCapabilities.coldChain.temperatureRange
														.max
												}
												°C)
											</span>
										)}
									</div>
								)}
								{vendor.specialCapabilities.oversizedCargo && (
									<div className="flex items-center text-sm">
										<FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
										<span>{t("transporter.oversizedCargo")}</span>
									</div>
								)}
								{vendor.specialCapabilities.crossBorder && (
									<div className="flex items-center text-sm">
										<FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
										<span>{t("transporter.crossBorder")}</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			);
		}

		if (tab === "about") {
			return (
				<div className="bg-white rounded-lg p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gray-50 p-4 rounded-xl">
							<p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
								{t("transporter.pricingModelLabel")}
							</p>
							<p className="font-bold text-gray-900 capitalize">
								{vendor.pricingModel || t("transporter.onDemand")}
							</p>
						</div>
					</div>

					<div>
						<h3 className="text-md font-bold text-gray-900 mb-3 uppercase tracking-wide">
							{t("transporter.transportTypesTitle")}
						</h3>
						<div className="flex flex-wrap gap-2">
							{(vendor.transportType || []).map((type, i) => (
								<span
									key={i}
									className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
								>
									{getTransportTypeLabel(type)}
								</span>
							))}
						</div>
					</div>
				</div>
			);
		}

		if (tab === "hours") {
			return (
				<VendorHours
					hours={vendor.operatingHours}
					openField="start"
					closeField="end"
					isOpenField="isAvailable"
				/>
			);
		}
		if (tab === "certifications") {
			return (
				<CertificationsSection
					certifications={vendor.certifications}
					editing={false}
				/>
			);
		}
		if (tab === "reviews") {
			return <VendorReviewsList reviews={reviews} />;
		}
		return null;
	},
};
