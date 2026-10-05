import React from "react";

/**
 * Page du tableau de bord dont on n'a encore aucune donnée (session en cours de
 * restauration, premier chargement) : même gabarit que les vraies pages, avec
 * l'en-tête et les blocs grisés à la place d'un spinner plein écran.
 * `blocks` : nombre de blocs de contenu grisés sous l'en-tête.
 */
const DashboardPageSkeleton = ({ blocks = 3 }) => (
	<div className="dashboard-page">
		<div className="dashboard-container space-y-6" aria-busy="true">
			<div className="space-y-3 animate-pulse">
				<div className="h-3 w-28 bg-gray-200/80 rounded" />
				<div className="h-8 w-64 max-w-full bg-gray-200/80 rounded-lg" />
				<div className="h-3 w-80 max-w-full bg-gray-200/60 rounded" />
			</div>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="h-24 bg-white/70 rounded-2xl border border-white/60" />
				))}
			</div>
			{Array.from({ length: blocks }, (_, i) => (
				<div
					key={i}
					className="h-48 bg-white/70 rounded-[2rem] border border-white/60 animate-pulse"
				/>
			))}
		</div>
	</div>
);

export default DashboardPageSkeleton;
