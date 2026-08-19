import React from "react";
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
	FiImage,
} from "react-icons/fi";
import { cropAdviceData, cropCategories } from "../../../data/cropAdviceData";

const CropAdviceDetail = () => {
	const { cropId } = useParams();
	const navigate = useNavigate();
	const crop = cropAdviceData.find((c) => c.id === cropId);

	if (!crop) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="text-center">
					<h1 className="text-xl font-bold text-gray-900 mb-2">
						Fiche introuvable
					</h1>
					<p className="text-gray-500 mb-6">
						Cette culture n'existe pas ou n'est plus référencée.
					</p>
					<Link
						to="/producer/crop-advice"
						className="inline-flex items-center gap-2 text-harvests-primary font-medium"
					>
						<FiArrowLeft className="h-4 w-4" />
						Retour aux conseils agricoles
					</Link>
				</div>
			</div>
		);
	}

	const categoryLabel =
		cropCategories.find((c) => c.value === crop.category)?.label ||
		crop.category;

	return (
		<div className="min-h-screen relative overflow-hidden">
			<div className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 space-y-6">
				<button
					type="button"
					onClick={() => navigate("/producer/crop-advice")}
					className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
				>
					<FiArrowLeft className="h-4 w-4" />
					Retour aux conseils agricoles
				</button>

				{/* Zone image (à venir) */}
				<div className="relative w-full aspect-[16/6] rounded-2xl overflow-hidden bg-gradient-to-br from-harvests-light to-gray-100 border border-gray-100 flex items-center justify-center">
					{crop.image ? (
						<img
							src={crop.image}
							alt={crop.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="flex flex-col items-center gap-2 text-gray-400">
							<FiImage className="h-8 w-8" />
							<span className="text-xs font-medium">Image à venir</span>
						</div>
					)}
					<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5">
						<span className="inline-block text-xs px-2 py-1 rounded-full bg-white/90 text-harvests-primary font-medium mb-1">
							{categoryLabel}
						</span>
						<h1 className="text-2xl md:text-3xl font-bold text-white">
							{crop.name}
						</h1>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 text-sm text-gray-700">
					<div className="flex items-start gap-3">
						<FiSun className="mt-0.5 text-amber-500 flex-shrink-0" />
						<div>
							<span className="font-medium text-gray-900">{crop.season.label}</span>
							<div className="text-gray-500">
								Semis : {crop.season.sowing} · Récolte : {crop.season.harvest}
							</div>
							{crop.season.note && (
								<div className="text-xs text-gray-400 mt-1">{crop.season.note}</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-3">
						<FiThermometer className="text-red-500 flex-shrink-0" />
						<span>
							Température idéale : {crop.idealTemp.min}°C - {crop.idealTemp.max}°C
						</span>
					</div>

					<div className="flex items-start gap-3">
						<FiDroplet className="mt-0.5 text-blue-500 flex-shrink-0" />
						<span>{crop.water}</span>
					</div>

					<div className="flex items-center gap-3">
						<FiCalendar className="text-gray-500 flex-shrink-0" />
						<span>Cycle : {crop.cycleDays}</span>
					</div>

					<div>
						<div className="font-medium text-gray-900 mb-1">Sol recommandé</div>
						<p className="text-gray-600">{crop.soil}</p>
					</div>

					{crop.equipment && crop.equipment.length > 0 && (
						<div className="flex items-start gap-3">
							<FiTool className="mt-0.5 text-slate-500 flex-shrink-0" />
							<div>
								<div className="font-medium text-gray-900 mb-1">
									Engins & matériel nécessaires
								</div>
								<ul className="list-disc list-inside space-y-1 text-gray-600">
									{crop.equipment.map((item, i) => (
										<li key={i}>{item}</li>
									))}
								</ul>
							</div>
						</div>
					)}

					{crop.fertilizer && (
						<div className="flex items-start gap-3">
							<FiLayers className="mt-0.5 text-yellow-700 flex-shrink-0" />
							<div>
								<span className="font-medium text-gray-900">Fertilisation : </span>
								{crop.fertilizer}
							</div>
						</div>
					)}

					<div>
						<div className="font-medium text-gray-900 mb-1">Conseils de culture</div>
						<ul className="list-disc list-inside space-y-1 text-gray-600">
							{crop.tips.map((tip, i) => (
								<li key={i}>{tip}</li>
							))}
						</ul>
					</div>

					<div className="flex items-start gap-3">
						<FiCheckCircle className="mt-0.5 text-green-600 flex-shrink-0" />
						<div>
							<span className="font-medium text-gray-900">Récolte : </span>
							{crop.harvestTips}
						</div>
					</div>

					<div className="flex items-start gap-3">
						<FiPackage className="mt-0.5 text-orange-500 flex-shrink-0" />
						<div>
							<span className="font-medium text-gray-900">Après récolte : </span>
							{crop.postHarvest}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CropAdviceDetail;
