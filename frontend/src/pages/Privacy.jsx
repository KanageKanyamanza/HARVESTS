import React from 'react';
import Layout from '../components/layout/Layout';

const Privacy = () => {
  const lastUpdated = '26 novembre 2025';

  return (
    <Layout>
      <div className="min-h-screen py-12 md:py-20">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Politique de Confidentialité
              </h1>
              <p className="text-gray-500">
                Dernière mise à jour : {lastUpdated}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Chez Harvests, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. Données collectées</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nous collectons les types de données suivants :
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Données d'identification</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale</li>
                </ul>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Données de transaction</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>Historique des commandes</li>
                  <li>Informations de paiement (cryptées)</li>
                  <li>Adresses de livraison</li>
                </ul>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Données techniques</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Données de navigation (cookies)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Utilisation des données</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Traiter vos commandes et paiements</li>
                  <li>Assurer la livraison de vos produits</li>
                  <li>Vous envoyer des notifications sur vos commandes</li>
                  <li>Améliorer nos services et votre expérience utilisateur</li>
                  <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                  <li>Prévenir la fraude et assurer la sécurité</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Partage des données</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nous pouvons partager vos données avec :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Les vendeurs</strong> : pour le traitement de vos commandes</li>
                  <li><strong>Les transporteurs</strong> : pour la livraison de vos produits</li>
                  <li><strong>Les prestataires de paiement</strong> : pour le traitement sécurisé des transactions</li>
                  <li><strong>Les autorités légales</strong> : si requis par la loi</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Sécurité des données</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données : chiffrement SSL/TLS, stockage sécurisé, accès restreint aux données, et audits de sécurité réguliers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. Conservation des données</h2>
                <p className="text-gray-600 leading-relaxed">
                  Vos données sont conservées pendant la durée de votre utilisation de nos services et pour une période supplémentaire conformément aux obligations légales (généralement 5 ans pour les données de transaction). Vous pouvez demander la suppression de votre compte et de vos données à tout moment.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Nous utilisons des cookies pour :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance</strong> : pour analyser l'utilisation du site</li>
                  <li><strong>Cookies de préférence</strong> : pour mémoriser vos choix</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. Vos droits</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conformément à la réglementation applicable, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                  <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retrait du consentement</strong> : retirer votre consentement à tout moment</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. Modifications</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nous pouvons mettre à jour cette politique de confidentialité. Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. Contact</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous :<br />
                  Email : contact@harvests.site<br />
                  Téléphone : +221 771970713 / +221 774536704<br />
                  Adresse : Dakar, Sénégal
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;

