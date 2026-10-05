import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiTruck } from 'react-icons/fi';
import i18n from './i18n';

// Jour 49 (bascule bilingue) : libellés et descriptions lus dans
// common:orderStatus / common:orderStatusDescription au moment de l'appel,
// donc dans la langue courante. Les appelants lisent toujours config.text et
// config.description.
const withLabels = (status, config, { description = false } = {}) => ({
	...config,
	text: i18n.t(`orderStatus.${status}`, { ns: 'common' }),
	...(description && {
		description: i18n.t(`orderStatusDescription.${status}`, { ns: 'common' }),
	}),
});

// Config de statut détaillée (couleur/texte/icône/description) utilisée par
// OrderStatusBadge et par les écrans affichant le fil de suivi d'une commande.
const STATUS_STYLES = {
	'pending': { color: 'text-yellow-600 bg-yellow-100', icon: FiClock },
	'confirmed': { color: 'text-blue-600 bg-blue-100', icon: FiCheckCircle },
	'preparing': { color: 'text-purple-600 bg-purple-100', icon: FiPackage },
	'ready-for-pickup': { color: 'text-orange-600 bg-orange-100', icon: FiPackage },
	'in-transit': { color: 'text-indigo-600 bg-indigo-100', icon: FiTruck },
	'out-for-delivery': { color: 'text-blue-600 bg-blue-100', icon: FiTruck },
	'delivered': { color: 'text-green-600 bg-green-100', icon: FiCheckCircle },
	'completed': { color: 'text-green-600 bg-green-100', icon: FiCheckCircle },
	'cancelled': { color: 'text-red-600 bg-red-100', icon: FiXCircle }
};

export const getStatusConfig = (status) => {
	const key = STATUS_STYLES[status] ? status : 'pending';
	return withLabels(key, STATUS_STYLES[key], { description: true });
};

// Config de statut compacte (sans icône) pour l'affichage d'une ligne d'article.
const ITEM_STATUS_STYLES = {
	pending: { color: 'bg-yellow-100 text-yellow-700' },
	confirmed: { color: 'bg-green-100 text-green-700' },
	preparing: { color: 'bg-purple-100 text-purple-700' },
	'ready-for-pickup': { color: 'bg-orange-100 text-orange-700' },
	'in-transit': { color: 'bg-blue-100 text-blue-700' },
	delivered: { color: 'bg-green-100 text-green-700' },
	completed: { color: 'bg-emerald-100 text-emerald-700' },
	cancelled: { color: 'bg-gray-100 text-gray-600' },
	rejected: { color: 'bg-red-100 text-red-600' },
	refunded: { color: 'bg-red-100 text-red-600' },
	disputed: { color: 'bg-red-100 text-red-600' }
};

export const getItemStatusConfig = (status = 'pending') => {
	const key = ITEM_STATUS_STYLES[status] ? status : 'pending';
	return withLabels(key, ITEM_STATUS_STYLES[key]);
};
