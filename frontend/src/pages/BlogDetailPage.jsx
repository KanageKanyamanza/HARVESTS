import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { blogApiService, adminBlogApiService } from "../services/blogService";
import trackingService from "../services/trackingService";
import BlogVisitorModal from "../components/blog/BlogVisitorModal";
import useBlogVisitorModal from "../hooks/useBlogVisitorModal";
import { useNotifications } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import BlogPreviewBanner from "./blogDetail/BlogPreviewBanner";
import BlogHeader from "./blogDetail/BlogHeader";
import BlogContent from "./blogDetail/BlogContent";
import BlogSidebar from "./blogDetail/BlogSidebar";
import Layout from "../components/layout/Layout";
import {
	getTypeIcon,
	getTypeLabel,
	getCategoryLabel,
	translateTag,
	normalizeTags,
	formatDate,
	getLocalizedContent,
} from "./blogDetail/blogUtils";

const BlogDetailPage = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const { showSuccess, showError } = useNotifications();
	const [searchParams] = useSearchParams();

	const [blog, setBlog] = useState(null);
	const [loading, setLoading] = useState(true);
	const [relatedBlogs, setRelatedBlogs] = useState([]);
	const [liked, setLiked] = useState(false);
	const isLoadingRef = useRef(false);
	const currentSlugRef = useRef(null);

	// Vérifier si on est en mode prévisualisation admin
	const isPreviewMode =
		searchParams.get("preview") === "true" &&
		searchParams.get("admin") === "true";

	// Wrapper pour getLocalizedContent avec i18n
	const getLocalizedContentWrapper = (content, fallback = "") => {
		return getLocalizedContent(content, fallback, i18n);
	};

	// Mémoriser le titre du blog pour éviter les re-renders inutiles
	const blogTitle = blog
		? getLocalizedContentWrapper(blog.title, "Titre non disponible")
		: "";

	// Hook pour la modale des visiteurs (seulement en mode normal)
	const {
		isModalOpen,
		isReturningVisitor,
		visitorData,
		isAuthenticatedUser,
		closeModal,
		handleFormSubmit,
	} = useBlogVisitorModal(blog?._id, blogTitle, slug);

	// Charger le blog
	const loadBlog = async () => {
		// Éviter les chargements multiples simultanés
		if (isLoadingRef.current && currentSlugRef.current === slug) {
			return;
		}

		isLoadingRef.current = true;
		currentSlugRef.current = slug;

		try {
			setLoading(true);

			let response;
			if (isPreviewMode) {
				// En mode prévisualisation, utiliser l'API admin pour récupérer tous les blogs
				const blogsResponse = await adminBlogApiService.getBlogs({
					limit: 100,
				});
				const allBlogs = blogsResponse.data.data || blogsResponse.data || [];

				// Trouver le blog par slug (localisé)
				const foundBlog = allBlogs.find((b) => {
					const localizedSlug = getLocalizedContentWrapper(b.slug, b.slug);
					return localizedSlug === slug;
				});

				if (!foundBlog) {
					throw new Error("Blog not found");
				}

				response = { data: { data: foundBlog } };
			} else {
				// Mode normal, utiliser l'API publique
				response = await blogApiService.getBlogBySlug(slug);

				// Initialiser le tracking si un visitId est fourni (seulement si pas déjà en cours)
				if (response.data.visitId && !trackingService.isTracking) {
					trackingService.initTracking(response.data.visitId);
				}
			}

			setBlog(response.data.data || response.data);

			// Charger des blogs similaires (seulement en mode normal)
			if (!isPreviewMode && response.data.data) {
				const relatedResponse = await blogApiService.getBlogs({
					category: response.data.data.category,
					limit: 3,
				});
				const relatedData =
					relatedResponse.data.data || relatedResponse.data || [];
				setRelatedBlogs(
					relatedData.filter((b) => {
						const blogSlug =
							typeof b.slug === "string"
								? b.slug
								: getLocalizedContentWrapper(b.slug, "");
						return blogSlug !== slug;
					})
				);
			}
		} catch (err) {
			console.error("Error loading blog:", err);
			showError(t("blog.articleNotFound", "Article non trouvé"));
			if (!isPreviewMode) {
				navigate("/blog");
			}
		} finally {
			setLoading(false);
			isLoadingRef.current = false;
		}
	};

	useEffect(() => {
		loadBlog();

		// Nettoyer le tracking lors du démontage du composant
		return () => {
			trackingService.stopTracking();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	// Synchroniser l'état 'liked' avec les données du blog
	useEffect(() => {
		if (blog) {
			setLiked(!!blog.isLiked);
		}
	}, [blog]);

	// Effet pour détecter les changements de langue
	useEffect(() => {
		const handleLanguageChange = () => {
			// Ne pas recharger le blog, juste mettre à jour l'affichage
			// Le contenu bilingue est déjà chargé
		};

		i18n.on("languageChanged", handleLanguageChange);

		return () => {
			i18n.off("languageChanged", handleLanguageChange);
		};
	}, [i18n]);

	// Gérer le like
	const handleLike = async () => {
		if (!blog) return;

		try {
			const response = await blogApiService.likeBlog(blog._id);
			const { likes, isLiked } = response.data.data;

			setBlog((prev) => ({ ...prev, likes }));
			setLiked(isLiked);

			if (isLiked) {
				showSuccess(t("blog.likeSuccess", "Merci pour votre like !"));
			}
		} catch (error) {
			console.error("Error liking blog:", error);
			if (error.response && error.response.status === 401) {
				showError(
					t(
						"blog.loginRequired",
						"Vous devez être connecté pour aimer cet article"
					)
				);
			} else {
				showError(t("blog.likeError", "Erreur lors du like"));
			}
		}
	};

	// Partager l'article
	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: getLocalizedContentWrapper(blog.title),
					text: getLocalizedContentWrapper(blog.excerpt),
					url: window.location.href,
				});
			} catch (err) {
				console.log("Share cancelled", err);
			}
		} else {
			// Fallback: copier le lien
			navigator.clipboard.writeText(window.location.href);
			showSuccess(t("blog.shareSuccess", "Lien copié dans le presse-papier !"));
		}
	};

	// Wrappers pour les fonctions utilitaires avec t
	const getTypeLabelWrapper = (type) => getTypeLabel(type, t);
	const getCategoryLabelWrapper = (category) => getCategoryLabel(category, t);
	const translateTagWrapper = (tag) => translateTag(tag, t);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement du blog..." />
			</div>
		);
	}

	if (!blog) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						{t("blog.articleNotFound", "Article non trouvé")}
					</h1>
					<button
						onClick={() => navigate("/blog")}
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("blog.backToBlog", "Retour au blog")}
					</button>
				</div>
			</div>
		);
	}

	const normalizedTags = normalizeTags(blog.tags);

	// Configuration SEO dynamique basée sur le blog (pas de hook ici pour éviter les erreurs de hooks)
	const baseUrl = (
		import.meta.env.VITE_FRONTEND_URL ||
		(typeof window !== "undefined" ? window.location.origin : "") ||
		"https://www.harvests.site"
	).replace(/\/$/, "");

	const localizedTitle = getLocalizedContent(blog.title, "", i18n);
	const localizedExcerpt = getLocalizedContent(blog.excerpt, "", i18n);
	const localizedContent = getLocalizedContent(blog.content, "", i18n);
	const blogImage = blog.featuredImage?.url || `${baseUrl}/logo.png`;
	const blogUrl = `${baseUrl}/blog/${slug}`;
	const blogPublishedTime = blog.publishedAt
		? new Date(blog.publishedAt).toISOString()
		: null;
	const blogModifiedTime = blog.updatedAt
		? new Date(blog.updatedAt).toISOString()
		: null;

	const seoConfig = {
		title: localizedTitle,
		description:
			localizedExcerpt ||
			localizedContent?.substring(0, 160) ||
			t("blog.defaultDescription", "Découvrez cet article sur Harvests"),
		keywords: blog.tags?.join(", ") || "",
		image: blogImage,
		type: "article",
		canonical: blogUrl,
		ogTitle: localizedTitle,
		ogDescription: localizedExcerpt || localizedContent?.substring(0, 160),
		ogImage: blogImage,
		twitterTitle: localizedTitle,
		twitterDescription: localizedExcerpt || localizedContent?.substring(0, 160),
		twitterImage: blogImage,
		articleAuthor:
			blog.author?.firstName && blog.author?.lastName
				? `${blog.author.firstName} ${blog.author.lastName}`
				: "Harvests",
		articlePublishedTime: blogPublishedTime,
		articleModifiedTime: blogModifiedTime,
		articleSection: blog.category || "",
		articleTags: blog.tags || [],
	};

	return (
		<Layout seo={seoConfig}>
			<div className="min-h-screen bg-gray-50">
				{/* Indicateur de prévisualisation */}
				{isPreviewMode && <BlogPreviewBanner onClose={() => window.close()} />}

				{/* Header */}
				<BlogHeader
					blog={blog}
					isPreviewMode={isPreviewMode}
					navigate={navigate}
					t={t}
					getLocalizedContent={getLocalizedContentWrapper}
					getTypeIcon={getTypeIcon}
					getTypeLabel={getTypeLabelWrapper}
					getCategoryLabel={getCategoryLabelWrapper}
					formatDate={formatDate}
					liked={liked}
					handleLike={handleLike}
					handleShare={handleShare}
				/>

				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Contenu principal */}
						<div className="lg:col-span-2">
							<BlogContent
								blog={blog}
								getLocalizedContent={getLocalizedContentWrapper}
								normalizedTags={normalizedTags}
								translateTag={translateTagWrapper}
								t={t}
							/>
						</div>

						{/* Sidebar */}
						<BlogSidebar
							isPreviewMode={isPreviewMode}
							blog={blog}
							relatedBlogs={relatedBlogs}
							liked={liked}
							handleLike={handleLike}
							handleShare={handleShare}
							getLocalizedContent={getLocalizedContentWrapper}
							getTypeIcon={getTypeIcon}
							getTypeLabel={getTypeLabelWrapper}
							formatDate={formatDate}
							t={t}
						/>
					</div>
				</div>

				{/* Modale des visiteurs - seulement en mode normal */}
				{!isPreviewMode && (
					<BlogVisitorModal
						isOpen={isModalOpen}
						onClose={closeModal}
						blogId={blog?._id}
						blogTitle={
							blog
								? getLocalizedContentWrapper(blog.title, "Titre non disponible")
								: ""
						}
						blogSlug={slug}
						isReturningVisitor={isReturningVisitor}
						isAuthenticatedUser={isAuthenticatedUser}
						visitorData={visitorData}
						onFormSubmit={handleFormSubmit}
					/>
				)}
			</div>
		</Layout>
	);
};

export default BlogDetailPage;
