import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	User,
	Image as ImageIcon,
	Info,
	Phone,
	MapPin,
	ShieldCheck,
	Sparkles,
	ArrowRight,
	X,
	Building2,
} from "lucide-react";

// Map each userType to its profile route
const PROFILE_ROUTES = {
	producer: "/producer/profile",
	transformer: "/transformer/profile",
	restaurateur: "/restaurateur/profile",
	transporter: "/transporter/profile",
	exporter: "/exporter/profile",
	explorer: "/explorer/profile",
	consumer: "/consumer/profile",
};

const DISMISS_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// MongoDB uses _id, some APIs expose id — support both
const getDismissKey = (user) => {
	const uid = user?._id || user?.id;
	return uid ? `profile_modal_dismissed_${uid}` : null;
};

const isDismissalExpired = (user) => {
	const key = getDismissKey(user);
	if (!key) return true; // no key → always show (can't track)
	const lastDismissed = localStorage.getItem(key);
	if (!lastDismissed) return true; // never dismissed → show
	const elapsed = Date.now() - parseInt(lastDismissed, 10);
	return elapsed >= DISMISS_DURATION_MS;
};

const computeMissingFields = (user) => {
	const missing = [];
	if (!user) return missing;

	if (!user.avatar)
		missing.push({ id: "avatar", label: "Photo de profil", icon: <User className="w-4 h-4" />, reason: "Inspire 40% plus de confiance" });
	if (!user.shopBanner)
		missing.push({ id: "shopBanner", label: "Bannière de boutique", icon: <ImageIcon className="w-4 h-4" />, reason: "Rend votre vitrine attractive" });
	if (!user.bio)
		missing.push({ id: "bio", label: "Biographie / Présentation", icon: <Info className="w-4 h-4" />, reason: "Raconte votre histoire aux clients" });
	if (!user.phone)
		missing.push({ id: "phone", label: "Numéro de téléphone", icon: <Phone className="w-4 h-4" />, reason: "Essentiel pour la communication client" });
	if (!user.address || !user.city)
		missing.push({ id: "location", label: "Adresse & Localisation", icon: <MapPin className="w-4 h-4" />, reason: "Aidez les clients à vous situer" });

	if (user.userType === "producer" && !user.farmName)
		missing.push({ id: "farmName", label: "Nom de la ferme", icon: <Building2 className="w-4 h-4" />, reason: "Votre identité de producteur" });
	else if (user.userType === "restaurateur" && !user.restaurantName)
		missing.push({ id: "restaurantName", label: "Nom du restaurant", icon: <Building2 className="w-4 h-4" />, reason: "Assurez votre visibilité culinaire" });
	else if (["transformer", "exporter", "transporter"].includes(user.userType) && !user.companyName)
		missing.push({ id: "companyName", label: "Nom de l'entreprise", icon: <Building2 className="w-4 h-4" />, reason: "Renforce votre professionnalisme" });

	return missing;
};

const ProfileCompletionModal = ({ user }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [missingFields, setMissingFields] = useState([]);

	const profileRoute = user?.userType
		? PROFILE_ROUTES[user.userType] || "/dashboard"
		: "/dashboard";

	useEffect(() => {
		// Skip consumers and admins
		if (!user || user.userType === "consumer" || user.userType === "admin") {
			setIsOpen(false);
			setMissingFields([]);
			return;
		}

		const missing = computeMissingFields(user);
		setMissingFields(missing);

		// Debug — visible in browser console to help diagnose
		console.log(
			"[ProfileModal] userType:", user.userType,
			"| uid:", user._id || user.id,
			"| missing fields:", missing.length,
			"| dismissal expired:", isDismissalExpired(user),
		);

		if (missing.length > 0 && isDismissalExpired(user)) {
			const timer = setTimeout(() => setIsOpen(true), 1500);
			return () => clearTimeout(timer);
		} else {
			setIsOpen(false);
		}
	}, [
		user?._id,
		user?.id,
		user?.userType,
		user?.avatar,
		user?.shopBanner,
		user?.bio,
		user?.phone,
		user?.address,
		user?.city,
		user?.farmName,
		user?.restaurantName,
		user?.companyName,
	]);

	const handleClose = () => {
		setIsOpen(false);
		const key = getDismissKey(user);
		if (key) {
			localStorage.setItem(key, Date.now().toString());
		}
	};

	if (!isOpen || missingFields.length === 0) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
				onClick={handleClose}
			></div>

			{/* Modal Container */}
			<div className="relative max-h-[95vh] w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-y-auto border border-gray-100">
				{/* Top Decorative Header */}
				<div className="bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white relative overflow-hidden">
					<div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
					<div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-emerald-400/20 rounded-full blur-xl"></div>

					<button
						onClick={handleClose}
						className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
					>
						<X size={20} />
					</button>

					<div className="relative z-10 flex flex-col items-center text-center">
						<div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4 ring-1 ring-white/30">
							<Sparkles className="w-8 h-8 text-white" />
						</div>
						<h2 className="text-2xl font-[1000] tracking-tighter mb-2">
							Boostez votre Visibilité !
						</h2>
						<p className="text-emerald-50/80 text-sm font-medium leading-relaxed max-w-xs">
							Un profil complet permet d'augmenter vos ventes de{" "}
							<span className="font-bold text-white italic">300%</span> en
							moyenne sur HARVESTS.
						</p>
					</div>
				</div>

				{/* Content */}
				<div className="p-8 space-y-6">
					<div>
						<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
							<div className="w-4 h-[2px] bg-emerald-500"></div>
							Éléments à compléter
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{missingFields.map((field) => (
								<div
									key={field.id}
									className="group flex items-center p-2 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300"
								>
									<div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-emerald-600 group-hover:scale-110 transition-transform">
										{field.icon}
									</div>
									<div className="ml-4 flex-1">
										<p className="text-sm font-black text-gray-900 leading-none mb-1">
											{field.label}
										</p>
										<p className="text-[11px] text-gray-500 font-medium">
											{field.reason}
										</p>
									</div>
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-4 pt-2">
						<Link
							to={profileRoute}
							onClick={handleClose}
							className="group flex items-center justify-between w-full h-16 px-8 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 hover:shadow-emerald-200 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
						>
							Compléter mon profil
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</Link>

						<div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
							<ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
							<p className="text-[11px] text-blue-800 font-medium leading-tight">
								Un profil vérifié gagne en crédibilité et assure une meilleure
								sécurité pour vos transactions.
							</p>
						</div>

						<button
							onClick={handleClose}
							className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors py-2"
						>
							Rappelle-moi plus tard
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileCompletionModal;
