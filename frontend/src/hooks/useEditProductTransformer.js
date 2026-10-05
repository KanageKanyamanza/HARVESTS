import { transformerService } from "../services";
import { DEFAULT_UNIT } from "../config/units";
import { useEditProduct } from "./useEditProduct";

/**
 * Hook personnalisé pour gérer l'édition d'un produit transformé.
 *
 * Jour 51 : délègue au hook du producteur (même formulaire, même logique
 * bilingue et mêmes corrections), seuls le service, la page de retour et
 * l'unité par défaut changent.
 */
export const useEditProductTransformer = () =>
	useEditProduct({
		service: transformerService,
		listPath: "/transformer/products",
		defaultUnit: DEFAULT_UNIT,
	});
