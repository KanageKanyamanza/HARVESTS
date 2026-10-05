import React from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Page de détail en cours de chargement : le bouton retour est utilisable tout
 * de suite ; le titre et le contenu (données du serveur) sont grisés.
 * `label` : intitulé fixe éventuel affiché au-dessus du titre.
 */
const DetailPageSkeleton = ({ onBack, label }) => (
	<div className="dashboard-page">
		<div className="dashboard-container max-w-[1400px]">
			<div className="flex items-center gap-6 mb-12">
				<button
					onClick={onBack}
					className="p-4 bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all duration-300 shadow-sm border border-gray-100 hover:scale-105"
				>
					<ArrowLeft className="h-6 w-6" />
				</button>
				<div className="space-y-2">
					{label && (
						<span className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
							{label}
						</span>
					)}
					<div className="h-7 w-64 bg-gray-200/80 rounded-lg animate-pulse" />
					<div className="h-4 w-40 bg-gray-200/60 rounded animate-pulse" />
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
				<div className="lg:col-span-2 space-y-6">
					<div className="h-72 bg-white/70 rounded-[2rem] border border-white/60" />
					<div className="h-48 bg-white/70 rounded-[2rem] border border-white/60" />
				</div>
				<div className="space-y-6">
					<div className="h-48 bg-white/70 rounded-[2rem] border border-white/60" />
					<div className="h-72 bg-white/70 rounded-[2rem] border border-white/60" />
				</div>
			</div>
		</div>
	</div>
);

export default DetailPageSkeleton;
