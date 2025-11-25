import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroBg1 from "../../assets/images/herobgcar1.jpg";
import heroBg2 from "../../assets/images/herobgcar2.jpg";
import heroBg3 from "../../assets/images/herobgcar3.jpg";
import heroBg4 from "../../assets/images/herobgcar4.jpg";

const HeroSection = () => {
	const slides = useMemo(
		() => [
			{
				id: 0,
				image: heroBg2,
				subtitle:
					"HARVESTS, une place de marché digitale pour les produits agricoles africains",
			},
			{
				id: 1,
				image: heroBg1,
				subtitle: "Avec HARVESTS, les restaurateurs peuvent acheter des produits agricoles frais et de qualité directement du producteur.",
			},
			{
				id: 2,
				image: heroBg3,
				subtitle:
					"Avec HARVESTS, les restaurateurs peuvent vendre leurs plats directement au consommateur.",
			},
			{
				id: 3,
				image: heroBg4,
				subtitle:
					"HARVESTS inclut la gestion de la chaine d'approvisionnement : Transports des produits du producteur au consommateur.",
			},
		],
		[]
	);

	const [currentSlide, setCurrentSlide] = useState(0);
	const position = useMemo(() => {
		switch (currentSlide) {
			case 0:
				return {
					wrapper:
						"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center px-4 md:px-0 md:left-auto md:right-6 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:text-right md:items-end",
					button: "justify-center md:justify-end",
					title: "text-center md:text-right",
				};
			case 3:
				return {
					wrapper:
						"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center items-center px-4 md:left-0 md:bottom-0 md:top-auto md:px-4 md:pb-6 md:translate-x-0 md:translate-y-0 md:text-left md:items-start",
					button: "justify-center md:justify-start",
					title: "text-center md:text-left",
				};
			case 1:
			case 2:
			default:
				return {
					wrapper:
						"absolute left-1/2 bottom-24 sm:bottom-32 md:bottom-12 -translate-x-1/2 text-center items-center px-4 md:px-0",
					button: "justify-center",
					title: "text-center",
				};
		}
	}, [currentSlide]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 10000);

		return () => clearInterval(interval);
	}, [slides.length]);

	// const goToSlide = (index) => {
	// 	setCurrentSlide((index + slides.length) % slides.length);
	// };

	const slide = slides[currentSlide];

	return (
		<section
			className="relative flex h-screen overflow-hidden text-white bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
			style={{
				backgroundImage: `url(${slide.image})`,
			}}
		>
			<div className="absolute bg-black inset-0 bg-pattern opacity-50"></div>
			<div className="relative container-xl flex flex-1 py-16 md:py-20">
				<div className={`flex w-full md:max-w-4xl flex-col gap-6 ${position.wrapper}`}>
					<h1 className={`text-3xl font-display font-bold text-balance ${position.title}`}>
						{slide.subtitle}
					</h1>

					<div
						className={`flex flex-col sm:flex-row gap-4 items-center ${position.button}`}
					>
						<Link
							to="/contact"
							className="btn-lg bg-primary-600 font-semibold inline-flex items-center text-white hover:bg-primary-600 hover:ring-4 hover:ring-offset-2 hover:ring-primary-200 hover:ring-opacity-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
						>
							Contactez-nous
						</Link>
					</div>
				</div>

				{/* Contrôles du carrousel */}
				{/* <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-6">
					<button
						type="button"
						onClick={() => goToSlide(currentSlide - 1)}
						className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
						aria-label="Slide précédent"
					>
						<ChevronLeft className="h-6 w-6" />
					</button>
					<div className="flex items-center gap-3">
						{slides.map((item, index) => (
							<button
								key={item.id}
								type="button"
								onClick={() => goToSlide(index)}
								className={`h-2 rounded-full transition-all duration-300 ${
									index === currentSlide
										? "w-10 bg-white"
										: "w-4 bg-white/40 hover:bg-white/70"
								}`}
								aria-label={`Aller au slide ${index + 1}`}
							/>
						))}
					</div>
					<button
						type="button"
						onClick={() => goToSlide(currentSlide + 1)}
						className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition"
						aria-label="Slide suivant"
					>
						<ChevronRight className="h-6 w-6" />
					</button>
				</div> */}

				{/* Lien vers la section vidéo en bas à droite */}
				<div className="absolute bottom-6 right-4 md:bottom-10 md:right-10">
					<a
						href="#why-harvests"
						onClick={(e) => {
							e.preventDefault();
							document.getElementById("why-harvests")?.scrollIntoView({
								behavior: "smooth",
								block: "start",
							});
						}}
						className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						<span className="mr-2">Pourquoi choisir Harvests ?</span>
						<ArrowRight className="h-4 w-4" />
					</a>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
