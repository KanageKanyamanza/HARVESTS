import React from "react";
import { FiShield } from "react-icons/fi";
import DocumentUpload from "../../common/DocumentUpload";

const LABELS = {
	nationalId: "Carte d'Identité / Passeport",
	businessLicense: "Registre de Commerce (RCCM)",
	taxId: "Numéro d'Identification Fiscale (NINEA)",
	healthPermit: "Permis sanitaire",
	transportLicense: "Licence de transport",
	insuranceCertificate: "Attestation d'assurance",
	firePermit: "Permis incendie",
	certification: "Certificat / Label",
};

const DocumentsSection = ({
	documents = {},
	onInputChange,
	docTypes = ["businessLicense", "taxId", "nationalId"],
	editing = true,
}) => {
	if (!editing) return null; // Or show read-only view? Backlogs usually want editing.

	const handleDocChange = (type, field, value) => {
		const currentDoc = documents[type] || {};
		const updatedDoc = { ...currentDoc, [field]: value };

		// Update the documents object
		// Note: This relies on the parent form handling { target: { name: 'documents', value: ... } }
		// which generic form handlers usually do.
		const newDocuments = { ...documents, [type]: updatedDoc };

		// Create a synthetic event
		onInputChange({
			target: { name: "documents", value: newDocuments, type: "custom" },
		});
	};

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiShield className="mr-2" />
				Documents Légaux & Administratifs
			</h3>
			<div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
				<div className="flex">
					<div className="flex-shrink-0">
						<FiShield className="h-5 w-5 text-blue-400" />
					</div>
					<div className="ml-3">
						<p className="text-sm text-blue-700">
							Ces documents sont nécessaires pour certifier votre activité. Ils
							resteront confidentiels et ne seront utilisés que par l'équipe
							administrative pour la vérification.
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6">
				{docTypes.map((type) => (
					<div
						key={type}
						className="bg-gray-50 p-4 rounded-lg border border-gray-200"
					>
						<h4 className="font-medium text-gray-800 mb-3 border-b pb-2">
							{LABELS[type] || type}
						</h4>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Number Input */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Numéro / Référence
								</label>
								<input
									type="text"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Ex: XYZ-123456"
									value={documents[type]?.number || ""}
									onChange={(e) =>
										handleDocChange(type, "number", e.target.value)
									}
								/>
							</div>

							{/* File Upload */}
							<div>
								<DocumentUpload
									label="Scan du document (PDF/Image)"
									currentFile={documents[type]?.document}
									onFileChange={(url) => handleDocChange(type, "document", url)}
									onFileRemove={() => handleDocChange(type, "document", "")}
								/>
							</div>
						</div>

						{/* Verification Status Badge */}
						<div className="mt-3 flex justify-end">
							{documents[type]?.isVerified ? (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
									Document Vérifié
								</span>
							) : documents[type]?.document ? (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
									En cours d'analyse
								</span>
							) : (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
									À fournir
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DocumentsSection;
