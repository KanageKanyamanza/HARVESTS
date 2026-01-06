import React from "react";
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
	const isOwnerOrAdmin =
		user &&
		(user.userType === "admin" ||
			(product.producer && product.producer._id === user._id));

	return (
		<div className="space-y-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
			{/* Informations générales */}
			<div className="bg-white rounded-lg p-6 shadow-sm border">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
					<FiPackage className="h-5 w-5 mr-2" />
					Informations générales
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-3">
						{product.category && (
							<InfoRow
								label="Catégorie"
								value={getCategoryLabel(product.category)}
							/>
						)}
						{product.subcategory && (
							<InfoRow label="Sous-catégorie" value={product.subcategory} />
						)}
						{product.price && (
							<InfoRow label="Prix" value={formatPrice(product.price)} />
						)}
						{product.compareAtPrice && (
							<InfoRow
								label="Prix de comparaison"
								value={formatPrice(product.compareAtPrice)}
								className="line-through text-gray-500"
							/>
						)}
						{product.inventory?.quantity !== undefined && (
							<InfoRow
								label="Stock disponible"
								value={`${product.inventory.quantity} ${formatUnit(
									product.inventory.quantity,
									product.unit
								)}`}
							/>
						)}
						{product.minimumOrderQuantity && (
							<InfoRow
								label="Quantité minimum"
								value={`${product.minimumOrderQuantity} ${formatUnit(
									product.minimumOrderQuantity,
									product.unit
								)}`}
							/>
						)}
						{product.maximumOrderQuantity && (
							<InfoRow
								label="Quantité maximum"
								value={`${product.maximumOrderQuantity} ${formatUnit(
									product.maximumOrderQuantity,
									product.unit
								)}`}
							/>
						)}
					</div>
					<div className="space-y-3">
						{product.tags?.length > 0 && (
							<div>
								<dt className="text-gray-600 mb-2 block">Tags</dt>
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
			</div>

			{/* Variantes */}
			{product.hasVariants && product.variants?.length > 0 && (
				<div className="bg-white rounded-lg p-6 shadow-sm border">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<FiPackage className="h-5 w-5 mr-2" />
						Variantes disponibles
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{product.variants.map((variant, i) => (
							<div
								key={i}
								className="border border-gray-200 rounded-lg p-4 space-y-2"
							>
								<h4 className="font-medium text-gray-900">{variant.name}</h4>
								<InfoRow label="Prix" value={formatPrice(variant.price)} />
								{variant.compareAtPrice && (
									<InfoRow
										label="Prix de comparaison"
										value={formatPrice(variant.compareAtPrice)}
										className="line-through text-gray-500"
									/>
								)}
								<InfoRow
									label="Stock"
									value={`${variant.inventory?.quantity || 0} ${formatUnit(
										variant.inventory?.quantity || 0,
										variant.unit || product.unit
									)}`}
								/>
								{variant.sku && (
									<InfoRow
										label="SKU"
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
						Informations de publication
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<InfoRow label="Statut" value={statusConfig.text} />
							<div className="flex justify-between">
								<dt className="text-gray-600">Actif</dt>
								<dd>
									{product.isActive ? (
										<FiCheckCircle className="h-4 w-4 text-green-500" />
									) : (
										<FiXCircle className="h-4 w-4 text-red-500" />
									)}
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-gray-600">Mis en avant</dt>
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
								label="Créé le"
								value={new Date(product.createdAt).toLocaleDateString("fr-FR")}
							/>
							{product.publishedAt && (
								<InfoRow
									label="Publié le"
									value={new Date(product.publishedAt).toLocaleDateString(
										"fr-FR"
									)}
								/>
							)}
							{product.lastStockUpdate && (
								<InfoRow
									label="Dernière mise à jour stock"
									value={new Date(product.lastStockUpdate).toLocaleDateString(
										"fr-FR"
									)}
								/>
							)}
						</div>
					</div>
					{product.rejectionReason && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
							<dt className="text-red-800 font-medium mb-1">Raison du rejet</dt>
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
						Informations du vendeur
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-3">
							<InfoRow label="Nom" value={getVendorName(producer)} />
							{formatVendorAddress(producer) && (
								<InfoRow
									label="Localisation"
									value={formatVendorAddress(producer)}
								/>
							)}
							<InfoRow
								label="Membre depuis"
								value={new Date(producer.createdAt).toLocaleDateString("fr-FR")}
							/>
						</div>
						<div className="space-y-3">
							{producer.phone && (
								<InfoRow label="Téléphone" value={producer.phone} />
							)}
							{producer.email && (
								<InfoRow label="Email" value={producer.email} />
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const InfoRow = ({ label, value, className = "" }) => (
	<div className="flex justify-between">
		<dt className="text-gray-600">{label}</dt>
		<dd className={`font-medium ${className}`}>{value}</dd>
	</div>
);

export default ProductSpecifications;
