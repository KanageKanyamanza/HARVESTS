import SEOHead from "../components/seo/SEOHead";
import HeroSection from "../components/home/HeroSection";
import TrustBadgesSection from "../components/home/TrustBadgesSection";
import CategoriesSection from "../components/home/CategoriesSection";
import FlashSalesSection from "../components/home/FlashSalesSection";
import TopSellersSection from "../components/home/TopSellersSection";
import RegionalPavilionSection from "../components/home/RegionalPavilionSection";
import ProductsSection from "../components/home/ProductsSection";
import BecomeSellerBanner from "../components/home/BecomeSellerBanner";
// import LogisticsPartnersSection from "../components/home/LogisticsPartnersSection";
import BannersSection from "../components/home/BannersSection";
import DiscountBannerSection from "../components/home/DiscountBannerSection";
import LoyaltyProgramSection from "../components/home/LoyaltyProgramSection";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection";

const Home = () => {
	return (
		<div className="overflow-hidden bg-white">
			<SEOHead />
			<HeroSection />
			<TrustBadgesSection />
			<FlashSalesSection />
			<CategoriesSection />
			<TopSellersSection />
			<RegionalPavilionSection />
			<FeaturedProductsSection />
			<ProductsSection />
			<BannersSection />
			<BecomeSellerBanner />
			<DiscountBannerSection />
			<LoyaltyProgramSection />
			{/* <LogisticsPartnersSection /> */}
		</div>
	);
};

export default Home;
