import React, {
	useMemo,
	useCallback,
	useState,
	useEffect,
	useRef,
} from "react";
import { uploadService } from "../../services";

/**
 * Composant d'image optimisé pour Cloudinary
 * Gère automatiquement les URLs Cloudinary et locales avec optimisations de performance
 */
const CloudinaryImage = ({
	src,
	alt = "",
	className = "",
	loading = "lazy",
	fallback = "/images/placeholder.svg",
	width,
	height,
	quality = "auto",
	format = "auto",
	...props
}) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);
	const imgRef = useRef(null);

	// Obtenir l'URL optimisée avec transformations Cloudinary
	const optimizedSrc = useMemo(() => {
		if (!src) return fallback;

		// Si c'est déjà l'URL du fallback, ne rien faire
		if (src === fallback) return fallback;

		// Si c'est une URL Cloudinary, l'optimiser
		const srcString = String(src);
		if (srcString.includes("cloudinary.com")) {
			return uploadService.getOptimizedUrlLocal(srcString, {
				width,
				height,
				quality,
				format,
				crop: width && height ? "fill" : "fit",
			});
		}

		// Pour les autres URLs, utiliser getImageUrl
		return uploadService.getImageUrl(srcString);
	}, [src, fallback, width, height, quality, format]);

	// Générer srcset pour images responsives (WebP si supporté)
	const srcSet = useMemo(() => {
		if (!src || typeof src !== "string" || !src.includes("cloudinary.com"))
			return undefined;

		const sizes = [400, 800, 1200, 1600];
		return sizes
			.map((size) => {
				const optimizedUrl = uploadService.getOptimizedUrlLocal(src, {
					width: size,
					quality: "auto",
					format: "auto",
				});
				return `${optimizedUrl} ${size}w`;
			})
			.join(", ");
	}, [src]);

	// Gestion des erreurs d'image
	const handleError = useCallback(
		(e) => {
			if (
				fallback &&
				e.target.src !== window.location.origin + fallback &&
				!imageError
			) {
				console.warn(
					"Erreur chargement image, basculement sur fallback:",
					optimizedSrc,
				);
				setImageError(true);
				e.target.src = fallback;
				setImageLoaded(true); // On montre le fallback
			}
		},
		[fallback, imageError, optimizedSrc],
	);

	const handleLoad = useCallback(() => {
		setImageLoaded(true);
	}, []);

	// Vérifier si l'image est déjà chargée (cas du cache)
	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) {
			setImageLoaded(true);
		}
	}, [optimizedSrc]);

	// Réinitialiser l'état si la source change
	useEffect(() => {
		setImageError(false);
		setImageLoaded(false);
	}, [src]);

	return (
		<img
			ref={imgRef}
			src={optimizedSrc}
			srcSet={srcSet}
			sizes={
				width ?
					`${width}px`
				:	"(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px"
			}
			alt={alt}
			className={`${className} ${!imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
			loading={loading}
			width={width}
			height={height}
			onError={handleError}
			onLoad={handleLoad}
			decoding="async"
			{...props}
		/>
	);
};

export default CloudinaryImage;
