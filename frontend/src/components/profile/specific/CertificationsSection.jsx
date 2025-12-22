import React from "react";
import {
	FiAward,
	FiPlus,
	FiTrash2,
	FiCalendar,
	FiFileText,
} from "react-icons/fi";
import DocumentUpload from "../../common/DocumentUpload";

const CertificationsSection = ({
	certifications = [],
	onInputChange,
	editing = true,
}) => {
	if (!editing && (!certifications || certifications.length === 0)) return null;

	const handleAdd = () => {
		const newCerts = [
			...certifications,
			{
				name: "",
				issuedBy: "",
				validUntil: "",
				certificateNumber: "",
				document: "",
			},
		];
		onInputChange({
			target: { name: "certifications", value: newCerts, type: "custom" },
		});
	};

	const handleRemove = (index) => {
		const newCerts = certifications.filter((_, i) => i !== index);
		onInputChange({
			target: { name: "certifications", value: newCerts, type: "custom" },
		});
	};

	const handleChange = (index, field, value) => {
		const newCerts = [...certifications];
		newCerts[index] = { ...newCerts[index], [field]: value };
		onInputChange({
			target: { name: "certifications", value: newCerts, type: "custom" },
		});
	};

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900 flex items-center">
					<FiAward className="mr-2" />
					Certifications & Labels
				</h3>
				{editing && (
					<button
						type="button"
						onClick={handleAdd}
						className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
					>
						<FiPlus className="mr-1" /> Ajouter
					</button>
				)}
			</div>

			{!editing && certifications.length === 0 && (
				<p className="text-gray-500 italic text-sm">
					Aucune certification renseignée.
				</p>
			)}

			<div className="space-y-4">
				{certifications.map((cert, index) => (
					<div
						key={index}
						className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative"
					>
						{editing && (
							<button
								type="button"
								onClick={() => handleRemove(index)}
								className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
								title="Supprimer"
							>
								<FiTrash2 />
							</button>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
							{/* Nom du label */}
							<div className="col-span-1 md:col-span-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Nom du Label / Certification
								</label>
								{editing ? (
									<input
										type="text"
										value={cert.name || ""}
										onChange={(e) =>
											handleChange(index, "name", e.target.value)
										}
										placeholder="Ex: Agriculture Biologique, Label Rouge, ISO 9001..."
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
									/>
								) : (
									<p className="font-semibold text-gray-900">{cert.name}</p>
								)}
							</div>

							{/* Organisme */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Délivré par
								</label>
								{editing ? (
									<input
										type="text"
										value={cert.issuedBy || ""}
										onChange={(e) =>
											handleChange(index, "issuedBy", e.target.value)
										}
										placeholder="Organisme certificateur"
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
									/>
								) : (
									<p className="text-sm text-gray-600">{cert.issuedBy}</p>
								)}
							</div>

							{/* Numéro */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Numéro de certificat
								</label>
								{editing ? (
									<input
										type="text"
										value={cert.certificateNumber || ""}
										onChange={(e) =>
											handleChange(index, "certificateNumber", e.target.value)
										}
										placeholder="Réf. du certificat"
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
									/>
								) : (
									<p className="text-sm text-gray-600">
										{cert.certificateNumber}
									</p>
								)}
							</div>

							{/* Date validité */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Valide jusqu'au
								</label>
								{editing ? (
									<input
										type="date"
										value={
											cert.validUntil
												? new Date(cert.validUntil).toISOString().split("T")[0]
												: ""
										}
										onChange={(e) =>
											handleChange(index, "validUntil", e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
									/>
								) : (
									<div className="flex items-center text-sm text-gray-600">
										<FiCalendar className="mr-1" />
										{cert.validUntil
											? new Date(cert.validUntil).toLocaleDateString()
											: "Non précisé"}
									</div>
								)}
							</div>

							{/* Document Preuve */}
							<div className="col-span-1 md:col-span-2 mt-2">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									Preuve / Diplôme
								</label>
								{editing ? (
									<DocumentUpload
										currentFile={cert.document}
										onFileChange={(url) => handleChange(index, "document", url)}
										onFileRemove={() => handleChange(index, "document", "")}
										label={null}
									/>
								) : cert.document ? (
									<a
										href={cert.document}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-sm text-blue-600 hover:underline"
									>
										<FiFileText className="mr-1" /> Voir le certificat
									</a>
								) : (
									<span className="text-sm text-gray-400">
										Aucun document joint
									</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default CertificationsSection;
