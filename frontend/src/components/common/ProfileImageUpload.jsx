import React, { useState, useRef } from "react";
import {
	Upload,
	X,
	Check,
	Image as ImageIcon,
	Loader2,
	Trash2,
} from "lucide-react";
import { profileService } from "../../services";
import CloudinaryImage from "./CloudinaryImage";

const ProfileImageUpload = ({
	currentImage,
	onImageChange,
	onImageRemove,
	imageType = "avatar", // 'avatar', 'banner', 'logo'
	size = "medium", // 'small', 'medium', 'large'
	aspectRatio = "square", // 'square', 'banner', 'free'
	className = "",
	disabled = false,
}) => {
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);

	const config = profileService.getImageConfig(imageType);

	const sizeClasses = {
		small: "w-16 h-16",
		medium: "w-24 h-24",
		large: "w-32 h-32 md:w-40 md:h-40",
	};

	// Use predefined class or the string itself if it looks like a Tailwind class
	const finalSizeClass = sizeClasses[size] || size;

	const aspectRatioClasses = {
		square: "aspect-square rounded-full",
		banner: "aspect-[3/1] rounded-[2rem]",
		free: "rounded-2xl",
	};

	const handleFileSelect = async (file) => {
		if (disabled) return;
		setError("");

		if (!profileService.validateFileType(file, config.allowedTypes)) {
			setError("Format non supporté (JPEG, PNG, WebP uniquement)");
			return;
		}

		if (!profileService.validateFileSize(file, config.maxSize)) {
			setError(
				`Trop volumineux (Max ${Math.round(config.maxSize / 1024 / 1024)}MB)`,
			);
			return;
		}

		try {
			setUploading(true);
			const formData = profileService.createFormData(file, config.fieldName);
			const response = await profileService[config.uploadFunction](formData);

			let imageUrl =
				response.data?.data?.user?.[config.fieldName] ||
				response.data?.user?.[config.fieldName] ||
				response.data?.profile?.[config.fieldName] ||
				response.data?.[config.fieldName] ||
				response.data?.data?.[config.fieldName];

			if (imageUrl) {
				onImageChange(imageUrl);
			} else {
				console.error("Aucune URL trouvée dans la réponse:", response.data);
				setError("Erreur lors de la récupération de l'image");
			}
		} catch (error) {
			console.error("Erreur upload:", error);
			setError("Échec de l'upload");
		} finally {
			setUploading(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragOver(false);
		const files = Array.from(e.dataTransfer.files);
		if (files.length > 0) handleFileSelect(files[0]);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setDragOver(true);
	};
	const handleDragLeave = (e) => {
		e.preventDefault();
		setDragOver(false);
	};
	const handleClick = () => {
		if (!disabled) fileInputRef.current?.click();
	};
	const handleRemove = (e) => {
		e.stopPropagation();
		onImageRemove();
	};

	return (
		<div className={`relative group/upload ${className}`}>
			<div
				className={`
          relative overflow-hidden cursor-pointer transition-all duration-500
          ${finalSizeClass || ""} 
          ${aspectRatioClasses[aspectRatio] || "rounded-2xl"}
          ${dragOver ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]" : "border-gray-200 bg-gray-50/30 hover:bg-gray-50"}
          ${currentImage ? "border-solid" : "border-2 border-dashed"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          flex items-center justify-center
        `}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={handleClick}
			>
				{currentImage ?
					<div className="relative w-full h-full group/img">
						<CloudinaryImage
							src={currentImage}
							alt="Upload preview"
							className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
						/>
						{!disabled && (
							<div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
								<div className="flex flex-col items-center gap-2">
									<div
										className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white hover:bg-rose-500 hover:border-rose-400 transition-all transform translate-y-2 group-hover/img:translate-y-0"
										onClick={handleRemove}
									>
										<Trash2 className="h-5 w-5" />
									</div>
									<span className="text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover/img:opacity-100 transition-opacity">
										Changer
									</span>
								</div>
							</div>
						)}
					</div>
				:	<div className="flex flex-col items-center p-6 text-center animate-fade-in">
						{uploading ?
							<div className="flex flex-col items-center gap-3">
								<Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
								<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
									Traitement...
								</span>
							</div>
						:	<div className="flex flex-col items-center gap-2">
								<div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover/upload:text-emerald-500 group-hover/upload:border-emerald-100 transition-all">
									<Upload className="h-5 w-5" />
								</div>
								<div className="mt-2">
									<p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
										{imageType === "avatar" && "Photo Profil"}
										{imageType === "banner" && "Bannière"}
										{imageType === "logo" && "Logo"}
									</p>
									<p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-1">
										PNG, JPG ou WebP
									</p>
								</div>
							</div>
						}
					</div>
				}
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept={config.allowedTypes.join(",")}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFileSelect(file);
				}}
				className="hidden"
				disabled={disabled}
			/>

			{error && (
				<div className="absolute -bottom-10 left-0 right-0 py-2 px-4 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-xl border border-rose-100 flex items-center gap-2 animate-fade-in-up">
					<X className="h-3 w-3" />
					{error}
				</div>
			)}
		</div>
	);
};

export default ProfileImageUpload;
