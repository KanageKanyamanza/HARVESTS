import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	FiArrowLeft,
	FiSun,
	FiDroplet,
	FiThermometer,
	FiCalendar,
	FiCheckCircle,
	FiPackage,
	FiTool,
	FiLayers,
	FiCheck,
	FiShield,
} from "react-icons/fi";
import { Sprout } from "lucide-react";
import {
	cropAdviceData,
	cropCategories,
	getCropGrowthStages,
	getCropEquipmentDetails,
} from "../../../data/cropAdviceData";

const CropAdviceDetail = () => {
	const { cropId } = useParams();
	const navigate = useNavigate();
	const crop = cropAdviceData.find((c) => c.id === cropId);

	const [heroImgSrc, setHeroImgSrc] = useState(
		crop ? crop.image || crop.fallbackUrl : null
	);

	if (!crop) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
				<div className="text-center max-w-md bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
					<Sprout className="h-12 w-12 text-gray-400 mx-auto" />
					<h1 className="text-xl font-bold text-gray-900">
						Fiche de culture introuvable
					</h1>
					<p className="text-gray-500 text-sm">
						Cette culture n'existe pas ou n'est plus référencée dans la base agricole.
					</p>
					<Link
						to="/producer/crop-advice"
						className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-harvests-primary text-white font-medium text-sm hover:bg-harvests-secondary transition-colors"
					>
						<FiArrowLeft className="h-4 w-4" />
						Retour aux conseils agricoles
					</Link>
				</div>
			</div>
		);
	}

	const categoryLabel =
		cropCategories.find((c) => c.value === crop.category)?.label || crop.category;

	const growthStages = getCropGrowthStages(crop);
	const equipmentDetails = getCropEquipmentDetails(crop);

	return (
		<div className="min-h-screen relative overflow-hidden bg-gray-50/50 pb-16">
			<div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6 space-y-8">
				{/* Bouton retour */}
				<button
					type="button"
					onClick={() => navigate("/producer/crop-advice")}
					className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-harvests-primary bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-x-0.5"
				>
					<FiArrowLeft className="h-4 w-4" />
					Retour aux conseils agricoles
				</button>

				{/* Section Hero avec Image du Produit */}
				<div className="relative w-full aspect-[21/9] min-h-[260px] md:min-h-[340px] rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-gray-900 shadow-xl border border-gray-100">
					{heroImgSrc ? (
						<img
							src={heroImgSrc}
							alt={crop.name}
							onError={() => {
								if (heroImgSrc !== crop.fallbackUrl && crop.fallbackUrl) {
									setHeroImgSrc(crop.fallbackUrl);
								} else {
									setHeroImgSrc(null);
								}
							}}
							className="w-full h-full object-cover opacity-85"
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-2">
							<Sprout className="h-16 w-16 text-emerald-400 animate-pulse" />
							<span className="text-sm font-medium">{crop.name}</span>
						</div>
					)}

					<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

					<div className="absolute inset-x-0 bottom-0 p-6 md:p-8 space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs px-3 py-1 rounded-full bg-harvests-primary text-white font-semibold shadow-md">
								{categoryLabel}
							</span>
							<span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-medium">
								Zone Sahelienne / West Africa
							</span>
						</div>
						<h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-md tracking-tight">
							Fiche de Culture : {crop.name}
						</h1>
						<p className="text-gray-200 text-sm md:text-base max-w-2xl line-clamp-2">
							{crop.season.label} · Durée estimée du cycle : {crop.cycleDays}
						</p>
					</div>
				</div>

				{/* Cartes métriques rapides */}
				<div className="grid grid-cols lg:grid-cols-4 gap-4">
					<div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
						<div className="p-3 rounded-xl bg-amber-50 text-amber-500">
							<FiSun className="h-6 w-6" />
						</div>
						<div>
							<span className="text-xs text-gray-400 font-medium block">Saison</span>
							<span className="text-sm font-bold text-gray-800 line-clamp-1">{crop.season.label}</span>
						</div>
					</div>

					<div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
						<div className="p-3 rounded-xl bg-red-50 text-red-500">
							<FiThermometer className="h-6 w-6" />
						</div>
						<div>
							<span className="text-xs text-gray-400 font-medium block">Température</span>
							<span className="text-sm font-bold text-gray-800">{crop.idealTemp.min}°C - {crop.idealTemp.max}°C</span>
						</div>
					</div>

					<div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
						<div className="p-3 rounded-xl bg-blue-50 text-blue-500">
							<FiDroplet className="h-6 w-6" />
						</div>
						<div>
							<span className="text-xs text-gray-400 font-medium block">Besoin en eau</span>
							<span className="text-xs font-semibold text-gray-800 line-clamp-2">{crop.water}</span>
						</div>
					</div>

					<div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
						<div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
							<FiCalendar className="h-6 w-6" />
						</div>
						<div>
							<span className="text-xs text-gray-400 font-medium block">Durée du cycle</span>
							<span className="text-sm font-bold text-gray-800">{crop.cycleDays}</span>
						</div>
					</div>
				</div>

				{/* SECTION 1 : ÉTAPES DE POUSSE (GROWTH STAGES WITH IMAGES) */}
				<div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-8 shadow-sm space-y-6">
					<div className="flex flex-wrap gap-1 items-center justify-between border-b border-gray-100 pb-4">
						<div className="space-y-1">
							<span className="text-xs font-bold text-harvests-primary uppercase tracking-wider">
								Guide Visuel
							</span>
							<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
								<Sprout className="text-emerald-600" />
								Étapes de Pousse & Développement
							</h2>
						</div>
						<span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
							4 phases clés
						</span>
					</div>

					{/* Timeline des étapes de pousse */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{growthStages.map((stage, idx) => (
							<div
								key={stage.id || idx}
								className="group bg-gray-50/70 rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:border-harvests-primary/40 transition-all duration-300 flex flex-col"
							>
								{/* Image de l'étape de pousse */}
								<div className="relative aspect-[16/9] bg-emerald-900/10 overflow-hidden">
									<img
										src={stage.image}
										alt={stage.name}
										onError={(e) => {
											if (stage.fallbackUrl) e.target.src = stage.fallbackUrl;
										}}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
									<span className="absolute top-3 left-3 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-harvests-primary text-white shadow-md">
										{stage.phase || `Étape ${idx + 1}`}
									</span>
									<span className="absolute bottom-2 left-3 right-3 text-xs text-emerald-100 font-medium">
										{stage.period}
									</span>
								</div>

								{/* Contenu textuel de l'étape */}
								<div className="p-5 flex-1 flex flex-col justify-between space-y-2">
									<h3 className="font-bold text-gray-900 text-lg group-hover:text-harvests-primary transition-colors">
										{stage.name}
									</h3>
									<p className="text-sm text-gray-600 leading-relaxed">
										{stage.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* SECTION 2 : ENGINS & MATÉRIEL AGRICOLE (EQUIPMENT & MACHINERY WITH IMAGES) */}
				<div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-8 shadow-sm space-y-6">
					<div className="flex flex-wrap gap-1 items-center justify-between border-b border-gray-100 pb-4">
						<div className="space-y-1">
							<span className="text-xs font-bold text-harvests-primary uppercase tracking-wider">
								Équipements Préconisés
							</span>
							<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
								<FiTool className="text-slate-700" />
								Engins & Matériel Agricole Recommandé
							</h2>
						</div>
						<span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
							Matériel spécialisé
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{equipmentDetails.map((eq, i) => (
							<div
								key={i}
								className="group bg-gray-50/70 rounded-2xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:border-harvests-primary/40 transition-all duration-300 flex flex-col"
							>
								{/* Image de l'engin */}
								<div className="relative aspect-[16/9] bg-slate-900/10 overflow-hidden">
									<img
										src={eq.image}
										alt={eq.name}
										onError={(e) => {
											if (eq.fallbackUrl) e.target.src = eq.fallbackUrl;
										}}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
									<span className="absolute top-3 left-3 text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg bg-slate-700 text-white shadow-md tracking-wider">
										{eq.category}
									</span>
								</div>

								{/* Contenu textuel de l'engin */}
								<div className="p-5 flex-1 flex flex-col justify-between space-y-2">
									<h3 className="font-bold text-gray-900 text-lg group-hover:text-harvests-primary transition-colors">
										{eq.name}
									</h3>
									<p className="text-sm text-gray-600 leading-relaxed">
										{eq.description || `Optimisé pour la culture du produit ${crop.name}.`}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* SECTION 3 : DÉTAILS DE CULTURE & FERTILISATION */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Sol & Préparation */}
					<div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
						<div className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg">
							<div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
								<FiShield className="h-5 w-5" />
							</div>
							Sol & Préparation Recommandée
						</div>
						<p className="text-sm text-gray-700 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
							{crop.soil}
						</p>
					</div>

					{/* Fertilisation */}
					<div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
						<div className="flex items-center gap-2.5 text-amber-900 font-bold text-lg">
							<div className="p-2 rounded-xl bg-amber-100 text-amber-700">
								<FiLayers className="h-5 w-5" />
							</div>
							Fertilisation & Apports Nutritifs
						</div>
						<p className="text-sm text-gray-700 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
							{crop.fertilizer}
						</p>
					</div>
				</div>

				{/* SECTION 4 : CONSEILS PRATIQUES, RÉCOLTE & APRÈS-RÉCOLTE */}
				<div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-8 shadow-sm space-y-6">
					<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
						<FiCheckCircle className="text-emerald-600" />
						Conseils Clés & Post-Récolte
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Recommandations pratiques */}
						<div className="space-y-3">
							<h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								Pratiques de Culture
							</h3>
							<ul className="space-y-2 text-xs text-gray-600">
								{crop.tips.map((tip, i) => (
									<li key={i} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
										<FiCheck className="text-emerald-600 mt-0.5 flex-shrink-0" />
										<span>{tip}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Indicateurs de Récolte */}
						<div className="space-y-3">
							<h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-amber-500" />
								Indicateurs de Récolte
							</h3>
							<div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl text-xs text-gray-700 leading-relaxed space-y-2">
								<FiCheckCircle className="h-5 w-5 text-amber-600" />
								<p className="font-medium text-amber-900">{crop.harvestTips}</p>
							</div>
						</div>

						{/* Conservation & Stockage */}
						<div className="space-y-3">
							<h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-orange-500" />
								Stockage & Post-Récolte
							</h3>
							<div className="bg-orange-50/60 border border-orange-200/80 p-4 rounded-2xl text-xs text-gray-700 leading-relaxed space-y-2">
								<FiPackage className="h-5 w-5 text-orange-600" />
								<p className="font-medium text-orange-900">{crop.postHarvest}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CropAdviceDetail;
