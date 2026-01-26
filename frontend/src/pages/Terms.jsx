import React from "react";
import Layout from "../components/layout/Layout";

const Terms = () => {
	const lastUpdated = "26 novembre 2025";

	return (
		<Layout>
			<div className="min-h-screen py-12 md:py-20">
				<div className="container-xl">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="text-center mb-12">
							<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Conditions Générales d'Utilisation
							</h1>
							<p className="text-gray-500">
								Dernière mise à jour : {lastUpdated}
							</p>
						</div>

						{/* Content */}
						<div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 prose prose-gray max-w-none">
							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									1. Acceptation des conditions
								</h2>
								<p className="text-gray-600 leading-relaxed">
									En accédant et en utilisant la plateforme Harvests, vous
									acceptez d'être lié par les présentes Conditions Générales
									d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez
									ne pas utiliser notre plateforme.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									2. Description du service
								</h2>
								<p className="text-gray-600 leading-relaxed mb-4">
									Harvests est une plateforme de marché en ligne qui met en
									relation :
								</p>
								<ul className="list-disc list-inside text-gray-600 space-y-2">
									<li>Les producteurs agricoles et leurs produits</li>
									<li>Les transformateurs et leurs produits transformés</li>
									<li>Les restaurateurs et leurs plats</li>
									<li>
										Les consommateurs à la recherche de produits frais et locaux
									</li>
									<li>Les transporteurs pour la livraison des commandes</li>
								</ul>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									3. Inscription et compte utilisateur
								</h2>
								<p className="text-gray-600 leading-relaxed mb-4">
									Pour utiliser certaines fonctionnalités de Harvests, vous
									devez créer un compte. Vous vous engagez à :
								</p>
								<ul className="list-disc list-inside text-gray-600 space-y-2">
									<li>
										Fournir des informations exactes et complètes lors de
										l'inscription
									</li>
									<li>
										Maintenir la confidentialité de vos identifiants de
										connexion
									</li>
									<li>
										Être responsable de toutes les activités effectuées sous
										votre compte
									</li>
									<li>
										Nous informer immédiatement de toute utilisation non
										autorisée
									</li>
								</ul>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									4. Obligations des vendeurs
								</h2>
								<p className="text-gray-600 leading-relaxed mb-4">
									Les vendeurs (producteurs, transformateurs, restaurateurs)
									s'engagent à :
								</p>
								<ul className="list-disc list-inside text-gray-600 space-y-2">
									<li>
										Proposer des produits conformes aux descriptions et images
									</li>
									<li>
										Respecter les normes d'hygiène et de sécurité alimentaire
									</li>
									<li>Honorer les commandes dans les délais annoncés</li>
									<li>
										Répondre aux réclamations des clients de manière
										professionnelle
									</li>
									<li>
										Disposer de toutes les autorisations légales nécessaires
									</li>
								</ul>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									5. Obligations des acheteurs
								</h2>
								<p className="text-gray-600 leading-relaxed mb-4">
									Les acheteurs s'engagent à :
								</p>
								<ul className="list-disc list-inside text-gray-600 space-y-2">
									<li>Fournir des informations de livraison exactes</li>
									<li>Effectuer les paiements dans les délais impartis</li>
									<li>Réceptionner les commandes aux créneaux convenus</li>
									<li>
										Signaler tout problème dans les 48 heures suivant la
										réception
									</li>
								</ul>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									6. Paiements et commissions
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Harvests prélève une commission sur chaque transaction
									effectuée sur la plateforme. Les taux de commission sont
									communiqués aux vendeurs lors de leur inscription ou via leur
									plan de souscription. Les paiements sont sécurisés et traités
									par nos partenaires de paiement agréés (Orange Money, Wave,
									PayPal, Cartes Bancaires).
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									7. Annulation et remboursement
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Les conditions d'annulation et de remboursement varient selon
									le type de produit et le moment de l'annulation. En général,
									une commande peut être annulée sans frais tant qu'elle n'a pas
									été préparée ou expédiée. Les remboursements sont traités sous
									5 à 10 jours ouvrés.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									8. Propriété intellectuelle
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Tous les contenus présents sur Harvests (logos, textes,
									images, logiciels) sont protégés par le droit de la propriété
									intellectuelle. Toute reproduction ou utilisation non
									autorisée est interdite.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									9. Limitation de responsabilité
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Harvests agit en tant qu'intermédiaire entre vendeurs et
									acheteurs. Nous ne sommes pas responsables de la qualité des
									produits vendus, des retards de livraison imputables aux
									vendeurs ou transporteurs, ni des litiges entre utilisateurs.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									10. Modification des conditions
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Harvests se réserve le droit de modifier ces conditions à tout
									moment. Les utilisateurs seront informés des modifications par
									email ou notification sur la plateforme. L'utilisation
									continue de la plateforme après modification vaut acceptation
									des nouvelles conditions.
								</p>
							</section>

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									11. Contact
								</h2>
								<p className="text-gray-600 leading-relaxed">
									Pour toute question concernant ces conditions, contactez-nous
									à :<br />
									Email : contact@harvests.site
									<br />
									Téléphone : +221 771970713 / +221 774536704
								</p>
							</section>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Terms;
