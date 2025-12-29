import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
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
	const [showPreview, setShowPreview] = useState(false);
	const [pdfPage, setPdfPage] = useState(1);
	const fileInputRef = useRef(null);

	// Reset pdf page when opening new preview
	React.useEffect(() => {
		if (showPreview) setPdfPage(1);
	}, [showPreview]);

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
		currentFile?.includes(".pdf") ||
		currentFile?.includes("format=pdf");

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
						<button
							type="button"
							onClick={() => setShowPreview(true)}
							className="text-sm font-medium text-blue-600 hover:underline truncate block focus:outline-none"
						>
							Voir le document
						</button>
						<span className="text-xs text-green-600 flex items-center mt-1">
							<FiCheck className="mr-1" /> Uploadé
						</span>
					</div>
					{!disabled && (
						<button
							onClick={async (e) => {
								e.stopPropagation();

								// Supprimer de Cloudinary si c'est une URL distante
								if (currentFile && currentFile.includes("http")) {
									try {
										await uploadService.deleteImageByUrl(currentFile);
									} catch (err) {
										console.error(
											"Erreur lors de la suppression de l'image sur Cloudinary",
											err
										);
										// On continue quand même pour supprimer de l'interface
									}
								}

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

			{/* Modal de prévisualisation */}
			{showPreview &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4"
						onClick={() => setShowPreview(false)}
					>
						<div
							className="relative bg-white rounded-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh] max-w-[95vw]"
							onClick={(e) => e.stopPropagation()}
						>
							{/* En-tête du modal */}
							<div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
								<h3 className="text-lg font-semibold text-gray-800">
									Prévisualisation du document
								</h3>
								<button
									onClick={() => setShowPreview(false)}
									className="p-1 rounded-full hover:bg-gray-200 transition-colors"
								>
									<FiX className="w-6 h-6 text-gray-600" />
								</button>
							</div>

							{/* Contenu du document */}
							<div className="overflow-auto bg-gray-100 flex items-center justify-center p-4">
								{isPdf ? (
									currentFile?.includes("cloudinary") ? (
										<div className="flex flex-col items-center w-full h-full">
											<div className="flex-1 flex items-center justify-center overflow-hidden w-full relative">
												<img
													key={pdfPage}
													src={currentFile
														.replace(/\.pdf$/i, ".jpg")
														.replace(/\/upload\/?/, `/upload/pg_${pdfPage}/`)}
													alt={`Page ${pdfPage}`}
													className="max-w-full max-h-[75vh] object-contain rounded shadow-sm"
													onError={(e) => {
														e.target.onerror = null;
														e.target.src =
															"https://placehold.co/600x800?text=Fin+du+document";
													}}
												/>
											</div>

											{/* Pagination Controls */}
											<div className="flex items-center justify-center space-x-4 mt-4 bg-white p-2 rounded-full shadow-md border">
												<button
													onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
													disabled={pdfPage <= 1}
													className={`p-2 rounded-full ${
														pdfPage <= 1
															? "text-gray-300 cursor-not-allowed"
															: "text-blue-600 hover:bg-blue-50"
													}`}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-6 w-6"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15 19l-7-7 7-7"
														/>
													</svg>
												</button>
												<span className="font-medium text-gray-700">
													Page {pdfPage}
												</span>
												<button
													onClick={() => setPdfPage((p) => p + 1)}
													className="p-2 rounded-full text-blue-600 hover:bg-blue-50"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-6 w-6"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 5l7 7-7 7"
														/>
													</svg>
												</button>
											</div>
										</div>
									) : (
										<iframe
											src={`${currentFile}#toolbar=0`}
											title="Document PDF"
											className="w-[85vw] md:w-[800px] h-[70vh] rounded border border-gray-200 bg-white"
										/>
									)
								) : (
									<img
										src={currentFile}
										alt="Document preview"
										className="max-w-full max-h-[80vh] object-contain rounded shadow-sm"
									/>
								)}
							</div>
						</div>
					</div>,
					document.body
				)}
		</div>
	);
};

export default DocumentUpload;
