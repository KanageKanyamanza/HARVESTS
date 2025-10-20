import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroBg from "../../assets/images/herobg.jpg";

const HeroSection = () => {
	return (
		<section
			className="relative h-screen text-white bg-cover bg-center bg-no-repeat content-center justify-center items-center"
			style={{
				backgroundImage: `url(${heroBg})`,
			}}
		>
			<div className="absolute bg-black inset-0 bg-pattern opacity-50"></div>
			<div className="relative container-xl py-20 lg:pt-24 lg:pb-32 text-center">
				<div className=" text-center">
					<h1 className="text-4xl sm:text-6xl font-display font-bold mb-6 text-balance">
						Your Harvests
						<br />
						Your Future
					</h1>
					<p className="text-2xl sm:text-2xl mb-8 text-white/90 text-balance">
						Your farm’s window to global markets
						<br />
						La vitrine digitale de vos récoltes
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Link
							to="/contact"
							className="btn-lg bg-primary-600 font-semibold inline-flex items-center text-white hover:bg-primary-600 hover:ring-4 hover:ring-offset-2 hover:ring-primary-200 hover:ring-opacity-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out"
						>
							Contactez-nous
						</Link>
					</div>
				</div>

				{/* Lien vers la section vidéo en bas à droite */}
				<div className="absolute -bottom-16 right-0 md:bottom-8 md:right-8">
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
