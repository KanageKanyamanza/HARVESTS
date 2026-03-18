import React from "react";
import {
	Award,
	Plus,
	Trash2,
	Calendar,
	FileText,
	ArrowRight,
	Sparkles,
	ExternalLink,
} from "lucide-react";
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
		<div className="space-y-10">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">
						Mise en avant
					</p>
					<h3 className="text-xl font-[1000] text-gray-900 tracking-tight flex items-center gap-3">
						<Award className="h-6 w-6 text-emerald-600" />
						Gérez vos certifications
					</h3>
				</div>
				{editing && (
					<button
						type="button"
						onClick={handleAdd}
						className="group inline-flex items-center gap-2 px-2 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-lg active:scale-95"
					>
						<Plus className="h-4 w-4" />
						Ajouter un Label
					</button>
				)}
			</div>

			{!editing && certifications.length === 0 && (
				<div className="bg-gray-50/50 rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
					<Award className="h-12 w-12 text-gray-200 mx-auto mb-4" />
					<p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
						Aucune certification enregistrée
					</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{certifications.map((cert, index) => (
					<div
						key={index}
						className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-700 relative overflow-hidden"
					>
						{/* Design Element */}
						<div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
							<Sparkles className="h-24 w-24" />
						</div>

						{editing && (
							<button
								type="button"
								onClick={() => handleRemove(index)}
								className="absolute top-6 right-6 w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
								title="Supprimer"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}

						<div className="p-8 space-y-8 relative z-10">
							{/* Nom du label */}
							<div className="space-y-2">
								<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
									Nom du Label / Certification
								</label>
								{editing ?
									<input
										type="text"
										value={cert.name || ""}
										onChange={(e) =>
											handleChange(index, "name", e.target.value)
										}
										placeholder="Agriculture Biologique, ISO 9001..."
										className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-gray-900 font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner"
									/>
								:	<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
											<Award className="h-5 w-5" />
										</div>
										<h4 className="text-lg font-[1000] text-gray-900 tracking-tight">
											{cert.name}
										</h4>
									</div>
								}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Organisme */}
								<div className="space-y-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
										Délivré par
									</label>
									{editing ?
										<input
											type="text"
											value={cert.issuedBy || ""}
											onChange={(e) =>
												handleChange(index, "issuedBy", e.target.value)
											}
											placeholder="Organisme certificateur"
											className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner"
										/>
									:	<p className="text-sm font-bold text-gray-600 ml-2">
											{cert.issuedBy}
										</p>
									}
								</div>

								{/* Date validité */}
								<div className="space-y-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
										Date d'expiration
									</label>
									{editing ?
										<div className="relative">
											<input
												type="date"
												value={
													cert.validUntil ?
														new Date(cert.validUntil)
															.toISOString()
															.split("T")[0]
													:	""
												}
												onChange={(e) =>
													handleChange(index, "validUntil", e.target.value)
												}
												className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner appearance-none"
											/>
											<Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
										</div>
									:	<div className="flex items-center gap-2 text-sm font-bold text-gray-600 ml-2">
											<Calendar className="h-4 w-4 text-emerald-500" />
											{cert.validUntil ?
												new Date(cert.validUntil).toLocaleDateString()
											:	"Non précisé"}
										</div>
									}
								</div>
							</div>

							{/* Document Preuve */}
							<div className="pt-6 border-t border-gray-100">
								<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">
									Preuve Documentaire
								</label>
								{editing ?
									<div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 hover:border-emerald-200 transition-colors">
										<DocumentUpload
											currentFile={cert.document}
											onFileChange={(url) =>
												handleChange(index, "document", url)
											}
											onFileRemove={() => handleChange(index, "document", "")}
											label={null}
										/>
									</div>
								: cert.document ?
									<a
										href={cert.document}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-3 px-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 hover:shadow-md transition-all group"
									>
										<FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
										Consulter le document
										<ExternalLink className="h-3 w-3" />
									</a>
								:	<span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic ml-2">
										Aucun document joint
									</span>
								}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default CertificationsSection;
