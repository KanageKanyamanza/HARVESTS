import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSourceLang } from "../utils/bilingualField";

/**
 * Jour 48 (bascule bilingue) : langue des champs principaux d'un formulaire
 * de contenu bilingue (voir utils/bilingualField.js).
 *
 * Les champs principaux (`name`, `description`...) sont dans la langue de
 * l'interface, les champs `<champ>Alt` dans l'autre langue. Quand
 * l'utilisateur change de langue, les deux sont échangés sur place : la
 * saisie en cours est conservée, seuls les rôles s'inversent.
 *
 * @param setFormData setter de l'état du formulaire
 * @param fields      noms des champs bilingues (tableau stable, défini hors
 *                    du composant)
 */
export const useBilingualSourceLang = (setFormData, fields) => {
	const { i18n } = useTranslation();
	const [sourceLang, setSourceLang] = useState(() =>
		getSourceLang(i18n.language),
	);

	useEffect(() => {
		const uiLang = getSourceLang(i18n.language);
		if (uiLang === sourceLang) return;
		setFormData((form) => {
			const next = { ...form };
			for (const field of fields) {
				next[field] = form[`${field}Alt`];
				next[`${field}Alt`] = form[field];
			}
			return next;
		});
		setSourceLang(uiLang);
		// Uniquement sur changement de langue de l'interface : en édition,
		// sourceLang peut être fixé au chargement sur l'autre langue (produit
		// sans texte dans la langue de l'UI) sans que cela déclenche d'échange.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [i18n.language]);

	return [sourceLang, setSourceLang];
};
