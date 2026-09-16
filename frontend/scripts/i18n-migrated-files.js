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
];
