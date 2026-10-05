import React from "react";

/**
 * Squelette d'une grille de cartes : à placer uniquement à l'endroit où
 * arrivent les données du serveur (le texte fixe de la page reste affiché).
 * - variant "card" : image + deux lignes (produits, vendeurs, articles)
 * - variant "row"  : ligne horizontale (listes, commandes, avis)
 * - variant "stat" : carte de chiffre clé
 */
const CardGridSkeleton = ({
	count = 8,
	className = "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6",
	variant = "card",
}) => (
	<div className={className} aria-busy="true">
		{Array.from({ length: count }, (_, i) => (
			<div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
				{variant === "card" && (
					<>
						<div className="aspect-[4/3] bg-gray-100" />
						<div className="p-4 space-y-2">
							<div className="h-4 bg-gray-100 rounded w-3/4" />
							<div className="h-3 bg-gray-100 rounded w-1/2" />
						</div>
					</>
				)}
				{variant === "row" && (
					<div className="p-4 flex items-center gap-4">
						<div className="h-12 w-12 rounded-xl bg-gray-100 flex-shrink-0" />
						<div className="flex-1 space-y-2">
							<div className="h-4 bg-gray-100 rounded w-1/2" />
							<div className="h-3 bg-gray-100 rounded w-1/3" />
						</div>
					</div>
				)}
				{variant === "stat" && (
					<div className="p-5 space-y-3">
						<div className="h-3 bg-gray-100 rounded w-1/2" />
						<div className="h-7 bg-gray-100 rounded w-1/3" />
					</div>
				)}
			</div>
		))}
	</div>
);

export default CardGridSkeleton;
