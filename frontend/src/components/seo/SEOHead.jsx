import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useSEO } from "../../hooks/useSEO";

/**
 * Composant SEO réutilisable pour toutes les pages publiques
 * Gère automatiquement les meta tags, Open Graph, Twitter Cards, etc.
 */
const SEOHead = ({
	title,
	description,
	keywords,
	image,
	type = "website",
	noindex = false,
	canonical,
	ogTitle,
	ogDescription,
	ogImage,
	twitterTitle,
	twitterDescription,
	twitterImage,
	articleAuthor,
	articlePublishedTime,
	articleModifiedTime,
	articleSection,
	articleTags,
}) => {
	const { i18n } = useTranslation();
	const location = useLocation();
	const routeSEO = useSEO(); // Récupère les données SEO basées sur la route actuelle

	const baseUrl = (
		import.meta.env.VITE_FRONTEND_URL ||
		(typeof window !== "undefined" ? window.location.origin : "") ||
		"https://www.harvests.site"
	).replace(/\/$/, "");

	// URL canonique par défaut
	const canonicalUrl =
		canonical || routeSEO.canonical || `${baseUrl}${location.pathname}`;

	// Titre
	const pageTitle = title ? `${title} | Harvests` : routeSEO.title;

	// Description
	const pageDescription = description || routeSEO.description;

	// Image
	const pageImage = image || ogImage || routeSEO.image || `${baseUrl}/logo.png`;

	// Mots-clés
	const pageKeywords = keywords || routeSEO.keywords;

	// Open Graph
	const ogTitleValue = ogTitle || title || routeSEO.title;
	const ogDescriptionValue =
		ogDescription || description || routeSEO.description;
	const ogImageValue = ogImage || image || routeSEO.image || pageImage;

	// Twitter
	const twitterTitleValue = twitterTitle || title || ogTitleValue;
	const twitterDescriptionValue =
		twitterDescription || description || ogDescriptionValue;
	const twitterImageValue = twitterImage || image || ogImageValue;

	// Schémas JSON-LD
	const schemaOrgJSONLD = React.useMemo(() => {
		const schemas = [];

		// SiteWeb de base
		schemas.push({
			"@context": "https://schema.org",
			"@type": "WebSite",
			url: baseUrl,
			name: "Harvests",
			description: routeSEO.description,
			publisher: {
				"@type": "Organization",
				name: "Harvests",
				logo: {
					"@type": "ImageObject",
					url: `${baseUrl}/logo.png`,
				},
			},
		});

		// Produit
		if (type === "product" && title) {
			schemas.push({
				"@context": "https://schema.org",
				"@type": "Product",
				name: title,
				image: pageImage,
				description: pageDescription,
				brand: {
					"@type": "Brand",
					name: "Harvests",
				},
				offers: {
					"@type": "Offer",
					url: canonicalUrl,
					priceCurrency: "XOF",
					price: title.match(/(\d+)/)?.[0] || "0",
					availability: "https://schema.org/InStock",
				},
			});
		}

		// Article de blog
		if (type === "article" && title) {
			schemas.push({
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				headline: title,
				image: pageImage,
				author: {
					"@type": "Person",
					name: articleAuthor || "Harvests Team",
				},
				publisher: {
					"@type": "Organization",
					name: "Harvests",
					logo: {
						"@type": "ImageObject",
						url: `${baseUrl}/logo.png`,
					},
				},
				datePublished: articlePublishedTime,
				dateModified: articleModifiedTime || articlePublishedTime,
				description: pageDescription,
				mainEntityOfPage: {
					"@type": "WebPage",
					"@id": canonicalUrl,
				},
			});
		}

		return schemas;
	}, [
		type,
		title,
		pageImage,
		pageDescription,
		canonicalUrl,
		baseUrl,
		routeSEO.description,
		articleAuthor,
		articlePublishedTime,
		articleModifiedTime,
	]);

	return (
		<Helmet>
			{/* Langue */}
			<html lang={i18n.language || "fr"} />

			{/* Meta tags de base */}
			<title>{pageTitle}</title>
			<meta name="description" content={pageDescription} />
			{pageKeywords && <meta name="keywords" content={pageKeywords} />}
			{noindex && <meta name="robots" content="noindex, nofollow" />}

			{/* Canonical URL */}
			<link rel="canonical" href={canonicalUrl} />

			{/* Open Graph */}
			<meta property="og:type" content={type} />
			<meta property="og:title" content={ogTitleValue} />
			<meta property="og:description" content={ogDescriptionValue} />
			<meta property="og:url" content={canonicalUrl} />
			<meta property="og:image" content={ogImageValue} />
			<meta property="og:image:width" content="1200" />
			<meta property="og:image:height" content="630" />
			<meta
				property="og:locale"
				content={i18n.language === "en" ? "en_US" : "fr_FR"}
			/>
			<meta property="og:site_name" content="Harvests" />

			{/* Twitter Card */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={twitterTitleValue} />
			<meta name="twitter:description" content={twitterDescriptionValue} />
			<meta name="twitter:image" content={twitterImageValue} />

			{/* Article (si type = article) */}
			{type === "article" && (
				<>
					{articleAuthor && (
						<meta property="article:author" content={articleAuthor} />
					)}
					{articlePublishedTime && (
						<meta
							property="article:published_time"
							content={articlePublishedTime}
						/>
					)}
					{articleModifiedTime && (
						<meta
							property="article:modified_time"
							content={articleModifiedTime}
						/>
					)}
					{articleSection && (
						<meta property="article:section" content={articleSection} />
					)}
					{articleTags &&
						articleTags.map((tag, index) => (
							<meta key={index} property="article:tag" content={tag} />
						))}
				</>
			)}

			{/* Formats JSON-LD */}
			{schemaOrgJSONLD.map((schema, index) => (
				<script key={index} type="application/ld+json">
					{JSON.stringify(schema)}
				</script>
			))}

			{/* Additional meta tags */}
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="theme-color" content="#16a34a" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-status-bar-style" content="default" />
			<meta name="apple-mobile-web-app-title" content="Harvests" />
		</Helmet>
	);
};

export default SEOHead;
