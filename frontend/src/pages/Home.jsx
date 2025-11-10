import React from 'react';
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
  return (
    <div className="overflow-hidden bg-harvests-light">
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
