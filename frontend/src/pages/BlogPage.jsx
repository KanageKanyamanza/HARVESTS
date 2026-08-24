import React, {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogApiService } from "../services/blogService";
import SEOHead from "../components/seo/SEOHead";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CloudinaryImage from "../components/common/CloudinaryImage";
import { 
  FiSearch, FiCalendar, FiEye, FiHeart, FiTag, FiArrowRight, FiGrid, FiList, FiClock, FiShare2, FiX, FiCheck
} from "react-icons/fi";
import { BookOpen, Sparkles, TrendingUp, Newspaper } from "lucide-react";

// Fonction simple pour formater les dates
const formatDate = (dateString, language = "fr") => {
	if (!dateString) return "";
	const date = new Date(dateString);
	const options = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};
	return date.toLocaleDateString(
		language === "fr" ? "fr-FR" : "en-US",
		options,
	);
};

const BlogPage = () => {
	const { t, i18n } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Mode d'affichage mémorisé
	const [viewMode, setViewMode] = useState(() => {
		return localStorage.getItem("preferred_view_mode") || "grid";
	});

	const handleViewModeChange = (mode) => {
		setViewMode(mode);
		localStorage.setItem("preferred_view_mode", mode);
	};

	// Filtres
	const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get("search") || "");
	const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
	const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
	const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
	const [totalPages, setTotalPages] = useState(1);
	const language = i18n.language || "fr";

	const searchDebounceRef = useRef(null);
	const blogCacheRef = useRef(new Map());
	const CACHE_DURATION = 5 * 60 * 1000;

	const baseUrl = useMemo(() => {
		return (
			import.meta.env.VITE_FRONTEND_URL ||
			(typeof window !== "undefined" ? window.location.origin : "") ||
			"https://www.harvests.site"
		).replace(/\/$/, "");
	}, []);

	const seoConfig = useMemo(() => {
		const title = t("seo.blog.title", "Actualités & Blog Agricole | Harvests");
		const description = t(
			"seo.blog.description",
			"Découvrez nos articles, études de cas et conseils sur l'agriculture, la logistique et les circuits courts.",
		);
		const keywords = t(
			"seo.blog.keywords",
			"blog agriculture, actualités agritech, circuits courts, logistique agricole, Sénégal",
		);

		return {
			title,
			description,
			keywords,
			image: `${baseUrl}/logo.png`,
			type: "website",
			canonical: `${baseUrl}${location.pathname}${location.search ? location.search : ""}`,
		};
	}, [t, baseUrl, location.pathname, location.search]);

	const loadBlogs = useCallback(
		async (forceRefresh = false) => {
			try {
				setLoading(true);
				setError(null);

				const params = {
					page: currentPage,
					limit: 13,
					lang: language,
				};

				if (debouncedSearchTerm) params.search = debouncedSearchTerm;
				if (selectedType) params.type = selectedType;
				if (selectedCategory) params.category = selectedCategory;

				const cacheKey = JSON.stringify(params);
				const cachedData = blogCacheRef.current.get(cacheKey);
				const now = Date.now();

				if (!forceRefresh && cachedData && now - cachedData.timestamp < CACHE_DURATION) {
					setBlogs(cachedData.data || []);
					setTotalPages(cachedData.pagination?.pages || 1);
					setLoading(false);
					return;
				}

				const response = await blogApiService.getBlogs(params);

				if (response.data.success) {
					const blogsData = response.data.data || [];
					const pagination = response.data.pagination || {};

					blogCacheRef.current.set(cacheKey, {
						data: blogsData,
						pagination: pagination,
						timestamp: now,
					});

					setBlogs(blogsData);
					setTotalPages(pagination.pages || 1);
				}
			} catch (err) {
				console.error("Erreur lors du chargement des blogs:", err);
				setError("Erreur lors du chargement des articles");
			} finally {
				setLoading(false);
			}
		},
		[currentPage, debouncedSearchTerm, selectedType, selectedCategory, language],
	);

	useEffect(() => {
		if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
		searchDebounceRef.current = setTimeout(() => {
			setDebouncedSearchTerm((prev) => {
				if (prev !== searchTerm) setCurrentPage(1);
				return searchTerm;
			});
		}, 400);

		return () => {
			if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
		};
	}, [searchTerm]);

	useEffect(() => {
		loadBlogs();
	}, [loadBlogs]);

	useEffect(() => {
		loadBlogs(true);
	}, [i18n.language]);

	const handleBlogClick = (blog) => {
		const slug = blog.slug?.[language] || blog.slug?.fr || blog.slug?.en || blog.slug;
		if (slug) {
			navigate(`/blog/${slug}`);
		} else if (blog._id) {
			navigate(`/blog/${blog._id}`);
		}
	};

	const handleLike = async (e, blogId) => {
		e.stopPropagation();
		try {
			const response = await blogApiService.likeBlog(blogId);
			if (response.data.success) {
				const { likes, isLiked } = response.data.data;
				setBlogs((prevBlogs) =>
					prevBlogs.map((b) => (b._id === blogId ? { ...b, likes, isLiked } : b)),
				);
			}
		} catch (err) {
			console.error("Erreur lors du like:", err);
		}
	};

	const CATEGORY_FALLBACK_IMAGES = {
		strategie: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop",
		technologie: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop",
		finance: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop",
		"ressources-humaines": "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop",
		marketing: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop",
		operations: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop",
		gouvernance: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop",
	};

	const RANDOM_AGRI_IMAGES = [
		"https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1592417817098-8f3d6eb1b757?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop",
		"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop",
	];

	const getBlogImageUrl = (blog) => {
		if (!blog) return RANDOM_AGRI_IMAGES[0];
		if (typeof blog.featuredImage === "string" && blog.featuredImage.trim()) return blog.featuredImage;
		if (blog.featuredImage?.url && typeof blog.featuredImage.url === "string") return blog.featuredImage.url;
		if (Array.isArray(blog.images) && blog.images.length > 0) {
			for (const img of blog.images) {
				if (typeof img === "string" && img.trim()) return img;
				if (img?.url && typeof img.url === "string") return img.url;
			}
		}
		if (typeof blog.coverImage === "string" && blog.coverImage.trim()) return blog.coverImage;
		if (blog.coverImage?.url && typeof blog.coverImage.url === "string") return blog.coverImage.url;

		if (blog.category && CATEGORY_FALLBACK_IMAGES[blog.category]) {
			return CATEGORY_FALLBACK_IMAGES[blog.category];
		}

		const str = (blog._id || blog.title?.fr || blog.title || "").toString();
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % RANDOM_AGRI_IMAGES.length;
		return RANDOM_AGRI_IMAGES[index];
	};

	const getLocalizedContent = (content, fallback) => {
		if (typeof content === "string") return content;
		return content?.[language] || content?.fr || content?.en || fallback || "";
	};

	const translateTag = (tag) => t(`blog.tags.${tag}`, tag);
	const getTypeLabel = (type) => t(`blog.types.${type}`, type);
	const getCategoryLabel = (category) => t(`blog.categories.${category}`, category);

	if (loading && blogs.length === 0) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement du blog..." />
			</div>
		);
	}

	const featuredBlog = blogs.length > 0 ? blogs[0] : null;
	const regularBlogs = blogs.length > 1 ? blogs.slice(1) : (blogs.length === 1 ? blogs : []);

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<SEOHead {...seoConfig} />

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

				{/* Hero Banner Agritech */}
				<div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-6 overflow-hidden shadow-xl border border-emerald-800/40">
					<div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
							<Newspaper className="w-4 h-4 text-[#31BC2E]" />
							<span>Actualités & Tendances Agricoles</span>
						</div>

						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-3">
							Le Journal Agritech Harvests
						</h1>

						<p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
							Découvrez les conseils d'experts, études de cas, guides pratiques et innovations sur la chaîne de valeur agroalimentaire en Afrique.
						</p>
					</div>
				</div>

				{/* Toolbar Sticky (Sous la Navbar 108px) */}
				<div className="sticky top-[var(--app-header-height)] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-emerald-100/90 p-3 sm:p-4 mb-6 transition-all">
					<div className="flex flex-col md:flex-row items-center justify-between gap-3">

						{/* Search Input */}
						<div className="relative flex-1 w-full">
							<FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder={t("blog.searchPlaceholder", "Rechercher un article, un sujet, un mot-clé...")}
								className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200/90 rounded-xl focus:ring-2 focus:ring-[#1A5514] focus:border-transparent outline-none transition-all shadow-sm"
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
								>
									Effacer
								</button>
							)}
						</div>

						{/* Filters + View Mode Switcher */}
						<div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
							<select
								value={selectedType}
								onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
								className="py-2 px-3 bg-white border border-gray-200/90 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1A5514] cursor-pointer"
							>
								<option value="">{t("blog.types.all", "Tous les formats")}</option>
								<option value="article">Article</option>
								<option value="etude-cas">Étude de cas</option>
								<option value="tutoriel">Tutoriel</option>
								<option value="actualite">Actualité</option>
								<option value="temoignage">Témoignage</option>
							</select>

							<select
								value={selectedCategory}
								onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
								className="py-2 px-3 bg-white border border-gray-200/90 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#1A5514] cursor-pointer"
							>
								<option value="">{t("blog.categories.all", "Toutes catégories")}</option>
								<option value="strategie">Stratégie</option>
								<option value="technologie">Technologie</option>
								<option value="finance">Finance</option>
								<option value="ressources-humaines">RH</option>
								<option value="marketing">Marketing</option>
								<option value="operations">Opérations</option>
								<option value="gouvernance">Gouvernance</option>
							</select>

							{/* Switcher Grille / Liste */}
							<div className="flex items-center mx-auto bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
								<button
									onClick={() => handleViewModeChange('grid')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en grille"
								>
									<FiGrid className="h-4 w-4" />
									<span className="">Grille</span>
								</button>
								<button
									onClick={() => handleViewModeChange('list')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en liste"
								>
									<FiList className="h-4 w-4" />
									<span className="">Liste</span>
								</button>
							</div>
						</div>
					</div>

					<div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
						<span>
							Affichage de <strong className="text-gray-900">{blogs.length}</strong> article{blogs.length > 1 ? 's' : ''}
						</span>
					</div>
				</div>

				{/* Spotlight Featured Article (If available) */}
				{featuredBlog && !searchTerm && currentPage === 1 && (
					<div 
						onClick={() => handleBlogClick(featuredBlog)}
						className="group bg-white rounded-2xl border border-emerald-100/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden mb-8 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
					>
						<div className="lg:col-span-7 relative h-64 sm:h-72 lg:h-[340px] bg-gradient-to-r from-emerald-900 to-emerald-700 overflow-hidden">
							<CloudinaryImage
								src={getBlogImageUrl(featuredBlog)}
								alt={getLocalizedContent(featuredBlog.title, "Image de l'article")}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
								width={1000}
								height={600}
							/>

							<div className="absolute top-3 left-3 bg-[#1A5514] text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md uppercase tracking-wider flex items-center gap-1.5 z-10">
								<Sparkles className="w-3.5 h-3.5 text-yellow-400" />
								<span>À la Une</span>
							</div>

							{featuredBlog.featuredImage?.caption && (
								<div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-md text-emerald-100 text-[11px] p-2.5 line-clamp-1 font-medium z-10">
									{featuredBlog.featuredImage.caption}
								</div>
							)}
						</div>

						<div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
									<span>{getTypeLabel(featuredBlog.type)}</span>
									{featuredBlog.category && <span>• {getCategoryLabel(featuredBlog.category)}</span>}
								</div>

								<h2 className="text-xl sm:text-2xl font-black text-[#161D14] group-hover:text-[#1A5514] transition-colors leading-tight line-clamp-3">
									{getLocalizedContent(featuredBlog.title, "Titre non disponible")}
								</h2>

								<p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
									{getLocalizedContent(featuredBlog.excerpt, "Aucun extrait disponible")}
								</p>
							</div>

							<div className="pt-4 border-t border-gray-100 flex items-center justify-between">
								<div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
									{featuredBlog.publishedAt && (
										<span className="flex items-center gap-1">
											<FiCalendar className="w-3.5 h-3.5 text-emerald-600" />
											{formatDate(featuredBlog.publishedAt, language)}
										</span>
									)}
									<span className="flex items-center gap-1">
										<FiEye className="w-3.5 h-3.5 text-gray-400" />
										{featuredBlog.views || 0}
									</span>
								</div>

								<span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E]">
									Lire l'article <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Articles List / Grid */}
				{blogs.length > 0 ? (
					viewMode === 'grid' ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{regularBlogs.map((blog) => (
								<article
									key={blog._id}
									onClick={() => handleBlogClick(blog)}
									className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group"
								>
									<div>
										<div className="relative h-48 bg-gradient-to-r from-emerald-900 to-emerald-700 overflow-hidden">
											<CloudinaryImage
												src={getBlogImageUrl(blog)}
												alt={getLocalizedContent(blog.title, "Article")}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												width={600}
												height={350}
											/>

											<div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
												{getTypeLabel(blog.type)}
											</div>
										</div>

										<div className="p-5 space-y-2">
											{blog.category && (
												<span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block">
													{getCategoryLabel(blog.category)}
												</span>
											)}

											<h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors line-clamp-2 leading-snug">
												{getLocalizedContent(blog.title, "Titre de l'article")}
											</h3>

											<p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
												{getLocalizedContent(blog.excerpt, "Extrait de l'article...")}
											</p>
										</div>
									</div>

									<div className="p-5 pt-0 space-y-3">
										{blog.tags && blog.tags.length > 0 && (
											<div className="flex flex-wrap gap-1.5">
												{blog.tags.slice(0, 2).map((tag, idx) => (
													<span key={idx} className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
														#{translateTag(tag)}
													</span>
												))}
											</div>
										)}

										<div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
											<span className="flex items-center gap-1">
												<FiCalendar className="w-3.5 h-3.5 text-emerald-600" />
												{formatDate(blog.publishedAt, language)}
											</span>

											<div className="flex items-center gap-3">
												<button
													onClick={(e) => handleLike(e, blog._id)}
													className={`flex items-center gap-1 transition-colors ${blog.isLiked ? "text-red-500" : "hover:text-red-500"}`}
												>
													<FiHeart className={`w-3.5 h-3.5 ${blog.isLiked ? "fill-current" : ""}`} />
													<span>{blog.likes || 0}</span>
												</button>
												<span className="flex items-center gap-1">
													<FiEye className="w-3.5 h-3.5" />
													{blog.views || 0}
												</span>
											</div>
										</div>
									</div>
								</article>
							))}
						</div>
					) : (
						/* Vue Liste */
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{regularBlogs.map((blog) => (
								<article
									key={blog._id}
									onClick={() => handleBlogClick(blog)}
									className="group bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-4 sm:p-5 flex gap-4 cursor-pointer min-w-0"
								>
									<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
										<CloudinaryImage
											src={getBlogImageUrl(blog)}
											alt="Vignette"
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											width={200}
											height={200}
										/>
									</div>

									<div className="flex-1 space-y-1.5 min-w-0 flex flex-col justify-between">
										<div>
											<div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase">
												<span>{getTypeLabel(blog.type)}</span>
												{blog.category && <span>• {getCategoryLabel(blog.category)}</span>}
											</div>

											<h3 className="text-sm sm:text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate whitespace-nowrap overflow-hidden block">
												{getLocalizedContent(blog.title, "Titre non disponible")}
											</h3>

											<p className="text-xs text-gray-500 line-clamp-2">
												{getLocalizedContent(blog.excerpt, "")}
											</p>
										</div>

										<div className="flex items-center justify-between text-[11px] text-gray-400 font-medium pt-1">
											<span>{formatDate(blog.publishedAt, language)}</span>
											<span className="text-[#1A5514] font-bold flex items-center gap-1 group-hover:text-[#31BC2E]">
												Lire <FiArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
											</span>
										</div>
									</div>
								</article>
							))}
						</div>
					)
				) : (
					<div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
						<BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
						<h3 className="text-base font-extrabold text-[#161D14] mb-1">
							{t("blog.noBlogs", "Aucun article trouvé")}
						</h3>
						<p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
							{t("blog.noBlogsDescription", "Aucun article ne correspond à vos filtres.")}
						</p>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center mt-10">
						<div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
								<button
									key={page}
									onClick={() => {
										setCurrentPage(page);
										window.scrollTo({ top: 0, behavior: 'smooth' });
									}}
									className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
										currentPage === page
											? "bg-[#1A5514] text-white shadow-sm"
											: "text-gray-600 hover:bg-gray-100"
									}`}
								>
									{page}
								</button>
							))}
						</div>
					</div>
				)}

			</div>
		</div>
	);
};

export default BlogPage;
