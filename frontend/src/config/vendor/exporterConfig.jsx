import React from "react";
import { FiStar, FiTruck, FiGlobe, FiCheckCircle } from "react-icons/fi";
import {
	getVendorAverageRating,
	formatAverageRating,
} from "../../utils/vendorRatings";
import { formatPriceOrQuote } from "./baseConfig.jsx";
import { FiPhone, FiMail } from "react-icons/fi";
import {
	VendorFleetCard,
	VendorReviewsList,
	VendorEmptyState,
} from "../../components/common/vendor";
import CertificationsSection from "../../components/profile/specific/CertificationsSection";
import i18n from "../../utils/i18n";

const t = (key, opts) =>
	i18n.t(`vendorProfile.${key}`, {
		ns: "public",
		...(typeof opts === "string" ? { defaultValue: opts } : opts),
	});

const getVehicleTypeLabel = (type) => t(`exporter.vehicleTypes.${type}`, type);
const getConditionLabel = (cond) => t(`exporter.conditionLabels.${cond}`, cond);
const getExperienceLabel = (exp) => t(`exporter.experienceLabels.${exp}`, exp);
const getMarketTypeLabel = (type) => t(`exporter.marketTypeLabels.${type}`, type);

export const exporterConfig = {
	vendorType: "exporter",
	getVendorName: (e) => e.companyName || `${e.firstName} ${e.lastName}`,
	getVendorSubtitle: (e) => {
		const markets =
			e.targetMarkets?.map((m) => m.country).filter(Boolean) || [];
		return markets.length > 0
			? t("exporter.exportTo", { markets: markets.slice(0, 3).join(", ") })
			: t("exporter.genericLabel");
	},

	getVendorStats: (exporter, _items, reviews = []) => {
		const averageRating = getVendorAverageRating(exporter, reviews);
		return [
			{
				icon: <FiStar className="w-5 h-5 text-yellow-500" />,
				value: formatAverageRating(averageRating),
				label: t("statLabels.averageRating"),
			},
			{
				icon: <FiGlobe className="w-5 h-5 text-blue-500" />,
				value: exporter.targetMarkets?.length || 0,
				label: t("exporter.targetMarketsLabel"),
			},
			{
				icon: <FiTruck className="w-5 h-5 text-green-500" />,
				value: exporter.fleet?.length || 0,
				label: t("exporter.fleetLabel"),
			},
			{
				icon: <FiCheckCircle className="w-5 h-5 text-purple-500" />,
				value: exporter.exportLicenses?.length || 0,
				label: t("exporter.licensesLabel"),
			},
		];
	},

	getVendorContact: (e) => {
		const contact = [];
		if (e.phone)
			contact.push({
				icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />,
				text: e.phone,
				href: `tel:${e.phone}`,
			});
		if (e.email)
			contact.push({
				icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />,
				text: e.email,
				href: `mailto:${e.email}`,
			});
		return contact;
	},
	getVendorLocation: (e) =>
		[e.address, e.city, e.region, e.country].filter(Boolean),
	getVendorDescription: (e) => e.bio || e.description || "",
	getVendorTags: (e) => {
		const tags = [];
		if (e.targetMarkets?.length > 0) {
			tags.push({
				label: t("exporter.targetMarketsLabel"),
				items: e.targetMarkets.map((m) => m.country).filter(Boolean),
			});
		}
		if (e.exportProducts?.length > 0) {
			tags.push({
				label: t("exporter.exportProductsLabel"),
				items: [
					...new Set(e.exportProducts.map((p) => p.category).filter(Boolean)),
				],
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
			? t("exporter.capacityLabel", { capacity: capacity.join(", ") })
			: t("exporter.genericVehicleDescription");
	},
	getItemPrice: () => null,
	getItemImage: (v) =>
		v.image?.url ||
		v.image?.secure_url ||
		(typeof v.image === "string" ? v.image : null),
	getItemExtraInfo: (v) =>
		`${v.isAvailable ? t("available") : t("unavailable")} - ${getConditionLabel(v.condition)}`,
	get getItemButtonText() { return t("exporter.itemButton"); },
	getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
	getItemButtonColor: "bg-blue-600 hover:bg-blue-700",
	getEmptyStateIcon: (
		<FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
	),
	get getEmptyStateTitle() { return t("exporter.emptyFleetTitle"); },
	get getEmptyStateDescription() { return t("exporter.emptyFleetDescription"); },

	tabs: ["fleet", "markets", "about", "certifications", "reviews"],
	getTabLabel: (tab) =>
		({
			fleet: t("tabs.fleet"),
			markets: t("tabs.markets"),
			about: t("tabs.about"),
			certifications: t("tabs.certifications"),
			reviews: t("tabs.reviews"),
		}[tab] || tab),
	getTabCount: (tab, items, reviews, vendor) => {
		if (tab === "fleet") return items?.length || 0;
		if (tab === "reviews") return reviews?.length || 0;
		if (tab === "markets") return vendor?.targetMarkets?.length || 0;
		if (tab === "about") return 1;
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
						/>
					))}
				</div>
			);
		}

		if (tab === "markets") {
			if (!vendor.targetMarkets?.length) {
				return (
					<div className="text-center py-12">
						<FiGlobe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{t("exporter.noMarketsTitle")}
						</h3>
						<p className="text-gray-500">
							{t("exporter.noMarketsDescription")}
						</p>
					</div>
				);
			}
			return (
				<div className="space-y-4">
					{vendor.targetMarkets.map((market, idx) => (
						<div
							key={idx}
							className="bg-white border border-gray-200 rounded-lg p-6"
						>
							<div className="flex items-center justify-between mb-2">
								<h3 className="font-semibold text-gray-900">
									{market.country} {market.region && `- ${market.region}`}
								</h3>
								{market.experience && (
									<span className="text-xs text-gray-500">
										{getExperienceLabel(market.experience)}
									</span>
								)}
							</div>
							{market.marketType && (
								<p className="text-sm text-gray-600 mb-2">
									{t("exporter.marketTypeLabel", { type: getMarketTypeLabel(market.marketType) })}
								</p>
							)}
							{market.annualVolume && (
								<p className="text-sm text-gray-600">
									{t("exporter.annualVolumeLabel", { volume: market.annualVolume.value, unit: market.annualVolume.unit })}
								</p>
							)}
						</div>
					))}
				</div>
			);
		}

		if (tab === "about") {
			return (
				<div className="bg-white rounded-lg p-6 space-y-8">
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
							{t("exporter.commercialConditionsTitle")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div>
								<p className="text-sm text-gray-500 font-bold uppercase mb-3 text-indigo-600">
									{t("exporter.acceptedIncoterms")}
								</p>
								<div className="flex flex-wrap gap-2">
									{(vendor.tradingTerms?.acceptedIncoterms || []).map(
										(t, i) => (
											<span
												key={i}
												className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100 font-medium"
											>
												{t}
											</span>
										)
									)}
								</div>
							</div>
							<div>
								<p className="text-sm text-gray-500 font-bold uppercase mb-3 text-green-600">
									{t("exporter.acceptedCurrencies")}
								</p>
								<div className="flex flex-wrap gap-2">
									{(vendor.tradingTerms?.currencies || []).map((c, i) => (
										<span
											key={i}
											className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 font-medium"
										>
											{c}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					{vendor.exportLicenses && vendor.exportLicenses.length > 0 && (
						<div>
							<h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
								{t("exporter.exportLicensesTitle")}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{vendor.exportLicenses.map((l, i) => (
									<div
										key={i}
										className="p-4 border border-gray-100 rounded-xl bg-gray-50"
									>
										<p className="font-bold text-gray-900">
											{t("exporter.licenseNumber", { number: l.licenseNumber })}
										</p>
										<p className="text-sm text-gray-600">
											{t("exporter.issuedBy", { issuer: l.issuedBy })}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											{t("exporter.validUntil", { date: new Date(l.validUntil).toLocaleDateString() })}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			);
		}

		if (tab === "reviews") {
			return <VendorReviewsList reviews={reviews} />;
		}
		if (tab === "certifications") {
			return (
				<CertificationsSection
					certifications={vendor.certifications}
					editing={false}
				/>
			);
		}
		return null;
	},
};
