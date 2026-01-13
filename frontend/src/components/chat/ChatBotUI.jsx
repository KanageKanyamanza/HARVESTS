import React from "react";
import {
	MessageCircle,
	X,
	Minimize2,
	Package,
	Truck,
	CreditCard,
	User,
	ShoppingBag,
	Trash2,
	Heart,
	Sparkles,
	ShoppingCart,
	ArrowRight,
	Minus,
	Maximize2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { faqData } from "../../data/faqData";

const categoryIcons = {
	livraison: Truck,
	paiement: CreditCard,
	commande: Package,
	compte: User,
	produits: ShoppingBag,
};

export const ChatBotButton = ({ onClick, backToTopVisible }) => (
	<button
		onClick={onClick}
		className={`fixed right-6 w-14 h-14 bg-gradient-to-tr from-primary-600 to-primary-500 text-white rounded-[1.5rem] shadow-xl shadow-primary-200 hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center z-40 group ${
			backToTopVisible ? "bottom-[80px]" : "bottom-6"
		}`}
		aria-label="Ouvrir le chat"
	>
		<div className="absolute inset-0 rounded-[1.5rem] bg-white/20 animate-pulse rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
		<MessageCircle className="w-7 h-7" />
		<span className="absolute -top-1 -right-1 flex h-4 w-4">
			<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
			<span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
		</span>
	</button>
);

export const ChatBotHeader = ({
	isMinimized,
	setIsMinimized,
	isMaximized,
	setIsMaximized,
	setIsOpen,
	clearConversation,
	messagesCount,
}) => (
	<div
		className="relative px-5 py-1 flex items-center justify-between cursor-pointer bg-gradient-to-r from-primary-600 to-primary-500 text-white overflow-hidden shrink-0"
		onClick={() => isMinimized && setIsMinimized(false)}
	>
		{/* Decorative circles */}
		<div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
		<div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-16 h-16 rounded-full bg-black/5 blur-lg pointer-events-none"></div>

		<div className="relative flex items-center gap-4 z-10">
			<div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-sm">
				<MessageCircle className="w-6 h-6 text-white" />
			</div>
			<div>
				
				<h3 className="font-bold text-white text-lg tracking-tight">
					Assistant Harvests
				</h3>
				<div className="flex items-center gap-1">
					<span className="w-2 h-2 mb-2 bg-primary-100 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>
					<p className="text-xs font-medium text-white/90">En ligne</p>
				</div>
			</div>
		</div>
		<div className="relative flex items-center gap-1 z-10">
			{messagesCount > 1 && (
				<button
					onClick={(e) => {
						e.stopPropagation();
						clearConversation();
					}}
					className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
					title="Effacer"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			)}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsMinimized(!isMinimized);
				}}
				className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
				title="Réduire"
			>
				<Minus className="w-5 h-5" />
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsMaximized(!isMaximized);
				}}
				className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
				title={isMaximized ? "Restaurer" : "Agrandir"}
			>
				{isMaximized ? (
					<Minimize2 className="w-5 h-5" />
				) : (
					<Maximize2 className="w-5 h-5" />
				)}
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(false);
				}}
				className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
				title="Fermer"
			>
				<X className="w-5 h-5" />
			</button>
		</div>
	</div>
);

export const TypingIndicator = () => (
	<div className="flex gap-3 px-2 py-1">
		<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 flex items-center justify-center shadow-sm border border-primary-100/50">
			<MessageCircle className="w-4 h-4" />
		</div>
		<div className="bg-white border border-gray-100 px-4 py-3 rounded-[1.3rem] rounded-tl-none shadow-sm flex items-center gap-1.5">
			<span
				className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
				style={{ animationDelay: "0ms" }}
			></span>
			<span
				className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
				style={{ animationDelay: "150ms" }}
			></span>
			<span
				className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
				style={{ animationDelay: "300ms" }}
			></span>
		</div>
	</div>
);

