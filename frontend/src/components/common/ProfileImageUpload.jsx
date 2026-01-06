import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiCheck } from "react-icons/fi";
import { profileService } from "../../services";
import CloudinaryImage from "./CloudinaryImage";
import LoadingSpinner from "./LoadingSpinner";

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

	// Configuration par type d'image
	const config = profileService.getImageConfig(imageType);

	// Tailles d'affichage
	const sizeClasses = {
		small: "w-16 h-16",
		medium: "w-24 h-24",
		large: "w-32 h-32",
	};

	const aspectRatioClasses = {
		square: "aspect-square",
		banner: "aspect-[3/1]",
		free: "",
	};

	const handleFileSelect = async (file) => {
		if (disabled) return;

		setError("");

		// Validation du type
		if (!profileService.validateFileType(file, config.allowedTypes)) {
			setError("Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.");
			return;
		}

		// Validation de la taille
		if (!profileService.validateFileSize(file, config.maxSize)) {
			setError(
				`Fichier trop volumineux. Taille maximum: ${Math.round(
					config.maxSize / 1024 / 1024
				)}MB`
			);
			return;
		}

		try {
			setUploading(true);
			const formData = profileService.createFormData(file, config.fieldName);
			const response = await profileService[config.uploadFunction](formData);

			// Extraire l'URL de l'image de la réponse
			let imageUrl = null;

			// Structure 1: response.data.data.user.fieldName (structure avec data wrapper)
			if (response.data?.data?.user) {
				imageUrl =
					response.data.data.user.avatar ||
					response.data.data.user.shopBanner ||
					response.data.data.user.shopLogo;
			}

			// Structure 2: response.data.user.fieldName (structure directe)
			if (!imageUrl && response.data?.user) {
				imageUrl =
					response.data.user.avatar ||
					response.data.user.shopBanner ||
					response.data.user.shopLogo;
			}

			// Structure 3: response.data.profile.fieldName (fallback)
			if (!imageUrl && response.data?.profile) {
				imageUrl =
					response.data.profile.avatar ||
					response.data.profile.shopBanner ||
					response.data.profile.shopLogo;
			}

			// Structure 4: response.data.fieldName (fallback)
			if (!imageUrl) {
				imageUrl =
					response.data?.avatar ||
					response.data?.shopBanner ||
					response.data?.shopLogo;
			}

			// Structure 5: response.data.data.fieldName (fallback)
			if (!imageUrl && response.data?.data) {
				imageUrl =
					response.data.data.avatar ||
					response.data.data.shopBanner ||
					response.data.data.shopLogo;
			}

			if (imageUrl) {
				onImageChange(imageUrl);
			} else {
				console.error(
					"❌ Aucune URL d'image trouvée dans la réponse:",
					response.data
				);
			}
		} catch (error) {
			console.error("Erreur lors de l'upload:", error);
			setError("Erreur lors de l'upload de l'image");
		} finally {
			setUploading(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragOver(false);

		const files = Array.from(e.dataTransfer.files);
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
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
		if (!disabled) {
			fileInputRef.current?.click();
		}
	};

	const handleRemove = (e) => {
		e.stopPropagation();
		onImageRemove();
	};

	return (
		<div className={`relative ${className}`}>
			<div
				className={`
          ${sizeClasses[size]} 
          ${aspectRatioClasses[aspectRatio]}
          border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${
						dragOver
							? "border-harvests-green bg-green-50"
							: "border-gray-300 hover:border-gray-400"
					}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${currentImage ? "border-solid" : ""}
          flex items-center justify-center overflow-hidden
        `}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={handleClick}
			>
				{currentImage ? (
					<div className="relative w-full h-full group">
						<CloudinaryImage
							src={currentImage}
							alt="Uploaded"
							className="w-full h-full object-cover"
							width={400}
							height={400}
							quality="auto"
							crop="fill"
						/>
						{!disabled && (
							<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
								<button
									onClick={handleRemove}
									className="text-white hover:text-red-400 transition-colors"
									title="Supprimer l'image"
								>
									<FiX className="h-6 w-6" />
								</button>
							</div>
						)}
					</div>
				) : (
					<div className="text-center ">
						{uploading ? (
							<LoadingSpinner size="sm" text="Upload..." />
						) : (
							<div className="flex flex-col items-center">
								<FiUpload className="h-6 w-6 text-gray-400 mb-2" />
								<span className="text-xs text-gray-500">
									{imageType === "avatar" && "Photo de profil"}
									{imageType === "banner" && "Bannière de boutique"}
									{imageType === "logo" && "Logo de boutique"}
								</span>
								<span className="text-xs text-gray-400 mt-1">
									Glisser-déposer ou cliquer
								</span>
							</div>
						)}
					</div>
				)}
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
				<div className="mt-2 text-sm text-red-600 flex items-center">
					<FiX className="h-4 w-4 mr-1" />
					{error}
				</div>
			)}

			{/* {currentImage && !error && (
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <FiCheck className="h-4 w-4 mr-1" />
          Image uploadée avec succès
        </div>
      )} */}
		</div>
	);
};

export default ProfileImageUpload;
