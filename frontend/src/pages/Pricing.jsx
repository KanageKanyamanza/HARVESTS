import React from "react";
import {
	FiCheck,
	FiX,
	FiStar,
	FiTrendingUp,
	FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Pricing = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const plans = [
		{
			id: "gratuit",
			name: "Gratuit",
			subtitle: "Découverte",
			icon: <FiStar className="w-8 h-8" />,
			monthlyPrice: 0,
			annualPrice: 0,
			description:
				"Idéal pour les producteurs débutants souhaitant tester la plateforme sans engagement.",
			features: [
				{ text: "Création de compte vendeur simple", included: true },
				{ text: "Mise en ligne de 2 à 5 produits maximum", included: true },
				{ text: "Profil vendeur (nom, localisation, contact)", included: true },
				{ text: "Accès aux messages entrants de clients", included: true },
				{ text: "Visibilité standard (pas de mise en avant)", included: true },
				{ text: "Assistance via WhatsApp (non prioritaire)", included: true },
				{ text: "Page boutique", included: false },
				{ text: "Badge confiance", included: false },
				{ text: "Mise en avant", included: false },
				{ text: "Statistiques", included: false },
				{ text: "Accès B2B", included: false },
				{ text: "Support prioritaire", included: false },
			],
			cta: "Créer mon compte",
			ctaLink: "/register",
			paymentLink: "/payment/subscription/gratuit",
			color: "gray",
		},
		{
			id: "standard",
			name: "Standard",
			subtitle: "Professionnel",
			icon: <FiTrendingUp className="w-8 h-8" />,
			monthlyPrice: 3000,
			annualPrice: 25000,
			description:
				"Idéal pour les petits producteurs, coopératives ou transformateurs souhaitant développer leur visibilité et leurs ventes.",
			features: [
				{ text: "Mise en ligne de 20 à 30 produits", included: true },
				{
					text: "Fiche boutique personnalisée avec logo et galerie photos",
					included: true,
				},
				{ text: "Statistiques de consultation basiques", included: true },
				{
					text: "Mise en avant ponctuelle dans les catégories",
					included: true,
				},
				{ text: 'Badge "Producteur certifié"', included: true },
				{ text: "Accès illimité aux commandes et messages", included: true },
				{ text: "Support prioritaire via WhatsApp", included: true },
				{ text: "Produits illimités", included: false },
				{ text: "Mise en avant sur page d'accueil", included: false },
				{ text: "Statistiques avancées", included: false },
				{ text: "URL personnalisée", included: false },
				{ text: "Support VIP", included: false },
			],
			cta: "Choisir Standard",
			ctaLink: "/register",
			paymentLink: "/payment/subscription/standard",
			color: "green",
			popular: false,
		},
		{
			id: "premium",
			name: "Premium",
			subtitle: "Export & Croissance",
			icon: <FiZap className="w-8 h-8" />,
			monthlyPrice: 10000,
			annualPrice: 75000,
			description:
				"Idéal pour les producteurs structurés, coopératives sérieuses, distributeurs et exportateurs.",
			features: [
				{ text: "Produits illimités sur la boutique", included: true },
				{
					text: "Badge de confiance et certification officielle",
					included: true,
				},
				{
					text: "Mise en avant sur la page d'accueil et les réseaux HARVESTS",
					included: true,
				},
				{
					text: "Accès aux acheteurs B2B, hôtels, restaurants, exportateurs",
					included: true,
				},
				{
					text: "Statistiques avancées de ventes et de consultations",
					included: true,
				},
				{ text: "Page boutique avec URL personnalisée", included: true },
				{ text: "Accès aux campagnes sponsorisées et salons", included: true },
				{
					text: "Support dédié (WhatsApp, e-mail et téléphone)",
					included: true,
				},
			],
			cta: "Choisir Premium",
			ctaLink: "/register",
			paymentLink: "/payment/subscription/premium",
			color: "emerald",
			popular: true,
		},
	];

	const comparisonTable = [
		{
			feature: "Produits publiables",
			gratuit: "2–5",
			standard: "20–30",
			premium: "Illimité",
		},
		{
			feature: "Page boutique",
			gratuit: "Basique",
			standard: "Personnalisée",
			premium: "Premium avec url",
		},
		{
			feature: "Badge confiance",
			gratuit: "Non",
			standard: "Oui",
			premium: "Oui + Label",
		},
		{
			feature: "Mise en avant",
			gratuit: "Non",
			standard: "Oui (catégories)",
			premium: "Oui (Page Home + pubs)",
		},
		{
			feature: "Statistiques",
			gratuit: "Non",
			standard: "Basiques",
			premium: "Avancées",
		},
		{
			feature: "Accès B2B",
			gratuit: "Limité",
			standard: "Moyen",
			premium: "Prioritaire",
		},
		{
			feature: "Communications",
			gratuit: "Oui",
			standard: "Prioritaire",
			premium: "Support VIP",
		},
	];

	const recommendations = [
		{ profile: "Agriculteur individuel", plan: "Gratuit ou Standard" },
		{ profile: "Coopérative", plan: "Standard ou Premium" },
		{ profile: "Transformateur", plan: "Premium" },
		{ profile: "Exportateur", plan: "Premium" },
		{
			profile: "Institution / grossiste",
			plan: "Premium Pro (adapté à la demande)",
		},
	];

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR").format(price);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							Grille Tarifaire
						</h1>
						<p className="text-xl md:text-2xl mb-2 opacity-90">
							Découvrez nos formules pour producteurs et coopératives
						</p>
						<p className="text-lg opacity-80 max-w-2xl mx-auto">
							HARVESTS accompagne les acteurs du secteur agricole à chaque étape
							de leur croissance. Choisissez le plan qui correspond à vos
							besoins et développez votre visibilité dès aujourd'hui.
						</p>
					</div>
				</div>
			</div>

			{/* Pricing Cards */}
			<div className="container mx-auto px-4 py-16">
				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{plans.map((plan) => (
						<div
							key={plan.id}
							className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
								plan.popular ? "ring-4 ring-emerald-500 ring-opacity-50" : ""
							}`}
						>
							{plan.popular && (
								<div className="absolute rounded-bl-lg top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-semibold">
									Populaire
								</div>
							)}

							<div
								className={`p-4 bg-gradient-to-br ${
									plan.color === "gray"
										? "from-gray-100 to-gray-200"
										: plan.color === "green"
										? "from-green-50 to-green-100"
										: "from-emerald-50 to-emerald-100"
								}`}
							>
								<div className="flex items-center gap-4">
                <div
									className={`inline-flex p-4 rounded-full ${
										plan.color === "gray"
											? "bg-gray-300"
											: plan.color === "green"
											? "bg-green-200"
											: "bg-emerald-200"
									} text-${
										plan.color === "gray" ? "gray" : plan.color
									}-700 mb-4`}
								>
									{plan.icon}
								</div>

								<div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
								<p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
                </div>
                </div>

								<div className="mb-6">
									<div className="flex items-baseline">
										<span className="text-4xl font-bold">
											{plan.monthlyPrice === 0
												? "0"
												: formatPrice(plan.monthlyPrice)}
										</span>
										<span className="text-gray-600 ml-2">FCFA</span>
										<span className="text-gray-500 ml-2 text-sm">/mois</span>
									</div>
									{plan.monthlyPrice > 0 && (
										<div className="mt-2 text-sm text-gray-600">
											<span className="font-semibold">Annuel:</span>{" "}
											{formatPrice(plan.annualPrice)} FCFA
											{plan.annualPrice < plan.monthlyPrice * 12 && (
												<span className="text-green-600 ml-2">
													(remise{" "}
													{Math.round(
														(1 - plan.annualPrice / (plan.monthlyPrice * 12)) *
															100
													)}
													%)
												</span>
											)}
										</div>
									)}
								</div>

								<p className="text-gray-700 mb-6 text-sm">{plan.description}</p>

								<button
									onClick={() => {
										if (isAuthenticated && plan.paymentLink) {
											navigate(plan.paymentLink);
										} else {
											navigate(plan.ctaLink);
										}
									}}
									className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
										plan.color === "gray"
											? "bg-gray-600 text-white hover:bg-gray-700"
											: plan.color === "green"
											? "bg-green-600 text-white hover:bg-green-700"
											: "bg-emerald-600 text-white hover:bg-emerald-700"
									}`}
								>
									{isAuthenticated && plan.paymentLink
										? "Procéder au paiement"
										: plan.cta}
								</button>
							</div>

							<div className="p-6">
								<h4 className="font-semibold mb-4 text-gray-800">
									Fonctionnalités incluses:
								</h4>
								<ul className="space-y-3">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start">
											{feature.included ? (
												<FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
											) : (
												<FiX className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
											)}
											<span
												className={
													feature.included
														? "text-gray-700"
														: "text-gray-400 line-through"
												}
											>
												{feature.text}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Comparison Table */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-8">
						Grille de comparaison interactive
					</h2>
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="bg-green-600 text-white">
										<th className="px-6 py-4 text-left font-semibold">
											Fonctionnalités
										</th>
										<th className="px-6 py-4 text-center font-semibold">
											Gratuit
										</th>
										<th className="px-6 py-4 text-center font-semibold">
											Standard
										</th>
										<th className="px-6 py-4 text-center font-semibold">
											Premium
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="bg-gray-50">
										<td className="px-6 py-4 font-semibold">Prix mensuel</td>
										<td className="px-6 py-4 text-center">0</td>
										<td className="px-6 py-4 text-center">3 000 FCFA</td>
										<td className="px-6 py-4 text-center">10 000 FCFA</td>
									</tr>
									<tr>
										<td className="px-6 py-4 font-semibold">Prix annuel</td>
										<td className="px-6 py-4 text-center">0</td>
										<td className="px-6 py-4 text-center">25 000 FCFA</td>
										<td className="px-6 py-4 text-center">75 000 FCFA</td>
									</tr>
									{comparisonTable.map((row, index) => (
										<tr
											key={index}
											className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
										>
											<td className="px-6 py-4">{row.feature}</td>
											<td className="px-6 py-4 text-center">{row.gratuit}</td>
											<td className="px-6 py-4 text-center">{row.standard}</td>
											<td className="px-6 py-4 text-center font-semibold text-emerald-600">
												{row.premium}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* Recommendations */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-8">
						Par rapport à votre profil, nous vous recommandons :
					</h2>
					<div className="bg-white rounded-lg shadow-lg overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="bg-green-600 text-white">
									<th className="px-6 py-4 text-left font-semibold">Profil</th>
									<th className="px-6 py-4 text-left font-semibold">
										Plan recommandé
									</th>
								</tr>
							</thead>
							<tbody>
								{recommendations.map((rec, index) => (
									<tr
										key={index}
										className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
									>
										<td className="px-6 py-4 font-medium">{rec.profile}</td>
										<td className="px-6 py-4 text-emerald-600 font-semibold">
											{rec.plan}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Rejoignez la communauté HARVESTS dès aujourd'hui
					</h2>
					<p className="text-xl mb-8 opacity-90">
						Créez votre compte vendeur en quelques clics et commencez à
						valoriser vos produits.
					</p>
					<button
						onClick={() => {
							if (isAuthenticated) {
								navigate("/payment/subscription/standard");
							} else {
								navigate("/register");
							}
						}}
						className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
					>
						{isAuthenticated ? "Voir les plans" : "Je créé mon compte"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Pricing;
