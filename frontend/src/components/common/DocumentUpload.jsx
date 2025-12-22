import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiCheck, FiFileText, FiImage } from "react-icons/fi";
import { uploadService } from "../../services";

const DocumentUpload = ({
	currentFile, // URL of the uploaded file
	onFileChange, // (url) => void
	onFileRemove, // () => void
	label = "Document",
	className = "",
	disabled = false,
}) => {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);

	const allowedTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/webp",
	];
	const maxSize = 10 * 1024 * 1024; // 10MB

	const handleFileSelect = async (file) => {
		if (disabled) return;
		setError("");

		// Validation
		if (!uploadService.validateFileType(file, allowedTypes)) {
			setError("Format non supporté. Utilisez PDF, JPEG ou PNG.");
			return;
		}
		if (!uploadService.validateFileSize(file, maxSize)) {
			setError("Fichier trop volumineux (Max 10MB).");
			return;
		}

		try {
			setUploading(true);
			const formData = uploadService.createFormData(file, "file");
			// Folder is handled by backend default or we can append it
			// formData.append('folder', 'harvests/documents');

			const response = await uploadService.uploadDocument(formData);

			if (response.data && (response.data.secure_url || response.data.url)) {
				onFileChange(response.data.secure_url || response.data.url);
			} else if (response.data?.data?.secure_url) {
				onFileChange(response.data.data.secure_url);
			} else {
				throw new Error("Réponse inattendue du serveur");
			}
		} catch (err) {
			console.error("Upload error:", err);
			setError("Erreur lors de l'upload.");
		} finally {
			setUploading(false);
		}
	};

	const isPdf =
		currentFile?.toLowerCase().endsWith(".pdf") ||
		currentFile?.includes(".pdf");

	return (
		<div className={`w-full ${className}`}>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>

			{!currentFile ? (
				<div
					onClick={() => !disabled && fileInputRef.current?.click()}
					className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
							disabled
								? "opacity-50 cursor-not-allowed border-gray-200"
								: "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
						}
          `}
				>
					{uploading ? (
						<div className="flex items-center justify-center text-sm text-blue-600">
							<span className="animate-spin mr-2">⏳</span> Upload en cours...
						</div>
					) : (
						<div className="flex flex-col items-center justify-center text-gray-500">
							<FiUpload className="w-6 h-6 mb-1" />
							<span className="text-xs">Cliquez pour uploader (PDF/Image)</span>
						</div>
					)}
				</div>
			) : (
				<div className="relative border rounded-lg p-3 flex items-center bg-gray-50">
					<div className="mr-3 p-2 bg-white rounded border">
						{isPdf ? (
							<FiFileText className="w-6 h-6 text-red-500" />
						) : (
							<FiImage className="w-6 h-6 text-blue-500" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<a
							href={currentFile}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm font-medium text-blue-600 hover:underline truncate block"
						>
							Voir le document
						</a>
						<span className="text-xs text-green-600 flex items-center mt-1">
							<FiCheck className="mr-1" /> Uploadé
						</span>
					</div>
					{!disabled && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onFileRemove();
							}}
							className="ml-2 p-1 text-gray-400 hover:text-red-500"
							title="Supprimer"
						>
							<FiX />
						</button>
					)}
				</div>
			)}

			{error && <p className="text-xs text-red-500 mt-1">{error}</p>}

			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,.jpg,.jpeg,.png,.webp"
				className="hidden"
				onChange={(e) =>
					e.target.files?.[0] && handleFileSelect(e.target.files[0])
				}
				disabled={disabled}
			/>
		</div>
	);
};

export default DocumentUpload;
