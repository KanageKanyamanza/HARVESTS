/**
 * Jour 59 (sécurité) — lecture d'une URL de livraison Cloudinary.
 *
 * https://res.cloudinary.com/<cloud>/<resource_type>/<type>/[s--sig--/][v123/]<public_id>[.<format>]
 * - resource_type : image (images et PDF), raw (autres fichiers), video
 * - type : upload (public), authenticated / private (accès signé uniquement)
 * Pour une ressource raw, l'extension fait partie du public_id.
 */
const DELIVERY_RE =
	/^https?:\/\/res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/(upload|authenticated|private)\/(?:s--[^/]+--\/)?(?:v(\d+)\/)?([^?#]+)/i;

const parseCloudinaryUrl = (url) => {
	if (typeof url !== "string") return null;
	const match = url.match(DELIVERY_RE);
	if (!match) return null;
	const [, cloudName, resourceType, type, version, path] = match;
	const decodedPath = decodeURIComponent(path);

	if (resourceType === "raw") {
		return { cloudName, resourceType, type, version, publicId: decodedPath, format: "" };
	}
	const ext = decodedPath.match(/\.([a-z0-9]+)$/i);
	return {
		cloudName,
		resourceType,
		type,
		version,
		publicId: ext ? decodedPath.slice(0, -ext[0].length) : decodedPath,
		format: ext ? ext[1].toLowerCase() : "",
	};
};

/** Vrai si l'asset n'est accessible qu'avec une URL signée. */
const isProtectedAsset = (url) => {
	const parsed = parseCloudinaryUrl(url);
	return Boolean(parsed && parsed.type !== "upload");
};

module.exports = { parseCloudinaryUrl, isProtectedAsset };
