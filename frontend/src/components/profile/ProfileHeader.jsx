import React from "react";
import {
	Star,
	MapPin,
	Mail,
	Phone,
	Calendar,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import ProfileImageUpload from "../common/ProfileImageUpload";
import { formatAverageRating } from "../../utils/vendorRatings";

const VENDOR_TYPES = [
	"producer",
	"transformer",
	"restaurateur",
	"exporter",
	"transporter",
];

const ProfileHeader = ({
	user,
	avatar,
	editing,
	saving,
	vendorStats,
	vendorStatsLoading,
	onAvatarChange,
	onAvatarRemove,
	onEdit,
	onSave,
	onCancel,
	safeDisplay,
}) => {
	const isVendor = VENDOR_TYPES.includes(user.userType);

	return (
		<div className="relative group">
			{/* Main Glass Card */}
			<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-2 md:p-3 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
				{/* Background Sparkles */}
				<div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
					<Sparkles className="h-48 w-48" />
				</div>

				<div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 text-center md:text-left">
					{/* Avatar Section */}
					<div className="relative shrink-0">
						<div
							className={`p-1 rounded-full bg-gradient-to-tr ${editing ? "from-emerald-400 to-blue-500 animate-spin-slow" : "from-gray-100 to-gray-50 border border-gray-100"} shadow-lg`}
						>
							<div className="bg-white rounded-full p-1">
								<ProfileImageUpload
									imageType="avatar"
									currentImage={avatar}
									onImageChange={onAvatarChange}
									onImageRemove={onAvatarRemove}
									size="large"
									aspectRatio="square"
									className="rounded-full shadow-inner"
								/>
							</div>
						</div>
						{!editing && user.isEmailVerified && (
							<div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white p-1.5 rounded-full shadow-lg border border-emerald-50 text-emerald-600">
								<ShieldCheck className="h-6 w-6" />
							</div>
						)}
					</div>

					{/* User Info Section */}
					<div className="flex-1 space-y-6">
						<div>
							<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
								<h2 className="text-3xl md:text-4xl font-[1000] text-gray-900 tracking-tight">
									{safeDisplay(user.firstName, "")}{" "}
									{safeDisplay(user.lastName, "")}
								</h2>
								<span className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-md">
									{user.userType}
								</span>
							</div>
							<p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
								<Mail className="h-4 w-4 text-emerald-500" />
								{safeDisplay(user.email, "")}
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Contact Minis */}
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
									<Phone className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Téléphone
									</p>
									<p className="text-sm font-bold text-gray-900">
										{safeDisplay(user.phone)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
									<MapPin className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Localisation
									</p>
									<p className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">
										{safeDisplay(user.address?.city || user.city)},{" "}
										{safeDisplay(user.address?.country || user.country)}
									</p>
								</div>
							</div>

							{isVendor && (
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
										<Star className="h-5 w-5 fill-amber-600" />
									</div>
									<div>
										<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
											Réputation
										</p>
										<div className="flex items-center gap-2">
											<span className="text-sm font-black text-gray-900">
												{formatAverageRating(vendorStats?.averageRating ?? 0)}
											</span>
											<span className="text-[10px] text-gray-400 font-bold">
												{vendorStatsLoading ?
													"..."
												:	`(${vendorStats?.reviewCount ?? 0} avis)`}
											</span>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="pt-6 border-t border-gray-100/50 flex flex-wrap gap-4 items-center justify-center md:justify-start">
							<div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
								<Calendar className="h-3.5 w-3.5" />
								Membre depuis{" "}
								{new Date(user.createdAt).toLocaleDateString("fr-FR", {
									month: "long",
									year: "numeric",
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
