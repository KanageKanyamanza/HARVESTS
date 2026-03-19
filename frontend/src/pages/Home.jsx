import SEOHead from "../components/seo/SEOHead";
import HeroSection from "../components/home/HeroSection";
import TrustBadgesSection from "../components/home/TrustBadgesSection";
import CategoriesSection from "../components/home/CategoriesSection";
import ProductsSection from "../components/home/ProductsSection";
import LogisticsPartnersSection from "../components/home/LogisticsPartnersSection";
import BannersSection from "../components/home/BannersSection";
import DiscountBannerSection from "../components/home/DiscountBannerSection";
import LoyaltyProgramSection from "../components/home/LoyaltyProgramSection";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection";

const Home = () => {
	return (
		<div className="overflow-hidden bg-harvests-light">
			<SEOHead />
			<HeroSection />
			<TrustBadgesSection />
			<CategoriesSection />
			<FeaturedProductsSection />
			<ProductsSection />
			<BannersSection />
			<DiscountBannerSection />
			<LoyaltyProgramSection />
			<LogisticsPartnersSection />
		</div>
	);
};

export default Home;
