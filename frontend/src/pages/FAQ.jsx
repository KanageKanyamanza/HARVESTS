import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Layout from "../components/layout/Layout";

const FAQ = () => {
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
		{
			category: "Général",
			questions: [
				{
					q: "Qu'est-ce que Harvests ?",
					a: "Harvests est une plateforme de marché digitale qui connecte les producteurs agricoles africains aux consommateurs, restaurateurs et autres acheteurs. Nous facilitons l'achat de produits frais directement auprès des producteurs locaux.",
				},
				{
					q: "Dans quels pays Harvests est-il disponible ?",
					a: "Harvests est actuellement disponible au Sénégal et s'étend progressivement à d'autres pays africains. Consultez notre site pour les mises à jour sur notre expansion.",
				},
				{
					q: "Comment puis-je contacter le support ?",
					a: "Vous pouvez nous contacter par email à contact@harvests.site, par téléphone au +221 771970713 ou +221 774536704, ou via notre page de contact sur le site.",
				},
			],
		},
		{
			category: "Compte & Inscription",
			questions: [
				{
					q: "Comment créer un compte ?",
					a: "Cliquez sur 'Inscription' en haut de la page, choisissez votre type de compte (consommateur, producteur, restaurateur, etc.), remplissez le formulaire et validez votre email.",
				},
				{
					q: "Quels types de comptes sont disponibles ?",
					a: "Nous proposons plusieurs types de comptes : Consommateur (pour acheter), Producteur (pour vendre des produits agricoles), Transformateur (pour vendre des produits transformés), Restaurateur (pour vendre des plats), et Transporteur (pour livrer).",
				},
				{
					q: "J'ai oublié mon mot de passe, que faire ?",
					a: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions envoyées pour réinitialiser votre mot de passe.",
				},
			],
		},
		{
			category: "Commandes & Livraison",
			questions: [
				{
					q: "Comment passer une commande ?",
					a: "Parcourez les produits, ajoutez-les à votre panier, puis procédez au paiement. Vous pouvez choisir votre mode de livraison et suivre votre commande depuis votre tableau de bord.",
				},
				{
					q: "Quels sont les frais de livraison ?",
					a: "Les frais de livraison sont calculés en fonction de la distance et du poids. Ils sont offerts pour toute commande supérieure à 50 000 FCFA (selon le plan du vendeur).",
				},
				{
					q: "Quels sont les délais de livraison ?",
					a: "Les délais varient selon votre localisation et le producteur. En général, comptez 1 à 3 jours pour les zones urbaines. Les délais exacts sont indiqués lors de la commande.",
				},
				{
					q: "Puis-je annuler ma commande ?",
					a: "Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée. Rendez-vous dans 'Mes Commandes' et cliquez sur 'Annuler'. Après expédition, contactez le support.",
				},
			],
		},
		{
			category: "Paiement",
			questions: [
				{
					q: "Quels modes de paiement acceptez-vous ?",
					a: "Nous acceptons les paiements par Mobile Money (Orange Money, Wave, Free Money), cartes bancaires (Visa, Mastercard) et PayPal.",
				},
				{
					q: "Mes paiements sont-ils sécurisés ?",
					a: "Oui, tous les paiements sont sécurisés et cryptés. Nous utilisons des protocoles de sécurité standards pour protéger vos informations financières.",
				},
				{
					q: "Comment obtenir un remboursement ?",
					a: "En cas de problème avec votre commande, contactez le support dans les 48h. Après vérification, le remboursement sera effectué sous 5 à 10 jours ouvrés.",
				},
			],
		},
		{
			category: "Vendeurs",
			questions: [
				{
					q: "Comment devenir vendeur sur Harvests ?",
					a: "Créez un compte vendeur (producteur, transformateur ou restaurateur), complétez votre profil avec vos informations et documents requis, puis soumettez votre demande de validation.",
				},
				{
					q: "Quels sont les frais pour les vendeurs ?",
					a: "Harvests prélève une commission sur chaque vente. Les taux varient selon le type de compte et le volume de ventes. Consultez nos plans tarifaires pour plus de détails.",
				},
				{
					q: "Comment gérer mes produits ?",
					a: "Depuis votre tableau de bord vendeur, vous pouvez ajouter, modifier ou supprimer vos produits, gérer vos stocks et suivre vos commandes.",
				},
			],
		},
	];

	const toggleQuestion = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<Layout>
			<div className="min-h-screen py-12 md:py-20">
				<div className="container-xl">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Questions Fréquentes
						</h1>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Trouvez rapidement des réponses à vos questions. Si vous ne
							trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
						</p>
					</div>

					{/* FAQ Sections */}
					<div className="max-w-3xl mx-auto space-y-8">
						{faqs.map((section, sectionIndex) => (
							<div
								key={sectionIndex}
								className="bg-white rounded-2xl shadow-sm overflow-hidden"
							>
								<h2 className="text-lg font-semibold text-white bg-primary-600 px-6 py-4">
									{section.category}
								</h2>
								<div className="divide-y divide-gray-100">
									{section.questions.map((faq, qIndex) => {
										const index = `${sectionIndex}-${qIndex}`;
										const isOpen = openIndex === index;
										return (
											<div
												key={qIndex}
												className="border-b border-gray-100 last:border-0"
											>
												<button
													onClick={() => toggleQuestion(index)}
													className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
												>
													<span className="font-medium text-gray-900 pr-4">
														{faq.q}
													</span>
													{isOpen ?
														<ChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
													:	<ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
													}
												</button>
												{isOpen && (
													<div className="px-6 pb-4 text-gray-600 leading-relaxed">
														{faq.a}
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>

					{/* Contact CTA */}
					<div className="mt-12 text-center">
						<p className="text-gray-600 mb-4">
							Vous n'avez pas trouvé la réponse à votre question ?
						</p>
						<a
							href="/contact"
							className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
						>
							Contactez-nous
						</a>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default FAQ;
