import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ShieldCheck, Truck, Sprout, ShoppingBag, Store, ChevronRight, Building2, Award, UtensilsCrossed } from "lucide-react";
import heroBg1 from "../../assets/images/herobgcar1.webp";
import heroBg2 from "../../assets/images/herobgcar2.webp";
import heroBg3 from "../../assets/images/herobgcar3.webp";
import heroBg4 from "../../assets/images/herobgcar4.webp";

const HeroSection = () => {
	const { t } = useTranslation("public");
	const [currentSlide, setCurrentSlide] = useState(0);

	const slideMeta = [
		{ id: 0, image: heroBg1, icon: Award },
		{ id: 1, image: heroBg2, icon: Building2 },
		{ id: 2, image: heroBg3, icon: Store },
		{ id: 3, image: heroBg4, icon: Truck }
	];
	const slideContent = t("home.hero.slides", { returnObjects: true });
	const slides = slideMeta.map((meta, i) => ({ ...meta, ...slideContent[i] }));

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [slides.length]);

	const stakeholderMeta = [
		{ id: "farmers", href: "/producteurs", icon: Sprout, badge: "CF Grower", gradient: "from-[#1A5514] to-[#2E8B22]", bgLight: "bg-[#F3F8F2]", textColor: "text-[#1A5514]" },
		{ id: "buyers", href: "/products", icon: ShoppingBag, badge: "CF Buyer", gradient: "from-[#004D40] to-[#00897B]", bgLight: "bg-[#E0F2F1]", textColor: "text-[#004D40]" },
		{ id: "storefront", href: "/transformers", icon: Store, badge: "CF Storefront", gradient: "from-[#B78103] to-[#E6A100]", bgLight: "bg-[#FFFDE7]", textColor: "text-[#855D00]" },
		{ id: "restaurateurs", href: "/restaurateurs", icon: UtensilsCrossed, badge: "CF Kitchen", gradient: "from-[#1E3A8A] to-[#3B82F6]", bgLight: "bg-[#EFF6FF]", textColor: "text-[#1E3A8A]" }
	];
	const stakeholderContent = t("home.hero.stakeholders", { returnObjects: true });
	const stakeholderCards = stakeholderMeta.map((meta, i) => ({ ...meta, ...stakeholderContent[i] }));

	return (
		<section className="relative bg-[#F8FAF6] pt-0 pb-12 lg:pb-16 overflow-hidden">
			{/* Décoration d'arrière-plan */}
			<div className="absolute top-0 right-0 w-1/3 h-96 bg-gradient-to-l from-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

			{/* Zone d'en-tête Hero avec Carrousel d'Images (100vh sur mobile) */}
			<div className="relative mb-12 lg:mb-16 min-h-[calc(100vh-105px)] lg:min-h-[525px] flex items-center">
				{/* Carrousel d'images de droite (50% largeur & 100% hauteur sans py) */}
				<div className="absolute top-0 bottom-0 right-0 w-full lg:w-1/2 h-full z-0 overflow-hidden">
					{slides.map((slide, index) => (
						<img
							key={slide.id}
							src={slide.image}
							alt={slide.badge}
							className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
								index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
							}`}
						/>
					))}

					{/* Fondu subtil uniquement sur desktop (caché sur mobile) */}
					<div className="hidden lg:block absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-[#F8FAF6] via-[#F8FAF6]/50 to-transparent z-10 pointer-events-none" />

					{/* Assombrissement de l'image uniquement sur mobile (< lg) */}
					<div className="absolute inset-0 bg-black/60 lg:bg-transparent z-10 pointer-events-none" />

					{/* Badge d'information dynamique avec indicateurs de carrousel (visible uniquement à partir de md) */}
					<div className="absolute bottom-6 right-6 lg:right-12 z-20 hidden md:block bg-black/45 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white max-w-xs shadow-xl transition-all duration-500">
						<div className="flex items-center gap-1.5 mb-1">
							{React.createElement(slides[currentSlide].icon, { className: "w-4 h-4 text-emerald-400 flex-shrink-0" })}
							<span className="text-[10px] whitespace-nowrap uppercase tracking-widest text-emerald-300 font-extrabold block">
								{slides[currentSlide].badge}
							</span>
						</div>
						<p className="text-xs font-semibold opacity-95 leading-snug">
							{slides[currentSlide].caption}
						</p>

						{/* Indicateurs de diapositive (Puces) */}
						<div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/20">
							{slides.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setCurrentSlide(idx)}
									className={`h-1.5 rounded-full transition-all duration-300 ${
										idx === currentSlide ? "w-6 bg-[#31BC2E]" : "w-1.5 bg-white/40 hover:bg-white/70"
									}`}
									aria-label={t("home.hero.slideLabel", { n: idx + 1 })}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Contenu Texte à gauche */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
					<div className="w-full lg:w-1/2 space-y-5 pr-0 lg:pr-8">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white lg:text-[#161D14] tracking-tight leading-tight">
							{t("home.hero.title1")} <br className="hidden sm:inline" />
							<span className="text-emerald-400 lg:text-[#1A5514] lg:bg-gradient-to-r lg:from-[#1A5514] lg:to-[#31BC2E] lg:bg-clip-text lg:text-transparent">
								{t("home.hero.titleHighlight")}
							</span>
						</h1>
						<p className="text-base sm:text-lg text-gray-200 lg:text-gray-600 max-w-lg leading-relaxed">
							{t("home.hero.subtitle")}
						</p>
						<div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3.5">
							<Link
								to="/products"
								className="w-full whitespace-nowrap sm:w-auto px-6 py-3.5 rounded-full bg-[#1A5514] hover:bg-[#144210] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
							>
								{t("home.hero.ctaPrimary")}
								<ArrowUpRight className="w-5 h-5" />
							</Link>
							<Link
								to="/register"
								className="w-full whitespace-nowrap sm:w-auto px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#1A5514] border border-emerald-600/30 font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
							>
								{t("home.hero.ctaSecondary")}
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

				{/* 4 Role-Based Stakeholder Cards (Complete Farmer Style Grid) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
					{stakeholderCards.map((card) => {
						const Icon = card.icon;
						return (
							<Link
								key={card.id}
								to={card.href}
								className={`group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-200/80 bg-white overflow-hidden flex flex-col justify-between`}
							>
								{/* Overlay Gradient on Hover */}
								<div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${card.gradient}`} />

								<div className="relative z-10 space-y-3">
									<div className="flex items-center justify-between">
										<div className={`p-3 rounded-xl ${card.bgLight} group-hover:bg-white/20 transition-colors`}>
											<Icon className={`w-6 h-6 ${card.textColor} group-hover:text-white transition-colors`} />
										</div>
										<span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 group-hover:bg-white/20 group-hover:text-white transition-colors">
											{card.badge}
										</span>
									</div>
									<h3 className="text-base font-bold text-[#161D14] group-hover:text-white transition-colors">
										{card.title}
									</h3>
									<p className="text-xs text-gray-600 group-hover:text-white/90 transition-colors leading-relaxed">
										{card.subtitle}
									</p>
								</div>

								<div className="relative z-10 pt-4 mt-2 border-t border-gray-100 group-hover:border-white/20 flex items-center justify-between font-bold text-xs text-[#1A5514] group-hover:text-white transition-colors">
									<span>{card.cta}</span>
									<ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default HeroSection;

