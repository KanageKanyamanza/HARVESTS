import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Leaf, Handshake, Star } from "lucide-react";
import DiscountBanner from "../../assets/images/Discount-Bannar.webp";
import harvestIntroVideo from "../../assets/videos/harvestintro.mp4";

const DiscountBannerSection = () => {
	const { t } = useTranslation("public");
	const points = t("home.discountBanner.points", { returnObjects: true });
	return (
		<section
			id="why-harvests"
			className="py-20 bg-harvests-light"
			data-aos="fade-up"
		>
			<div className="container-xl">
				{/* En-tête de la section */}
				<div className="text-center mb-12">
					<h2
						className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4"
						data-aos="fade-up"
					>
						{t("home.discountBanner.title")}
					</h2>
					<p
						className="text-xl text-gray-600 max-w-3xl mx-auto"
						data-aos="fade-up"
						data-aos-delay="100"
					>
						{t("home.discountBanner.subtitle")}
					</p>
				</div>

				{/* Conteneur principal avec image de fond et vidéo à droite */}
				<div
					className="relative rounded-3xl overflow-hidden min-h-[600px] md:h-[500px] bg-cover bg-center shadow-2xl"
					style={{ backgroundImage: `url(${DiscountBanner})` }}
				>
					{/* Overlay pour améliorer la lisibilité */}
					<div className="absolute inset-0 bg-black/30"></div>

					{/* Contenu en deux colonnes */}
					<div className="relative h-full flex flex-col md:flex-row py-4">
						{/* Colonne gauche - Contenu textuel */}
						<div className="flex-1 flex flex-col justify-center p-6 md:p-12 text-white">
							<div className="max-w-lg">
								<h3 className="text-3xl md:text-4xl text-white font-bold mb-6">
									{t("home.discountBanner.heading")}
								</h3>
								<p className="text-lg md:text-xl mb-8 text-white/90">
									{t("home.discountBanner.description")}
								</p>

								{/* Points clés */}
								<div className="space-y-4 mb-8">
									<div className="flex items-center">
										<div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
											<Leaf className="w-5 h-5 text-white" />
										</div>
										<span className="text-lg">
											{points[0]}
										</span>
									</div>
									<div className="flex items-center">
										<div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
											<Handshake className="w-5 h-5 text-white" />
										</div>
										<span className="text-lg">
											{points[1]}
										</span>
									</div>
									<div className="flex items-center">
										<div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-4">
											<Star className="w-5 h-5 text-white" />
										</div>
										<span className="text-lg">
											{points[2]}
										</span>
									</div>
								</div>

								<Link
									to="/products"
									className="inline-flex items-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
								>
									{t("home.discountBanner.cta")}
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</div>
						</div>

						{/* Colonne droite - Vidéo */}
						<div className="w-full md:w-1/2 lg:w-2/5 p-4 md:p-8 flex items-center">
							<div className="relative w-full h-[280px] md:h-full rounded-2xl overflow-hidden bg-gray-900 shadow-xl">
								<video
									className="w-full h-full object-cover"
									controls
									preload="metadata"
									playsInline
									onError={(e) => {
										console.error("Erreur de chargement de la vidéo:", e);
									}}
								>
									<source src={harvestIntroVideo} type="video/mp4" />
									{t("home.discountBanner.videoFallback")}
								</video>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DiscountBannerSection;
