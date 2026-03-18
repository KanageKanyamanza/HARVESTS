import React from "react";
import {
	ShoppingBag,
	Image as ImageIcon,
	Sparkles,
	User,
	ArrowRight,
} from "lucide-react";
import ProfileImageUpload from "../common/ProfileImageUpload";
import CloudinaryImage from "../common/CloudinaryImage";

const VENDOR_TYPES = [
	"producer",
	"transformer",
	"restaurateur",
	"exporter",
	"transporter",
];

const ShopSection = ({
	user,
	shopBanner,
	shopLogo,
	onBannerChange,
	onBannerRemove,
	onLogoChange,
	onLogoRemove,
	editing = false,
}) => {
	if (!VENDOR_TYPES.includes(user?.userType)) return null;

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-3 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
			{/* Background Element */}
			<div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
				<ShoppingBag className="h-48 w-48" />
			</div>

			<div className="relative z-10 space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">
							Identité Visuelle
						</p>
						<h3 className="text-xl font-[1000] text-gray-900 tracking-tight flex items-center gap-3">
							<ShoppingBag className="h-6 w-6 text-amber-500" />
							Ma Vitrine Commerciale
						</h3>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
					<div className="space-y-4">
						<div className="flex items-center justify-between px-2">
							<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Bannière de boutique
							</label>
							<span className="text-[9px] font-bold text-gray-300">
								1200x400px recomm.
							</span>
						</div>
						<div className="rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-100 hover:border-amber-200 transition-colors bg-gray-50/50 p-2">
							<ProfileImageUpload
								currentImage={shopBanner}
								onImageChange={onBannerChange}
								onImageRemove={onBannerRemove}
								imageType="banner"
								size="large"
								aspectRatio="banner"
								className="w-full"
							/>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between px-2">
							<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Logo de marque
							</label>
							<span className="text-[9px] font-bold text-gray-300">
								400x400px recomm.
							</span>
						</div>
						<div className="rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-100 hover:border-amber-200 transition-colors bg-gray-50/50 p-2">
							<ProfileImageUpload
								currentImage={shopLogo}
								onImageChange={onLogoChange}
								onImageRemove={onLogoRemove}
								imageType="logo"
								size="medium"
								aspectRatio="square"
								className="w-full"
							/>
						</div>
					</div>
				</div>

				{/* Live Preview Card */}
				<div className="mt-10">
					<div className="flex items-center gap-2 mb-4 px-2">
						<Sparkles className="h-4 w-4 text-amber-500" />
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Aperçu public de votre vitrine
						</p>
					</div>

					<div className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-200 group/preview">
						{/* Banner Preview */}
						<div className="aspect-[3/1] bg-gray-100 relative">
							{shopBanner ?
								<CloudinaryImage
									src={shopBanner}
									alt="Bannière de boutique"
									className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-1000"
								/>
							:	<div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-200">
									<ImageIcon className="h-12 w-12 opacity-20" />
								</div>
							}
							{/* Overlay for better text readability */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
						</div>

						{/* Shop Info Bar */}
						<div className="bg-white p-2 md:p-4 flex items-center justify-between gap-6">
							<div className="flex items-center gap-6">
								{/* Logo Preview */}
								<div className="relative -mt-16 md:-mt-20">
									<div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-white p-1.5 shadow-xl border border-gray-50 group-hover/preview:-translate-y-1 transition-transform">
										{shopLogo ?
											<CloudinaryImage
												src={shopLogo}
												alt="Logo de boutique"
												className="w-full h-full object-cover rounded-2xl"
											/>
										:	<div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
												<User className="h-10 w-10" />
											</div>
										}
									</div>
								</div>

								<div className="pt-2 md:pt-4">
									<h5 className="text-xl md:text-2xl font-[1000] text-gray-900 tracking-tight">
										{user?.shopInfo?.shopName ||
											(user?.farmName && user?.farmName !== "À compléter" ?
												user.farmName
											:	null) ||
											user?.companyName ||
											user?.businessName ||
											"Ma Boutique Harvests"}
									</h5>
									<div className="flex items-center gap-2 mt-1">
										<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											Exploitée par {user?.firstName}{" "}
											{user?.lastName !== "À compléter" ? user?.lastName : ""}
										</p>
									</div>
								</div>
							</div>

							<div className="hidden md:block">
								<div className="px-6 py-3 bg-gray-50 rounded-2xl flex items-center gap-3 text-gray-400 font-black text-[10px] uppercase tracking-widest">
									Voir la boutique publique
									<ArrowRight className="h-4 w-4" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShopSection;
