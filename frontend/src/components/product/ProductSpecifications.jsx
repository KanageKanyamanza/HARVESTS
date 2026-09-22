import React from "react";
import { useTranslation } from "react-i18next";
import {
	FiPackage,
	FiUser,
	FiClock,
	FiCheckCircle,
	FiXCircle,
} from "react-icons/fi";
import {
	formatUnit,
	getCategoryLabel,
	getVendorName,
	formatVendorAddress,
} from "../../utils/productUtils";
import { formatPrice } from "../../utils/currencyUtils";

const ProductSpecifications = ({ product, producer, user, statusConfig }) => {
	const { t, i18n } = useTranslation("public");
	const dateLocale = i18n.language === "en" ? "en-US" : "fr-FR";
	const isOwnerOrAdmin =
		user &&
		(user.userType === "admin" ||
			(product.producer && product.producer._id === user._id));

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
			{/* Informations générales */}
			<div className="bg-white rounded-lg p-6 shadow-sm border">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<FiPackage className="h-5 w-5 mr-2" />
					{t("productDetail.generalInfo")}
				</h3>
				<div className="space-y-3">
					{product.category && (
						<InfoRow
							label={t("productDetail.category")}
							value={getCategoryLabel(product.category)}
						/>
					)}
					{product.subcategory && (
						<InfoRow label={t("productDetail.subcategory")} value={product.subcategory} />
					)}
					{product.price && (
						<InfoRow label={t("productDetail.price")} value={formatPrice(product.price)} />
					)}
					{product.compareAtPrice && (
						<InfoRow
							label={t("productDetail.comparePrice")}
							value={formatPrice(product.compareAtPrice)}
							className="line-through text-gray-500"
						/>
					)}
					{product.minimumOrderQuantity > 0 && (
						<InfoRow
							label={t("productDetail.minQuantity")}
							value={`${product.minimumOrderQuantity} ${formatUnit(
								product.minimumOrderQuantity,
								product.unit
							)}`}
						/>
					)}
					{product.maximumOrderQuantity > 0 && (
						<InfoRow
							label={t("productDetail.maxQuantity")}
							value={`${product.maximumOrderQuantity} ${formatUnit(
								product.maximumOrderQuantity,
								product.unit
							)}`}
						/>
					)}
					{product.tags?.length > 0 && (
						<div className="pt-1">
							<dt className="text-gray-600 mb-2 block text-sm">{t("productDetail.tags")}</dt>
							<dd className="flex flex-wrap gap-2">
								{product.tags.map((tag, i) => (
									<span
										key={i}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
									>
										{tag}
									</span>
								))}
							</dd>
						</div>
					)}
				</div>
			</div>

			{/* Variantes */}
			{product.hasVariants && product.variants?.length > 0 && (
				<div className="bg-white rounded-lg p-6 shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<FiPackage className="h-5 w-5 mr-2" />
						{t("productDetail.availableVariants")}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{product.variants.map((variant, i) => (
							<div
								key={i}
								className="border border-gray-200 rounded-lg p-4 space-y-2"
							>
								<h4 className="font-medium text-gray-900">{variant.name}</h4>
								<InfoRow label={t("productDetail.price")} value={formatPrice(variant.price)} />
								{variant.compareAtPrice && (
									<InfoRow
										label={t("productDetail.comparePrice")}
										value={formatPrice(variant.compareAtPrice)}
										className="line-through text-gray-500"
									/>
								)}
								<InfoRow
									label={t("productDetail.stock")}
									value={`${variant.inventory?.quantity || 0} ${formatUnit(
										variant.inventory?.quantity || 0,
										variant.unit || product.unit
									)}`}
								/>
								{variant.sku && (
									<InfoRow
										label={t("productDetail.sku")}
										value={variant.sku}
										className="text-sm"
									/>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Infos publication (propriétaire/admin seulement) */}
			{isOwnerOrAdmin && (
				<div className="bg-white rounded-lg p-6 shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<FiClock className="h-5 w-5 mr-2" />
						{t("productDetail.publicationInfo")}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<InfoRow label={t("productDetail.status")} value={statusConfig.text} />
							<div className="flex justify-between">
								<dt className="text-gray-600">{t("productDetail.active")}</dt>
								<dd>
									{product.isActive ? (
										<FiCheckCircle className="h-4 w-4 text-green-500" />
									) : (
										<FiXCircle className="h-4 w-4 text-red-500" />
									)}
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-gray-600">{t("productDetail.featured")}</dt>
								<dd>
									{product.isFeatured ? (
										<FiCheckCircle className="h-4 w-4 text-yellow-500" />
									) : (
										<FiXCircle className="h-4 w-4 text-gray-400" />
									)}
								</dd>
							</div>
						</div>
						<div className="space-y-3">
							<InfoRow
								label={t("productDetail.createdAt")}
								value={new Date(product.createdAt).toLocaleDateString(dateLocale)}
							/>
							{product.publishedAt && (
								<InfoRow
									label={t("productDetail.publishedAt")}
									value={new Date(product.publishedAt).toLocaleDateString(
										dateLocale
									)}
								/>
							)}
							{product.lastStockUpdate && (
								<InfoRow
									label={t("productDetail.lastStockUpdate")}
									value={new Date(product.lastStockUpdate).toLocaleDateString(
										dateLocale
									)}
								/>
							)}
						</div>
					</div>
					{product.rejectionReason && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<dt className="text-red-800 font-medium mb-1">{t("productDetail.rejectionReason")}</dt>
							<dd className="text-red-700">{product.rejectionReason}</dd>
						</div>
					)}
				</div>
			)}

			{/* Infos vendeur */}
			{producer && (
				<div className="bg-white rounded-lg p-6 shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<FiUser className="h-5 w-5 mr-2" />
						{t("productDetail.producerInfo")}
					</h3>
					<div className="space-y-3">
						<InfoRow label={t("productDetail.name")} value={getVendorName(producer)} />
						{formatVendorAddress(producer) && (
							<InfoRow
								label={t("productDetail.location")}
								value={formatVendorAddress(producer)}
							/>
						)}
						<InfoRow
							label={t("productDetail.memberSince")}
							value={new Date(producer.createdAt).toLocaleDateString(dateLocale)}
						/>
						{producer.phone && (
							<InfoRow label={t("productDetail.phone")} value={producer.phone} />
						)}
						{producer.email && (
							<InfoRow label={t("productDetail.email")} value={producer.email} />
						)}
					</div>
				</div>
			)}
		</div>
	);
};

const InfoRow = ({ label, value, className = "" }) => (
	<div className="flex justify-between items-baseline gap-4">
		<dt className="text-gray-600 shrink-0">{label}</dt>
		<dd className={`font-medium text-right ${className}`}>{value}</dd>
	</div>
);

export default ProductSpecifications;
