import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/home/HeroSection';
import TrustBadgesSection from '../components/home/TrustBadgesSection';
import CategoriesSection from '../components/home/CategoriesSection';
import ProductsSection from '../components/home/ProductsSection';
import LogisticsPartnersSection from '../components/home/LogisticsPartnersSection';
import BannersSection from '../components/home/BannersSection';
import DiscountBannerSection from '../components/home/DiscountBannerSection';
import LoyaltyProgramSection from '../components/home/LoyaltyProgramSection';
import FeaturedProductsSection from '../components/home/FeaturedProductsSection';

const Home = () => {
  const baseUrl = (import.meta.env.VITE_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '') || '').replace(/\/$/, '');
  const canonicalUrl = `${baseUrl || 'https://www.harvests.site'}/`;

  return (
    <div className="overflow-hidden bg-harvests-light">
      <Helmet>
        <title>Harvests | Marketplace agroalimentaire et logistique</title>
        <meta name="description" content="Commandez des produits frais, travaillez avec des producteurs locaux et profitez d'une logistique fiable avec Harvests." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Harvests | Marketplace agroalimentaire et logistique" />
        <meta property="og:description" content="Plateforme complète pour producteurs, restaurateurs et transporteurs. Circuits courts et livraisons rapides." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${baseUrl || 'https://www.harvests.site'}/logo.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Harvests | Marketplace agroalimentaire et logistique" />
        <meta name="twitter:description" content="Produits frais, circuits courts et logistique fiable pour tous les acteurs de la chaîne alimentaire." />
        <meta name="twitter:image" content={`${baseUrl || 'https://www.harvests.site'}/logo.png`} />
      </Helmet>
      <HeroSection />
      <TrustBadgesSection />
      <CategoriesSection />
      <ProductsSection />
      <BannersSection />
      <DiscountBannerSection />
      <LoyaltyProgramSection />
      <FeaturedProductsSection />
      <LogisticsPartnersSection />
    </div>
  );
};

export default Home;
