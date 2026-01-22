import React from "react";
import {
	ShieldCheck,
	FileText,
	Info,
	CheckCircle2,
	Clock,
	AlertCircle,
} from "lucide-react";
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
	docTypes = ["businessLicense", "taxId"],
	editing = true,
}) => {
	if (!editing) return null;

	const handleDocChange = (type, field, value) => {
		const currentDoc = documents[type] || {};
		const updatedDoc = { ...currentDoc, [field]: value };
		const newDocuments = { ...documents, [type]: updatedDoc };

		onInputChange({
			target: { name: "documents", value: newDocuments, type: "custom" },
		});
	};

	return (
		<div className="space-y-10">
			<div className="grid grid-cols-1 gap-8">
				{docTypes.map((type) => (
					<div
						key={type}
						className="group bg-gray-50/50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 border border-gray-100 group-hover:border-emerald-100 transition-all shadow-sm">
									<FileText className="h-6 w-6" />
								</div>
								<div>
									<h4 className="text-lg font-[1000] text-gray-900 tracking-tight">
										{LABELS[type] || type}
									</h4>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Document Obligatoire
									</p>
								</div>
							</div>

							<div className="flex justify-end">
								{documents[type]?.isVerified ?
									<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
										<CheckCircle2 className="h-3.5 w-3.5" />
										Document Vérifié
									</div>
								: documents[type]?.document ?
									<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
										<Clock className="h-3.5 w-3.5" />
										En cours d'analyse
									</div>
								:	<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
										<AlertCircle className="h-3.5 w-3.5" />À fournir
									</div>
								}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Number Input */}
							<div className="space-y-2">
								<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
									Numéro / Référence
								</label>
								<div className="relative group/input">
									<input
										type="text"
										className="w-full bg-white px-5 py-4 border-2 border-gray-50 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-200"
										placeholder="EX: RC-SN-DQR-2024-B-..."
										value={documents[type]?.number || ""}
										onChange={(e) =>
											handleDocChange(type, "number", e.target.value)
										}
									/>
									<div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within/input:text-emerald-500 transition-colors">
										<Info className="h-4 w-4" />
									</div>
								</div>
							</div>

							{/* File Upload */}
							<div className="space-y-2">
								<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
									Scan du document (PDF/Image)
								</label>
								<div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 hover:border-emerald-200 transition-colors">
									<DocumentUpload
										currentFile={documents[type]?.document}
										onFileChange={(url) =>
											handleDocChange(type, "document", url)
										}
										onFileRemove={() => handleDocChange(type, "document", "")}
										label={null}
									/>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DocumentsSection;