export const ProductResults = ({
	products,
	getProductImage,
	getProductName,
	onClose,
}) => (
	<div className="mt-3 space-y-3 px-1">
		{products
			.filter((p) => !p.isLink)
			.map((product) => (
				<Link
					key={product._id}
					to={`/products/${product._id}`}
					className="flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
					onClick={onClose}
				>
					<div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 relative group-hover:scale-105 transition-transform duration-300">
						{getProductImage(product) ? (
							<img
								src={getProductImage(product)}
								alt={getProductName(product)}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-gray-300">
								<Package className="w-8 h-8" />
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0 flex flex-col justify-center">
						<p className="font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors text-[13px]">
							{getProductName(product)}
						</p>
						<p className="text-primary-600 font-bold mt-1 text-xs bg-primary-50 w-fit px-2 py-0.5 rounded-lg">
							{product.price?.toLocaleString("fr-FR")} FCFA
						</p>
					</div>
					<div className="flex items-center justify-center w-8 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
						<ArrowRight className="w-5 h-5" />
					</div>
				</Link>
			))}
		<Link
			to="/products"
			className="flex items-center justify-center w-full py-3 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all"
			onClick={onClose}
		>
			Voir tout le catalogue
		</Link>
	</div>
);

export const SellerResults = ({
	sellers,
	getUserImage,
	getSellerName,
	getSellerType,
	onClose,
}) => (
	<div className="mt-3 space-y-3 px-1">
		{sellers.map((seller) => (
			<Link
				key={seller._id}
				to={`/producers/${seller._id}`}
				className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
				onClick={onClose}
			>
				<div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
					{getUserImage(seller) ? (
						<img
							src={getUserImage(seller)}
							alt={getSellerName(seller)}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-gray-300">
							<User className="w-6 h-6" />
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors text-[13px]">
						{getSellerName(seller)}
					</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
							{getSellerType(seller.userType)}
						</span>
						{seller.address?.city && (
							<span className="text-[10px] text-gray-400 truncate">
								• {seller.address.city}
							</span>
						)}
					</div>
				</div>
			</Link>
		))}
	</div>
);

export const TransporterResults = ({
	transporters,
	getUserImage,
	getTransporterName,
}) => (
	<div className="mt-3 space-y-3 px-1">
		{transporters.map((t) => (
			<div
				key={t._id}
				className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
			>
				<div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 border-2 border-white shadow-sm">
					{getUserImage(t) ? (
						<img
							src={getUserImage(t)}
							alt={getTransporterName(t)}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-blue-300">
							<Truck className="w-6 h-6" />
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-bold text-gray-900 truncate text-[13px]">
						{getTransporterName(t)}
					</p>
					<div className="flex items-center gap-2 mt-0.5">
						<span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
							{t.userType === "exporter" ? "Exportateur" : "Transporteur"}
						</span>
					</div>
					{t.serviceAreas?.length > 0 && (
						<p className="text-[10px] text-gray-400 mt-1 truncate">
							{t.serviceAreas
								.slice(0, 2)
								.map((a) => a.region || a.city)
								.join(", ")}
						</p>
					)}
				</div>
			</div>
		))}
	</div>
);

export const QuickLinks = ({ links, onAction, onClose }) => (
	<div className="mt-3 space-y-2 px-1">
		{links.map((link, idx) =>
			link.action ? (
				<button
					key={idx}
					onClick={() => onAction(link.action)}
					className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all shadow-sm group"
				>
					<span>{link.label}</span>
					<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
				</button>
			) : (
				<Link
					key={idx}
					to={link.to}
					className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all shadow-sm group"
					onClick={onClose}
				>
					<span>{link.label}</span>
					<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
				</Link>
			)
		)}
	</div>
);

export const QuickActions = ({ onIntent }) => (
	<div className="mt-4 px-1">
		<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
			Accès rapide
		</p>
		<div className="grid grid-cols-2 gap-2">
			{[
				{
					intent: "MY_CART",
					icon: ShoppingCart,
					label: "Panier",
					color: "text-indigo-600",
					bg: "bg-indigo-50",
				},
				{
					intent: "MY_ORDERS",
					icon: Package,
					label: "Commandes",
					color: "text-blue-600",
					bg: "bg-blue-50",
				},
				{
					intent: "MY_FAVORITES",
					icon: Heart,
					label: "Favoris",
					color: "text-rose-600",
					bg: "bg-rose-50",
				},
				{
					intent: "NEW_PRODUCTS",
					icon: Sparkles,
					label: "Nouveautés",
					color: "text-amber-600",
					bg: "bg-amber-50",
				},
			].map(({ intent, icon: Icon, label, color, bg }) => (
				<button
					key={intent}
					onClick={() => onIntent(intent)}
					className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:shadow-md transition-all hover:-translate-y-0.5`}
				>
					<div
						className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center`}
					>
						<Icon className="w-3.5 h-3.5" />
					</div>
					<span>{label}</span>
				</button>
			))}
		</div>
	</div>
);

export const QuickQuestions = ({ questions, onClick }) => (
	<div className="mt-3 space-y-2 px-1">
		{questions.map((faq) => (
			<button
				key={faq.id}
				onClick={() => onClick(faq)}
				className="w-full text-left p-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-800 hover:border-primary-200 transition-all shadow-sm hover:shadow-md"
			>
				{faq.question}
			</button>
		))}
	</div>
);

export const Categories = ({ onCategoryClick }) => (
	<div className="mt-5 px-1 pb-2">
		<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
			Je peux vous aider avec :
		</p>
		<div className="flex flex-wrap gap-2">
			{faqData.categories.map((cat) => {
				const Icon = categoryIcons[cat.id] || Package;
				return (
					<button
						key={cat.id}
						onClick={() => onCategoryClick(cat.id)}
						className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-primary-500 hover:text-white hover:border-primary-500 hover:shadow-md hover:shadow-primary-200 transition-all duration-300"
					>
						<Icon className="w-3.5 h-3.5" />
						<span>{cat.label.replace(/[^\w\s]/gi, "").trim()}</span>
					</button>
				);
			})}
		</div>
	</div>
);

export const ChatMessages = ({
	messages,
	isTyping,
	feedbackGiven,
	onFeedback,
	getUserAvatar,
	getUserFirstName,
	guestInfo,
}) => (
	<div className="flex flex-col gap-4 py-2">
		{messages.map((msg) => (
			<ChatMessage
				key={msg.id}
				message={msg.text}
				isBot={msg.isBot}
				timestamp={msg.timestamp}
				messageId={msg.interactionId}
				onFeedback={onFeedback}
				feedbackGiven={feedbackGiven[msg.id]}
				userAvatar={!msg.isBot ? getUserAvatar() : null}
				userName={!msg.isBot ? getUserFirstName() || guestInfo?.name : null}
			/>
		))}
		{isTyping && <TypingIndicator />}
	</div>
);
