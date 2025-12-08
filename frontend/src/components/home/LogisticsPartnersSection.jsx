import React from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiGlobe, FiArrowRight, FiPackage } from "react-icons/fi";

const stats = [
	{
		icon: <FiTruck className="h-6 w-6 text-harvests-green" />,
		label: "Transporteurs certifiés",
		value: "120+",
		description: "Réseau couvrant routes, rail et fret maritime.",
	},
	{
		icon: <FiGlobe className="h-6 w-6 text-harvests-green" />,
		label: "Destinations servies",
		value: "35 pays",
		description: "Exportations régulières vers l’Europe, l’Asie et l’Amérique.",
	},
	{
		icon: <FiPackage className="h-6 w-6 text-harvests-green" />,
		label: "Volumes expédiés",
		value: "18K tonnes",
		description: "Produits agricoles et transformés expédiés en 2024.",
	},
];

const LogisticsPartnersSection = () => {
	return (
		<section className="relative py-20 " data-aos="fade-up">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-harvests-light via-white to-transparent" />
			<div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
					<div className="space-y-6" data-aos="fade-right">
						<span className="inline-flex items-center px-3 py-1 rounded-full bg-harvests-light text-harvests-green font-semibold text-xs uppercase tracking-widest">
							Logistique intégrée
						</span>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900">
							Exportateurs & transporteurs : vos récoltes arrivent à bon port
						</h2>
						<p className="text-lg text-gray-600 leading-relaxed">
							Nous travaillons main dans la main avec des exportateurs
							expérimentés et des transporteurs spécialisés pour garantir la
							conservation des récoltes, la traçabilité des lots et le respect
							des délais de livraison. Harvests vous accompagne de la ferme
							jusqu’aux marchés internationaux.
						</p>
					</div>

					<div className="relative" data-aos="fade-left">
						<div className="absolute -inset-4 bg-harvests-light opacity-40 blur-2xl rounded-3xl" />
						<div className="relative bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
							{/* <div className="h-56 bg-[url('https://images.unsplash.com/photo-1546549037-47f0e96c77ec?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" /> */}
							<div className="p-3 sm:p-8 space-y-6">
								<div className="flex items-center gap-3">
									<span className="h-10 w-10 rounded-full bg-harvests-green text-white flex items-center justify-center">
										<FiTruck className="h-5 w-5" />
									</span>
									<div>
										<h3 className="text-xl font-semibold text-gray-900">
											Chaîne logistique Harvests
										</h3>
										<p className="text-sm text-gray-500">
											Collecte → Contrôle qualité → Douanes → Livraison finale
										</p>
									</div>
								</div>
								<ul className="space-y-4 text-sm text-gray-600">
									<li className="flex gap-3">
										<span className="text-harvests-green font-semibold">
											01
										</span>
										<span>
											<strong>Exportateurs spécialisés</strong> en produits
											agricoles frais, transformés et bio.
										</span>
									</li>
									<li className="flex gap-3">
										<span className="text-harvests-green font-semibold">
											02
										</span>
										<span>
											<strong>Transporteurs multimodaux</strong> assurant chaîne
											du froid et suivi en temps réel.
										</span>
									</li>
									<li className="flex gap-3">
										<span className="text-harvests-green font-semibold">
											03
										</span>
										<span>
											<strong>Formalités simplifiées</strong> grâce à nos
											équipes export et partenaires douaniers.
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="p-4 sm:p-6">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{stats.map((item, index) => (
						<div
							key={item.label}
							className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
							data-aos="fade-up"
							data-aos-delay={index * 100}
						>
							<div className="flex items-center gap-3">
								<span className="flex items-center justify-center h-10 w-10 rounded-full bg-harvests-light">
									{item.icon}
								</span>
								<div>
									<p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
										{item.label}
									</p>
									<p className="text-lg font-bold text-gray-900">
										{item.value}
									</p>
								</div>
							</div>
							<p className="mt-3 text-sm text-gray-500">{item.description}</p>
						</div>
					))}
				</div>
				<div className=" items-center gap-4 pt-4">
					<div className="flex justify-center p-4">
						<Link
							to="/logistics"
							className="inline-flex whitespace-nowrap items-center px-2 sm:px-5 py-3 rounded-md text-white bg-harvests-green hover:bg-green-700 transition-colors font-semibold"
						>
							Découvrir nos solutions logistiques
							<FiArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</div>
					<p className="text-sm text-gray-500">
						Une question ? Notre équipe support vous aide à préparer vos flux
						d’exportation.
					</p>
				</div>
			</div>
		</section>
	);
};

export default LogisticsPartnersSection;
