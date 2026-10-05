import React from "react";
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Fiche publique (produit, plat, article, vendeur) en cours de chargement :
 * le bouton retour (texte fixe) est affiché et utilisable, le contenu venant
 * du serveur est grisé à son emplacement.
 * variant "product" : image + informations ; "article" : bannière + texte.
 */
const PublicDetailSkeleton = ({ onBack, variant = "product" }) => {
	const { t } = useTranslation("common");
	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<div className="max-w-7xl mx-auto px-4 py-4">
				<button
					onClick={onBack}
					className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#1A5514] transition-colors mb-4"
				>
					<FiArrowLeft className="w-4 h-4" />
					{t("back")}
				</button>
				{variant === "article" ?
					<div className="max-w-3xl mx-auto space-y-4 animate-pulse" aria-busy="true">
						<div className="aspect-[16/7] bg-gray-200/70 rounded-2xl" />
						<div className="h-8 bg-gray-200/70 rounded w-3/4" />
						<div className="h-4 bg-gray-200/60 rounded w-1/3" />
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-3 bg-gray-200/60 rounded" />
						))}
					</div>
				:	<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse" aria-busy="true">
						<div className="aspect-square bg-gray-200/70 rounded-3xl" />
						<div className="space-y-4">
							<div className="h-8 bg-gray-200/70 rounded w-2/3" />
							<div className="h-4 bg-gray-200/60 rounded w-1/3" />
							<div className="h-10 bg-gray-200/70 rounded-xl w-1/2" />
							<div className="h-28 bg-gray-200/60 rounded-xl" />
							<div className="h-12 bg-gray-200/70 rounded-xl" />
						</div>
					</div>
				}
			</div>
		</div>
	);
};

export default PublicDetailSkeleton;
