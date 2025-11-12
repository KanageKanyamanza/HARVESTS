/**
 * Utilitaires pour les produits
 */

import { toPlainText } from './textHelpers';

export const parseProductName = (name) => toPlainText(name, 'Produit');

export const parseProductDescription = (description) => toPlainText(description, '');
