import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useSEO } from "../../hooks/useSEO";

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  type = "website",
  noindex = false,
  canonical,
  // Open Graph overrides
  ogTitle,
  ogDescription,
  ogImage,
  // Twitter overrides
  twitterTitle,
  twitterDescription,
  twitterImage,
  // Article metadata
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  // Product metadata
  price,
  currency = "XOF",
  availability = "https://schema.org/InStock",
  // Structured data extras
  breadcrumbs,  // [{ name, url }]
  faqItems,     // [{ question, answer }]
}) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const routeSEO = useSEO();

  const baseUrl = (
    import.meta.env.VITE_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "https://www.harvests.site"
  ).replace(/\/$/, "");

  const lang = i18n.language || "fr";
  const canonicalUrl = canonical || routeSEO.canonical || `${baseUrl}${location.pathname}`;
  const pageTitle   = title ? `${title} | Harvests` : routeSEO.title;
  const pageDesc    = description || routeSEO.description;
  const pageImage   = image || ogImage || routeSEO.image || `${baseUrl}/logo.png`;
  const pageImageAlt = imageAlt || "Harvests — Marketplace agroalimentaire";
  const pageKeywords = keywords || routeSEO.keywords;

  const ogTitleValue       = ogTitle || title || routeSEO.title;
  const ogDescValue        = ogDescription || description || routeSEO.description;
  const ogImageValue       = ogImage || image || routeSEO.image || pageImage;
  const twitterTitleValue  = twitterTitle || ogTitleValue;
  const twitterDescValue   = twitterDescription || ogDescValue;
  const twitterImageValue  = twitterImage || ogImageValue;

  const schemaOrgJSONLD = React.useMemo(() => {
    const schemas = [];

    // Organisation (toujours présente)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Harvests",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
        width: 200,
        height: 200,
      },
      sameAs: [
        "https://www.facebook.com/harvests.sn",
        "https://www.linkedin.com/company/harvests-sn",
      ],
    });

    // WebSite avec SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Harvests",
      description: routeSEO.description,
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/products?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });

    // Breadcrumb
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
        })),
      });
    }

    // Produit
    if (type === "product" && title) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        image: pageImage,
        description: pageDesc,
        brand: {
          "@type": "Brand",
          name: "Harvests",
        },
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: currency,
          ...(price !== undefined && { price: String(price) }),
          availability,
          seller: { "@id": `${baseUrl}/#organization` },
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
        publisher: { "@id": `${baseUrl}/#organization` },
        datePublished: articlePublishedTime,
        dateModified: articleModifiedTime || articlePublishedTime,
        description: pageDesc,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      });
    }

    // FAQ
    if (type === "faq" && faqItems && faqItems.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }

    return schemas;
  }, [
    type,
    title,
    pageImage,
    pageDesc,
    canonicalUrl,
    baseUrl,
    routeSEO.description,
    articleAuthor,
    articlePublishedTime,
    articleModifiedTime,
    price,
    currency,
    availability,
    breadcrumbs,
    faqItems,
  ]);

  return (
    <Helmet>
      {/* Langue */}
      <html lang={lang} />

      {/* Meta de base */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content="Harvests" />

      {/* Canonical + hreflang */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hreflang="fr" href={canonicalUrl} />
      <link rel="alternate" hreflang="en" href={canonicalUrl} />
      <link rel="alternate" hreflang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:title" content={ogTitleValue} />
      <meta property="og:description" content={ogDescValue} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageValue} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={pageImageAlt} />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "fr_FR"} />
      <meta property="og:locale:alternate" content={lang === "en" ? "fr_FR" : "en_US"} />
      <meta property="og:site_name" content="Harvests" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitleValue} />
      <meta name="twitter:description" content={twitterDescValue} />
      <meta name="twitter:image" content={twitterImageValue} />
      <meta name="twitter:image:alt" content={pageImageAlt} />

      {/* Article */}
      {type === "article" && (
        <>
          {articleAuthor && (
            <meta property="article:author" content={articleAuthor} />
          )}
          {articlePublishedTime && (
            <meta property="article:published_time" content={articlePublishedTime} />
          )}
          {articleModifiedTime && (
            <meta property="article:modified_time" content={articleModifiedTime} />
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

      {/* JSON-LD */}
      {schemaOrgJSONLD.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* PWA */}
      <meta name="theme-color" content="#16a34a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Harvests" />
    </Helmet>
  );
};

export default SEOHead;
