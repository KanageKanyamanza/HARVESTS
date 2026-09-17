// Jour 36 (garde-fous CI) — liste des fichiers déjà migrés vers i18next
// (useTranslation) et donc censés ne plus contenir de texte français codé en
// dur. À compléter au fil de l'eau à chaque jour de migration (Jours 37+) :
// un fichier qui sort de cette liste sans être réellement migré perd sa
// protection contre la dette de traduction.
export const MIGRATED_FILES = [
	"hooks/useSEO.js",
	"pages/BlogPage.jsx",
	"pages/BlogDetailPage.jsx",
	"components/blog/BlogVisitorModal.jsx",
	"pages/blogDetail/blogUtils.js",
	"pages/blogDetail/BlogHeader.jsx",
	"pages/blogDetail/BlogSidebar.jsx",
	"pages/blogDetail/BlogContent.jsx",
	"components/home/HeroSection.jsx",
	"components/home/TrustBadgesSection.jsx",
	"components/home/CategoriesSection.jsx",
	"components/home/FlashSalesSection.jsx",
	"components/home/TopSellersSection.jsx",
	"components/home/RegionalPavilionSection.jsx",
	"components/home/FeaturedProductsSection.jsx",
	"components/home/ProductsSection.jsx",
	"components/home/BecomeSellerBanner.jsx",
	"components/home/BannersSection.jsx",
	"components/home/DiscountBannerSection.jsx",
	"components/home/LoyaltyProgramSection.jsx",
	"components/layout/Header.jsx",
	"components/layout/Footer.jsx",
	"components/products/ProductCard.jsx",
	"components/products/ProductFilters.jsx",
	"components/products/ProductPagination.jsx",
	"pages/Products.jsx",
	"components/home/VendorsNewsTicker.jsx",
];
